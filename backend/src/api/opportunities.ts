// ============================================================
// 商机管理 API — PRD V3.3.2 第 5.3 / 6.4 节
// 对齐 UI 设计稿：销售作战台（商机队列三栏）+ AI成交日报
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

// ============================================================
// Zod Schemas
// ============================================================
const statusEnum = z.enum([
  'new', 'qualified', 'quoted', 'negotiating',
  'pending_client', 'won', 'lost', 'invalid',
]);

const priorityEnum = z.enum(['high', 'medium', 'low']);

const lostReasonEnum = z.enum([
  'budget_too_low', 'date_unavailable', 'no_response',
  'lost_to_competitor', 'plan_mismatch', 'event_cancelled',
  'price_too_high', 'not_real_demand',
]);

const listQuerySchema = z.object({
  status: statusEnum.optional(),
  priority: priorityEnum.optional(),
  assigned_to: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

const createBodySchema = z.object({
  demand_id: z.string().uuid(),
  priority: priorityEnum.optional(),
  assigned_to: z.string().uuid().optional(),
});

const updateBodySchema = z.object({
  priority: priorityEnum.optional(),
  assigned_to: z.string().uuid().optional(),
  next_action: z.string().optional(),
  next_action_at: z.string().optional(),
});

const transitionBodySchema = z.object({
  to_status: statusEnum,
  lost_reason: lostReasonEnum.optional(),
  lost_reason_note: z.string().optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });

// ============================================================
// Routes
// ============================================================
export default async function opportunityRoutes(app: FastifyInstance) {

  // GET / — 列表（支持按状态/优先级筛选）
  app.get('/', {
    preHandler: [authMiddleware, requireRole('agent', 'admin')],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { status, priority, assigned_to, page, pageSize } = listQuerySchema.parse(req.query);
    const offset = (page - 1) * pageSize;
    const conditions: string[] = [];
    const params: string[] = [];
    let idx = 1;

    if (status) { conditions.push(`o.status = $${idx++}`); params.push(status); }
    if (priority) { conditions.push(`o.priority = $${idx++}`); params.push(priority); }
    if (assigned_to) { conditions.push(`o.assigned_to = $${idx++}`); params.push(assigned_to); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(`SELECT COUNT(*) FROM opportunities o ${where}`, params);
    const total = parseInt(String(countResult.rows[0].count), 10);

    const result = await query(
      `SELECT o.*, d.title as demand_title, d.performer_count, d.budget_range
       FROM opportunities o
       LEFT JOIN demands d ON d.id = o.demand_id
       ${where}
       ORDER BY o.priority DESC, o.created_at ASC
       LIMIT $${idx++} OFFSET $${idx}`,
      [...params, String(pageSize), String(offset)]
    );

    return reply.send(successResponse({
      items: result.rows,
      total,
      page,
      pageSize,
    }));
  });

  // GET /:id — 详情（含报价和跟进记录）
  app.get('/:id', {
    preHandler: [authMiddleware],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);
    const result = await query(
      `SELECT o.*, d.title as demand_title, d.performer_count, d.budget_range,
              d.event_date, d.location, d.description
       FROM opportunities o
       LEFT JOIN demands d ON d.id = o.demand_id
       WHERE o.id = $1`, [id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(9001, '商机不存在'));
    return reply.send(successResponse(result.rows[0]));
  });

  // POST / — 创建商机
  app.post('/', {
    preHandler: [authMiddleware, requireRole('agent', 'admin'), validate({ body: createBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const body = createBodySchema.parse(req.body);
    const userId = req.user?.sub ?? '';

    const exist = await query('SELECT id FROM opportunities WHERE demand_id = $1', [body.demand_id]);
    if (exist.rows.length > 0) {
      return reply.status(409).send(errorResponse(9002, '该需求已有商机记录'));
    }

    const result = await query(
      `INSERT INTO opportunities (demand_id, priority, assigned_to)
       VALUES ($1, $2, $3) RETURNING *`,
      [body.demand_id, body.priority || 'medium', body.assigned_to || userId]
    );

    return reply.status(201).send(successResponse(result.rows[0]));
  });

  // PATCH /:id/status — 状态流转
  app.patch('/:id/status', {
    preHandler: [authMiddleware, requireRole('agent', 'admin'), validate({ body: transitionBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);
    const { to_status, lost_reason, lost_reason_note } = transitionBodySchema.parse(req.body);

    const curr = await query('SELECT status FROM opportunities WHERE id = $1', [id]);
    if (curr.rows.length === 0) return reply.status(404).send(errorResponse(9001, '商机不存在'));

    const updates: string[] = ['status = $1', 'updated_at = now()'];
    const p: string[] = [to_status, id];
    let idx = 2;

    if (lost_reason) { updates.push(`lost_reason = $${++idx}`); p.push(lost_reason); }
    if (lost_reason_note) { updates.push(`lost_reason_note = $${++idx}`); p.push(lost_reason_note); }

    const result = await query(
      `UPDATE opportunities SET ${updates.join(', ')} WHERE id = $2 RETURNING *`,
      p
    );

    return reply.send(successResponse(result.rows[0]));
  });

  // PATCH /:id — 更新优先级/分配/下一步
  app.patch('/:id', {
    preHandler: [authMiddleware, requireRole('agent', 'admin'), validate({ body: updateBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);
    const body = updateBodySchema.parse(req.body);

    const sets: string[] = ['updated_at = now()'];
    const p: string[] = [];
    let idx = 1;

    if (body.priority) { sets.push(`priority = $${idx++}`); p.push(body.priority); }
    if (body.assigned_to) { sets.push(`assigned_to = $${idx++}`); p.push(body.assigned_to); }
    if (body.next_action) { sets.push(`next_action = $${idx++}`); p.push(body.next_action); }
    if (body.next_action_at) { sets.push(`next_action_at = $${idx++}`); p.push(body.next_action_at); }

    if (p.length === 0) return reply.send(errorResponse(9003, '无更新字段'));
    p.push(id);

    const result = await query(
      `UPDATE opportunities SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      p
    );

    if (result.rows.length === 0) return reply.status(404).send(errorResponse(9001, '商机不存在'));
    return reply.send(successResponse(result.rows[0]));
  });

  // GET /stats — 统计（AI成交日报用）
  app.get('/stats', {
    preHandler: [authMiddleware, requireRole('agent', 'admin')],
  }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const result = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'qualified') as qualified_count,
        COUNT(*) FILTER (WHERE status = 'quoted') as quoted_count,
        COUNT(*) FILTER (WHERE status = 'negotiating') as negotiating_count,
        COUNT(*) FILTER (WHERE status = 'pending_client') as pending_count,
        COUNT(*) FILTER (WHERE status = 'won') as won_count,
        COUNT(*) FILTER (WHERE status = 'lost') as lost_count,
        COUNT(*) FILTER (WHERE status = 'won' AND created_at >= now() - interval '7 days') as won_7d,
        COUNT(*) FILTER (WHERE status = 'lost' AND created_at >= now() - interval '7 days') as lost_7d
      FROM opportunities
    `);
    return reply.send(successResponse(result.rows[0]));
  });
}
