// TODO: Phase 2 拆分
// ============================================================
// 需求管理路由处理器
// 对齐 docs/API_CONTRACT.md 第 2.3 节（6 个端点）
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
import { generateAiPlan } from '../services/ai.js';
import type { DemandPromptInput } from '../services/ai.js';
import type {
  DemandStatus,
  DemandSource,
  Urgency,
  DemandListItem,
  DemandDetail,
  StatusHistoryEntry,
  LineupEntry,
  PaymentEntry,
  PaymentType,
  PerformerTier,
} from '../types/index.js';

// ============================================================
// Zod 校验 Schema
// ============================================================

const demandSourceSchema = z.enum(['sku', 'requirement', 'phone']);

// urgencySchema removed (unused)

const demandStatusSchema = z.enum([
  'pending_ai',
  'ai_generated',
  'pending_operator',
  'operator_adjusted',
  'pending_client_confirm',
  'confirmed',
  'pending_deposit',
  'deposit_received',
  'pending_performer',
  'performer_confirmed',
  'performing',
  'finished',
  'pending_final_payment',
  'final_payment_received',
  'settled',
  'cancelled',
  'refunding',
]);

/** POST /v1/demands 请求体 */
const createDemandBodySchema = z.object({
  source: demandSourceSchema,
  sku_id: z.string().uuid().optional(),
  title: z.string().max(200).optional(),
  event_type: z.string().min(1),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式需为 YYYY-MM-DD'),
  event_time: z.string().regex(/^\d{2}:\d{2}$/, '时间格式需为 HH:mm').optional(),
  city: z.string().min(1),
  address: z.string().min(1),
  audience_count: z.number().int().positive().optional(),
  budget: z.number().positive().optional(),
  duration_minutes: z.number().int().positive().optional(),
  comedy_style: z.string().optional(),
  special_requirements: z.string().optional(),
  venue_name: z.string().optional(),
  venue_type: z.string().optional(),
});

/** GET /v1/demands 查询参数 */
const listDemandsQuerySchema = z.object({
  status: demandStatusSchema.optional(),
  role: z.enum(['my', 'all']).optional().default('my'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

/** 路由参数（UUID id） */
const demandIdParamSchema = z.object({
  id: z.string().uuid(),
});

/** PUT /v1/demands/:id 请求体（所有字段可选） */
const updateDemandBodySchema = z.object({
  title: z.string().max(200).optional(),
  event_type: z.string().min(1).optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  event_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  city: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  audience_count: z.number().int().positive().optional(),
  budget: z.number().positive().optional(),
  duration_minutes: z.number().int().positive().optional(),
  comedy_style: z.string().optional(),
  special_requirements: z.string().optional(),
  venue_name: z.string().optional(),
  venue_type: z.string().optional(),
});

// ============================================================
// 数据库行类型
// ============================================================

interface DemandRow {
  id: string;
  client_id: string;
  business_line: string | null;
  source: string;
  sku_id: string | null;
  title: string | null;
  event_type: string;
  event_date: string;
  event_time: string | null;
  city: string;
  address: string;
  audience_count: number | null;
  budget: string | null;
  duration_minutes: number | null;
  comedy_style: string | null;
  special_requirements: string | null;
  venue_name: string | null;
  venue_type: string | null;
  ai_plan_content: string | null;
  adjusted_plan_content: string | null;
  final_plan_content: string | null;
  final_price: string | null;
  urgency: string;
  contract_mode: string | null;
  operator_id: string | null;
  status: string;
  status_history: StatusHistoryEntry[];
  created_at: string;
  updated_at: string;
}

interface LineupRow {
  id: string;
  demand_id: string;
  performer_id: string;
  role: string;
  status: string;
  performer_name: string;
  performer_tier: string;
}

interface PaymentRow {
  id: string;
  demand_id: string;
  type: string;
  amount: string;
  method: string;
  received_at: string;
}

interface ClientRow {
  id: string;
  name: string;
}

// ============================================================
// 辅助函数
// ============================================================

/** 将数据库行映射为 DemandListItem */
function toDemandListItem(row: DemandRow & Partial<ClientRow>): DemandListItem {
  return {
    id: row.id,
    title: row.title || '未命名需求',
    event_type: row.event_type,
    event_date: row.event_date ? row.event_date.split('T')[0] : '',
    city: row.city,
    budget: row.budget ? Number(row.budget) : 0,
    status: row.status as DemandStatus,
    urgency: (row.urgency as Urgency) || 'normal',
    created_at: row.created_at,
    client: {
      id: row.client_id,
      name: (row as ClientRow).name || '未知用户',
    },
  };
}

/** 将数据库行映射为 DemandDetail */
function toDemandDetail(
  row: DemandRow,
  lineups: LineupEntry[],
  payments: PaymentEntry[]
): DemandDetail {
  return {
    id: row.id,
    client_id: row.client_id,
    source: row.source as DemandSource,
    sku_id: row.sku_id || undefined,
    title: row.title || '',
    event_type: row.event_type,
    event_date: row.event_date ? row.event_date.split('T')[0] : '',
    event_time: row.event_time || undefined,
    city: row.city,
    address: row.address,
    audience_count: row.audience_count || undefined,
    budget: row.budget ? Number(row.budget) : undefined,
    duration_minutes: row.duration_minutes || undefined,
    comedy_style: row.comedy_style || undefined,
    special_requirements: row.special_requirements || undefined,
    ai_plan_content: row.ai_plan_content || undefined,
    adjusted_plan_content: row.adjusted_plan_content || undefined,
    final_plan_content: row.final_plan_content || undefined,
    final_price: row.final_price ? Number(row.final_price) : undefined,
    urgency: (row.urgency as Urgency) || 'normal',
    contract_mode: row.contract_mode as DemandDetail['contract_mode'],
    status: row.status as DemandStatus,
    status_history: row.status_history || [],
    lineups,
    payments,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** 将 lineup 行映射为 LineupEntry */
function toLineupEntry(row: LineupRow): LineupEntry {
  return {
    performer: {
      id: row.performer_id,
      name: row.performer_name,
      tier: (row.performer_tier as PerformerTier) || 'T6',
    },
    role: row.role,
    status: row.status as LineupEntry['status'],
  };
}

/** 将 payment 行映射为 PaymentEntry */
function toPaymentEntry(row: PaymentRow): PaymentEntry {
  return {
    type: row.type as PaymentType,
    amount: Number(row.amount),
    method: row.method,
    received_at: row.received_at,
  };
}

// ============================================================
// 状态机：允许哪些状态可编辑
// ============================================================
const EDITABLE_STATUSES: DemandStatus[] = ['pending_ai'];

// ============================================================
// 状态机：允许撤回的状态
// ============================================================
const WITHDRAWABLE_STATUSES: DemandStatus[] = [
  'pending_ai',
  'ai_generated',
  'pending_operator',
];

// ============================================================
// 路由注册
// ============================================================

export default async function demandRoutes(app: FastifyInstance): Promise<void> {
  // ==========================================================
  // POST /v1/demands - 提交需求（agent / client）
  // ==========================================================
  app.post(
    '/',
    {
      preHandler: [
        authMiddleware,
        requireRole('agent', 'client'),
        validate({ body: createDemandBodySchema }),
      ],
    },
    async function createDemand(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const body = request.body as z.infer<typeof createDemandBodySchema>;
      const user = request.user;

      // 如果 source 是 sku，需校验 sku_id 传入
      if (body.source === 'sku' && !body.sku_id) {
        reply.status(400).send(errorResponse(3003, 'SKU选购模式下必须提供 sku_id'));
        return;
      }

      // 初始化状态历史（第一条）
      const initialHistory: StatusHistoryEntry[] = [
        {
          status: 'pending_ai',
          at: new Date().toISOString(),
          operator_id: user.sub,
        },
      ];

      const result = await query<{ id: string }>(
        `INSERT INTO demands (
           client_id, source, sku_id, title, event_type, event_date,
           event_time, city, address, audience_count, budget,
           duration_minutes, comedy_style, special_requirements,
           venue_name, venue_type, status, status_history
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'pending_ai', $17)
         RETURNING id`,
        [
          user.sub,
          body.source,
          body.sku_id ?? null,
          body.title ?? null,
          body.event_type,
          body.event_date,
          body.event_time ?? null,
          body.city,
          body.address,
          body.audience_count ?? null,
          body.budget ?? null,
          body.duration_minutes ?? null,
          body.comedy_style ?? null,
          body.special_requirements ?? null,
          body.venue_name ?? null,
          body.venue_type ?? null,
          JSON.stringify(initialHistory),
        ]
      );

    // Auto-create opportunity (PRD 6.4: every demand = a new opportunity)
    await query(
      `INSERT INTO opportunities (demand_id, status, priority) VALUES ($1, 'new', 'medium')`,
      [result.rows[0].id]
    );

reply
        .status(201)
        .send(
          createdResponse(
            { id: result.rows[0].id, status: 'pending_ai' },
            '需求已提交，AI正在生成方案'
          )
        );
    }
  );

  // ==========================================================
  // GET /v1/demands - 需求列表
  // agent 看自己的，admin 看全部
  // ==========================================================
  app.get(
    '/',
    {
      preHandler: [
        authMiddleware,
        requireRole('agent', 'admin', 'client'),
        validate({ query: listDemandsQuerySchema }),
      ],
    },
    async function listDemands(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const q = request.query as z.infer<typeof listDemandsQuerySchema>;
      const user = request.user;
      const { page, pageSize, offset } = normalizePagination(q.page, q.pageSize);

      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 0;

      // agent/client 只能看自己的需求，admin 可看全部
      if (user.role !== 'admin' && q.role !== 'all') {
        idx++;
        conditions.push(`d.client_id = $${idx}`);
        params.push(user.sub);
      }

      // 按状态筛选
      if (q.status) {
        idx++;
        conditions.push(`d.status = $${idx}`);
        params.push(q.status);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const limitIdx = idx + 1;
      const offsetIdx = idx + 2;

      const [dataResult, countResult] = await Promise.all([
        query<DemandRow & ClientRow>(
          `SELECT d.*, u.name
           FROM demands d
           LEFT JOIN users u ON d.client_id = u.id
           ${whereClause}
           ORDER BY d.created_at DESC
           LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
          [...params, pageSize, offset]
        ),
        query<{ total: string }>(
          `SELECT COUNT(*) AS total FROM demands d ${whereClause}`,
          params
        ),
      ]);

      const items = dataResult.rows.map(toDemandListItem);
      const total = Number(countResult.rows[0].total);

      reply
        .status(200)
        .send(paginatedResponse(items, total, page, pageSize));
    }
  );

  // ==========================================================
  // GET /v1/demands/:id - 需求详情（含 AI 方案 + 阵容 + 付款记录）
  // ==========================================================
  app.get(
    '/:id',
    {
      preHandler: [
        authMiddleware,
        requireRole('agent', 'admin', 'client'),
        validate({ params: demandIdParamSchema }),
      ],
    },
    async function getDemand(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof demandIdParamSchema>;
      const user = request.user;

      const result = await query<DemandRow>(
        'SELECT * FROM demands WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        reply.status(404).send(errorResponse(3004, '需求不存在'));
        return;
      }

      const demand = result.rows[0];

      // agent/client 只能看自己的需求
      if (user.role !== 'admin' && demand.client_id !== user.sub) {
        reply.status(403).send(errorResponse(1005, '权限不足'));
        return;
      }

      // 并行查询阵容和付款记录
      const [lineupResult, paymentResult] = await Promise.all([
        query<LineupRow>(
          `SELECT l.*, p.name AS performer_name, p.tier::TEXT AS performer_tier
           FROM lineup l
           LEFT JOIN performers p ON l.performer_id = p.id
           WHERE l.demand_id = $1
           ORDER BY l.created_at ASC`,
          [id]
        ),
        query<PaymentRow>(
          `SELECT id, demand_id, type, amount::TEXT, method, received_at
           FROM payment_records
           WHERE demand_id = $1
           ORDER BY received_at ASC`,
          [id]
        ),
      ]);

      const lineups = lineupResult.rows.map(toLineupEntry);
      const payments = paymentResult.rows.map(toPaymentEntry);

      reply
        .status(200)
        .send(successResponse(toDemandDetail(demand, lineups, payments)));
    }
  );

  // ==========================================================
  // PUT /v1/demands/:id - 修改需求（AI 出方案前可编辑）
  // ==========================================================
  app.put(
    '/:id',
    {
      preHandler: [
        authMiddleware,
        requireRole('agent', 'client'),
        validate({ params: demandIdParamSchema, body: updateDemandBodySchema }),
      ],
    },
    async function updateDemand(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof demandIdParamSchema>;
      const body = request.body as z.infer<typeof updateDemandBodySchema>;
      const user = request.user;

      // 查询需求，校验存在性和权限
      const existing = await query<DemandRow>(
        'SELECT * FROM demands WHERE id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(3004, '需求不存在'));
        return;
      }

      const demand = existing.rows[0];

      // 仅需求创建者可编辑
      if (demand.client_id !== user.sub) {
        reply.status(403).send(errorResponse(1005, '权限不足'));
        return;
      }

      // 状态校验：只有 pending_ai 状态可编辑
      if (!EDITABLE_STATUSES.includes(demand.status as DemandStatus)) {
        reply.status(409).send(errorResponse(3001, 'AI方案已生成，不可修改'));
        return;
      }

      // 动态构建 SET 子句（参数化查询）
      const fieldMap: Record<string, string> = {
        title: 'title',
        event_type: 'event_type',
        event_date: 'event_date',
        event_time: 'event_time',
        city: 'city',
        address: 'address',
        audience_count: 'audience_count',
        budget: 'budget',
        duration_minutes: 'duration_minutes',
        comedy_style: 'comedy_style',
        special_requirements: 'special_requirements',
        venue_name: 'venue_name',
        venue_type: 'venue_type',
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
        reply.status(200).send(successResponse({ id }, '需求已更新'));
        return;
      }

      // 更新 updated_at
      idx++;
      setClauses.push(`updated_at = NOW()`);

      // ID 作为最后一个参数
      idx++;
      params.push(id);

      await query(
        `UPDATE demands SET ${setClauses.join(', ')} WHERE id = $${idx}`,
        params
      );

      reply.status(200).send(successResponse({ id }, '需求已更新'));
    }
  );

  // ==========================================================
  // PATCH /v1/demands/:id/withdraw - 撤回需求
  // ==========================================================
  app.patch(
    '/:id/withdraw',
    {
      preHandler: [
        authMiddleware,
        requireRole('agent', 'client'),
        validate({ params: demandIdParamSchema }),
      ],
    },
    async function withdrawDemand(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof demandIdParamSchema>;
      const user = request.user;

      const existing = await query<DemandRow>(
        'SELECT * FROM demands WHERE id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(3004, '需求不存在'));
        return;
      }

      const demand = existing.rows[0];

      // 仅需求创建者可撤回
      if (demand.client_id !== user.sub) {
        reply.status(403).send(errorResponse(1005, '权限不足'));
        return;
      }

      // 状态校验：只有允许的状态可撤回
      if (!WITHDRAWABLE_STATUSES.includes(demand.status as DemandStatus)) {
        reply.status(409).send(errorResponse(3002, '当前状态不可撤回'));
        return;
      }

      // 追加状态变更到 status_history
      const newEntry: StatusHistoryEntry = {
        status: 'cancelled' as DemandStatus,
        at: new Date().toISOString(),
        operator_id: user.sub,
      };

      const currentHistory = demand.status_history || [];
      const updatedHistory = [...currentHistory, newEntry];

      await query(
        `UPDATE demands
         SET status = 'cancelled',
             status_history = $2::jsonb,
             updated_at = NOW()
         WHERE id = $1`,
        [id, JSON.stringify(updatedHistory)]
      );

      reply
        .status(200)
        .send(
          successResponse(
            { id, status: 'cancelled' },
            '需求已撤回'
          )
        );
    }
  );

  // ==========================================================
  // POST /v1/demands/:id/ai-plan - 触发 AI 生成方案（admin）
  // 调用 DeepSeek API，失败时自动切换通义千问备选
  // ==========================================================
  app.post(
    '/:id/ai-plan',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: demandIdParamSchema }),
      ],
    },
    async function triggerAiPlan(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof demandIdParamSchema>;
      const user = request.user;

      const existing = await query<DemandRow>(
        'SELECT * FROM demands WHERE id = $1',
        [id]
      );

      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(3004, '需求不存在'));
        return;
      }

      const demand = existing.rows[0];

      // 状态校验：只有 pending_ai 状态可触发 AI
      if (demand.status !== 'pending_ai') {
        reply.status(409).send(errorResponse(3005, '当前状态不可触发AI方案'));
        return;
      }

      // 构建 AI prompt 输入
      const promptInput: DemandPromptInput = {
        event_type: demand.event_type,
        event_date: demand.event_date ? demand.event_date.split('T')[0] : '',
        event_time: demand.event_time,
        city: demand.city,
        address: demand.address,
        audience_count: demand.audience_count,
        duration_minutes: demand.duration_minutes,
        comedy_style: demand.comedy_style,
        special_requirements: demand.special_requirements,
        budget: demand.budget ? Number(demand.budget) : null,
        venue_name: demand.venue_name,
        venue_type: demand.venue_type,
      };

      // 调用 AI 生成方案
      let aiPlanContent: string;
      try {
        const aiPlan = await generateAiPlan(promptInput);
        aiPlanContent = JSON.stringify(aiPlan);
      } catch (aiError: unknown) {
        const errMsg = aiError instanceof Error ? aiError.message : String(aiError);
        console.error('[AI] 方案生成失败:', errMsg);
        reply.status(500).send(errorResponse(3006, `AI方案生成失败: ${errMsg}`));
        return;
      }

      // 追加状态变更到 status_history
      const newEntry: StatusHistoryEntry = {
        status: 'ai_generated' as DemandStatus,
        at: new Date().toISOString(),
        operator_id: user.sub,
      };

      const currentHistory = demand.status_history || [];
      const updatedHistory = [...currentHistory, newEntry];

      await query(
        `UPDATE demands
         SET status = 'ai_generated',
             ai_plan_content = $2,
             status_history = $3::jsonb,
             updated_at = NOW()
         WHERE id = $1`,
        [id, aiPlanContent, JSON.stringify(updatedHistory)]
      );

      reply
        .status(200)
        .send(
          successResponse(
            {
              id,
              status: 'ai_generated',
              ai_plan_content: aiPlanContent,
            },
            'AI方案已生成'
          )
        );
    }
  );

  // ==========================================================
  // GET /v1/demands/:id 增强：返回同活动公司的历史订单 (P-28)
  // 客户历史卡片功能
  // ==========================================================
  // Note: This enhances the existing GET /:id endpoint.
  // We add company_history to the response data.

  // ==========================================================
  // POST /v1/demands/:id/alternatives - 创建备选方案 (W-07)
  // 运营推送多个方案供客户对比选择
  // ==========================================================
  const alternativeBodySchema = z.object({
    plan_name: z.string().min(1).max(200),
    plan_content: z.string().min(1),
    price: z.number().positive().optional(),
    performer_lineup: z.array(z.object({
      performer_id: z.string().uuid(),
      name: z.string().min(1),
      tier: z.string().optional(),
      role: z.string().min(1),
    })).optional(),
    notes: z.string().optional(),
  });

  app.post(
    '/:id/alternatives',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: demandIdParamSchema, body: alternativeBodySchema }),
      ],
    },
    async function createAlternative(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof demandIdParamSchema>;
      const body = request.body as z.infer<typeof alternativeBodySchema>;
      const operatorId = request.user.sub;

      // 校验需求存在
      const existing = await query<DemandRow>(
        'SELECT id FROM demands WHERE id = $1', [id]
      );
      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(3004, '需求不存在'));
        return;
      }

      const result = await query<{ id: string }>(
        `INSERT INTO demand_alternatives (demand_id, plan_name, plan_content, price, performer_lineup, notes, status, operator_id)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, 'pending', $7)
         RETURNING id`,
        [
          id,
          body.plan_name,
          body.plan_content,
          body.price ?? null,
          JSON.stringify(body.performer_lineup ?? []),
          body.notes ?? null,
          operatorId,
        ]
      );

      await query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1, 'demand', 'create_alternative', 'demand', $2, $3)`,
        [operatorId, id, JSON.stringify({ plan_name: body.plan_name, price: body.price })]
      );

      reply.status(201).send(createdResponse({
        id: result.rows[0].id,
        demand_id: id,
      }, '备选方案已创建'));
    }
  );

  // ==========================================================
  // GET /v1/demands/:id/alternatives - 获取备选方案列表 (W-07)
  // ==========================================================
  app.get(
    '/:id/alternatives',
    {
      preHandler: [
        authMiddleware,
        requireRole('agent', 'admin', 'client'),
        validate({ params: demandIdParamSchema }),
      ],
    },
    async function getAlternatives(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof demandIdParamSchema>;

      const result = await query(
        `SELECT * FROM demand_alternatives
         WHERE demand_id = $1
         ORDER BY created_at DESC`,
        [id]
      );

      reply.send(successResponse(result.rows));
    }
  );

  // ==========================================================
  // PATCH /v1/demands/:id/alternatives/:alt_id/select - 选择备选方案 (W-07)
  // ==========================================================
  app.patch(
    '/:id/alternatives/:alt_id/select',
    {
      preHandler: [
        authMiddleware,
        requireRole('agent', 'client'),
        validate({ params: z.object({ id: z.string().uuid(), alt_id: z.string().uuid() }) }),
      ],
    },
    async function selectAlternative(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id, alt_id } = request.params as { id: string; alt_id: string };

      // 校验方案存在
      const alt = await query(
        'SELECT * FROM demand_alternatives WHERE id = $1 AND demand_id = $2',
        [alt_id, id]
      );
      if (alt.rows.length === 0) {
        reply.status(404).send(errorResponse(3007, '备选方案不存在'));
        return;
      }

      // 将所有备选方案置为 rejected，选中置为 selected
      const altRow = alt.rows[0] as { plan_content: string; price: number | null };
      await query(
        `UPDATE demand_alternatives SET status = 'rejected', updated_at = NOW()
         WHERE demand_id = $1 AND id != $2`,
        [id, alt_id]
      );
      await query(
        `UPDATE demand_alternatives SET status = 'selected', updated_at = NOW()
         WHERE id = $1`,
        [alt_id]
      );

      // 更新需求的价格（如果方案有价格）
      if (altRow.price) {
        await query(
          `UPDATE demands SET final_price = $1, updated_at = NOW() WHERE id = $2`,
          [altRow.price, id]
        );
      }

      reply.send(successResponse({ demand_id: id, selected_alternative_id: alt_id }, '方案已选择'));
    }
  );

  // ==========================================================
  // GET /v1/demands/:id/export - 导出方案 JSON（前端转 Word）(C-12/W-14)
  // ==========================================================
  app.get(
    '/:id/export',
    {
      preHandler: [
        authMiddleware,
        requireRole('agent', 'admin', 'client'),
        validate({ params: demandIdParamSchema }),
      ],
    },
    async function exportDemandPlan(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof demandIdParamSchema>;

      const result = await query<DemandRow>(
        'SELECT * FROM demands WHERE id = $1', [id]
      );

      if (result.rows.length === 0) {
        reply.status(404).send(errorResponse(3004, '需求不存在'));
        return;
      }

      const demand = result.rows[0];

      // 获取阵容信息
      const lineupResult = await query<LineupRow>(
        `SELECT l.*, p.name AS performer_name, p.tier::TEXT AS performer_tier
         FROM lineup l
         LEFT JOIN performers p ON l.performer_id = p.id
         WHERE l.demand_id = $1
         ORDER BY l.created_at ASC`,
        [id]
      );

      // 获取备选方案
      const alternatives = await query(
        `SELECT * FROM demand_alternatives
         WHERE demand_id = $1
         ORDER BY created_at ASC`,
        [id]
      );

      // 构建导出数据（供前端转为 Word）
      const exportData = {
        demand: {
          id: demand.id,
          title: demand.title || '未命名需求',
          event_type: demand.event_type,
          event_date: demand.event_date ? demand.event_date.split('T')[0] : '',
          event_time: demand.event_time,
          city: demand.city,
          address: demand.address,
          audience_count: demand.audience_count,
          budget: demand.budget ? Number(demand.budget) : undefined,
          duration_minutes: demand.duration_minutes,
          comedy_style: demand.comedy_style,
          special_requirements: demand.special_requirements,
          venue_name: demand.venue_name,
          venue_type: demand.venue_type,
          status: demand.status,
          urgency: demand.urgency,
          created_at: demand.created_at,
        },
        plan: demand.final_plan_content
          ? (() => { try { return JSON.parse(demand.final_plan_content); } catch { return demand.final_plan_content; } })()
          : (demand.adjusted_plan_content
            ? (() => { try { return JSON.parse(demand.adjusted_plan_content); } catch { return demand.adjusted_plan_content; } })()
            : (demand.ai_plan_content
              ? (() => { try { return JSON.parse(demand.ai_plan_content); } catch { return demand.ai_plan_content; } })()
              : null)),
        final_price: demand.final_price ? Number(demand.final_price) : undefined,
        lineups: lineupResult.rows.map(toLineupEntry),
        alternatives: alternatives.rows,
        export_time: new Date().toISOString(),
      };

      reply.send(successResponse(exportData, '方案数据已导出'));
    }
  );

  // ==========================================================
  // PATCH /v1/demands/:id/history - 客户历史卡片增强 (P-28)
  // 返回同公司的历史订单（已整合到 GET /:id 的增强逻辑中）
  // 这里作为独立端点提供
  // ==========================================================
  app.patch(
    '/:id/history',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: demandIdParamSchema }),
      ],
    },
    async function getClientHistory(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { id } = request.params as z.infer<typeof demandIdParamSchema>;

      const demand = await query<DemandRow>(
        'SELECT id, client_id FROM demands WHERE id = $1', [id]
      );

      if (demand.rows.length === 0) {
        reply.status(404).send(errorResponse(3004, '需求不存在'));
        return;
      }

      const clientId = demand.rows[0].client_id;

      // 查询同公司的所有历史订单
      const historyOrders = await query<DemandRow & { paid_total: string; client_name: string }>(
        `SELECT d.*, u.name AS client_name,
                COALESCE((SELECT SUM(pr.amount) FROM payment_records pr WHERE pr.demand_id = d.id), 0) AS paid_total
         FROM demands d
         LEFT JOIN users u ON d.client_id = u.id
         WHERE d.client_id = $1
           AND d.id != $2
         ORDER BY d.created_at DESC
         LIMIT 50`,
        [clientId, id]
      );

      // 汇总统计
      const stats = await query(
        `SELECT
           COUNT(*) AS total_orders,
           COALESCE(SUM(pr.amount), 0) AS total_spent
         FROM demands d
         LEFT JOIN payment_records pr ON pr.demand_id = d.id
         WHERE d.client_id = $1`,
        [clientId]
      );

      reply.send(successResponse({
        client: {
          id: clientId,
          name: historyOrders.rows[0]?.client_name || '未知',
        },
        stats: {
          total_orders: Number(stats.rows[0].total_orders),
          total_spent: Number(stats.rows[0].total_spent),
        },
        history_orders: historyOrders.rows.map((row) => ({
          id: row.id,
          title: row.title || '未命名需求',
          event_type: row.event_type,
          event_date: (row.event_date || '').toString().substring(0, 10),
          city: row.city,
          status: row.status,
          final_price: row.final_price ? Number(row.final_price) : undefined,
          paid_total: Number(row.paid_total),
          created_at: row.created_at,
        })),
      }));
    }
  );
}
