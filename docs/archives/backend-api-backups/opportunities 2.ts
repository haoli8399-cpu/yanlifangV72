import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

const createBody = z.object({
  demand_id: z.string().uuid(),
  status: z.enum(['new']).optional().default('new'),
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  notes: z.string().optional(),
});

const statusBody = z.object({
  status: z.enum(['new', 'qualified', 'quoted', 'negotiating', 'pending_client', 'won', 'lost', 'invalid']),
  lost_reason: z.string().optional(),
});

const listQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.string().optional(),
  priority: z.string().optional(),
});

export default async function opportunityRoutes(app: FastifyInstance) {
  const demandSelect = `
    d.id as demand_id,
    COALESCE(u.name, '') as company_name,
    d.comedy_style as performance_type,
    d.event_type as activity_type,
    d.budget,
    d.event_date,
    d.city,
    d.audience_count,
    d.special_requirements as description
  `;

  // GET /v1/opportunities — 商机列表
  app.get('/opportunities', { preHandler: [authMiddleware] }, async (req, reply) => {
    const q = listQuery.parse(req.query);
    const offset = (q.page - 1) * q.pageSize;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let i = 1;
    if (q.status) { conditions.push(`o.status = $${i++}`); params.push(q.status); }
    if (q.priority) { conditions.push(`o.priority = $${i++}`); params.push(q.priority); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [items, count] = await Promise.all([
      query(`SELECT o.*, ${demandSelect} FROM opportunities o LEFT JOIN demands d ON o.demand_id = d.id LEFT JOIN users u ON d.client_id = u.id ${where} ORDER BY o.created_at DESC LIMIT $${i++} OFFSET $${i++}`, [...params, q.pageSize, offset]),
      query(`SELECT COUNT(*) FROM opportunities o ${where}`, params),
    ]);
    return reply.send(paginatedResponse(items.rows, Number(count.rows[0].count), q.page, q.pageSize));
  });

  // GET /v1/opportunities/:id — 商机详情
  app.get('/opportunities/:id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const res = await query(`SELECT o.*, ${demandSelect} FROM opportunities o LEFT JOIN demands d ON o.demand_id = d.id LEFT JOIN users u ON d.client_id = u.id WHERE o.id = $1`, [id]);
    if (res.rows.length === 0) return reply.status(404).send(errorResponse(9901, '商机不存在'));
    return reply.send(successResponse(res.rows[0]));
  });

  // POST /v1/opportunities — 创建商机
  app.post('/opportunities', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = createBody.parse(req.body);
    const res = await query(`INSERT INTO opportunities (demand_id, status, priority) VALUES ($1, $2, $3) RETURNING *`, [body.demand_id, body.status, body.priority]);
    return reply.send(successResponse(res.rows[0], '商机已创建'));
  });

  // PATCH /v1/opportunities/:id/status — 更新商机状态
  app.patch('/opportunities/:id/status', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = statusBody.parse(req.body);

    // 获取当前状态
    const current = await query('SELECT status FROM opportunities WHERE id = $1', [id]);
    if (current.rows.length === 0) return reply.status(404).send(errorResponse(9901, '商机不存在'));

    const currentStatus = current.rows[0].status as string;
    const newStatus = body.status;

    // 状态流转校验 (防止回流导致后台显示异常)
    const validTransitions: Record<string, string[]> = {
      new: ['qualified', 'invalid'],
      qualified: ['quoted', 'lost', 'invalid', 'new'],
      quoted: ['negotiating', 'pending_client', 'won', 'lost', 'new'],
      negotiating: ['quoted', 'pending_client', 'won', 'lost', 'new'],
      pending_client: ['won', 'lost', 'negotiating', 'new'],
      won: [],
      lost: ['new', 'qualified', 'quoted', 'negotiating', 'pending_client'],
      invalid: ['new'],
    };

    const allowed = validTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      return reply.status(400).send(errorResponse(9902, `不允许从 ${currentStatus} 变更到 ${newStatus}`));
    }

    // 丢失必须指定原因
    if (newStatus === 'lost' && !body.lost_reason) {
      return reply.status(400).send(errorResponse(9903, '丢单必须填写原因'));
    }

    const result = await query(
      `UPDATE opportunities SET status = $1, lost_reason = $2, updated_at = now() WHERE id = $3 RETURNING *`,
      [newStatus, body.lost_reason || null, id]
    );

    return reply.send(successResponse(result.rows[0], '商机状态已更新'));
  });
}
