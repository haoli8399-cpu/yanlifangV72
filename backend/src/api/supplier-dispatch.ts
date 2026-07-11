import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { transaction, query } from '../utils/db.js';
import { createdResponse, errorResponse, successResponse } from '../utils/response.js';

const candidatesBodySchema = z.object({
  demand_id: z.string().uuid(),
});

const confirmBodySchema = z.object({
  demand_id: z.string().uuid(),
  performer_ids: z.array(z.string().uuid()).min(1).refine(
    (ids) => new Set(ids).size === ids.length,
    'performer_ids 不能重复'
  ),
  performance_role: z.string().min(1).optional().default('商演艺人'),
  arrival_time: z.string().datetime().optional(),
});

type AuthedRequest = FastifyRequest & {
  user?: {
    sub: string;
    role: string;
    company_id?: string;
  };
};

interface DemandSchedule {
  id: string;
  event_date: string | Date | null;
  event_time: string | null;
  duration_minutes: number | null;
  budget: number | null;
}

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

async function getDemandSchedule(demandId: string, reply: FastifyReply): Promise<DemandSchedule | null> {
  const result = await query<DemandSchedule>(
    'SELECT id, event_date, event_time, duration_minutes, budget FROM demands WHERE id = $1',
    [demandId]
  );

  if (result.rows.length === 0) {
    reply.status(404).send(errorResponse(3004, '需求不存在'));
    return null;
  }

  return result.rows[0];
}

function buildArrivalTime(demand: DemandSchedule, override?: string): string {
  if (override) {
    return override;
  }

  const datePart = demand.event_date instanceof Date
    ? demand.event_date.toISOString().slice(0, 10)
    : String(demand.event_date ?? new Date().toISOString().slice(0, 10)).slice(0, 10);
  const timePart = demand.event_time ? String(demand.event_time).slice(0, 8) : '09:00:00';
  return `${datePart}T${timePart}Z`;
}

export default async function supplierDispatchRoutes(app: FastifyInstance) {
  app.post('/dispatch/candidates', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const { demand_id } = candidatesBodySchema.parse(request.body);
    const demand = await getDemandSchedule(demand_id, reply);
    if (!demand) return;

    const arrivalTime = buildArrivalTime(demand);
    const result = await query(
      `SELECT p.id, p.name, p.tier, p.status, p.credit_score, p.credit_level, p.rating,
              COUNT(done.id)::int AS historical_deals,
              ROUND((p.credit_score / 5.0)::numeric, 2) AS match_score
       FROM performers p
       LEFT JOIN assignments conflict
         ON conflict.performer_id = p.id
        AND conflict.arrival_time::date = $2::timestamptz::date
        AND conflict.status NOT IN ('cancelled', 'rejected')
       LEFT JOIN assignments done
         ON done.performer_id = p.id
        AND done.status = 'completed'
       WHERE p.company_id = $1
         AND p.status = 'active'
         AND conflict.id IS NULL
       GROUP BY p.id
       ORDER BY p.credit_score DESC, historical_deals DESC, p.rating DESC`,
      [companyId, arrivalTime]
    );

    return reply.send(successResponse({
      demand_id,
      filters: {
        conflict_date: arrivalTime.slice(0, 10),
      },
      candidates: result.rows,
      ai_note: 'TODO: 替换为真实 AI 派单模型；当前按信誉分与历史成交排序，匹配度=信誉分/5',
    }));
  });

  app.post('/dispatch/confirm', { preHandler: [authMiddleware, requireRole('agent', 'admin')] }, async (request, reply) => {
    const companyId = await requireCompanyScope(request as AuthedRequest, reply);
    if (!companyId) return;

    const body = confirmBodySchema.parse(request.body);
    const demand = await getDemandSchedule(body.demand_id, reply);
    if (!demand) return;

    const arrivalTime = buildArrivalTime(demand, body.arrival_time);
    const performers = await query<{ id: string }>(
      `SELECT id FROM performers
       WHERE company_id = $1 AND status = 'active' AND id = ANY($2::uuid[])`,
      [companyId, body.performer_ids]
    );
    const ownedIds = new Set(performers.rows.map((row) => row.id));
    const missingIds = body.performer_ids.filter((id) => !ownedIds.has(id));

    if (missingIds.length > 0) {
      return reply.status(404).send(errorResponse(5004, '部分艺人不存在或不属于当前公司'));
    }

    const conflict = await query(
      `SELECT performer_id
       FROM assignments
       WHERE performer_id = ANY($1::uuid[])
         AND arrival_time::date = $2::timestamptz::date
         AND status NOT IN ('cancelled', 'rejected')`,
      [body.performer_ids, arrivalTime]
    );

    if (conflict.rows.length > 0) {
      return reply.status(409).send(errorResponse(6001, '所选艺人存在档期冲突'));
    }

    const assignments = await transaction(async (client) => {
      const created: Array<{ id: string; performer_id: string }> = [];

      for (const performerId of body.performer_ids) {
        const result = await client.query<{ id: string; performer_id: string }>(
          `INSERT INTO assignments (demand_id, performer_id, performance_role, arrival_time, status)
           VALUES ($1,$2,$3,$4,'pending')
           RETURNING id, performer_id`,
          [body.demand_id, performerId, body.performance_role, arrivalTime]
        );
        created.push(result.rows[0]);
      }

      await client.query(
        `INSERT INTO operation_logs (operator_id, module, action, target_type, target_id, detail)
         VALUES ($1,'supplier_dispatch','confirm','demand',$2,$3)`,
        [
          (request as AuthedRequest).user?.sub,
          body.demand_id,
          JSON.stringify({ performer_ids: body.performer_ids, arrival_time: arrivalTime }),
        ]
      );

      return created;
    });

    return reply.status(201).send(createdResponse({
      demand_id: body.demand_id,
      arrival_time: arrivalTime,
      assignments,
    }, '派单已确认，等待艺人确认'));
  });
}
