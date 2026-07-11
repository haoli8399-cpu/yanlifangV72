// 结算统计API
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

const settlementQuerySchema = z.object({
  period: z.string().optional(),
  performer_id: z.string().uuid().optional(),
});

const markSettledBodySchema = z.object({
  paid_at: z.string().min(1).optional(),
});

export default async function settlementRoutes(app: FastifyInstance) {
  // 结算汇总
  app.get('/', { preHandler: [authMiddleware, requireRole('admin', 'finance')] },
    async (req, reply) => {
      const { period, performer_id } = settlementQuerySchema.parse(req.query);

      let where = "WHERE 1=1";
      const params: unknown[] = [];
      let i = 1;
      if (period) { where += ` AND s.period = $${i++}`; params.push(period); }
      if (performer_id) { where += ` AND s.performer_id = $${i++}`; params.push(performer_id); }

      const result = await query(
        `SELECT p.id as performer_id, p.name as performer_name, p.tier,
                SUM(s.amount) as total_amount,
                COUNT(*) as total_count,
                SUM(CASE WHEN s.status='pending' THEN s.amount ELSE 0 END) as pending_amount,
                SUM(CASE WHEN s.status='settled' THEN s.amount ELSE 0 END) as settled_amount
         FROM settlements s
         JOIN performers p ON s.performer_id = p.id
         ${where}
         GROUP BY p.id, p.name, p.tier
         ORDER BY total_amount DESC`,
        params
      );

      let totalPending = 0, totalSettled = 0;
      for (const r of result.rows) { totalPending += Number(r.pending_amount); totalSettled += Number(r.settled_amount); }

      return reply.send(successResponse({
        items: result.rows,
        summary: { total_pending: totalPending, total_settled: totalSettled }
      }));
    });

  // 标记已结算
  app.patch('/:id/mark-settled', { preHandler: [authMiddleware, requireRole('admin', 'finance')] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const { paid_at = new Date().toISOString() } = markSettledBodySchema.parse(req.body ?? {});

      const old = await query('SELECT * FROM settlements WHERE id = $1', [id]);
      if (old.rows.length === 0) return reply.status(404).send(errorResponse(7001, '结算记录不存在'));

      await query(
        `UPDATE settlements SET status='settled', settled_at=NOW(), paid_at=$1 WHERE id=$2`,
        [paid_at, id]
      );

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'settlement', 'mark_settled', 'settlement', $2, $3)`,
        [req.user?.sub, id, JSON.stringify({ paid_at })]
      );

      return reply.send(successResponse({ id, status: 'settled' }, '已标记为已结算'));
    });

  // ==========================================================
  // GET /v1/settlements/export - 导出结算明细 (P-20)
  // 生成 CSV (BOM + 中文表头)
  // ==========================================================
  app.get('/export', { preHandler: [authMiddleware, requireRole('admin', 'finance')] },
    async (req, reply) => {
      const { period, performer_id } = settlementQuerySchema.parse(req.query);

      let where = "WHERE 1=1";
      const params: unknown[] = [];
      let i = 1;
      if (period) { where += ` AND s.period = $${i++}`; params.push(period); }
      if (performer_id) { where += ` AND s.performer_id = $${i++}`; params.push(performer_id); }

      const result = await query(
        `SELECT s.id, s.amount, s.period, s.status, s.settled_at, s.paid_at,
                p.name AS performer_name, p.tier,
                d.title AS demand_title, d.event_date, d.city
         FROM settlements s
         JOIN performers p ON s.performer_id = p.id
         JOIN demands d ON s.demand_id = d.id
         ${where}
         ORDER BY s.period DESC, p.name ASC`,
        params
      );

      // 构建 CSV (BOM + 中文表头)
      const headers = ['结算ID', '演员名称', '咖位', '需求标题', '活动日期', '城市', '金额', '结算周期', '状态', '结算时间', '打款时间'];
      const rows = result.rows.map((r: Record<string, unknown>) => [
        r.id,
        r.performer_name,
        r.tier,
        (r.demand_title as string || '').replace(/"/g, '""'),
        (r.event_date as string || '').substring(0, 10),
        r.city,
        Number(r.amount).toFixed(2),
        r.period,
        r.status === 'settled' ? '已结算' : '待结算',
        (r.settled_at as string || '').substring(0, 10),
        (r.paid_at as string || '').substring(0, 10),
      ]);

      const csvContent = '\uFEFF' + headers.join(',') + '\n' +
        rows.map((row: unknown[]) => row.map((cell: unknown) => `"${cell ?? ''}"`).join(',')).join('\n');

      reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', `attachment; filename=settlements_${period || 'all'}_${new Date().toISOString().substring(0,10)}.csv`)
        .send(csvContent);
    });
}
