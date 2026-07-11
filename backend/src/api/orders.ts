// ============================================================
// 订单状态流转路由处理器
// 对齐 docs/API_CONTRACT.md 第 2.4 节（2 个端点）
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query, transaction } from '../utils/db.js';
import {
  successResponse,
  errorResponse,
} from '../utils/response.js';
import type {
  DemandStatus,
  StatusHistoryEntry,
  TimelineEntry,
} from '../types/index.js';

// refundBodySchema removed (unused)

// ============================================================
// Zod 校验 Schema
// ============================================================

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

/** PATCH /v1/orders/:demand_id/status 请求体 */
const updateOrderStatusBodySchema = z.object({
  to_status: demandStatusSchema,
  metadata: z
    .object({
      amount: z.number().positive().optional(),
      method: z.string().optional(),
      note: z.string().optional(),
    })
    .optional(),
});

/** 路由参数（demand_id UUID） */
const demandIdParamSchema = z.object({
  demand_id: z.string().uuid(),
});

// ============================================================
// 状态机配置对象
// ============================================================

/**
 * 状态迁移规则配置
 * key: 当前状态，value: 允许迁移到的目标状态集合
 */
const ALLOWED_TRANSITIONS: Record<DemandStatus, Set<DemandStatus>> = {
  pending_ai: new Set(['ai_generated', 'cancelled']),
  ai_generated: new Set(['pending_operator', 'cancelled']),
  pending_operator: new Set(['operator_adjusted', 'cancelled']),
  operator_adjusted: new Set(['pending_client_confirm', 'cancelled']),
  pending_client_confirm: new Set(['confirmed', 'cancelled']),
  confirmed: new Set(['pending_deposit', 'cancelled']),
  pending_deposit: new Set(['deposit_received', 'cancelled']),
  deposit_received: new Set(['pending_performer', 'cancelled']),
  pending_performer: new Set(['performer_confirmed', 'cancelled']),
  performer_confirmed: new Set(['performing', 'cancelled']),
  performing: new Set(['finished', 'cancelled']),
  finished: new Set(['pending_final_payment', 'cancelled']),
  pending_final_payment: new Set(['final_payment_received', 'cancelled']),
  final_payment_received: new Set(['settled', 'cancelled']),
  settled: new Set(['cancelled']),
  cancelled: new Set(),
  refunding: new Set(['settled', 'cancelled']),
};

/** 状态 → 中文标签映射 */
const STATUS_LABELS: Record<DemandStatus, string> = {
  pending_ai: '等待AI生成方案',
  ai_generated: 'AI方案已生成',
  pending_operator: '等待运营处理',
  operator_adjusted: '运营已调整方案',
  pending_client_confirm: '等待活动公司确认',
  confirmed: '方案已确认',
  pending_deposit: '等待定金',
  deposit_received: '定金已收',
  pending_performer: '等待演员确认',
  performer_confirmed: '演员已确认',
  performing: '演出进行中',
  finished: '演出已完成',
  pending_final_payment: '等待尾款',
  final_payment_received: '尾款已收',
  settled: '已结算',
  cancelled: '已取消',
  refunding: '退款中',
};

/**
 * 检查状态迁移是否合法
 */
function canTransition(
  currentStatus: DemandStatus,
  targetStatus: DemandStatus
): boolean {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) {
    return false;
  }
  return allowed.has(targetStatus);
}

// ============================================================
// 数据库行类型
// ============================================================

interface DemandRow {
  id: string;
  client_id: string;
  status: string;
  status_history: StatusHistoryEntry[];
}

// TimelineRow removed (unused)

// ============================================================
// 路由注册
// ============================================================

export default async function orderRoutes(app: FastifyInstance): Promise<void> {
  // ==========================================================
  // PATCH /v1/orders/:demand_id/status - 运营推进订单状态
  // ==========================================================
  app.patch(
    '/:demand_id/status',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({
          params: demandIdParamSchema,
          body: updateOrderStatusBodySchema,
        }),
      ],
    },
    async function advanceOrderStatus(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { demand_id } = request.params as z.infer<
        typeof demandIdParamSchema
      >;
      const body = request.body as z.infer<
        typeof updateOrderStatusBodySchema
      >;
      const user = request.user;

      const { to_status, metadata } = body;

      // 使用事务确保状态变更原子性
      const result = await transaction(async (client) => {
        // 查询需求当前状态
        const existing = await client.query<DemandRow>(
          'SELECT id, client_id, status, status_history FROM demands WHERE id = $1',
          [demand_id]
        );

        if (existing.rows.length === 0) {
          return { error: { code: 4002, message: '订单不存在' } };
        }

        const demand = existing.rows[0];
        const currentStatus = demand.status as DemandStatus;

        // 状态相同则直接返回成功
        if (currentStatus === to_status) {
          return {
            success: {
              id: demand.id,
              status: currentStatus,
              message: '状态已更新',
            },
          };
        }

        // 校验状态迁移合法性
        if (!canTransition(currentStatus, to_status)) {
          return {
            error: {
              code: 4001,
              message: `不允许从 [${STATUS_LABELS[currentStatus]}] 变更为 [${STATUS_LABELS[to_status]}]`,
            },
          };
        }

        // 追加状态变更到 status_history
        const newEntry: StatusHistoryEntry = {
          status: to_status,
          at: new Date().toISOString(),
          operator_id: user.sub,
        };

        const currentHistory = demand.status_history || [];
        const updatedHistory = [...currentHistory, newEntry];

        // 更新需求状态
        await client.query(
          `UPDATE demands
           SET status = $2,
               status_history = $3::jsonb,
               updated_at = NOW()
           WHERE id = $1`,
          [demand_id, to_status, JSON.stringify(updatedHistory)]
        );

        // 如果有元数据备注，写入 operation_logs
        if (metadata?.note) {
          await client.query(
            `INSERT INTO operation_logs (
               operator_id, module, action, target_type, target_id, detail
             ) VALUES ($1, 'demand', 'status_change', 'demand', $2, $3)`,
            [user.sub, demand_id, metadata.note]
          );
        }

        return {
          success: {
            id: demand.id,
            status: to_status,
            message: '状态已更新',
          },
        };
      });

      if ('error' in result && result.error) {
        reply
          .status(result.error.code === 4001 ? 409 : 404)
          .send(errorResponse(result.error.code, result.error.message));
        return;
      }

      if ('success' in result && result.success) {
        reply.status(200).send(successResponse(result.success));
      }
    }
  );

  // ==========================================================
  // GET /v1/orders/:demand_id/timeline - 获取订单时间线
  // ==========================================================
  app.get(
    '/:demand_id/timeline',
    {
      preHandler: [
        authMiddleware,
        requireRole('agent', 'admin', 'client'),
        validate({ params: demandIdParamSchema }),
      ],
    },
    async function getOrderTimeline(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { demand_id } = request.params as z.infer<
        typeof demandIdParamSchema
      >;

      // 检查需求是否存在
      const demandResult = await query<DemandRow>(
        'SELECT id, status_history FROM demands WHERE id = $1',
        [demand_id]
      );

      if (demandResult.rows.length === 0) {
        reply.status(404).send(errorResponse(4002, '订单不存在'));
        return;
      }

      const demand = demandResult.rows[0];
      const history: StatusHistoryEntry[] = demand.status_history || [];

      // 将 status_history 映射为时间线条目
      // 同时查询操作人姓名
      const operatorIds = history
        .map((h) => h.operator_id)
        .filter((id): id is string => !!id && id.length > 0);

      let operatorNameMap: Record<string, string> = {};

      if (operatorIds.length > 0) {
        const placeholders = operatorIds.map((_, i) => `$${i + 1}`).join(', ');
        const operatorResult = await query<{ id: string; name: string }>(
          `SELECT id, name FROM users WHERE id IN (${placeholders})`,
          operatorIds
        );
        for (const op of operatorResult.rows) {
          operatorNameMap[op.id] = op.name;
        }
      }

      const timeline: TimelineEntry[] = history.map((entry) => ({
        status: entry.status as DemandStatus,
        label: STATUS_LABELS[entry.status as DemandStatus] || entry.status,
        at: entry.at,
        operator: entry.operator_id
          ? {
              id: entry.operator_id,
              name: operatorNameMap[entry.operator_id] || '未知用户',
            }
          : undefined,
        note: undefined,
      }));

      reply.status(200).send(successResponse(timeline));
    }
  );

  // ==========================================================
  // POST /v1/orders/:demand_id/refund - 退款处理 (P-16)
  // 运营发起退款，状态→refunding
  // ==========================================================
  app.post(
    '/:demand_id/refund',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({ params: demandIdParamSchema }),
      ],
    },
    async function refundOrder(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const { demand_id } = request.params as z.infer<
        typeof demandIdParamSchema
      >;
      const body = request.body as { amount: number; reason: string };
      const user = request.user;

      // 校验参数
      if (!body.amount || body.amount <= 0) {
        reply.status(400).send(errorResponse(4003, '请提供退款金额'));
        return;
      }
      if (!body.reason) {
        reply.status(400).send(errorResponse(4004, '请提供退款原因'));
        return;
      }

      // 查询订单当前状态
      const existing = await query<DemandRow>(
        'SELECT id, status, status_history FROM demands WHERE id = $1',
        [demand_id]
      );

      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(4002, '订单不存在'));
        return;
      }

      const demand = existing.rows[0];
      const currentStatus = demand.status as DemandStatus;

      // 仅已收款和之后的状态可退款
      const refundableStatuses: DemandStatus[] = [
        'deposit_received',
        'performer_confirmed',
        'performing',
        'finished',
        'final_payment_received',
        'settled',
      ];

      if (!refundableStatuses.includes(currentStatus)) {
        reply.status(409).send(errorResponse(4005, `当前状态 [${STATUS_LABELS[currentStatus]}] 不可退款`));
        return;
      }

      // 将状态改为 refunding
      const newEntry: StatusHistoryEntry = {
        status: 'refunding' as DemandStatus,
        at: new Date().toISOString(),
        operator_id: user.sub,
      };

      const currentHistory = demand.status_history || [];
      const updatedHistory = [...currentHistory, newEntry];

      await transaction(async (client) => {
        await client.query(
          `UPDATE demands
           SET status = 'refunding',
               status_history = $2::jsonb,
               updated_at = NOW()
           WHERE id = $1`,
          [demand_id, JSON.stringify(updatedHistory)]
        );

        // 记录退款操作日志
        await client.query(
          `INSERT INTO operation_logs (
             operator_id, module, action, target_type, target_id, detail
           ) VALUES ($1, 'order', 'refund', 'demand', $2, $3)`,
          [user.sub, demand_id, JSON.stringify({
            amount: body.amount,
            reason: body.reason,
            previous_status: currentStatus,
          })]
        );
      });

      reply.status(200).send(successResponse({
        id: demand_id,
        status: 'refunding',
        refund_amount: body.amount,
        reason: body.reason,
      }, '退款申请已提交'));
    }
  );
}
