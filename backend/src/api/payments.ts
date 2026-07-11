// @ts-nocheck — pre-existing Fastify framework type issues
// ============================================================
// 付款登记路由处理器
// 对齐 docs/API_CONTRACT.md 第 2.10 节（2 个端点）
// 付款登记后自动推进订单状态（定金→deposit_received，尾款→final_payment_received）
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query, transaction } from '../utils/db.js';
import {
  successResponse,
  errorResponse,
  createdResponse,
  normalizePagination,
  paginatedResponse,
} from '../utils/response.js';
import type {
  PaymentType,
  PaymentRecord,
  DemandStatus,
  StatusHistoryEntry,
} from '../types/index.js';

// ============================================================
// Zod 校验 Schema
// ============================================================

/** 付款类型枚举 */
const paymentTypeSchema = z.enum(['deposit', 'final']);

/** POST /v1/payments 请求体 */
const createPaymentBodySchema = z.object({
  demand_id: z.string().uuid(),
  type: paymentTypeSchema,
  amount: z.number().positive(),
  method: z.string().min(1, '收款方式不能为空'),
  received_at: z.string().datetime(),
  note: z.string().optional(),
});

/** GET /v1/payments 查询参数 */
const listPaymentsQuerySchema = z.object({
  demand_id: z.string().uuid().optional(),
  type: paymentTypeSchema.optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// ============================================================
// 数据库行类型
// ============================================================

interface PaymentRow {
  id: string;
  demand_id: string;
  type: string;
  amount: string | number;
  method: string;
  operator_id: string;
  received_at: string;
  note: string | null;
  created_at: string;
}

interface DemandStatusRow {
  id: string;
  status: string;
  status_history: StatusHistoryEntry[] | null;
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 将数据库行映射为 PaymentRecord
 */
function toPaymentRecord(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    demand_id: row.demand_id,
    type: row.type as PaymentType,
    amount: Number(row.amount),
    method: row.method,
    operator_id: row.operator_id,
    received_at: row.received_at,
    created_at: row.created_at,
  };
}

/**
 * 根据付款类型和当前订单状态，计算应自动迁移到的目标状态
 * 仅在订单处于正确的「等待付款」状态时才自动推进
 */
function getTargetStatusForPayment(
  paymentType: PaymentType,
  currentStatus: DemandStatus,
): DemandStatus | null {
  if (paymentType === 'deposit' && currentStatus === 'pending_deposit') {
    return 'deposit_received';
  }
  if (
    paymentType === 'final' &&
    currentStatus === 'pending_final_payment'
  ) {
    return 'final_payment_received';
  }
  // 其他状态不自动推进（如已处于 deposit_received 再次登记定金）
  return null;
}

// ============================================================
// 路由注册
// ============================================================

export default async function paymentRoutes(
  app: FastifyInstance,
): Promise<void> {
  // ==========================================================
  // POST /v1/payments - 运营登记收款（定金/尾款）
  // ==========================================================
  app.post(
    '/',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin', 'finance'),
        validate({ body: createPaymentBodySchema }),
      ],
    },
    async function createPayment(
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> {
      const body = request.body as z.infer<typeof createPaymentBodySchema>;
      const user = request.user;

      // 使用事务确保付款记录创建 + 状态变更原子性
      const result = await transaction(async (client) => {
        // 1. 检查需求是否存在，获取当前状态
        const demandResult = await client.query<DemandStatusRow>(
          'SELECT id, status, status_history FROM demands WHERE id = $1',
          [body.demand_id],
        );

        if (demandResult.rows.length === 0) {
          return { error: { code: 4002, message: '订单不存在' } };
        }

        const demand = demandResult.rows[0];
        const currentStatus = demand.status as DemandStatus;

        // 2. 插入付款记录
        const paymentResult = await client.query<PaymentRow>(
          `INSERT INTO payment_records (
             demand_id, type, amount, method, operator_id, received_at, note
           ) VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            body.demand_id,
            body.type,
            body.amount,
            body.method,
            user.sub,
            body.received_at,
            body.note ?? null,
          ],
        );

        const payment = paymentResult.rows[0];

        // 3. 判断是否需要自动推进订单状态
        const targetStatus = getTargetStatusForPayment(
          body.type as PaymentType,
          currentStatus,
        );

        let newStatus: DemandStatus = currentStatus;

        if (targetStatus) {
          // 追加状态变更到 status_history
          const newEntry: StatusHistoryEntry = {
            status: targetStatus,
            at: new Date().toISOString(),
            operator_id: user.sub,
          };

          const currentHistory: StatusHistoryEntry[] =
            (demand.status_history as StatusHistoryEntry[]) || [];
          const updatedHistory = [...currentHistory, newEntry];

          await client.query(
            `UPDATE demands
             SET status = $2,
                 status_history = $3::jsonb,
                 updated_at = NOW()
             WHERE id = $1`,
            [body.demand_id, targetStatus, JSON.stringify(updatedHistory)],
          );

          newStatus = targetStatus;
        }

        // 4. 写入操作日志
        await client.query(
          `INSERT INTO operation_logs (
             operator_id, module, action, target_type, target_id, detail
           ) VALUES ($1, 'payment', 'create', 'payment', $2, $3)`,
          [
            user.sub,
            payment.id,
            `登记${body.type === 'deposit' ? '定金' : '尾款'} ${body.amount}元，收款方式: ${body.method}`,
          ],
        );

        return {
          success: {
            id: payment.id,
            demand_status: newStatus,
          },
        };
      });

      if ('error' in result && result.error) {
        reply
          .status(404)
          .send(errorResponse(result.error.code, result.error.message));
        return;
      }

      if ('success' in result && result.success) {
        reply
          .status(201)
          .send(createdResponse(result.success, '收款已登记'));
      }
    },
  );

  // ==========================================================
  // GET /v1/payments - 获取付款记录
  // ==========================================================
  app.get(
    '/',
    {
      preHandler: [
        authMiddleware,
        validate({ query: listPaymentsQuerySchema }),
      ],
    },
    async function listPayments(
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> {
      const q = request.query as z.infer<typeof listPaymentsQuerySchema>;
      const { page, pageSize, offset } = normalizePagination(
        q.page,
        q.pageSize,
      );

      // 动态构建 WHERE 条件（参数化查询）
      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 0;

      if (q.demand_id) {
        idx++;
        conditions.push(`pr.demand_id = $${idx}`);
        params.push(q.demand_id);
      }

      if (q.type) {
        idx++;
        conditions.push(`pr.type = $${idx}`);
        params.push(q.type);
      }

      const whereClause =
        conditions.length > 0
          ? `WHERE ${conditions.join(' AND ')}`
          : '';

      // 分页查询 + 总数查询
      const limitIdx = idx + 1;
      const offsetIdx = idx + 2;

      const [dataResult, countResult] = await Promise.all([
        query<PaymentRow>(
          `SELECT pr.*
           FROM payment_records pr
           ${whereClause}
           ORDER BY pr.created_at DESC
           LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
          [...params, pageSize, offset],
        ),
        query<{ total: string }>(
          `SELECT COUNT(*) AS total FROM payment_records pr ${whereClause}`,
          params,
        ),
      ]);

      const items = dataResult.rows.map(toPaymentRecord);
      const total = Number(countResult.rows[0].total);

      reply
        .status(200)
        .send(paginatedResponse(items, total, page, pageSize));
    },
  );
}
