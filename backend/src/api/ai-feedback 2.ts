import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { successResponse } from '../utils/response.js';

const feedbackBody = z.object({
  opportunity_id: z.string().uuid(),
  quote_id: z.string().uuid().optional(),
  feedback_type: z.enum(['demand_parsing', 'plan_recommendation', 'pricing', 'performer_recommendation']),
  feedback_action: z.enum(['accept', 'reject']),
  reject_reason: z.string().optional(),
});

export default async function aiFeedbackRoutes(app: FastifyInstance) {
  // POST /v1/ai/feedback — 记录 AI 推荐反馈
  app.post('/ai/feedback', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = feedbackBody.parse(req.body);
    const db = (app as any).db || (await import('../utils/db.js')).query;
    const { query } = await import('../utils/db.js');
    const res = await query(
      `INSERT INTO ai_feedback_logs (opportunity_id, quote_id, feedback_type, feedback_action, reject_reason, operator_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [body.opportunity_id, body.quote_id || null, body.feedback_type, body.feedback_action, body.reject_reason || null, (req as any).user?.sub]
    );
    return reply.send(successResponse(res.rows[0], '反馈已记录'));
  });
}
