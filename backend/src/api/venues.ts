// ============================================================
// V4.7 场馆资源 API — 公开列表 / 详情
// GET /v1/venues | GET /v1/venues/:id
// P1 Mock 模式：不连接真实数据库，全部使用 Mock 数据
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
import { mockVenues } from '../mock/v47-data.js';

// ============================================================
// Zod Schemas
// ============================================================

const idParamSchema = z.object({ id: z.string() });

const listQuerySchema = z.object({
  city: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================================
// Routes
// ============================================================

export default async function venueRoutes(app: FastifyInstance) {

  // GET /v1/venues — 列表
  app.get('/', {
    preHandler: [validate({ query: listQuerySchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { city, capacity, page, pageSize } = listQuerySchema.parse(req.query);
    const { offset } = normalizePagination(page, pageSize);

    let filtered = [...mockVenues];

    if (city) {
      filtered = filtered.filter((v) => v.city.includes(city));
    }
    if (capacity) {
      filtered = filtered.filter(
        (v) => v.capacity_min <= capacity && v.capacity_max >= capacity,
      );
    }

    filtered.sort((a, b) => a.name.localeCompare(b.name));

    const total = filtered.length;
    const data = filtered.slice(offset, offset + pageSize);

    return reply.send(paginatedResponse(data, total, page, pageSize));
  });

  // GET /v1/venues/:id — 详情
  app.get('/:id', {
    preHandler: [validate({ params: idParamSchema })],
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(req.params);

    const venue = mockVenues.find((v) => v.id === id);
    if (!venue) {
      return reply.status(404).send(errorResponse(9401, '场馆不存在'));
    }

    return reply.send(successResponse({
      venue,
    }));
  });
}
