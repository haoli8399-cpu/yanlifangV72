// TODO: Phase 2 拆分
// ============================================================
// 演员管理路由处理器
// 对齐 docs/API_CONTRACT.md 第 2.6、2.7、2.8 节（9 个端点）
// 对齐 docs/演员分层管理体系.md · 咖位升降级规则
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole, optionalAuth } from '../middleware/auth.js';
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
  PerformerTier,
  CreditLevel,
  PerformerStatus,
  PerformerListItem,
  PerformerDetail,
  TierHistoryEntry,
  TierSuggestion,
  CreditDetail,
  CreditLogEntry,
} from '../types/index.js';

// ============================================================
// Zod 校验 Schema
// ============================================================

/** 演员咖位枚举 */
const performerTierSchema = z.enum(['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6']);

/** 信誉等级枚举 */
const creditLevelSchema = z.enum(['S', 'A', 'B', 'C', 'D']);

/** 演员状态枚举 */
const performerStatusSchema = z.enum(['active', 'inactive']);

/** GET /v1/performers 查询参数 */
const listQuerySchema = z.object({
  tier: performerTierSchema.optional(),
  credit_level: creditLevelSchema.optional(),
  style: z.string().optional(),
  status: performerStatusSchema.optional().default('active'),
  keyword: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

/** 路径参数：演员 ID */
const idParamSchema = z.object({
  id: z.string().uuid(),
});

/** POST /v1/performers 请求体 */
const createBodySchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(1).max(11),
  style_tags: z.array(z.string().min(1)).optional(),
  introduction: z.string().optional(),
  highlights: z.string().optional(),
  media_urls: z.array(z.string()).optional(),
  social_links: z.record(z.string(), z.string()).optional(),
  experience_years: z.number().int().min(0).optional(),
  tier: performerTierSchema.optional().default('T6'),
});

/** PUT /v1/performers/:id 请求体（所有字段可选） */
const updateBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(11).optional(),
  style_tags: z.array(z.string().min(1)).optional(),
  introduction: z.string().optional(),
  highlights: z.string().optional(),
  media_urls: z.array(z.string()).optional(),
  social_links: z.record(z.string(), z.string()).optional(),
  experience_years: z.number().int().min(0).optional(),
  tier: performerTierSchema.optional(),
  status: performerStatusSchema.optional(),
  avatar_url: z.string().optional(),
  cover_url: z.string().optional(),
  contract_type: z.string().optional(),
  exclusivity: z.boolean().optional(),
  settlement_rate: z.number().min(0).max(1).optional(),
});

/** PUT /v1/performers/:id/tier 请求体 */
const tierUpdateBodySchema = z.object({
  tier: performerTierSchema,
  reason: z.string().min(1, '调整原因不能为空'),
});

/** GET /v1/performers/:id/credit-logs 查询参数 */
const creditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// ============================================================
// 数据库行类型
// ============================================================

interface PerformerRow {
  id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  style_tags: string[];
  introduction: string | null;
  highlights: string | null;
  media_urls: string[];
  social_links: Record<string, string>;
  experience_years: number;
  rating: number;
  credit_score: number;
  credit_level: string;
  tier: string;
  tier_updated_at: string | null;
  tier_updated_by: string | null;
  contract_type: string | null;
  exclusivity: boolean;
  settlement_rate: number | null;
  status: string;
  protection_remaining: number;
  created_at: string;
  updated_at: string;
}

interface CreditLogRow {
  id: string;
  performer_id: string;
  change_amount: number;
  reason: string;
  related_demand_id: string | null;
  created_at: string;
}

interface TierHistoryRow {
  from_tier: string;
  to_tier: string;
  reason: string;
  operator_id: string;
  operator_name: string;
  created_at: string;
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 将数据库行映射为 PerformerListItem
 */
function toPerformerListItem(row: PerformerRow): PerformerListItem {
  return {
    id: row.id,
    name: row.name,
    avatar_url: row.avatar_url ?? '',
    style_tags: row.style_tags ?? [],
    tier: row.tier as PerformerTier,
    credit_score: Number(row.credit_score),
    credit_level: row.credit_level as CreditLevel,
    rating: Number(row.rating),
    experience_years: row.experience_years ?? 0,
    status: row.status as PerformerStatus,
  };
}

/**
 * 将数据库行映射为 PerformerDetail
 * @param isAdmin 当前用户是否为运营（控制 phone + contract 可见性）
 */
function toPerformerDetail(
  row: PerformerRow,
  isAdmin: boolean
): PerformerDetail {
  const base: PerformerDetail = {
    id: row.id,
    name: row.name,
    phone: isAdmin ? (row.phone ?? '') : '',
    avatar_url: row.avatar_url ?? '',
    cover_url: row.cover_url ?? '',
    style_tags: row.style_tags ?? [],
    introduction: row.introduction ?? '',
    highlights: row.highlights ?? '',
    media_urls: row.media_urls ?? [],
    social_links: row.social_links ?? {},
    experience_years: row.experience_years ?? 0,
    tier: row.tier as PerformerTier,
    tier_updated_at: row.tier_updated_at ?? '',
    credit_score: Number(row.credit_score),
    credit_level: row.credit_level as CreditLevel,
    rating: Number(row.rating),
    status: row.status as PerformerStatus,
    created_at: row.created_at,
  };

  // 签约信息仅运营可见
  if (isAdmin && (row.contract_type || row.exclusivity || row.settlement_rate !== null)) {
    base.contract = {
      type: row.contract_type ?? '',
      exclusivity: row.exclusivity ?? false,
      settlement_rate: row.settlement_rate ?? 0,
    };
  }

  return base;
}

// ============================================================
// 咖位升降级规则（对齐 docs/演员分层管理体系.md 第五节）
// ============================================================

/** 咖位对应的信誉分门槛 */
const TIER_CREDIT_THRESHOLDS: Record<string, number> = {
  T6: 3.5,
  T5: 3.5,
  T4: 3.8,
  T3: 4.0,
  T2: 4.5,
  T1: 4.5,
  T0: Infinity,
};

/** 咖位对应的演出场次门槛 */
const TIER_SHOW_THRESHOLDS: Record<string, number> = {
  T6: 0,
  T5: 3,
  T4: 10,
  T3: 30,
  T2: 50,
  T1: 80,
  T0: Infinity,
};

/** 咖位对应的评分采样窗口 */
const TIER_RATING_WINDOWS: Record<string, number> = {
  T6: 3,
  T5: 10,
  T4: 20,
  T3: 20,
  T2: 30,
  T1: 30,
  T0: 30,
};

/** 咖位评分门槛 */
const TIER_RATING_THRESHOLDS: Record<string, number> = {
  T6: 0,
  T5: 0,
  T4: 3.5,
  T3: 4.0,
  T2: 4.5,
  T1: 4.5,
  T0: Infinity,
};

/** 咖位排序（T0最高，T6最低） */
const TIER_ORDER: Record<string, number> = {
  T0: 0, T1: 1, T2: 2, T3: 3, T4: 4, T5: 5, T6: 6,
};

/** 反向排序映射 */
const TIER_ORDER_REVERSE: Record<number, string> = {
  0: 'T0', 1: 'T1', 2: 'T2', 3: 'T3', 4: 'T4', 5: 'T5', 6: 'T6',
};

/** 计算目标升级咖位 */
function getUpgradeTarget(currentTier: string): string | null {
  const currentOrder = TIER_ORDER[currentTier];
  if (currentOrder === undefined || currentOrder <= 1) return null; // T0/T1 不自动升级
  return TIER_ORDER_REVERSE[currentOrder - 1] ?? null;
}

/** 计算目标降级咖位 */
function getDowngradeTarget(currentTier: string): string | null {
  const currentOrder = TIER_ORDER[currentTier];
  if (currentOrder === undefined || currentOrder >= 6) return null; // T6 不降级
  return TIER_ORDER_REVERSE[currentOrder + 1] ?? null;
}

// ============================================================
// 路由注册
// ============================================================

export default async function performerRoutes(app: FastifyInstance): Promise<void> {
  // ==========================================================
  // 1. GET /v1/performers - 演员列表（公开）
  // ==========================================================
  app.get(
    '/',
    {
      preHandler: [validate({ query: listQuerySchema })],
    },
    async function listPerformers(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const q = request.query as z.infer<typeof listQuerySchema>;
      const { page, pageSize, offset } = normalizePagination(q.page, q.pageSize);

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 0;

      // 状态筛选
      idx++;
      conditions.push(`p.status = $${idx}::performer_status`);
      params.push(q.status);

      // 咖位筛选
      if (q.tier) {
        idx++;
        conditions.push(`p.tier = $${idx}::performer_tier`);
        params.push(q.tier);
      }

      // 信誉等级筛选
      if (q.credit_level) {
        idx++;
        conditions.push(`p.credit_level = $${idx}::credit_level`);
        params.push(q.credit_level);
      }

      // 风格筛选（匹配 style_tags JSONB 数组）
      if (q.style) {
        idx++;
        conditions.push(`$${idx}::text <@ (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(p.style_tags) AS elem)`);
        params.push(q.style);
      }

      // 关键词搜索
      if (q.keyword) {
        idx++;
        const kw = `%${q.keyword}%`;
        conditions.push(`(p.name ILIKE $${idx} OR p.introduction ILIKE $${idx})`);
        params.push(kw);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const limitIdx = idx + 1;
      const offsetIdx = idx + 2;

      const [dataResult, countResult] = await Promise.all([
        query<PerformerRow>(
          `SELECT p.*
           FROM performers p
           ${whereClause}
           ORDER BY p.tier ASC, p.credit_score DESC, p.rating DESC
           LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
          [...params, pageSize, offset]
        ),
        query<{ total: string }>(
          `SELECT COUNT(*) AS total FROM performers p ${whereClause}`,
          params
        ),
      ]);

      const items = dataResult.rows.map(toPerformerListItem);
      const total = Number(countResult.rows[0].total);

      reply
        .status(200)
        .send(paginatedResponse(items, total, page, pageSize));
    }
  );

  // ==========================================================
  // 2. GET /v1/performers/:id - 演员详情（公开，运营可见 phone + contract）
  // ==========================================================
  app.get(
    '/:id',
    {
      preHandler: [
        optionalAuth,
        validate({ params: idParamSchema }),
      ],
    },
    async function getPerformer(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const isAdmin = request.user?.role === 'admin';

      const result = await query<PerformerRow>(
        'SELECT * FROM performers WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        reply.status(404).send(errorResponse(5002, '演员不存在'));
        return;
      }

      reply
        .status(200)
        .send(successResponse(toPerformerDetail(result.rows[0], isAdmin)));
    }
  );

  // ==========================================================
  // 3. POST /v1/performers - 新增演员（admin）
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
    async function createPerformer(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const body = request.body as z.infer<typeof createBodySchema>;
      const operatorId = request.user.sub;

      // 检查手机号是否已被其他演员使用
      const existing = await query<{ id: string }>(
        'SELECT id FROM performers WHERE phone = $1',
        [body.phone]
      );

      if (existing.rows.length > 0) {
        reply.status(409).send(errorResponse(5003, '该手机号已关联演员'));
        return;
      }

      // 插入新演员（默认信誉分 3.50，信誉等级 C，状态 active，保护期剩余 3 场）
      const result = await query<{ id: string }>(
        `INSERT INTO performers (
           name, phone, style_tags, introduction, highlights,
           media_urls, social_links, experience_years, tier,
           credit_score, credit_level, status, protection_remaining,
           tier_updated_at, tier_updated_by
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::performer_tier, 3.50, 'C'::credit_level, 'active'::performer_status, 3, NOW(), $10)
         RETURNING id`,
        [
          body.name,
          body.phone,
          JSON.stringify(body.style_tags ?? []),
          body.introduction ?? null,
          body.highlights ?? null,
          JSON.stringify(body.media_urls ?? []),
          JSON.stringify(body.social_links ?? {}),
          body.experience_years ?? 0,
          body.tier,
          operatorId,
        ]
      );

      const performerId = result.rows[0].id;

      // 记录操作日志
      await query(
        `SELECT record_operation_log($1, 'performer', 'create', 'performer', $2, NULL, $3, '创建演员: ' || $4)`,
        [
          operatorId,
          performerId,
          JSON.stringify({ name: body.name, phone: body.phone, tier: body.tier }),
          body.name,
        ]
      );

      reply
        .status(201)
        .send(createdResponse({ id: performerId }, '演员已创建'));
    }
  );

  // ==========================================================
  // 4. PUT /v1/performers/:id - 编辑演员资料（admin）
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
    async function updatePerformer(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const body = request.body as z.infer<typeof updateBodySchema>;
      const operatorId = request.user.sub;

      // 检查演员是否存在，同时获取修改前数据
      const existing = await query<PerformerRow>(
        'SELECT * FROM performers WHERE id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(5002, '演员不存在'));
        return;
      }

      // 如果更新了 phone，检查唯一性
      if (body.phone && body.phone !== existing.rows[0].phone) {
        const conflict = await query<{ id: string }>(
          'SELECT id FROM performers WHERE phone = $1 AND id != $2',
          [body.phone, id]
        );

        if (conflict.rows.length > 0) {
          reply.status(409).send(errorResponse(5003, '该手机号已关联其他演员'));
          return;
        }
      }

      // 动态构建 SET 子句（参数化查询）
      // 非 JSONB 字段映射
      const scalarFieldMap: Record<string, string> = {
        name: 'name',
        phone: 'phone',
        introduction: 'introduction',
        highlights: 'highlights',
        experience_years: 'experience_years',
        avatar_url: 'avatar_url',
        cover_url: 'cover_url',
        contract_type: 'contract_type',
        settlement_rate: 'settlement_rate',
        status: 'status',
      };

      const setClauses: string[] = [];
      const params: unknown[] = [];
      let idx = 0;

      // 处理标量字段
      for (const [key, col] of Object.entries(scalarFieldMap)) {
        if (key in body && body[key as keyof typeof body] !== undefined) {
          idx++;
          setClauses.push(`${col} = $${idx}`);
          params.push(body[key as keyof typeof body]);
        }
      }

      // 处理 JSONB 字段
      if (body.style_tags !== undefined) {
        idx++;
        setClauses.push(`style_tags = $${idx}::jsonb`);
        params.push(JSON.stringify(body.style_tags));
      }

      if (body.media_urls !== undefined) {
        idx++;
        setClauses.push(`media_urls = $${idx}::jsonb`);
        params.push(JSON.stringify(body.media_urls));
      }

      if (body.social_links !== undefined) {
        idx++;
        setClauses.push(`social_links = $${idx}::jsonb`);
        params.push(JSON.stringify(body.social_links));
      }

      // 处理 boolean 字段
      if (body.exclusivity !== undefined) {
        idx++;
        setClauses.push(`exclusivity = $${idx}`);
        params.push(body.exclusivity);
      }

      // 如果更新了 tier，额外更新 tier_updated_at 和 tier_updated_by
      if (body.tier !== undefined) {
        idx++;
        setClauses.push(`tier = $${idx}::performer_tier`);
        params.push(body.tier);

        const oldTier = existing.rows[0].tier;
        const newTier = body.tier;

        // 如果咖位确实发生了变化，记录操作日志
        if (oldTier !== newTier) {
          // tier 历史日志在 UPDATE 后单独记录
        }
      }

      if (setClauses.length === 0) {
        reply.status(200).send(successResponse({ id }, '演员资料已更新'));
        return;
      }

      // 更新 updated_at
      idx++;
      setClauses.push(`updated_at = NOW()`);

      // ID 作为最后一个参数
      idx++;
      params.push(id);

      const beforeData = {
        name: existing.rows[0].name,
        phone: existing.rows[0].phone,
        tier: existing.rows[0].tier,
        status: existing.rows[0].status,
      };

      await query(
        `UPDATE performers SET ${setClauses.join(', ')} WHERE id = $${idx}`,
        params
      );

      // 获取更新后的数据
      const afterResult = await query<PerformerRow>(
        'SELECT * FROM performers WHERE id = $1',
        [id]
      );

      const afterData = {
        name: afterResult.rows[0]?.name,
        phone: afterResult.rows[0]?.phone,
        tier: afterResult.rows[0]?.tier,
        status: afterResult.rows[0]?.status,
      };

      // 记录操作日志
      await query(
        `SELECT record_operation_log($1, 'performer', 'update', 'performer', $2, $3::jsonb, $4::jsonb, '更新演员资料')`,
        [
          operatorId,
          id,
          JSON.stringify(beforeData),
          JSON.stringify(afterData),
        ]
      );

      // 如果咖位变了，额外记录 tier update 日志
      if (body.tier !== undefined && body.tier !== existing.rows[0].tier) {
        // 更新 tier_updated_at / tier_updated_by（已在 SET 子句中处理）
        await query(
          `SELECT record_operation_log($1, 'performer', 'update_tier', 'performer', $2, $3::jsonb, $4::jsonb, $5)`,
          [
            operatorId,
            id,
            JSON.stringify({ tier: existing.rows[0].tier }),
            JSON.stringify({ tier: body.tier }),
            body.tier !== undefined ? '编辑演员资料时同步修改咖位' : '',
          ]
        );
      }

      reply.status(200).send(successResponse({ id }, '演员资料已更新'));
    }
  );

  // ==========================================================
  // 5. GET /v1/performers/:id/tier-history - 咖位变动历史
  // ==========================================================
  app.get(
    '/:id/tier-history',
    {
      preHandler: [
        authMiddleware,
        validate({ params: idParamSchema }),
      ],
    },
    async function getTierHistory(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof idParamSchema>;

      // 先确认演员存在
      const performer = await query<{ id: string; name: string }>(
        'SELECT id, name FROM performers WHERE id = $1',
        [id]
      );

      if (performer.rows.length === 0) {
        reply.status(404).send(errorResponse(5002, '演员不存在'));
        return;
      }

      // 从操作日志表查询咖位变动历史
      const result = await query<TierHistoryRow>(
        `SELECT
           ol.before_data->>'tier' AS from_tier,
           ol.after_data->>'tier' AS to_tier,
           COALESCE(ol.detail, '') AS reason,
           ol.operator_id,
           u.name AS operator_name,
           ol.created_at
         FROM operation_logs ol
         JOIN users u ON u.id = ol.operator_id
         WHERE ol.target_type = 'performer'
           AND ol.target_id = $1
           AND ol.module = 'performer'
           AND ol.action = 'update_tier'
           AND ol.before_data->>'tier' IS NOT NULL
           AND ol.after_data->>'tier' IS NOT NULL
         ORDER BY ol.created_at DESC`,
        [id]
      );

      const history: TierHistoryEntry[] = result.rows.map((row) => ({
        from_tier: row.from_tier as PerformerTier,
        to_tier: row.to_tier as PerformerTier,
        reason: row.reason,
        operator: { id: row.operator_id, name: row.operator_name },
        created_at: row.created_at,
      }));

      reply.status(200).send(successResponse(history));
    }
  );

  // ==========================================================
  // 6. PUT /v1/performers/:id/tier - 手动调咖位（admin，需填原因）
  // ==========================================================
  app.put(
    '/:id/tier',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: idParamSchema, body: tierUpdateBodySchema }),
      ],
    },
    async function updateTier(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const { tier, reason } = request.body as z.infer<typeof tierUpdateBodySchema>;
      const operatorId = request.user.sub;

      // 获取演员当前信息
      const performer = await query<PerformerRow>(
        'SELECT id, name, tier, status FROM performers WHERE id = $1',
        [id]
      );

      if (performer.rows.length === 0) {
        reply.status(404).send(errorResponse(5002, '演员不存在'));
        return;
      }

      const currentTier = performer.rows[0].tier;

      // 如果咖位未变化，直接返回
      if (currentTier === tier) {
        reply
          .status(200)
          .send(successResponse({ tier: tier as PerformerTier }, '咖位未变化'));
        return;
      }

      // T0/T1 级别需人工认定（如果目标是 T0 或 T1，reject 空原因）
      if ((tier === 'T0' || tier === 'T1') && reason.length < 10) {
        reply
          .status(400)
          .send(errorResponse(5001, 'T0/T1级别需人工认定，请填写认定依据（不少于10字）'));
        return;
      }

      // 更新咖位
      await query(
        `UPDATE performers
         SET tier = $1::performer_tier,
             tier_updated_at = NOW(),
             tier_updated_by = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [tier, operatorId, id]
      );

      // 记录操作日志（咖位变动专用）
      await query(
        `SELECT record_operation_log($1, 'performer', 'update_tier', 'performer', $2, $3::jsonb, $4::jsonb, $5)`,
        [
          operatorId,
          id,
          JSON.stringify({ tier: currentTier }),
          JSON.stringify({ tier }),
          reason,
        ]
      );

      reply
        .status(200)
        .send(successResponse({ tier: tier as PerformerTier }, '咖位已更新'));
    }
  );

  // ==========================================================
  // 7. GET /v1/performers/:id/tier-suggestion - 系统升级建议
  // 基于信誉分 + 演出场次 + 客户评分（对齐演员分层管理体系第五节）
  // ==========================================================
  app.get(
    '/:id/tier-suggestion',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: idParamSchema }),
      ],
    },
    async function getTierSuggestion(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof idParamSchema>;

      // 获取演员信息
      const performer = await query<PerformerRow>(
        'SELECT id, name, tier, credit_score, rating FROM performers WHERE id = $1',
        [id]
      );

      if (performer.rows.length === 0) {
        reply.status(404).send(errorResponse(5002, '演员不存在'));
        return;
      }

      const currentTier = performer.rows[0].tier;
      const creditScore = Number(performer.rows[0].credit_score);

      // T0/T1 不适用自动升降
      if (currentTier === 'T0' || currentTier === 'T1') {
        const suggestion: TierSuggestion = {
          current_tier: currentTier as PerformerTier,
          direction: 'none',
          reasons: ['T0/T1级别不适用系统自动升降级建议，请人工评估'],
          metrics: {
            completed_shows: 0,
            credit_score: creditScore,
            recent_avg_rating: 0,
            recent_reject_count: 0,
          },
        };
        reply.status(200).send(successResponse(suggestion));
        return;
      }

      // 统计演出场次（completed 状态的排期）
      const showResult = await query<{ count: string }>(
        `SELECT COUNT(*) AS count
         FROM assignments
         WHERE performer_id = $1 AND status = 'completed'`,
        [id]
      );
      const completedShows = Number(showResult.rows[0].count);

      // 统计近 N 场客户评分均分（按当前咖位的窗口大小）
      const ratingWindow = TIER_RATING_WINDOWS[currentTier] ?? 10;
      const ratingResult = await query<{ avg: string }>(
        `SELECT COALESCE(AVG(overall_rating), 0) AS avg
         FROM (
           SELECT overall_rating
           FROM reviews
           WHERE to_performer_id = $1
             AND from_type = 'company'
           ORDER BY created_at DESC
           LIMIT $2
         ) AS recent_ratings`,
        [id, ratingWindow]
      );
      const recentAvgRating = Number(ratingResult.rows[0].avg);

      // 统计近期拒绝排期次数（近3个月）
      const rejectResult = await query<{ count: string }>(
        `SELECT COUNT(*) AS count
         FROM assignments
         WHERE performer_id = $1
           AND status = 'rejected'
           AND created_at >= NOW() - INTERVAL '3 months'`,
        [id]
      );
      const recentRejectCount = Number(rejectResult.rows[0].count);

      // 构建升降级建议
      const reasons: string[] = [];
      let direction: 'up' | 'down' | 'none' = 'none';
      let suggestedTier: PerformerTier | undefined;

      // --- 降级检查（优先级高于升级） ---

      // 检查是否有演出当天临时取消（最近10场）
      // NOTE: demands cancelled after performer confirmed = 演出当天临时取消
      const cancelResult = await query<{ count: string }>(
        `SELECT COUNT(*) AS count
         FROM assignments a
         JOIN demands d ON d.id = a.demand_id
         WHERE a.performer_id = $1
           AND d.status = 'cancelled'
           AND a.status = 'confirmed'
           AND d.updated_at >= NOW() - INTERVAL '6 months'
         ORDER BY d.updated_at DESC
         LIMIT 10`,
        [id]
      );

      if (Number(cancelResult.rows[0]?.count ?? 0) > 0) {
        const downTarget = getDowngradeTarget(currentTier);
        if (downTarget) {
          direction = 'down';
          const downTarget2 = getDowngradeTarget(downTarget);
          suggestedTier = (downTarget2 ?? downTarget) as PerformerTier;
          reasons.push('近期存在演出当天取消记录，建议降2级');
        }
      }

      // 信誉分连续低于当前咖位门槛（这里简化为当前信誉分低于门槛）
      if (direction === 'none' && creditScore < (TIER_CREDIT_THRESHOLDS[currentTier] ?? 3.5)) {
        const downTarget = getDowngradeTarget(currentTier);
        if (downTarget) {
          direction = 'down';
          suggestedTier = downTarget as PerformerTier;
          reasons.push(
            `信誉分 ${creditScore} 低于当前咖位 ${currentTier} 的门槛 ${TIER_CREDIT_THRESHOLDS[currentTier]}，建议降1级`
          );
        }
      }

      // 近N场客户评分均分低于门槛
      if (direction === 'none' && recentAvgRating > 0 && recentAvgRating < 3.0) {
        const downTarget = getDowngradeTarget(currentTier);
        if (downTarget) {
          direction = 'down';
          suggestedTier = downTarget as PerformerTier;
          reasons.push(
            `近${ratingWindow}场客户评分均分 ${recentAvgRating.toFixed(1)} 低于 3.0，建议降1级`
          );
        }
      }

      // 连续3次拒绝排期
      if (direction === 'none' && recentRejectCount >= 3) {
        const downTarget = getDowngradeTarget(currentTier);
        if (downTarget) {
          direction = 'down';
          suggestedTier = downTarget as PerformerTier;
          reasons.push(
            `近3个月连续拒绝排期 ${recentRejectCount} 次，建议降1级`
          );
        }
      }

      // --- 升级检查 ---
      if (direction === 'none') {
        const upgradeTarget = getUpgradeTarget(currentTier);

        if (upgradeTarget) {
          const requiredShows = TIER_SHOW_THRESHOLDS[upgradeTarget] ?? Infinity;
          const requiredCredit = TIER_CREDIT_THRESHOLDS[upgradeTarget] ?? Infinity;
          const requiredRating = TIER_RATING_THRESHOLDS[upgradeTarget] ?? 0;
          const upgradeRatingWindow = TIER_RATING_WINDOWS[upgradeTarget] ?? 10;

          // 获取对应升级窗口的评分
          const upgradeRatingResult = await query<{ avg: string }>(
            `SELECT COALESCE(AVG(overall_rating), 0) AS avg
             FROM (
               SELECT overall_rating
               FROM reviews
               WHERE to_performer_id = $1
                 AND from_type = 'company'
               ORDER BY created_at DESC
               LIMIT $2
             ) AS recent_ratings`,
            [id, upgradeRatingWindow]
          );
          const upgradeWindowAvgRating = Number(upgradeRatingResult.rows[0].avg);

          const allMet = completedShows >= requiredShows
            && creditScore >= requiredCredit
            && upgradeWindowAvgRating >= requiredRating;

          if (allMet) {
            // T2→T1 额外要求上过综艺（人工认定），系统仅提示
            if (currentTier === 'T2' && upgradeTarget === 'T1') {
              direction = 'up';
              suggestedTier = upgradeTarget as PerformerTier;
              reasons.push(
                `满足 T2→T1 基础条件（≥${requiredShows}场 ✓, 信誉分≥${requiredCredit} ✓, 评分≥${requiredRating} ✓），但需人工确认综艺经历`
              );
            } else {
              direction = 'up';
              suggestedTier = upgradeTarget as PerformerTier;
              reasons.push(
                `满足 ${currentTier}→${upgradeTarget} 全部升级条件：场次 ${completedShows}≥${requiredShows}，信誉分 ${creditScore}≥${requiredCredit}，近${upgradeRatingWindow}场评分 ${upgradeWindowAvgRating.toFixed(1)}≥${requiredRating}`
              );
            }
          } else {
            // 未完全满足，列出满足/不满足项
            if (completedShows < requiredShows) {
              reasons.push(
                `场次不足：当前 ${completedShows} 场，需要 ≥${requiredShows} 场才能升级到 ${upgradeTarget}`
              );
            }
            if (creditScore < requiredCredit) {
              reasons.push(
                `信誉分不足：当前 ${creditScore}，需要 ≥${requiredCredit} 才能升级到 ${upgradeTarget}`
              );
            }
            if (upgradeWindowAvgRating < requiredRating && upgradeWindowAvgRating > 0) {
              reasons.push(
                `近${upgradeRatingWindow}场评分不足：当前 ${upgradeWindowAvgRating.toFixed(1)}，需要 ≥${requiredRating} 才能升级到 ${upgradeTarget}`
              );
            }
            if (reasons.length === 0) {
              reasons.push(`暂不满足升级条件，继续保持`);
            }
          }
        } else {
          reasons.push('已是最高可自动升级级别');
        }
      }

      // 如果没有任何理由，补充默认
      if (reasons.length === 0) {
        reasons.push('当前数据和指标正常，无升降级建议');
      }

      const suggestion: TierSuggestion = {
        current_tier: currentTier as PerformerTier,
        suggested_tier: suggestedTier,
        direction,
        reasons,
        metrics: {
          completed_shows: completedShows,
          credit_score: creditScore,
          recent_avg_rating: recentAvgRating,
          recent_reject_count: recentRejectCount,
        },
      };

      reply.status(200).send(successResponse(suggestion));
    }
  );

  // ==========================================================
  // 8. GET /v1/performers/:id/credit - 信誉分详情（含四维度）
  // ==========================================================
  app.get(
    '/:id/credit',
    {
      preHandler: [
        authMiddleware,
        validate({ params: idParamSchema }),
      ],
    },
    async function getCreditDetail(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof idParamSchema>;

      const performer = await query<PerformerRow>(
        'SELECT id, credit_score, credit_level, name, rating FROM performers WHERE id = $1',
        [id]
      );

      if (performer.rows.length === 0) {
        reply.status(404).send(errorResponse(5002, '演员不存在'));
        return;
      }

      const totalScore = Number(performer.rows[0].credit_score);

      // 四维度近似拆分（当前数据库未单独存储各维度分数，按总分近似）
      // 实际维度分数需后续细化存储，此处暂用总分统一展示
      const creditDetail: CreditDetail = {
        total_score: totalScore,
        level: performer.rows[0].credit_level as CreditLevel,
        dimensions: {
          fulfillment: { score: totalScore, weight: 0.4 },
          quality: { score: totalScore, weight: 0.35 },
          activity: { score: totalScore, weight: 0.15 },
          basics: { score: totalScore, weight: 0.1 },
        },
      };

      reply.status(200).send(successResponse(creditDetail));
    }
  );

  // ==========================================================
  // 9. GET /v1/performers/:id/credit-logs - 信誉分变动明细（分页）
  // ==========================================================
  app.get(
    '/:id/credit-logs',
    {
      preHandler: [
        authMiddleware,
        validate({ params: idParamSchema, query: creditLogsQuerySchema }),
      ],
    },
    async function getCreditLogs(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof idParamSchema>;
      const q = request.query as z.infer<typeof creditLogsQuerySchema>;
      const { page, pageSize, offset } = normalizePagination(q.page, q.pageSize);

      // 确认演员存在
      const performer = await query<{ id: string }>(
        'SELECT id FROM performers WHERE id = $1',
        [id]
      );

      if (performer.rows.length === 0) {
        reply.status(404).send(errorResponse(5002, '演员不存在'));
        return;
      }

      const [dataResult, countResult] = await Promise.all([
        query<CreditLogRow>(
          `SELECT id, performer_id, change_amount, reason, related_demand_id, created_at
           FROM credit_score_logs
           WHERE performer_id = $1
           ORDER BY created_at DESC
           LIMIT $2 OFFSET $3`,
          [id, pageSize, offset]
        ),
        query<{ total: string }>(
          'SELECT COUNT(*) AS total FROM credit_score_logs WHERE performer_id = $1',
          [id]
        ),
      ]);

      const items: CreditLogEntry[] = dataResult.rows.map((row) => ({
        id: row.id,
        change_amount: Number(row.change_amount),
        reason: row.reason,
        related_demand_id: row.related_demand_id ?? undefined,
        created_at: row.created_at,
      }));

      reply
        .status(200)
        .send(
          successResponse({
            items,
            total: Number(countResult.rows[0].total),
            page,
            pageSize,
          })
        );
    }
  );

  // ==========================================================
  // POST /v1/performers/import - 批量导入演员 (P-14)
  // 接收 JSON 数组，批量创建
  // ==========================================================
  const importBodySchema = z.object({
    performers: z.array(z.object({
      name: z.string().min(1).max(100),
      phone: z.string().min(1).max(11),
      style_tags: z.array(z.string().min(1)).optional(),
      introduction: z.string().optional(),
      highlights: z.string().optional(),
      media_urls: z.array(z.string()).optional(),
      experience_years: z.number().int().min(0).optional(),
      tier: performerTierSchema.optional().default('T6'),
    })).min(1).max(500),
  });

  app.post(
    '/import',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ body: importBodySchema }),
      ],
    },
    async function importPerformers(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const body = request.body as z.infer<typeof importBodySchema>;
      const operatorId = request.user.sub;
      const { performers: performerList } = body;

      const results: { success: string[]; skipped: { name: string; phone: string; reason: string }[] } = {
        success: [],
        skipped: [],
      };

      await transaction(async (client) => {
        for (const p of performerList) {
          // 检查手机号是否已被使用
          const existing = await client.query<{ id: string }>(
            'SELECT id FROM performers WHERE phone = $1',
            [p.phone]
          );

          if (existing.rows.length > 0) {
            results.skipped.push({ name: p.name, phone: p.phone, reason: '手机号已存在' });
            continue;
          }

          // 插入新演员
          const result = await client.query<{ id: string }>(
            `INSERT INTO performers (
               name, phone, style_tags, introduction, highlights,
               media_urls, experience_years, tier,
               credit_score, credit_level, status, protection_remaining,
               tier_updated_at, tier_updated_by
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::performer_tier, 3.50, 'C'::credit_level, 'active'::performer_status, 3, NOW(), $9)
             RETURNING id`,
            [
              p.name,
              p.phone,
              JSON.stringify(p.style_tags ?? []),
              p.introduction ?? null,
              p.highlights ?? null,
              JSON.stringify(p.media_urls ?? []),
              p.experience_years ?? 0,
              p.tier,
              operatorId,
            ]
          );

          results.success.push(result.rows[0].id);
        }
      });

      // 批量导入操作日志
      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'performer', 'batch_import', 'performer', NULL, $2)`,
        [operatorId, JSON.stringify({ total: performerList.length, success: results.success.length, skipped: results.skipped.length })]
      );

      reply.status(201).send(createdResponse({
        imported: results.success.length,
        skipped: results.skipped.length,
        success_ids: results.success,
        skipped_details: results.skipped,
      }, `成功导入 ${results.success.length} 名演员，跳过 ${results.skipped.length} 名`));
    }
  );
}
