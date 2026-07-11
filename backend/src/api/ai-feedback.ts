// ============================================================
// AI 推荐反馈 API — PRD V3.3.2 第 5.3 节
// 追踪 AI 生成方案的采纳/拒绝/调整情况
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import { successResponse } from '../utils/response.js';

const createBodySchema = z.object({
  demand_id: z.string().uuid().optional(),
  quote_id: z.string().uuid().optional(),
  feedback_type: z.enum(['accept', 'reject', 'adjust']),
  feedback: z.string().optional(),
  was_accepted: z.boolean(),
  ai_model: z.string().optional(),
});

interface FeedbackStatsRow {
  accepted: string;
  rejected: string;
  type_count: string;
  feedback_type: string;
}

export default async function aiFeedbackRoutes(app: FastifyInstance) {

  // POST / — 记录 AI 反馈
  app.post('/', {
    preHandler: [authMiddleware, validate({ body: createBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const body = createBodySchema.parse(req.body);
    const userId = req.user?.sub ?? '';

    // 如果是 reject，自动标记对应的 quote
    if (!body.was_accepted && body.quote_id) {
      await query(
        `UPDATE quotes SET status = 'rejected', rejection_reason = $1 WHERE id = $2`,
        [body.feedback || 'AI方案被拒绝', body.quote_id]
      );
    }

    const result = await query(
      `INSERT INTO ai_feedback_logs (demand_id, quote_id, feedback_type, feedback, was_accepted, ai_model, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [body.demand_id || null, body.quote_id || null, body.feedback_type,
       body.feedback || null, body.was_accepted, body.ai_model || 'deepseek-v4', userId]
    );

    return reply.status(201).send(successResponse(result.rows[0]));
  });

  // GET /stats — 采纳率统计
  app.get('/stats', {
    preHandler: [authMiddleware, requireRole('agent', 'admin')],
  }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const result = await query<FeedbackStatsRow>(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE was_accepted = true) as accepted,
        COUNT(*) FILTER (WHERE was_accepted = false) as rejected,
        ROUND(COUNT(*) FILTER (WHERE was_accepted = true) * 100.0 / NULLIF(COUNT(*), 0), 1) as acceptance_rate,
        feedback_type,
        COUNT(*) as type_count
      FROM ai_feedback_logs
      GROUP BY feedback_type
      ORDER BY type_count DESC
    `);
    return reply.send(successResponse({
      summary: result.rows.length > 0 ? {
        total: result.rows.reduce((s, r) => s + parseInt(r.type_count, 10), 0),
        accepted: result.rows.filter((r) => Number(r.accepted) > 0).reduce((s, r) => s + parseInt(r.accepted, 10), 0),
        rejected: result.rows.filter((r) => Number(r.rejected) > 0).reduce((s, r) => s + parseInt(r.rejected, 10), 0),
      } : { total: 0, accepted: 0, rejected: 0 },
      byType: result.rows,
    }));
  });

  // GET / — 列表
  app.get('/', {
    preHandler: [authMiddleware],
  }, async (_req: FastifyRequest, reply: FastifyReply) => {
    const result = await query(
      'SELECT * FROM ai_feedback_logs ORDER BY created_at DESC LIMIT 50'
    );
    return reply.send(successResponse(result.rows));
  });
}
