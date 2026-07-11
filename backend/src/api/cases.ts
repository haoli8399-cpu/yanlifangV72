// ============================================================
// 案例管理路由处理器 (P-23)
// CRUD /v1/cases
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

const listQuerySchema = z.object({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  sku_id: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const createBodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  cover_url: z.string().optional(),
  images: z.array(z.string()).optional(),
  sku_id: z.string().uuid().nullable().optional(),
  performer_ids: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
  sort_order: z.number().int().optional().default(0),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
});

const updateBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  cover_url: z.string().optional(),
  images: z.array(z.string()).optional(),
  sku_id: z.string().uuid().nullable().optional(),
  performer_ids: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
  sort_order: z.number().int().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

// ============================================================
// 数据库行类型
// ============================================================

interface CaseRow {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  images: string[];
  sku_id: string | null;
  performer_ids: string[];
  tags: string[];
  sort_order: number;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// 路由注册
// ============================================================

export default async function caseRoutes(app: FastifyInstance): Promise<void> {
  // GET /v1/cases - 案例列表
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

      if (q.status) {
        idx++;
        conditions.push(`c.status = $${idx}`);
        params.push(q.status);
      }
      if (q.sku_id) {
        idx++;
        conditions.push(`c.sku_id = $${idx}`);
        params.push(q.sku_id);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const limitIdx = idx + 1;
      const offsetIdx = idx + 2;

      const [dataResult, countResult] = await Promise.all([
        query<CaseRow>(
          `SELECT c.* FROM cases c
           ${whereClause}
           ORDER BY c.sort_order ASC, c.created_at DESC
           LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
          [...params, pageSize, offset]
        ),
        query<{ total: string }>(
          `SELECT COUNT(*) AS total FROM cases c ${whereClause}`,
          params
        ),
      ]);

      const items = dataResult.rows.map((row) => ({
        ...row,
        images: typeof row.images === 'string' ? JSON.parse(row.images as string) : (row.images || []),
        performer_ids: typeof row.performer_ids === 'string' ? JSON.parse(row.performer_ids as string) : (row.performer_ids || []),
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags as string) : (row.tags || []),
      }));

      reply.send(paginatedResponse(items, Number(countResult.rows[0].total), page, pageSize));
    }
  );

  // GET /v1/cases/:id - 案例详情
  app.get(
    '/:id',
    {
      preHandler: [validate({ params: idParamSchema })],
    },
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const { id } = request.params as z.infer<typeof idParamSchema>;

      const result = await query<CaseRow>('SELECT * FROM cases WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        reply.status(404).send(errorResponse(8001, '案例不存在'));
        return;
      }

      const row = result.rows[0];
      const data = {
        ...row,
        images: typeof row.images === 'string' ? JSON.parse(row.images as string) : (row.images || []),
        performer_ids: typeof row.performer_ids === 'string' ? JSON.parse(row.performer_ids as string) : (row.performer_ids || []),
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags as string) : (row.tags || []),
      };

      reply.send(successResponse(data));
    }
  );

  // POST /v1/cases - 创建案例 (admin)
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
        `INSERT INTO cases (title, description, cover_url, images, sku_id, performer_ids, tags, sort_order, status, created_by)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb, $7::jsonb, $8, $9, $10)
         RETURNING id`,
        [
          body.title,
          body.description ?? null,
          body.cover_url ?? null,
          JSON.stringify(body.images ?? []),
          body.sku_id ?? null,
          JSON.stringify(body.performer_ids ?? []),
          JSON.stringify(body.tags ?? []),
          body.sort_order ?? 0,
          body.status ?? 'draft',
          operatorId,
        ]
      );

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'case', 'create', 'case', $2, $3)`,
        [operatorId, result.rows[0].id, JSON.stringify({ title: body.title })]
      );

      reply.status(201).send(createdResponse({ id: result.rows[0].id }, '案例已创建'));
    }
  );

  // PUT /v1/cases/:id - 更新案例 (admin)
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

      const existing = await query<CaseRow>('SELECT * FROM cases WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(8001, '案例不存在'));
        return;
      }

      const scalarFieldMap: Record<string, string> = {
        title: 'title',
        description: 'description',
        cover_url: 'cover_url',
        sku_id: 'sku_id',
        sort_order: 'sort_order',
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

      if (body.images !== undefined) {
        idx++;
        setClauses.push(`images = $${idx}::jsonb`);
        params.push(JSON.stringify(body.images));
      }
      if (body.performer_ids !== undefined) {
        idx++;
        setClauses.push(`performer_ids = $${idx}::jsonb`);
        params.push(JSON.stringify(body.performer_ids));
      }
      if (body.tags !== undefined) {
        idx++;
        setClauses.push(`tags = $${idx}::jsonb`);
        params.push(JSON.stringify(body.tags));
      }

      if (setClauses.length === 0) {
        reply.send(successResponse({ id }, '案例已更新'));
        return;
      }

      idx++;
      setClauses.push(`updated_at = NOW()`);
      idx++;
      params.push(id);

      await query(
        `UPDATE cases SET ${setClauses.join(', ')} WHERE id = $${idx}`,
        params
      );

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'case', 'update', 'case', $2, $3)`,
        [operatorId, id, JSON.stringify(body)]
      );

      reply.send(successResponse({ id }, '案例已更新'));
    }
  );

  // DELETE /v1/cases/:id - 删除案例 (admin)
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

      const existing = await query<CaseRow>('SELECT id, title FROM cases WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(8001, '案例不存在'));
        return;
      }

      await query('DELETE FROM cases WHERE id = $1', [id]);

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'case', 'delete', 'case', $2, $3)`,
        [operatorId, id, JSON.stringify({ title: existing.rows[0].title })]
      );

      reply.send(successResponse({ id }, '案例已删除'));
    }
  );
}
