// ============================================================
// 签约管理路由处理器
// 对齐 docs/API_CONTRACT.md 第 2.5 节（2 个端点）
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { query } from '../utils/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import type {
  ContractMode,
  ContractStatus,
  ContractInfo,
} from '../types/index.js';

// ============================================================
// Zod 校验 Schema
// ============================================================

/** 签约模式枚举 */
const contractModeSchema = z.enum(['skip', 'upload', 'system']);

/** PUT /v1/contracts/:demand_id 请求体 */
const setContractBodySchema = z.object({
  mode: contractModeSchema,
  file_url: z.string().url().optional(),
  signed_at: z.string().datetime().optional(),
});

/** 路由参数（demand_id UUID） */
const demandIdParamSchema = z.object({
  demand_id: z.string().uuid(),
});

// ============================================================
// 数据库行类型
// ============================================================

interface DemandContractRow {
  id: string;
  contract_mode: string | null;
  contract_file_url: string | null;
  contract_signed_at: string | null;
  status: string;
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 根据签约模式和签署时间，推导签约状态
 */
function deriveContractStatus(
  mode: ContractMode | null,
  signedAt: string | null,
): ContractStatus {
  if (!mode) {
    return 'pending';
  }
  if (mode === 'skip') {
    return 'skipped';
  }
  // upload 或 system 模式，有签署时间即已签
  if (signedAt) {
    return 'signed';
  }
  return 'pending';
}

/**
 * 将数据库行映射为 ContractInfo
 */
function toContractInfo(row: DemandContractRow): ContractInfo {
  const mode = (row.contract_mode as ContractMode) || null;
  return {
    mode: mode ?? 'skip', // 向后兼容：无签约模式视为 skip
    file_url: row.contract_file_url ?? undefined,
    signed_at: row.contract_signed_at ?? undefined,
    status: deriveContractStatus(mode, row.contract_signed_at),
  };
}

// ============================================================
// 路由注册
// ============================================================

export default async function contractRoutes(
  app: FastifyInstance,
): Promise<void> {
  // ==========================================================
  // PUT /v1/contracts/:demand_id - 设置签约模式 / 上传合同
  // ==========================================================
  app.put(
    '/:demand_id',
    {
      preHandler: [
        authMiddleware,
        requireRole('admin'),
        validate({
          params: demandIdParamSchema,
          body: setContractBodySchema,
        }),
      ],
    },
    async function setContract(
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> {
      const { demand_id } = request.params as z.infer<
        typeof demandIdParamSchema
      >;
      const body = request.body as z.infer<typeof setContractBodySchema>;

      // 检查需求是否存在
      const existing = await query<DemandContractRow>(
        'SELECT id, contract_mode, contract_file_url, contract_signed_at, status FROM demands WHERE id = $1',
        [demand_id],
      );

      if (existing.rows.length === 0) {
        reply.status(404).send(errorResponse(4002, '订单不存在'));
        return;
      }

      // 更新签约信息
      await query(
        `UPDATE demands
         SET contract_mode = $2,
             contract_file_url = $3,
             contract_signed_at = $4,
             updated_at = NOW()
         WHERE id = $1`,
        [
          demand_id,
          body.mode,
          body.file_url ?? null,
          body.signed_at ?? null,
        ],
      );

      reply.status(200).send(successResponse(null, '签约信息已更新'));
    },
  );

  // ==========================================================
  // GET /v1/contracts/:demand_id - 获取合同信息
  // ==========================================================
  app.get(
    '/:demand_id',
    {
      preHandler: [
        authMiddleware,
        validate({ params: demandIdParamSchema }),
      ],
    },
    async function getContract(
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> {
      const { demand_id } = request.params as z.infer<
        typeof demandIdParamSchema
      >;

      const result = await query<DemandContractRow>(
        'SELECT id, contract_mode, contract_file_url, contract_signed_at, status FROM demands WHERE id = $1',
        [demand_id],
      );

      if (result.rows.length === 0) {
        reply.status(404).send(errorResponse(4002, '订单不存在'));
        return;
      }

      reply.status(200).send(successResponse(toContractInfo(result.rows[0])));
    },
  );
}
