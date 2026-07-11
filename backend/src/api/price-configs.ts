// 价格配置API
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

const listQuery = z.object({
  config_type: z.enum(['performer_settlement','agent_quote','client_quote']).optional(),
  business_line: z.enum(['venue_booking','outdoor_show','show_sponsor','custom_content','custom_showcase']).optional(),
  tier: z.enum(['T0','T1','T2','T3','T4','T5','T6']).optional(),
});

const updateBody = z.object({
  base_price: z.number().positive().optional(),
  agent_discount: z.number().min(0).max(1).optional(),
  extra_fee_per_5min: z.number().optional(),
  script_creation_fee: z.number().optional(),
  script_performance_fee: z.number().optional(),
  remote_fee_in_city: z.number().optional(),
  remote_fee_out_city: z.number().optional(),
  reason: z.string().min(1, '修改原因必填'),
});

export default async function priceConfigRoutes(app: FastifyInstance) {
  // 列表
  app.get('/', { preHandler: [authMiddleware, requireRole('admin'), validate({ query: listQuery })] },
    async (req, reply) => {
      const { config_type, business_line, tier } = req.query as z.infer<typeof listQuery>;
      const conditions: string[] = [];
      const params: unknown[] = [];
      let i = 1;
      if (config_type) { conditions.push(`config_type = $${i++}`); params.push(config_type); }
      if (business_line) { conditions.push(`business_line = $${i++}`); params.push(business_line); }
      if (tier) { conditions.push(`tier = $${i++}`); params.push(tier); }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const result = await query(`SELECT * FROM price_configs ${where} ORDER BY config_type, business_line, tier`, params);
      return reply.send(successResponse(result.rows));
    });

  // 更新
  app.put('/:id', { preHandler: [authMiddleware, requireRole('admin'), validate({ body: updateBody })] },
    async (req, reply) => {
      const { id } = req.params as { id: string };
      const body = req.body as z.infer<typeof updateBody>;
      const { reason, ...fields } = body;

      // 查旧值
      const old = await query('SELECT * FROM price_configs WHERE id = $1', [id]);
      if (old.rows.length === 0) return reply.status(404).send(errorResponse(9001, '价格配置不存在'));

      // 构建动态UPDATE
      const oldRow = old.rows[0];
      const setClauses: string[] = [];
      const params: unknown[] = [];
      let i = 1;
      const changed: Record<string, { old: unknown; new: unknown }> = {};
      for (const [key, val] of Object.entries(fields)) {
        if (val !== undefined && val !== oldRow[key]) {
          setClauses.push(`${key} = $${i++}`);
          params.push(val);
          changed[key] = { old: oldRow[key], new: val };
        }
      }
      if (setClauses.length === 0) return reply.send(successResponse({ id }, '无变更'));

      setClauses.push(`updated_by = $${i++}`); params.push(req.user?.sub);
      setClauses.push(`updated_at = NOW()`);
      params.push(id);

      await query(`UPDATE price_configs SET ${setClauses.join(', ')} WHERE id = $${i}`, params);

      // 操作日志
      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'price_config', 'update', 'price_config', $2, $3)`,
        [req.user?.sub, id, JSON.stringify({ reason, changed })]
      );

      return reply.send(successResponse({ id }, '价格配置已更新'));
    });
}
