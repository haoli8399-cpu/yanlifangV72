import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { query } from '../utils/db.js';
import { createdResponse, errorResponse, paginatedResponse, successResponse } from '../utils/response.js';

const tierSchema = z.enum(['T0', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6']);
const statusSchema = z.enum(['active', 'inactive']);

const listQuerySchema = z.object({
  keyword: z.string().optional(),
  tier: tierSchema.optional(),
  status: statusSchema.optional().default('active'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const idParamSchema = z.object({ id: z.string().uuid() });

const createBodySchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(11).optional(),
  tier: tierSchema.optional().default('T6'),
  status: statusSchema.optional().default('active'),
  avatar_url: z.string().optional(),
  style_tags: z.array(z.string().min(1)).optional(),
  introduction: z.string().optional(),
  experience_years: z.number().int().min(0).optional(),
});

const updateBodySchema = createBodySchema.partial().extend({
  credit_score: z.number().min(0).max(5).optional(),
});

const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

type AuthedRequest = FastifyRequest & {
  user?: {
    sub: string;
    role: string;
    company_id?: string;
  };
};

async function resolveCompanyId(request: AuthedRequest): Promise<string | null> {
  if (request.user?.company_id) {
    return request.user.company_id;
  }

  if (!request.user?.sub) {
    return null;
  }

  const result = await query<{ id: string }>(
    'SELECT id FROM company_profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [request.user.sub]
  );

  return result.rows[0]?.id ?? null;
}

async function requireCompanyScope(request: AuthedRequest, reply: FastifyReply): Promise<string | null> {
  const companyId = await resolveCompanyId(request);

  if (!companyId) {
    reply.status(403).send(errorResponse(1006, '未找到当前用户公司资料'));
    return null;
  }

  return companyId;
}

async function ensureOwnedPerformer(performerId: string, companyId: string, reply: FastifyReply): Promise<boolean> {
  const result = await query<{ id: string }>(
    'SELECT id FROM performers WHERE id = $1 AND company_id = $2',
    [performerId, companyId]
  );

  if (result.rows.length === 0) {
    reply.status(404).send(errorResponse(5004, '艺人不存在或不属于当前公司'));
    return false;
  }

  return true;
}

export default async function supplierPerformersRoutes(app: FastifyInstance) {
  app.get('/performers', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const { keyword, tier, status, page, pageSize } = listQuerySchema.parse(request.query);
    const params: unknown[] = [companyId];
    const conditions = ['p.company_id = $1'];
    let i = 2;

    if (keyword) {
      conditions.push(`p.name ILIKE $${i++}`);
      params.push(`%${keyword}%`);
    }
    if (tier) {
      conditions.push(`p.tier = $${i++}`);
      params.push(tier);
    }
    if (status) {
      conditions.push(`p.status = $${i++}`);
      params.push(status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const offset = (page - 1) * pageSize;

    const [items, count] = await Promise.all([
      query(
        `SELECT p.id, p.name, p.phone, p.avatar_url, p.tier, p.status, p.credit_score,
                p.credit_level, p.rating, p.experience_years, p.created_at,
                COUNT(a.id) FILTER (
                  WHERE a.status = 'completed'
                    AND a.created_at >= now() - interval '3 months'
                )::int AS recent_3_month_deals
         FROM performers p
         LEFT JOIN assignments a ON a.performer_id = p.id
         ${where}
         GROUP BY p.id
         ORDER BY p.created_at DESC
         LIMIT $${i++} OFFSET $${i++}`,
        [...params, pageSize, offset]
      ),
      query<{ count: string }>(`SELECT COUNT(*) FROM performers p ${where}`, params),
    ]);

    return reply.send(paginatedResponse(items.rows, Number(count.rows[0].count), page, pageSize));
  });

  app.post('/performers', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const body = createBodySchema.parse(request.body);
    const result = await query<{ id: string }>(
      `INSERT INTO performers (
         company_id, name, phone, tier, status, avatar_url, style_tags, introduction, experience_years
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        companyId,
        body.name,
        body.phone ?? null,
        body.tier,
        body.status,
        body.avatar_url ?? null,
        JSON.stringify(body.style_tags ?? []),
        body.introduction ?? null,
        body.experience_years ?? 0,
      ]
    );

    return reply.status(201).send(createdResponse({ id: result.rows[0].id }, '艺人已创建'));
  });

  app.put('/performers/:id', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const { id } = idParamSchema.parse(request.params);
    if (!(await ensureOwnedPerformer(id, companyId, reply))) return;

    const body = updateBodySchema.parse(request.body);
    const fields: string[] = [];
    const params: unknown[] = [];
    let i = 1;

    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      fields.push(`${key} = $${i++}`);
      params.push(key === 'style_tags' ? JSON.stringify(value) : value);
    }

    if (fields.length === 0) {
      return reply.send(successResponse({ id }, '艺人资料已更新'));
    }

    fields.push(`updated_at = now()`);
    params.push(id, companyId);

    await query(
      `UPDATE performers SET ${fields.join(', ')} WHERE id = $${i++} AND company_id = $${i}`,
      params
    );

    return reply.send(successResponse({ id }, '艺人资料已更新'));
  });

  app.delete('/performers/:id', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const { id } = idParamSchema.parse(request.params);
    if (!(await ensureOwnedPerformer(id, companyId, reply))) return;

    await query(
      `UPDATE performers SET status = 'inactive', updated_at = now() WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    return reply.send(successResponse({ id, status: 'inactive' }, '艺人已删除'));
  });

  app.get('/performers/:id/schedule', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const { id } = idParamSchema.parse(request.params);
    if (!(await ensureOwnedPerformer(id, companyId, reply))) return;

    const result = await query(
      `SELECT a.id, a.arrival_time, a.status, a.performance_role,
              d.id AS demand_id, d.title AS demand_title, d.event_date, d.event_time, d.city, d.address
       FROM assignments a
       JOIN demands d ON d.id = a.demand_id
       WHERE a.performer_id = $1
       ORDER BY a.arrival_time DESC`,
      [id]
    );

    return reply.send(successResponse({ items: result.rows }));
  });

  app.get('/performers/:id/checkins', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const { id } = idParamSchema.parse(request.params);
    if (!(await ensureOwnedPerformer(id, companyId, reply))) return;

    const { page, pageSize } = pageQuerySchema.parse(request.query);
    const offset = (page - 1) * pageSize;
    const [items, count] = await Promise.all([
      query(
        `SELECT a.id, a.arrival_time, a.checkin_time, a.checkin_location, a.status,
                d.id AS demand_id, d.title AS demand_title, d.city
         FROM assignments a
         JOIN demands d ON d.id = a.demand_id
         WHERE a.performer_id = $1
         ORDER BY a.arrival_time DESC
         LIMIT $2 OFFSET $3`,
        [id, pageSize, offset]
      ),
      query<{ count: string }>('SELECT COUNT(*) FROM assignments WHERE performer_id = $1', [id]),
    ]);

    return reply.send(paginatedResponse(items.rows, Number(count.rows[0].count), page, pageSize));
  });

  app.get('/performers/:id/settlements', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const { id } = idParamSchema.parse(request.params);
    if (!(await ensureOwnedPerformer(id, companyId, reply))) return;

    const result = await query(
      `SELECT s.id, s.amount, s.period, s.status, s.settled_at, s.paid_at,
              d.id AS demand_id, d.title AS demand_title, d.event_date, d.city
       FROM settlements s
       JOIN demands d ON d.id = s.demand_id
       WHERE s.performer_id = $1
       ORDER BY s.created_at DESC`,
      [id]
    );

    return reply.send(successResponse({ items: result.rows }));
  });

  app.get('/performers/:id/credit', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const { id } = idParamSchema.parse(request.params);
    if (!(await ensureOwnedPerformer(id, companyId, reply))) return;

    const [performer, logs] = await Promise.all([
      query('SELECT id, name, credit_score, credit_level FROM performers WHERE id = $1', [id]),
      query(
        `SELECT id, change_amount, reason, related_demand_id, created_at
         FROM credit_score_logs
         WHERE performer_id = $1
         ORDER BY created_at DESC
         LIMIT 100`,
        [id]
      ),
    ]);

    return reply.send(successResponse({
      performer: performer.rows[0],
      logs: logs.rows,
    }));
  });
}
