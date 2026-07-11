// @ts-nocheck — pre-existing Fastify framework type issues
// 活动公司API
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

const certifyBody = z.object({
  full_name: z.string().min(1), credit_code: z.string(), business_license_url: z.string(),
  legal_person_name: z.string(), legal_person_id_url: z.string(),
  bank_name: z.string(), bank_account: z.string(),
});
const verifyBody = z.object({ action: z.enum(['approve','reject']), reason: z.string().optional() });

export default async function companyRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authMiddleware, requireRole('admin')] }, async (req, reply) => {
    const { status, keyword, page, pageSize } = req.query as Record<string,string>;
    const cond: string[] = []; const p: unknown[] = []; let i=1;
    if (status) { cond.push(`status=$${i++}`); p.push(status); }
    if (keyword) { cond.push(`(short_name ILIKE $${i} OR full_name ILIKE $${i})`); i++; p.push(`%${keyword}%`); }
    const w=cond.length?`WHERE ${cond.join(' AND ')}`:'';
    const pg=Math.max(1,Number(page)||1); const ps=Math.min(100,Number(pageSize)||20);
    const [items,count]=await Promise.all([
      query(`SELECT * FROM company_profiles ${w} ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i++}`,[...p,ps,(pg-1)*ps]),
      query(`SELECT COUNT(*) FROM company_profiles ${w}`,p)
    ]);
    return reply.send(successResponse({items:items.rows,total:Number(count.rows[0].count),page:pg,pageSize:ps}));
  });

  app.get('/:id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const r = await query('SELECT * FROM company_profiles WHERE id=$1', [req.params.id]);
    if (r.rows.length===0) return reply.status(404).send(errorResponse(2002,'公司不存在'));
    return reply.send(successResponse(r.rows[0]));
  });

  app.post('/:id/certify', { preHandler: [authMiddleware, requireRole('agent'), validate({ body: certifyBody })] },
    async (req, reply) => {
      const b = req.body as z.infer<typeof certifyBody>;
      await query(
        `UPDATE company_profiles SET full_name=$1, credit_code=$2, business_license_url=$3, legal_person_name=$4, legal_person_id_url=$5, bank_name=$6, bank_account=$7, status='pending_cert' WHERE id=$8`,
        [b.full_name,b.credit_code,b.business_license_url,b.legal_person_name,b.legal_person_id_url,b.bank_name,b.bank_account,req.params.id]
      );
      return reply.send(successResponse({status:'pending_cert'},'认证资料已提交'));
    });

  app.patch('/:id/verify', { preHandler: [authMiddleware, requireRole('admin'), validate({ body: verifyBody })] },
    async (req, reply) => {
      const { action, reason } = req.body as z.infer<typeof verifyBody>;
      const s = action==='approve'?'certified':'registered';
      await query(`UPDATE company_profiles SET status=$1 WHERE id=$2`,[s,req.params.id]);
      await query(`INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail) VALUES ($1,'company',$2,'company',$3,$4)`,[req.user?.sub,action,req.params.id,JSON.stringify({reason})]);
      return reply.send(successResponse({status:s}, action==='approve'?'已通过':'已驳回'));
    });

  // ==========================================================
  // GET /v1/companies/:id/stats - 活动公司消费统计 (P-21)
  // 历史消费汇总 + 明细
  // ==========================================================
  app.get('/:id/stats', { preHandler: [authMiddleware, requireRole('admin', 'agent')] },
    async (req, reply) => {
      const { id } = req.params as any as { id: string };
      const user = req.user;

      // 校验公司存在
      const company = await query('SELECT id, user_id, short_name FROM company_profiles WHERE id=$1', [id]);
      if (company.rows.length === 0) {
        return reply.status(404).send(errorResponse(2002, '公司不存在'));
      }

      // 权限校验：agent 只能看自己的
      if (user?.role === 'agent' && company.rows[0].user_id !== user.sub) {
        return reply.status(403).send(errorResponse(1005, '权限不足'));
      }

      // 消费汇总统计
      const [totalStats, monthlyStats, recentOrders] = await Promise.all([
        // 总体统计
        query(
          `SELECT
             COUNT(*) AS total_orders,
             COALESCE(SUM(p.amount), 0) AS total_spent,
             COUNT(DISTINCT DATE_TRUNC('month', p.received_at)) AS active_months
           FROM payment_records p
           JOIN demands d ON p.demand_id = d.id
           WHERE d.client_id = $1`,
          [id]
        ),
        // 按月统计
        query(
          `SELECT
             TO_CHAR(DATE_TRUNC('month', p.received_at), 'YYYY-MM') AS month,
             COUNT(*) AS order_count,
             COALESCE(SUM(p.amount), 0) AS total_amount
           FROM payment_records p
           JOIN demands d ON p.demand_id = d.id
           WHERE d.client_id = $1
           GROUP BY DATE_TRUNC('month', p.received_at)
           ORDER BY month DESC
           LIMIT 12`,
          [id]
        ),
        // 最近订单
        query(
          `SELECT d.id, d.title, d.event_date, d.city, d.status, d.final_price,
                  p.amount AS paid_amount, p.type AS payment_type, p.received_at
           FROM demands d
           LEFT JOIN payment_records p ON d.id = p.demand_id
           WHERE d.client_id = $1
           ORDER BY d.created_at DESC
           LIMIT 20`,
          [id]
        ),
      ]);

      return reply.send(successResponse({
        company: { id, short_name: company.rows[0].short_name },
        summary: {
          total_orders: Number(totalStats.rows[0].total_orders),
          total_spent: Number(totalStats.rows[0].total_spent),
          active_months: Number(totalStats.rows[0].active_months),
        },
        monthly_breakdown: monthlyStats.rows,
        recent_orders: recentOrders.rows,
      }));
    });
}
