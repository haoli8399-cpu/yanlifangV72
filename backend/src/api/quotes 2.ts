import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

const createBody = z.object({
  demand_id: z.string().uuid(),
  opportunity_id: z.string().uuid(),
  total_price: z.number().positive(),
  channel_price: z.number().optional(),
  cost_price: z.number().optional(),
  items_snapshot: z.array(z.any()).optional().default([]),
  ai_generated: z.boolean().optional().default(false),
});

const statusBody = z.object({
  status: z.enum(['draft', 'sent', 'viewed', 'confirmed', 'rejected', 'expired']),
});

export default async function quoteRoutes(app: FastifyInstance) {
  // POST /v1/quotes — 创建报价（自动递增版本）
  app.post('/quotes', { preHandler: [authMiddleware] }, async (req, reply) => {
    const body = createBody.parse(req.body);

    // 找当前最大版本号
    const maxVer = await query(
      'SELECT COALESCE(MAX(version), 0) as max_v FROM quotes WHERE opportunity_id = $1',
      [body.opportunity_id]
    );
    const version = Number(maxVer.rows[0].max_v) + 1;

    // 旧版本自动标记过期
    await query(
      "UPDATE quotes SET status = 'expired' WHERE opportunity_id = $1 AND status IN ('sent','draft')",
      [body.opportunity_id]
    );

    const res = await query(
      `INSERT INTO quotes (demand_id, opportunity_id, version, total_price, channel_price, cost_price, items_snapshot, ai_generated, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'draft') RETURNING *`,
      [body.demand_id, body.opportunity_id, version, body.total_price, body.channel_price || body.total_price, body.cost_price || 0, JSON.stringify(body.items_snapshot), body.ai_generated]
    );

    return reply.send(successResponse(res.rows[0], `报价 v${version} 已创建`));
  });

  // GET /v1/opportunities/:id/quotes — 商机所有报价版本
  app.get('/opportunities/:id/quotes', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const res = await query(
      'SELECT * FROM quotes WHERE opportunity_id = $1 ORDER BY version DESC',
      [id]
    );
    return reply.send(successResponse({ items: res.rows }));
  });

  // PATCH /v1/quotes/:id/status — 更新报价状态
  app.patch('/quotes/:id/status', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = statusBody.parse(req.body);
    const res = await query(
      'UPDATE quotes SET status = $1, operator_modified = true WHERE id = $2 RETURNING *',
      [body.status, id]
    );
    if (res.rows.length === 0) return reply.status(404).send(errorResponse(9901, '报价不存在'));
    return reply.send(successResponse(res.rows[0], '报价状态已更新'));
  });

  // GET /v1/quotes/:id — 报价详情
  app.get('/quotes/:id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const res = await query('SELECT * FROM quotes WHERE id = $1', [id]);
    if (res.rows.length === 0) return reply.status(404).send(errorResponse(9901, '报价不存在'));
    return reply.send(successResponse(res.rows[0]));
  });
}
