// @ts-nocheck — pre-existing Fastify framework type issues
// 排期分配API
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query, transaction } from '../utils/db.js';
import { successResponse, errorResponse, paginatedResponse, createdResponse } from '../utils/response.js';

const assignBody = z.object({
  demand_id: z.string().uuid(),
  performer_id: z.string().uuid(),
  performance_role: z.string().min(1),
  arrival_time: z.string().datetime(),
  negotiated_price: z.number().positive().optional(),
});

const respondBody = z.object({
  action: z.enum(['confirm', 'reject']),
  reject_reason: z.string().optional(),
});

const checkinBody = z.object({ latitude: z.number(), longitude: z.number() });
const calendarQuery = z.object({ performer_id: z.string().uuid().optional(), month: z.string().regex(/^\d{4}-\d{2}$/) });

export default async function assignmentRoutes(app: FastifyInstance) {
  // 1. 分配排期
  app.post('/', { preHandler: [authMiddleware, requireRole('admin'), validate({ body: assignBody })] },
    async (req, reply) => {
      const { demand_id, performer_id, performance_role, arrival_time, negotiated_price } = req.body as z.infer<typeof assignBody>;

      // 档期冲突检测
      const arrival = new Date(arrival_time);
      const dayStart = arrival.toISOString().split('T')[0] + 'T00:00:00Z';
      const dayEnd = arrival.toISOString().split('T')[0] + 'T23:59:59Z';
      const conflict = await query(
        `SELECT id FROM assignments WHERE performer_id=$1 AND arrival_time>=$2 AND arrival_time<=$3 AND status NOT IN ('cancelled','rejected')`,
        [performer_id, dayStart, dayEnd]
      );
      if (conflict.rows.length > 0) return reply.status(409).send(errorResponse(6001, '该演员此时段已有排期，档期冲突'));

      // 自动计算价格(按咖位)
      let price = negotiated_price;
      if (!price) {
        const tier = await query('SELECT tier FROM performers WHERE id=$1', [performer_id]);
        const tierPrices: Record<string, number> = { T1:2000,T2:1000,T3:800,T4:600,T5:400,T6:300 };
        price = tierPrices[tier.rows[0]?.tier] || 800;
      }

      const result = await query(
        `INSERT INTO assignments (demand_id, performer_id, performance_role, arrival_time, negotiated_price, status)
         VALUES ($1,$2,$3,$4,$5,'pending') RETURNING id`,
        [demand_id, performer_id, performance_role, arrival_time, price]
      );

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1,'assignment','create','assignment',$2,$3)`,
        [req.user?.sub, result.rows[0].id, JSON.stringify({ performer_id, arrival_time, price })]
      );

      return reply.status(201).send(createdResponse({ id: result.rows[0].id, status: 'pending' }, '排期已分配，等待演员确认'));
    });

  // 2. 排期列表
  app.get('/', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id, performer_id, status, date_from, date_to, page, pageSize } = req.query as Record<string,string>;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    if (demand_id) { conditions.push(`a.demand_id=$${i++}`); params.push(demand_id); }
    if (performer_id) { conditions.push(`a.performer_id=$${i++}`); params.push(performer_id); }
    if (status) { conditions.push(`a.status=$${i++}`); params.push(status); }
    if (date_from) { conditions.push(`a.arrival_time>=$${i++}`); params.push(date_from); }
    if (date_to) { conditions.push(`a.arrival_time<=$${i++}`); params.push(date_to); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const pg = Math.max(1, Number(page)||1);
    const ps = Math.min(100, Number(pageSize)||20);

    const [items, count] = await Promise.all([
      query(`SELECT a.*, p.name as performer_name, p.tier, d.title as demand_title, d.event_date
             FROM assignments a JOIN performers p ON a.performer_id=p.id JOIN demands d ON a.demand_id=d.id
             ${where} ORDER BY a.arrival_time DESC LIMIT $${i++} OFFSET $${i++}`, [...params, ps, (pg-1)*ps]),
      query(`SELECT COUNT(*) FROM assignments a ${where.replace(/a\./g,'a.')}`, params)
    ]);
    return reply.send(paginatedResponse(items.rows, Number(count.rows[0].count), pg, ps));
  });

  // 3. 确认/拒绝
  app.patch('/:id/respond', { preHandler: [authMiddleware, requireRole('performer'), validate({ body: respondBody })] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const { action, reject_reason } = req.body as z.infer<typeof respondBody>;

      const old = await query('SELECT * FROM assignments WHERE id=$1', [id]);
      if (old.rows.length === 0) return reply.status(404).send(errorResponse(6002, '排期不存在'));
      if (old.rows[0].status !== 'pending') return reply.status(400).send(errorResponse(6003, '当前状态不可操作'));

      const status = action === 'confirm' ? 'confirmed' : 'rejected';
      await query(
        `UPDATE assignments SET status=$1, reject_reason=$2, confirmed_at=NOW() WHERE id=$3`,
        [status, reject_reason || null, id]
      );

      // 拒绝扣信誉分
      if (action === 'reject') {
        await query(`UPDATE performers SET credit_score=GREATEST(0,credit_score-0.5) WHERE id=$1`, [old.rows[0].performer_id]);
        await query(`INSERT INTO credit_score_logs (performer_id, change_amount, reason, created_at)
                     VALUES ($1,$2,$3,NOW())`, [old.rows[0].performer_id, -0.5, '拒绝排期']);
      }

      return reply.send(successResponse({ status }, action === 'confirm' ? '已确认' : '已拒绝'));
    });

  // 4. 签到打卡
  app.post('/:id/checkin', { preHandler: [authMiddleware, requireRole('performer'), validate({ body: checkinBody })] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const { latitude, longitude } = req.body as z.infer<typeof checkinBody>;

      const old = await query('SELECT * FROM assignments WHERE id=$1', [id]);
      if (old.rows.length === 0) return reply.status(404).send(errorResponse(6002, '排期不存在'));
      if (old.rows[0].checkin_time) return reply.status(409).send(errorResponse(6004, '已签到，不可重复'));

      await transaction(async (client) => {
        await client.query(
          `UPDATE assignments SET checkin_time=NOW(), checkin_location=$1 WHERE id=$2`,
          [JSON.stringify({ latitude, longitude }), id]
        );
        await client.query(
          `UPDATE performers SET credit_score=LEAST(5,credit_score+1) WHERE id=$1`,
          [old.rows[0].performer_id]
        );
        await client.query(
          `INSERT INTO credit_score_logs (performer_id, change_amount, reason, related_demand_id, created_at)
           VALUES ($1,1,'准时签到打卡',$2,NOW())`,
          [old.rows[0].performer_id, old.rows[0].demand_id]
        );
      });

      return reply.send(successResponse({ checkin_time: new Date().toISOString(), credit_change: { amount: 1, reason: '准时签到打卡' } }, '签到成功'));
    });

  // 5. 档期日历 (P-11 Enhanced: FullCalendar format)
  app.get('/calendar', { preHandler: [authMiddleware] },
    async (req, reply) => {
      const { performer_id, month, start, end } = req.query as Record<string, string>;

      // FullCalendar 格式：支持 month 或 start/end 范围
      let dateWhere: string;
      const dateParams: unknown[] = [];
      let di = 1;

      if (start && end) {
        dateWhere = `a.arrival_time >= $${di++} AND a.arrival_time <= $${di++}`;
        dateParams.push(start, end);
      } else if (month) {
        const monthStart = `${month}-01`;
        const [y, m] = month.split('-').map(Number);
        const monthEnd = `${month}-${new Date(y, m, 0).getDate()}`;
        dateWhere = `a.arrival_time >= $${di++} AND a.arrival_time <= $${di++}`;
        dateParams.push(monthStart, monthEnd);
      } else {
        // 默认当月
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const monthStart = `${monthStr}-01`;
        const monthEnd = `${monthStr}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`;
        dateWhere = `a.arrival_time >= $${di++} AND a.arrival_time <= $${di++}`;
        dateParams.push(monthStart, monthEnd);
      }

      let where = `${dateWhere} AND a.status NOT IN ('cancelled','rejected')`;
      if (performer_id) { where += ` AND a.performer_id = $${di++}`; dateParams.push(performer_id); }

      const result = await query(
        `SELECT a.id, a.arrival_time, a.status,
                p.id AS performer_id, p.name AS performer_name, p.tier,
                d.id AS demand_id, d.title AS demand_title, d.event_date, d.city
         FROM assignments a
         JOIN performers p ON a.performer_id = p.id
         JOIN demands d ON a.demand_id = d.id
         WHERE ${where}
         ORDER BY a.arrival_time`,
        dateParams
      );

      // 转换为 FullCalendar events 格式
      const events = result.rows.map((row: Record<string, unknown>) => ({
        id: row.id,
        title: `${row.performer_name} - ${row.demand_title || '演出'}`,
        start: row.arrival_time,
        extendedProps: {
          performer_id: row.performer_id,
          performer_name: row.performer_name,
          performer_tier: row.tier,
          demand_id: row.demand_id,
          demand_title: row.demand_title,
          city: row.city,
          status: row.status,
        },
        backgroundColor: (row.status as string) === 'confirmed'
          ? '#1890ff'
          : (row.status as string) === 'completed'
            ? '#52c41a'
            : (row.status as string) === 'pending'
              ? '#faad14'
              : '#d9d9d9',
      }));

      return reply.send(successResponse(events));
    });
}
