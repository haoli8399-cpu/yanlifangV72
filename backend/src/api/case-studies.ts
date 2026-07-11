// ============================================================
// V4.7 案例库 API — V4.7 升级版案例（case_studies 表）
// GET /v1/case-studies | GET /v1/case-studies/:id
// P0 Mock 模式：不连接真实数据库，全部使用 Mock 数据
// 注：与已有 /v1/cases（旧 cases 表）不冲突，使用独立路由前缀
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
import { mockCaseStudies } from '../mock/v47-data.js';

// ============================================================
// Zod Schemas
// ============================================================

const idParamSchema = z.object({ id: z.string() });

const clientTypeEnum = z.enum(['互联网', '金融', '制造', '零售', '教育', '医疗', '政府']);

const eventSceneEnum = z.enum(['企业年会', '产品发布', '客户答谢', '开业庆典', '团建']);

const listQuerySchema = z.object({
  client_type: clientTypeEnum.optional(),
  event_scene: eventSceneEnum.optional(),
  is_public: z
    .enum(['true', 'false'])
    .optional()
    .default('true'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================================
// Routes
// ============================================================

export default async function caseStudyRoutes(app: FastifyInstance) {

  // GET /v1/case-studies — 列表
  app.get('/', {
    preHandler: [validate({ query: listQuerySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { client_type, event_scene, is_public, page, pageSize } = listQuerySchema.parse(req.query);
    const { offset } = normalizePagination(page, pageSize);

    let filtered = [...mockCaseStudies];

    if (client_type) {
      filtered = filtered.filter((c) => c.client_type === client_type);
    }
    if (event_scene) {
      filtered = filtered.filter((c) => c.event_scene === event_scene);
    }
    if (is_public === 'true') {
      filtered = filtered.filter((c) => c.is_public === true);
    }

    // 按创建时间倒序
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = filtered.length;
    const data = filtered.slice(offset, offset + pageSize);

    return reply.send(paginatedResponse(data, total, page, pageSize));
  });

  // GET /v1/case-studies/:id — 详情
  app.get('/:id', {
    preHandler: [validate({ params: idParamSchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);

    const caseStudy = mockCaseStudies.find((c) => c.id === id);
    if (!caseStudy) {
      return reply.status(404).send(errorResponse(9501, '案例不存在'));
    }

    return reply.send(successResponse({
      case_study: caseStudy,
    }));
  });
}
