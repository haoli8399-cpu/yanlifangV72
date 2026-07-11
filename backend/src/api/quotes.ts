// ============================================================
// 报价单管理 API — PRD V3.3.2 第 5.3 / 6.5 节
// 三层价：甲方标准价 / 渠道价(×0.7) / 成本价
// 对齐 UI 设计稿：SKU详情页价格阶梯
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

const createBodySchema = z.object({
  demand_id: z.string().uuid(),
  opportunity_id: z.string().uuid().optional(),
  total_price: z.number().positive(),
  channel_price: z.number().positive().optional(),
  cost_price: z.number().positive().optional(),
  valid_until: z.string().optional(),
  items_snapshot: z.array(z.any()).optional(),
});

const updateBodySchema = z.object({
  total_price: z.number().positive().optional(),
  channel_price: z.number().positive().optional(),
  cost_price: z.number().positive().optional(),
  valid_until: z.string().optional(),
  items_snapshot: z.array(z.any()).optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });

export default async function quoteRoutes(app: FastifyInstance) {

  // GET /by-demand/:demand_id — 查看某需求的所有报价版本
  app.get('/by-demand/:demand_id', {
    preHandler: [authMiddleware],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { demand_id } = z.object({ demand_id: z.string().uuid() }).parse(req.params);
    const result = await query(
      'SELECT * FROM quotes WHERE demand_id = $1 ORDER BY version DESC',
      [demand_id]
    );
    return reply.send(successResponse(result.rows));
  });

  // GET /by-opportunity/:opportunity_id — 查看某商机的所有报价版本
  app.get('/by-opportunity/:opportunity_id', {
    preHandler: [authMiddleware],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { opportunity_id } = z.object({ opportunity_id: z.string().uuid() }).parse(req.params);
    const result = await query(
      'SELECT * FROM quotes WHERE opportunity_id = $1 ORDER BY version DESC',
      [opportunity_id]
    );
    return reply.send(successResponse(result.rows));
  });

  // GET /:id — 报价详情
  app.get('/:id', {
    preHandler: [authMiddleware],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);
    const result = await query('SELECT * FROM quotes WHERE id = $1', [id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(9001, '报价不存在'));
    return reply.send(successResponse(result.rows[0]));
  });

  // POST / — 新建报价（自动计算毛利率+版本号递增）
  app.post('/', {
    preHandler: [authMiddleware, requireRole('agent', 'admin'), validate({ body: createBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const body = createBodySchema.parse(req.body);
    const userId = req.user?.sub ?? '';

    // 自动计算版本号
    const lastVersion = await query(
      'SELECT MAX(version) as max_v FROM quotes WHERE demand_id = $1',
      [body.demand_id]
    );
    const version = (Number(lastVersion.rows[0]?.max_v) || 0) + 1;

    // 自动计算渠道价 = 标准价 × 0.7
    const chPrice = body.channel_price ?? Math.round(body.total_price * 0.7 * 100) / 100;
    // 毛利率
    const costPrice = body.cost_price ?? Math.round(body.total_price * 0.6 * 100) / 100;
    const margin = body.total_price > 0
      ? Math.round(((body.total_price - costPrice) / body.total_price) * 10000) / 100
      : 0;

    const result = await query(
      `INSERT INTO quotes (demand_id, opportunity_id, version, total_price, channel_price, cost_price, margin, valid_until, items_snapshot, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [body.demand_id, body.opportunity_id, version, body.total_price, chPrice, costPrice, margin,
       body.valid_until || null, JSON.stringify(body.items_snapshot || []), userId]
    );

    return reply.status(201).send(successResponse(result.rows[0]));
  });

  // PUT /:id — 更新报价（标记旧版本为 superseded）
  app.put('/:id', {
    preHandler: [authMiddleware, requireRole('agent', 'admin'), validate({ body: updateBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);
    const body = updateBodySchema.parse(req.body);

    const setClauses: string[] = ['updated_at = now()'];
    const params: unknown[] = [];
    let idx = 1;

    if (body.total_price !== undefined) { setClauses.push(`total_price = $${idx++}`); params.push(body.total_price); }
    if (body.channel_price !== undefined) { setClauses.push(`channel_price = $${idx++}`); params.push(body.channel_price); }
    if (body.cost_price !== undefined) { setClauses.push(`cost_price = $${idx++}`); params.push(body.cost_price); }
    if (body.valid_until !== undefined) { setClauses.push(`valid_until = $${idx++}`); params.push(body.valid_until); }
    if (body.items_snapshot !== undefined) { setClauses.push(`items_snapshot = $${idx++}`); params.push(JSON.stringify(body.items_snapshot)); }

    if (body.total_price !== undefined && body.cost_price !== undefined) {
      const margin = body.total_price > 0
        ? Math.round(((body.total_price - body.cost_price) / body.total_price) * 10000) / 100
        : 0;
      setClauses.push(`margin = $${idx++}`);
      params.push(margin);
    }

    if (params.length === 0) return reply.send(errorResponse(9003, '无更新字段'));
    params.push(id);

    const result = await query(
      `UPDATE quotes SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(9001, '报价不存在'));
    return reply.send(successResponse(result.rows[0]));
  });
}
