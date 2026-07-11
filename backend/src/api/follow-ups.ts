// ============================================================
// 跟进记录 API — PRD V3.3.2 第 5.3 节
// 每次跟进记录（电话/微信/邮件/面谈）+ AI建议话术
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

const createBodySchema = z.object({
  opportunity_id: z.string().uuid(),
  action_type: z.enum(['call', 'wechat', 'email', 'meeting']),
  content: z.string().optional(),
  ai_suggested_script: z.string().optional(),
  outcome: z.string().optional(),
  next_follow_up_at: z.string().optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });
const oppParamSchema = z.object({ opportunity_id: z.string().uuid() });

export default async function followUpRoutes(app: FastifyInstance) {

  // GET /by-opportunity/:opportunity_id — 某商机的所有跟进记录
  app.get('/by-opportunity/:opportunity_id', {
    preHandler: [authMiddleware],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { opportunity_id } = oppParamSchema.parse(req.params);
    const result = await query(
      'SELECT * FROM follow_up_logs WHERE opportunity_id = $1 ORDER BY created_at DESC',
      [opportunity_id]
    );
    return reply.send(successResponse(result.rows));
  });

  // GET /:id — 跟进详情
  app.get('/:id', {
    preHandler: [authMiddleware],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);
    const result = await query('SELECT * FROM follow_up_logs WHERE id = $1', [id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(9001, '跟进记录不存在'));
    return reply.send(successResponse(result.rows[0]));
  });

  // POST / — 创建跟进记录
  app.post('/', {
    preHandler: [authMiddleware, requireRole('agent', 'admin'), validate({ body: createBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const body = createBodySchema.parse(req.body);
    const userId = req.user?.sub ?? '';

    const result = await query(
      `INSERT INTO follow_up_logs (opportunity_id, action_type, content, ai_suggested_script, outcome, next_follow_up_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [body.opportunity_id, body.action_type, body.content || null, body.ai_suggested_script || null,
       body.outcome || null, body.next_follow_up_at || null, userId]
    );

    // 同步更新商机的下一步动作
    if (body.next_follow_up_at) {
      await query(
        `UPDATE opportunities SET next_action = $1, next_action_at = $2, updated_at = now() WHERE id = $3`,
        [body.outcome ? `跟进：${body.outcome.substring(0, 100)}` : '已跟进', body.next_follow_up_at, body.opportunity_id]
      );
    }

    return reply.status(201).send(successResponse(result.rows[0]));
  });

  // GET /pending — 待跟进列表（next_follow_up_at <= now 的商机）
  app.get('/pending', {
    preHandler: [authMiddleware, requireRole('agent', 'admin')],
  }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const result = await query(`
      SELECT f.*, o.demand_id, o.status as opportunity_status, o.priority,
             d.title as demand_title
      FROM follow_up_logs f
      JOIN opportunities o ON o.id = f.opportunity_id
      LEFT JOIN demands d ON d.id = o.demand_id
      WHERE f.next_follow_up_at <= now() AND o.status NOT IN ('won', 'lost', 'invalid')
      ORDER BY f.next_follow_up_at ASC
    `);
    return reply.send(successResponse(result.rows));
  });
}
