import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { successResponse } from '../utils/response.js';

const createBody = z.object({
  opportunity_id: z.string().uuid(),
  action_type: z.enum(['call', 'wechat', 'email', 'meeting', 'system']).optional().default('system'),
  content: z.string().optional(),
  ai_suggested_script: z.string().optional(),
  outcome: z.string().optional(),
  next_follow_up_at: z.string().optional(),
});

export default async function followUpRoutes(app: FastifyInstance) {
  // POST /v1/follow-ups — 创建跟进记录
  app.post('/follow-ups', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = createBody.parse(req.body);
    const res = await query(
      `INSERT INTO follow_up_logs (opportunity_id, operator_id, action_type, content, ai_suggested_script, outcome, next_follow_up_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [body.opportunity_id, (req as any).user?.sub, body.action_type, body.content, body.ai_suggested_script, body.outcome, body.next_follow_up_at ? new Date(body.next_follow_up_at) : null]
    );
    return reply.send(successResponse(res.rows[0], '跟进记录已创建'));
  });

  // GET /v1/opportunities/:id/follow-ups — 商机跟进记录列表
  app.get('/opportunities/:id/follow-ups', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const res = await query(
      `SELECT fu.*, u.name as operator_name FROM follow_up_logs fu
       LEFT JOIN users u ON fu.operator_id = u.id
       WHERE fu.opportunity_id = $1 ORDER BY fu.created_at DESC`,
      [id]
    );
    return reply.send(successResponse({ items: res.rows }));
  });
}
