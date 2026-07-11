// ============================================================
// V4.7 演员/内容团队 API — 公开列表 / 详情
// GET /v1/talents | GET /v1/talents/:id
// P0 Mock 模式：不连接真实数据库，全部使用 Mock 数据
// 重要：对外 API 不返回 base_price（成本价），仅返回 display_price
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  normalizePagination,
} from '../utils/response.js';
import { mockTalents } from '../mock/v47-data.js';

// ============================================================
// Zod Schemas
// ============================================================

const idParamSchema = z.object({ id: z.string() });

const roleTypeEnum = z.enum(['脱口秀', '即兴', '主持', '培训', '魔术', '乐队', '其他']);

const listQuerySchema = z.object({
  role_type: roleTypeEnum.optional(),
  tags: z.string().optional(),     // 逗号分隔
  status: z.string().optional().default('active'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================================
// 辅助函数：过滤 base_price，仅对外暴露 display_price
// ============================================================

function toPublicTalent(talent: Record<string, unknown>): Record<string, unknown> {
  const { base_price, ...rest } = talent;
  return rest;
}

// ============================================================
// Routes
// ============================================================

export default async function talentRoutes(app: FastifyInstance) {

  // GET /v1/talents — 列表
  app.get('/', {
    preHandler: [validate({ query: listQuerySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { role_type, tags, status, page, pageSize } = listQuerySchema.parse(req.query);
    const { offset } = normalizePagination(page, pageSize);

    let filtered = [...mockTalents] as Record<string, unknown>[];

    if (role_type) {
      filtered = filtered.filter((t) => t.role_type === role_type);
    }
    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim());
      filtered = filtered.filter((t) => {
        const talentTags = (t.tags as string[]) || [];
        return tagList.some((tag) => talentTags.includes(tag));
      });
    }

    // 按评分倒序
    filtered.sort((a, b) => ((b.rating as number) || 0) - ((a.rating as number) || 0));

    const total = filtered.length;
    const data = filtered.slice(offset, offset + pageSize).map(toPublicTalent);

    return reply.send(paginatedResponse(data, total, page, pageSize));
  });

  // GET /v1/talents/:id — 详情（对外不返回 base_price）
  app.get('/:id', {
    preHandler: [validate({ params: idParamSchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);

    const talent = mockTalents.find((t) => t.id === id);
    if (!talent) {
      return reply.status(404).send(errorResponse(9301, '演员/团队不存在'));
    }

    return reply.send(successResponse({
      talent: toPublicTalent(talent as unknown as Record<string, unknown>),
    }));
  });
}
