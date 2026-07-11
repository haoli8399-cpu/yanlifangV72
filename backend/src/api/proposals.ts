// ============================================================
// V4.7 方案管理 API — 方案 CRUD / 查看埋点 / 列表
// POST /v1/proposals | GET /v1/proposals | GET /v1/proposals/:id |
// PATCH /v1/proposals/:id | POST /v1/proposals/:id/view
// P0 Mock 模式：不连接真实数据库，全部使用 Mock 数据
// ============================================================

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  normalizePagination,
} from '../utils/response.js';
import {
  mockProposals,
  mockProposalModules,
  generateProposalCode,
} from '../mock/v47-data.js';

// ============================================================
// Zod Schemas
// ============================================================

const idParamSchema = z.object({ id: z.string() });

const statusEnum = z.enum([
  'draft', 'internal_review', 'shared', 'viewed', 'downloaded',
  'modified_by_client', 'revised', 'approved', 'converted_to_order', 'lost',
]);

const listQuerySchema = z.object({
  status: statusEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

const createBodySchema = z.object({
  lead_id: z.string().uuid().optional(),
  customer_name: z.string().min(1).max(200),
  event_theme: z.string().min(1).max(200),
  understanding: z.string().min(1),
  plan_structure: z.record(z.unknown()).optional(),
  budget: z.string().optional(),
  performers: z.array(z.string()).optional(),
  cases: z.array(z.string()).optional(),
  consultant: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

const updateBodySchema = z.object({
  understanding: z.string().optional(),
  plan_structure: z.record(z.unknown()).optional(),
  budget: z.string().optional(),
  performers: z.array(z.string()).optional(),
  cases: z.array(z.string()).optional(),
  event_theme: z.string().optional(),
  event_date: z.string().optional(),
  headcount: z.number().int().positive().optional(),
  status: statusEnum.optional(),
});

const tokenQuerySchema = z.object({
  token: z.string().optional(),
});

const viewBodySchema = z.object({
  device_info: z.string().optional(),
});

// ============================================================
// Routes
// ============================================================

export default async function proposalRoutes(app: FastifyInstance) {

  // POST /v1/proposals — 创建方案
  app.post('/', {
    preHandler: [authMiddleware, requireRole('agent', 'admin'), validate({ body: createBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const body = createBodySchema.parse(req.body);
    const userId = req.user?.sub ?? '';

    const proposalId = `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const seq = mockProposals.length + 1;
    const code = generateProposalCode(seq);

    const newProposal = {
      id: proposalId,
      code,
      customer_name: body.customer_name,
      event_theme: body.event_theme,
      event_date: null,
      headcount: null,
      budget: body.budget || null,
      understanding: body.understanding,
      status: 'draft' as const,
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: userId,
      consultant_name: body.consultant?.name || null,
      consultant_phone: body.consultant?.phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return reply.status(201).send(successResponse({
      proposal_id: proposalId,
      code,
      share_url: `https://yanli.com/p/${proposalId}`,
      _mock: newProposal,
    }, '方案已创建'));
  });

  // GET /v1/proposals — 方案列表（销售端）
  app.get('/', {
    preHandler: [authMiddleware, requireRole('agent', 'admin')],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { status, page, pageSize } = listQuerySchema.parse(req.query);
    const { offset } = normalizePagination(page, pageSize);

    let filtered = [...mockProposals];
    if (status) filtered = filtered.filter((p) => p.status === status);

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = filtered.length;
    const data = filtered.slice(offset, offset + pageSize);

    return reply.send(paginatedResponse(data, total, page, pageSize));
  });

  // GET /v1/proposals/:id — 获取方案详情（客户H5用，公开，token验证）
  app.get('/:id', {
    preHandler: [validate({ query: tokenQuerySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);

    const proposal = mockProposals.find((p) => p.id === id);
    if (!proposal) {
      return reply.status(404).send(errorResponse(9201, '方案不存在'));
    }

    // Mock: 查找关联模块
    const modules = mockProposalModules.filter((m) => m.proposal_id === id);

    // Mock: 判断是否过期
    const validUntil = proposal.valid_until ? new Date(proposal.valid_until) : null;
    const isExpired = validUntil ? validUntil < new Date() : false;

    return reply.send(successResponse({
      proposal,
      modules,
      valid_until: proposal.valid_until,
      is_expired: isExpired,
    }));
  });

  // PATCH /v1/proposals/:id — 编辑方案（销售端）
  app.patch('/:id', {
    preHandler: [authMiddleware, requireRole('agent', 'admin'), validate({ body: updateBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);
    const body = updateBodySchema.parse(req.body);

    const proposalIdx = mockProposals.findIndex((p) => p.id === id);
    if (proposalIdx === -1) {
      return reply.status(404).send(errorResponse(9201, '方案不存在'));
    }

    // Mock: 更新字段
    const p = mockProposals[proposalIdx];
    if (body.understanding !== undefined) p.understanding = body.understanding;
    if (body.budget !== undefined) p.budget = body.budget;
    if (body.event_theme !== undefined) p.event_theme = body.event_theme;
    if (body.event_date !== undefined) p.event_date = body.event_date;
    if (body.headcount !== undefined) p.headcount = body.headcount;
    if (body.status !== undefined) p.status = body.status;
    p.updated_at = new Date().toISOString();

    return reply.send(successResponse(p, '方案已更新'));
  });

  // POST /v1/proposals/:id/view — 记录方案打开（埋点）
  app.post('/:id/view', {
    preHandler: [validate({ body: viewBodySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);
    const { device_info } = viewBodySchema.parse(req.body);

    const proposal = mockProposals.find((p) => p.id === id);
    if (!proposal) {
      return reply.status(404).send(errorResponse(9201, '方案不存在'));
    }

    // Mock: 如果是 shared 状态，变为 viewed
    if (proposal.status === 'shared') {
      proposal.status = 'viewed';
    }

    return reply.send(successResponse({
      viewed_at: new Date().toISOString(),
      device_info: device_info || 'unknown',
      proposal_id: id,
    }, '查看已记录'));
  });
}
