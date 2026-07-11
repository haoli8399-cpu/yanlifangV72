// ============================================================
// AI 模板管理路由处理器 (P-24)
// CRUD /v1/ai-templates
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  normalizePagination,
  createdResponse,
} from '../utils/response.js';

// ============================================================
// Zod 校验 Schema
// ============================================================

const idParamSchema = z.object({ id: z.string().uuid() });

const businessLineSchema = z.enum([
  'venue_booking', 'outdoor_show', 'show_sponsor', 'custom_content', 'custom_showcase',
]);

const listQuerySchema = z.object({
  business_line: businessLineSchema.optional(),
  status: z.enum(['active', 'inactive']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const variableSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['string', 'number', 'boolean', 'array']).default('string'),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
});

const createBodySchema = z.object({
  name: z.string().min(1).max(200),
  business_line: businessLineSchema.optional(),
  description: z.string().optional(),
  template_content: z.string().min(1),
  variables: z.array(variableSchema).optional(),
  is_default: z.boolean().optional().default(false),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

const updateBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  business_line: businessLineSchema.optional(),
  description: z.string().optional(),
  template_content: z.string().min(1).optional(),
  variables: z.array(variableSchema).optional(),
  is_default: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// ============================================================
// 数据库行类型
// ============================================================

interface TemplateRow {
  id: string;
  name: string;
  business_line: string | null;
  description: string | null;
  template_content: string;
  variables: Array<{ name: string; type: string; required: boolean; default?: unknown }>;
  is_default: boolean;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// 路由注册
// ============================================================

export default async function aiTemplateRoutes(app: FastifyInstance): Promise<void> {
  // GET /v1/ai-templates - 模板列表
  app.get(
    '/',
    {
      preHandler: [validate({ query: listQuerySchema })],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const q = request.query as z.infer<typeof listQuerySchema>;
      const { page, pageSize, offset } = normalizePagination(q.page, q.pageSize);

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 0;

      if (q.business_line) {
        idx++;
        conditions.push(`t.business_line = $${idx}`);
        params.push(q.business_line);
      }
      if (q.status) {
        idx++;
        conditions.push(`t.status = $${idx}`);
        params.push(q.status);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const limitIdx = idx + 1;
      const offsetIdx = idx + 2;

      const [dataResult, countResult] = await Promise.all([
        query<TemplateRow>(
          `SELECT t.* FROM ai_templates t
           ${whereClause}
           ORDER BY t.is_default DESC, t.updated_at DESC
           LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
          [...params, pageSize, offset]
        ),
        query<{ total: string }>(
          `SELECT COUNT(*) AS total FROM ai_templates t ${whereClause}`,
          params
        ),
      ]);

      reply.send(paginatedResponse(
        dataResult.rows,
        Number(countResult.rows[0].total),
        page,
        pageSize
      ));
    }
  );

  // GET /v1/ai-templates/:id - 模板详情
  app.get(
    '/:id',
    {
      preHandler: [validate({ params: idParamSchema })],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { id } = request.params as z.infer<typeof idParamSchema>;

      const result = await query<TemplateRow>('SELECT * FROM ai_templates WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        reply.status(404).send(errorResponse(9001, '模板不存在'));
        return;
      }

      reply.send(successResponse(result.rows[0]));
    }
  );

  // POST /v1/ai-templates - 创建模板 (admin)
  app.post(
    '/',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ body: createBodySchema }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const body = request.body as z.infer<typeof createBodySchema>;
      const operatorId = request.user.sub;

      const result = await query<{ id: string }>(
        `INSERT INTO ai_templates (name, business_line, description, template_content, variables, is_default, status, created_by)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)
         RETURNING id`,
        [
          body.name,
          body.business_line ?? null,
          body.description ?? null,
          body.template_content,
          JSON.stringify(body.variables ?? []),
          body.is_default ?? false,
          body.status ?? 'active',
          operatorId,
        ]
      );

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'ai_template', 'create', 'ai_template', $2, $3)`,
        [operatorId, result.rows[0].id, JSON.stringify({ name: body.name, business_line: body.business_line })]
      );

      reply.status(201).send(createdResponse({ id: result.rows[0].id }, '模板已创建'));
    }
  );

  // PUT /v1/ai-templates/:id - 更新模板 (admin)
  app.put(
    '/:id',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: idParamSchema, body: updateBodySchema }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const body = request.body as z.infer<typeof updateBodySchema>;
      const operatorId = request.user.sub;

      const existing = await query<TemplateRow>('SELECT * FROM ai_templates WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(9001, '模板不存在'));
        return;
      }

      const scalarFieldMap: Record<string, string> = {
        name: 'name',
        business_line: 'business_line',
        description: 'description',
        template_content: 'template_content',
        is_default: 'is_default',
        status: 'status',
      };

      const setClauses: string[] = [];
      const params: unknown[] = [];
      let idx = 0;

      for (const [key, col] of Object.entries(scalarFieldMap)) {
        if (key in body && body[key as keyof typeof body] !== undefined) {
          idx++;
          setClauses.push(`${col} = $${idx}`);
          params.push(body[key as keyof typeof body]);
        }
      }

      if (body.variables !== undefined) {
        idx++;
        setClauses.push(`variables = $${idx}::jsonb`);
        params.push(JSON.stringify(body.variables));
      }

      if (setClauses.length === 0) {
        reply.send(successResponse({ id }, '模板已更新'));
        return;
      }

      idx++;
      setClauses.push(`updated_at = NOW()`);
      idx++;
      params.push(id);

      await query(
        `UPDATE ai_templates SET ${setClauses.join(', ')} WHERE id = $${idx}`,
        params
      );

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'ai_template', 'update', 'ai_template', $2, $3)`,
        [operatorId, id, JSON.stringify(body)]
      );

      reply.send(successResponse({ id }, '模板已更新'));
    }
  );

  // DELETE /v1/ai-templates/:id - 删除模板 (admin)
  app.delete(
    '/:id',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: idParamSchema }),
      ],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const operatorId = request.user.sub;

      const existing = await query<TemplateRow>('SELECT id, name FROM ai_templates WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(9001, '模板不存在'));
        return;
      }

      await query('DELETE FROM ai_templates WHERE id = $1', [id]);

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'ai_template', 'delete', 'ai_template', $2, $3)`,
        [operatorId, id, JSON.stringify({ name: existing.rows[0].name })]
      );

      reply.send(successResponse({ id }, '模板已删除'));
    }
  );
}
