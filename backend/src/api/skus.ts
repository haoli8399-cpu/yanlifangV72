// ============================================================
// SKU 方案库路由处理器
// 对齐 docs/API_CONTRACT.md 第 2.2 节（5 个端点）
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query, transaction } from '../utils/db.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  normalizePagination,
  createdResponse,
} from '../utils/response.js';
import type {
  SkuListItem,
  SkuDetail,
  BusinessLine,
  SkuCustomFieldValue,
  SkuCustomFieldType,
} from '../types/index.js';

// ============================================================
// Zod 校验 Schema
// ============================================================

/** 业务线枚举（对齐 API_CONTRACT.md） */
const businessLineSchema = z.enum([
  'venue_booking',
  'outdoor_show',
  'show_sponsor',
  'custom_content',
  'custom_showcase',
]);

/** SKU 状态枚举 */
const skuStatusSchema = z.enum(['active', 'inactive']);

/** GET /v1/skus 查询参数 */
const listQuerySchema = z.object({
  business_line: businessLineSchema.optional(),
  style: z.string().optional(),
  min_price: z.coerce.number().positive().optional(),
  max_price: z.coerce.number().positive().optional(),
  status: skuStatusSchema.optional().default('active'),
  keyword: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

/** GET /v1/skus/:id 路径参数 */
const idParamSchema = z.object({
  id: z.string().uuid(),
});

/** POST /v1/skus 请求体 */
const createBodySchema = z.object({
  name: z.string().min(1).max(200),
  business_line: businessLineSchema,
  description: z.string().min(1),
  performer_profile: z.string().min(1),
  style_tags: z.array(z.string().min(1)).min(1),
  applicable_scenes: z.array(z.string().min(1)).min(1),
  base_price: z.number().positive(),
  duration_minutes: z.number().int().positive(),
  performers_count: z.number().int().positive(),
  media_urls: z.array(z.string().url()).optional(),
});

/** PUT /v1/skus/:id 请求体（所有字段可选） */
const updateBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  business_line: businessLineSchema.optional(),
  description: z.string().min(1).optional(),
  performer_profile: z.string().min(1).optional(),
  style_tags: z.array(z.string().min(1)).min(1).optional(),
  applicable_scenes: z.array(z.string().min(1)).min(1).optional(),
  base_price: z.number().positive().optional(),
  duration_minutes: z.number().int().positive().optional(),
  performers_count: z.number().int().positive().optional(),
  media_urls: z.array(z.string().url()).optional(),
});

/** PATCH /v1/skus/:id/status 请求体 */
const statusBodySchema = z.object({
  status: skuStatusSchema,
});

const customValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

const customValuesBodySchema = z.object({
  values: z.union([
    z.array(z.object({
      field_id: z.string().uuid(),
      value: customValueSchema,
    })),
    z.record(z.string().uuid(), customValueSchema),
  ]),
});

// ============================================================
// 数据库行类型（映射 skus 表）
// ============================================================

interface SkuRow {
  id: string;
  name: string;
  business_line: string;
  description: string;
  performer_profile: string;
  style_tags: string[];
  applicable_scenes: string[];
  base_price: number;
  duration_minutes: number;
  performers_count: number;
  cover_url: string;
  media_urls: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface SkuCustomFieldRow {
  id: string;
  name: string;
  field_type: SkuCustomFieldType;
  options: string[];
  required: boolean;
  sort_order: number;
  value: string | number | boolean | null;
}

interface CustomValueInput {
  field_id: string;
  value: string | number | boolean | null;
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 将数据库行映射为 SkuListItem
 * agent_price 按 base_price × 0.7 计算（对齐 FREEZE.md 决策 2.2）
 */
function toSkuListItem(row: SkuRow): SkuListItem {
  return {
    id: row.id,
    name: row.name,
    business_line: row.business_line as BusinessLine,
    description: row.description,
    performer_profile: row.performer_profile,
    style_tags: row.style_tags,
    applicable_scenes: row.applicable_scenes,
    base_price: Number(row.base_price),
    agent_price: Math.round(Number(row.base_price) * 0.7),
    duration_minutes: row.duration_minutes,
    performers_count: row.performers_count,
    cover_url: row.cover_url,
    status: row.status as SkuListItem['status'],
    created_at: row.created_at,
  };
}

/**
 * 将数据库行映射为 SkuDetail
 */
function toSkuDetail(row: SkuRow, customFields: SkuCustomFieldValue[] = []): SkuDetail {
  return {
    ...toSkuListItem(row),
    media_urls: row.media_urls,
    custom_fields: customFields,
    updated_at: row.updated_at,
  };
}

async function getSkuCustomFields(skuId: string): Promise<SkuCustomFieldValue[]> {
  const result = await query<SkuCustomFieldRow>(
    `SELECT f.id, f.name, f.field_type, f.options, f.required, f.sort_order, v.value
     FROM sku_custom_fields f
     LEFT JOIN sku_custom_values v
       ON v.field_id = f.id AND v.sku_id = $1
     ORDER BY f.sort_order ASC, f.created_at ASC`,
    [skuId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    field_type: row.field_type,
    options: row.options,
    required: row.required,
    sort_order: row.sort_order,
    value: row.value,
  }));
}

function normalizeCustomValues(
  values: z.infer<typeof customValuesBodySchema>['values']
): CustomValueInput[] {
  if (Array.isArray(values)) {
    return values;
  }

  return Object.entries(values).map(([fieldId, value]) => ({
    field_id: fieldId,
    value,
  }));
}

function isEmptyCustomValue(value: CustomValueInput['value']): boolean {
  return value === null || value === '';
}

function validateCustomValue(
  field: SkuCustomFieldValue,
  value: CustomValueInput['value']
): string | null {
  if (isEmptyCustomValue(value)) {
    return field.required ? `${field.name} 为必填字段` : null;
  }

  if (field.field_type === 'text' && typeof value !== 'string') {
    return `${field.name} 必须是文本`;
  }
  if (field.field_type === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) {
    return `${field.name} 必须是数字`;
  }
  if (field.field_type === 'switch' && typeof value !== 'boolean') {
    return `${field.name} 必须是开关布尔值`;
  }
  if (field.field_type === 'select' && (typeof value !== 'string' || !field.options.includes(value))) {
    return `${field.name} 必须是有效下拉选项`;
  }

  return null;
}

// ============================================================
// 路由注册
// ============================================================

export default async function skuRoutes(app: FastifyInstance): Promise<void> {
  // ==========================================================
  // GET /v1/skus - SKU 列表（公开）
  // ==========================================================
  app.get(
    '/',
    {
      preHandler: [validate({ query: listQuerySchema })],
    },
    async function listSkus(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const q = request.query as z.infer<typeof listQuerySchema>;
      const { page, pageSize, offset } = normalizePagination(q.page, q.pageSize);

      // 动态构建 WHERE 条件（参数化查询）
      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 0;

      // 状态筛选
      idx++;
      conditions.push(`s.status = $${idx}`);
      params.push(q.status);

      // 业务线筛选
      if (q.business_line) {
        idx++;
        conditions.push(`s.business_line = $${idx}`);
        params.push(q.business_line);
      }

      // 风格筛选（匹配 style_tags 数组）
      if (q.style) {
        idx++;
        conditions.push(`$${idx} = ANY(s.style_tags)`);
        params.push(q.style);
      }

      // 价格区间
      if (q.min_price !== undefined) {
        idx++;
        conditions.push(`s.base_price >= $${idx}`);
        params.push(q.min_price);
      }
      if (q.max_price !== undefined) {
        idx++;
        conditions.push(`s.base_price <= $${idx}`);
        params.push(q.max_price);
      }

      // 关键词搜索（ILIKE）
      if (q.keyword) {
        idx++;
        const keywordParam = `%${q.keyword}%`;
        conditions.push(
          `(s.name ILIKE $${idx} OR s.description ILIKE $${idx})`
        );
        params.push(keywordParam);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // 分页查询 + 总数查询
      const limitIdx = idx + 1;
      const offsetIdx = idx + 2;

      const [dataResult, countResult] = await Promise.all([
        query<SkuRow>(
          `SELECT s.*, ROUND(s.base_price * 0.7) AS agent_price
           FROM skus s
           ${whereClause}
           ORDER BY s.created_at DESC
           LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
          [...params, pageSize, offset]
        ),
        query<{ total: string }>(
          `SELECT COUNT(*) AS total FROM skus s ${whereClause}`,
          params
        ),
      ]);

      const items = dataResult.rows.map(toSkuListItem);
      const total = Number(countResult.rows[0].total);

      reply
        .status(200)
        .send(paginatedResponse(items, total, page, pageSize));
    }
  );

  // ==========================================================
  // GET /v1/skus/:id - SKU 详情（公开）
  // ==========================================================
  app.get(
    '/:id',
    {
      preHandler: [validate({ params: idParamSchema })],
    },
    async function getSku(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof idParamSchema>;

      const result = await query<SkuRow>(
        'SELECT * FROM skus WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        reply.status(404).send(errorResponse(2002, 'SKU不存在'));
        return;
      }

      const customFields = await getSkuCustomFields(id);

      reply.status(200).send(successResponse(toSkuDetail(result.rows[0], customFields)));
    }
  );

  // ==========================================================
  // PUT /v1/skus/:id/custom-values - 更新 SKU 自定义字段值（admin）
  // ==========================================================
  app.put(
    '/:id/custom-values',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: idParamSchema, body: customValuesBodySchema }),
      ],
    },
    async function updateSkuCustomValues(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const body = request.body as z.infer<typeof customValuesBodySchema>;
      const incomingValues = normalizeCustomValues(body.values);

      const sku = await query<{ id: string }>('SELECT id FROM skus WHERE id = $1', [id]);
      if (sku.rows.length === 0) {
        reply.status(404).send(errorResponse(2002, 'SKU不存在'));
        return;
      }

      const customFields = await getSkuCustomFields(id);
      const fieldsById = new Map(customFields.map((field) => [field.id, field]));
      const mergedValues = new Map(customFields.map((field) => [field.id, field.value]));

      for (const item of incomingValues) {
        const field = fieldsById.get(item.field_id);
        if (!field) {
          reply.status(400).send(errorResponse(2104, '自定义字段不存在'));
          return;
        }

        const validationError = validateCustomValue(field, item.value);
        if (validationError) {
          reply.status(400).send(errorResponse(2105, validationError));
          return;
        }

        mergedValues.set(item.field_id, item.value);
      }

      for (const field of customFields) {
        const mergedValue = mergedValues.get(field.id) ?? null;
        if (field.required && isEmptyCustomValue(mergedValue)) {
          reply.status(400).send(errorResponse(2105, `${field.name} 为必填字段`));
          return;
        }
      }

      await transaction(async (client) => {
        for (const item of incomingValues) {
          await client.query(
            `INSERT INTO sku_custom_values (sku_id, field_id, value)
             VALUES ($1, $2, $3::jsonb)
             ON CONFLICT (sku_id, field_id)
             DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
            [id, item.field_id, JSON.stringify(item.value)]
          );
        }
      });

      reply.send(successResponse({ id }, 'SKU自定义字段值已更新'));
    }
  );

  // ==========================================================
  // POST /v1/skus - 创建 SKU（admin）
  // ==========================================================
  app.post(
    '/',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ body: createBodySchema }),
      ],
    },
    async function createSku(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const body = request.body as z.infer<typeof createBodySchema>;

      // 检查名称唯一性
      const existing = await query<{ id: string }>(
        'SELECT id FROM skus WHERE name = $1',
        [body.name]
      );

      if (existing.rows.length > 0) {
        reply.status(409).send(errorResponse(2001, 'SKU名称已存在'));
        return;
      }

      // 插入新 SKU
      const result = await query<{ id: string }>(
        `INSERT INTO skus (
           name, business_line, description, performer_profile,
           style_tags, applicable_scenes, base_price,
           duration_minutes, performers_count, media_urls
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          body.name,
          body.business_line,
          body.description,
          body.performer_profile,
          body.style_tags,
          body.applicable_scenes,
          body.base_price,
          body.duration_minutes,
          body.performers_count,
          body.media_urls ?? null,
        ]
      );

      reply
        .status(201)
        .send(createdResponse({ id: result.rows[0].id }, 'SKU创建成功'));
    }
  );

  // ==========================================================
  // PUT /v1/skus/:id - 更新 SKU（admin）
  // ==========================================================
  app.put(
    '/:id',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: idParamSchema, body: updateBodySchema }),
      ],
    },
    async function updateSku(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const body = request.body as z.infer<typeof updateBodySchema>;

      // 检查 SKU 是否存在
      const existing = await query<SkuRow>(
        'SELECT id, name FROM skus WHERE id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(2002, 'SKU不存在'));
        return;
      }

      // 如果更新了 name，检查是否与已有 SKU 冲突
      if (body.name && body.name !== existing.rows[0].name) {
        const conflict = await query<{ id: string }>(
          'SELECT id FROM skus WHERE name = $1 AND id != $2',
          [body.name, id]
        );

        if (conflict.rows.length > 0) {
          reply.status(409).send(errorResponse(2001, 'SKU名称已存在'));
          return;
        }
      }

      // 动态构建 SET 子句（参数化查询）
      const fieldMap: Record<string, string> = {
        name: 'name',
        business_line: 'business_line',
        description: 'description',
        performer_profile: 'performer_profile',
        style_tags: 'style_tags',
        applicable_scenes: 'applicable_scenes',
        base_price: 'base_price',
        duration_minutes: 'duration_minutes',
        performers_count: 'performers_count',
        media_urls: 'media_urls',
      };

      const setClauses: string[] = [];
      const params: unknown[] = [];
      let idx = 0;

      for (const [key, col] of Object.entries(fieldMap)) {
        if (key in body && body[key as keyof typeof body] !== undefined) {
          idx++;
          setClauses.push(`${col} = $${idx}`);
          params.push(body[key as keyof typeof body]);
        }
      }

      if (setClauses.length === 0) {
        reply.status(200).send(successResponse({ id }, 'SKU更新成功'));
        return;
      }

      // 更新 updated_at
      idx++;
      setClauses.push(`updated_at = NOW()`);

      // ID 作为最后一个参数
      idx++;
      params.push(id);

      await query(
        `UPDATE skus SET ${setClauses.join(', ')} WHERE id = $${idx}`,
        params
      );

      reply.status(200).send(successResponse({ id }, 'SKU更新成功'));
    }
  );

  // ==========================================================
  // PATCH /v1/skus/:id/status - 上架/下架（admin）
  // ==========================================================
  app.patch(
    '/:id/status',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: idParamSchema, body: statusBodySchema }),
      ],
    },
    async function updateSkuStatus(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const { status } = request.body as z.infer<typeof statusBodySchema>;

      // 检查 SKU 是否存在
      const result = await query<SkuRow>(
        `UPDATE skus
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, status`,
        [status, id]
      );

      if (result.rows.length === 0) {
        reply.status(404).send(errorResponse(2002, 'SKU不存在'));
        return;
      }

      reply
        .status(200)
        .send(
          successResponse(
            { id: result.rows[0].id, status: result.rows[0].status },
            '状态已更新'
          )
        );
    }
  );
}
