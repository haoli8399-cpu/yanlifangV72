// ============================================================
// SKU 自定义字段配置 API
// ============================================================

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import { createdResponse, errorResponse, successResponse } from '../utils/response.js';

const fieldTypeSchema = z.enum(['text', 'number', 'switch', 'select']);
const idParamSchema = z.object({ id: z.string().uuid() });
const optionsSchema = z.array(z.string().min(1)).default([]);

const createBodySchema = z.object({
  name: z.string().min(1).max(100),
  field_type: fieldTypeSchema,
  options: optionsSchema.optional(),
  required: z.boolean().optional().default(false),
  sort_order: z.number().int().optional().default(0),
});

const updateBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  field_type: fieldTypeSchema.optional(),
  options: optionsSchema.optional(),
  required: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

interface SkuCustomFieldRow {
  id: string;
  name: string;
  field_type: 'text' | 'number' | 'switch' | 'select';
  options: string[];
  required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function normalizeOptions(fieldType: SkuCustomFieldRow['field_type'], options?: string[]): string[] {
  if (fieldType !== 'select') {
    return [];
  }
  return options ?? [];
}

function validateSelectOptions(fieldType: SkuCustomFieldRow['field_type'], options: string[]): string | null {
  if (fieldType === 'select' && options.length === 0) {
    return 'select 类型字段必须提供 options';
  }
  return null;
}

export default async function skuCustomFieldRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/',
    {
      preHandler: [authMiddleware, requireRole('admin')],
    },
    async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const result = await query<SkuCustomFieldRow>(
        `SELECT id, name, field_type, options, required, sort_order, created_at, updated_at
         FROM sku_custom_fields
         ORDER BY sort_order ASC, created_at ASC`
      );

      reply.send(successResponse(result.rows));
    }
  );

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
      const options = normalizeOptions(body.field_type, body.options);
      const optionError = validateSelectOptions(body.field_type, options);

      if (optionError) {
        reply.status(400).send(errorResponse(2101, optionError));
        return;
      }

      const existing = await query<{ id: string }>(
        'SELECT id FROM sku_custom_fields WHERE lower(name) = lower($1)',
        [body.name]
      );
      if (existing.rows.length > 0) {
        reply.status(409).send(errorResponse(2102, '自定义字段名称已存在'));
        return;
      }

      const result = await query<{ id: string }>(
        `INSERT INTO sku_custom_fields (name, field_type, options, required, sort_order)
         VALUES ($1, $2, $3::jsonb, $4, $5)
         RETURNING id`,
        [
          body.name,
          body.field_type,
          JSON.stringify(options),
          body.required,
          body.sort_order,
        ]
      );

      reply.status(201).send(createdResponse({ id: result.rows[0].id }, '自定义字段已创建'));
    }
  );

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

      const current = await query<SkuCustomFieldRow>(
        'SELECT * FROM sku_custom_fields WHERE id = $1',
        [id]
      );
      if (current.rows.length === 0) {
        reply.status(404).send(errorResponse(2103, '自定义字段不存在'));
        return;
      }

      if (body.name) {
        const conflict = await query<{ id: string }>(
          'SELECT id FROM sku_custom_fields WHERE lower(name) = lower($1) AND id != $2',
          [body.name, id]
        );
        if (conflict.rows.length > 0) {
          reply.status(409).send(errorResponse(2102, '自定义字段名称已存在'));
          return;
        }
      }

      const nextType = body.field_type ?? current.rows[0].field_type;
      const nextOptions = normalizeOptions(nextType, body.options ?? current.rows[0].options);
      const optionError = validateSelectOptions(nextType, nextOptions);
      if (optionError) {
        reply.status(400).send(errorResponse(2101, optionError));
        return;
      }

      const setClauses: string[] = [];
      const params: unknown[] = [];
      let idx = 0;

      if (body.name !== undefined) {
        params.push(body.name);
        setClauses.push(`name = $${++idx}`);
      }
      if (body.field_type !== undefined) {
        params.push(body.field_type);
        setClauses.push(`field_type = $${++idx}`);
      }
      if (body.options !== undefined || body.field_type !== undefined) {
        params.push(JSON.stringify(nextOptions));
        setClauses.push(`options = $${++idx}::jsonb`);
      }
      if (body.required !== undefined) {
        params.push(body.required);
        setClauses.push(`required = $${++idx}`);
      }
      if (body.sort_order !== undefined) {
        params.push(body.sort_order);
        setClauses.push(`sort_order = $${++idx}`);
      }

      if (setClauses.length === 0) {
        reply.send(successResponse({ id }, '自定义字段已更新'));
        return;
      }

      params.push(id);
      await query(
        `UPDATE sku_custom_fields
         SET ${setClauses.join(', ')}, updated_at = NOW()
         WHERE id = $${++idx}`,
        params
      );

      reply.send(successResponse({ id }, '自定义字段已更新'));
    }
  );

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

      const result = await query<{ id: string }>(
        'DELETE FROM sku_custom_fields WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        reply.status(404).send(errorResponse(2103, '自定义字段不存在'));
        return;
      }

      reply.send(successResponse({ id }, '自定义字段已删除'));
    }
  );
}
