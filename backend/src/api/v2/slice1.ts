// @ts-nocheck — Fastify internal types
// ============================================================
// 演立方 V7.2 · SLICE1 API — 公开演员 + Demand CRUD
// 对齐 SLICE1-SPEC-001 §6
// ============================================================
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { query } from '../../utils/db.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { authMiddleware } from '../../middleware/auth.js';
import { setETag, incrementVersion, getVersion } from '../../core/concurrency.js';
import { audit } from '../../core/audit.js';

// ---- Zod schemas ----
const demandCreateSchema = z.object({
  demand_mode: z.enum(['explicit_fast_execution']).default('explicit_fast_execution'),
  facts: z.object({
    event_type: z.object({ code: z.string() }).optional(),
    event_date: z.object({
      kind: z.enum(['exact','range']),
      start_date: z.string(), end_date: z.string(),
      flexibility: z.enum(['fixed','plus_minus_3_days','within_month','negotiable']),
    }).optional(),
    city: z.object({ code: z.string() }).optional(),
    venue_status: z.enum(['unknown','searching','tentative','confirmed_by_customer']).optional(),
    audience_size: z.object({ min: z.number(), max: z.number() }).optional(),
    budget_range: z.object({ currency: z.string(), min: z.string().nullable(), max: z.string().nullable(), tax_basis: z.enum(['tax_included','tax_excluded','unknown']) }).optional(),
    service_need: z.object({ summary: z.string(), expected_duration_minutes: z.number().nullable() }).optional(),
    content_constraints: z.array(z.string()).optional(),
  }),
  source_intent: z.object({
    resource_type: z.enum(['actor_profile','program_module_version']).optional(),
    resource_id: z.string().optional(),
    resource_version_id: z.string().optional(),
    preference_strength: z.enum(['reference','preferred','only_consider']).optional(),
  }).optional(),
});

const demandUpdateSchema = z.object({
  facts: z.record(z.unknown()).optional(),
});

export async function slice1Routes(app: FastifyInstance) {

  // ---- GET /v2/public/actors/:actor_id ----
  app.get('/v2/public/actors/:actor_id', async (req: FastifyRequest, reply: FastifyReply) => {
    const { actor_id } = req.params as { actor_id: string };
    const result = await query(
      `SELECT id, name, avatar_url, style_tags, introduction AS short_bio, city, status
       FROM performers WHERE id = $1 AND status = 'active'`,
      [actor_id]
    );
    if (result.rows.length === 0) {
      return reply.status(404).send(errorResponse(4040, '演员不存在'));
    }
    const row = result.rows[0];
    const view = {
      id: row.id,
      public_version_id: `${row.id}@v1`,
      display_name: row.name,
      avatar_url: row.avatar_url,
      short_bio: row.short_bio || '',
      style_tags: row.style_tags || [],
      suitable_event_types: [],
      service_cities: [{ code: row.city, label: row.city }],
      representative_programs: [],
      evidence: { status: 'declared', source_label: '演员档案', last_verified_at: new Date().toISOString() },
      non_commitment_notice: '公开资料，具体档期、价格与合作条件以主服务方核验为准。',
    };
    const version = getVersion(actor_id);
    setETag(reply, version);
    return reply.send(successResponse(view));
  });

  // ---- POST /v2/demands ----
  app.post('/v2/demands', { preHandler: [authMiddleware] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const body = demandCreateSchema.parse(req.body);
    const userId = (req as Record<string,unknown>).user?.sub as string;
    if (!userId) return reply.status(401).send(errorResponse(4010, '未认证'));

    const displayCode = `DM-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9999)).padStart(4,'0')}`;
    const result = await query(
      `INSERT INTO v72_demands (customer_id, display_code, demand_mode, facts, source_intent)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, displayCode, body.demand_mode, JSON.stringify(body.facts || {}), body.source_intent ? JSON.stringify(body.source_intent) : null]
    );
    const demand = result.rows[0];
    const version = incrementVersion(demand.id);
    setETag(reply, version);

    await audit({
      actor_id: userId, actor_type: 'customer', action: 'demand_created',
      resource_type: 'demand', resource_id: demand.id, resource_version: version,
      result: 'success',
    });

    return reply.status(201).send(successResponse({
      id: demand.id, display_code: demand.display_code, demand_mode: demand.demand_mode,
      lifecycle_status: demand.lifecycle, facts: demand.facts, source_intent: demand.source_intent,
      current_brief: null, matching_consent: null, latest_receipts: [],
      created_at: demand.created_at, updated_at: demand.updated_at,
    }));
  });

  // ---- GET /v2/demands/:demand_id/brief ----
  app.get('/v2/demands/:demand_id/brief', { preHandler: [authMiddleware] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { demand_id } = req.params as { demand_id: string };
    const userId = (req as Record<string,unknown>).user?.sub as string;
    const result = await query(`SELECT * FROM v72_demands WHERE id = $1`, [demand_id]);
    if (result.rows.length === 0) return reply.status(404).send(errorResponse(4040, '需求不存在'));
    const d = result.rows[0];
    if (d.customer_id !== userId) return reply.status(404).send(errorResponse(4040, '需求不存在'));

    const briefResult = await query(
      `SELECT * FROM brief_versions WHERE demand_id = $1 AND is_current = TRUE ORDER BY sequence DESC LIMIT 1`,
      [demand_id]
    );
    const brief = briefResult.rows[0] || null;

    const grantResult = await query(
      `SELECT * FROM authorization_grants WHERE object_type = 'demand' AND object_id = $1 AND status = 'active' ORDER BY granted_at DESC LIMIT 1`,
      [demand_id]
    );

    const version = getVersion(demand_id);
    setETag(reply, version);
    return reply.send(successResponse({
      id: d.id, display_code: d.display_code, demand_mode: d.demand_mode,
      lifecycle_status: d.lifecycle, facts: d.facts, source_intent: d.source_intent,
      current_brief: brief ? {
        id: brief.id, sequence: brief.sequence,
        confirmation_status: brief.confirmation_status,
        is_current: brief.is_current, items: brief.items || [],
        blocker_keys: brief.blocker_keys || [],
        ai_assisted: brief.created_by_type === 'ai',
        created_by: { actor_type: brief.created_by_type || 'customer', display_name: '客户' },
        created_at: brief.created_at, updated_at: brief.created_at,
        confirmed_by: brief.confirmed_by_id ? { user_id: brief.confirmed_by_id, display_name: '' } : null,
        confirmed_at: brief.confirmed_at,
        superseded_by_brief_version_id: brief.superseded_by_id,
      } : null,
      matching_consent: grantResult.rows[0] ? {
        grant_id: grantResult.rows[0].id,
        status: grantResult.rows[0].status,
        authorized_object: { type: 'brief_version', id: '', sequence: 0 },
        scope: grantResult.rows[0].scope,
        scope_version: grantResult.rows[0].scope_version,
        purpose: grantResult.rows[0].purpose || '',
        recipient_policy_code: grantResult.rows[0].recipient_policy || '',
        recipient_policy_version: grantResult.rows[0].recipient_policy_version || 1,
        recipient_rule_display: '符合平台资质的候选主服务方',
        shared_fields: [],
        granted_by: { user_id: grantResult.rows[0].grantor_id, display_name: '' },
        granted_at: grantResult.rows[0].granted_at,
        expires_at: grantResult.rows[0].expires_at,
        revoked_at: grantResult.rows[0].revoked_at,
      } : null,
      latest_receipts: [],
      created_at: d.created_at, updated_at: d.updated_at,
    }));
  });


  app.patch('/v2/demands/:demand_id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const userId = req.user?.sub;
    const r = await query('SELECT * FROM v72_demands WHERE id = $1', [demand_id]);
    if (r.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'Not found'));
    const d = r.rows[0];
    if (d.customer_id !== userId) return reply.status(404).send(errorResponse(4040, 'Not found'));
    if (d.lifecycle !== 'draft') return reply.status(409).send(errorResponse(4092, 'Only draft editable'));
    const body = req.body;
    if (body.facts) await query('UPDATE v72_demands SET facts = $1, updated_at = now() WHERE id = $2', [JSON.stringify(body.facts), demand_id]);
    const v = incrementVersion(demand_id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'customer', action: 'demand_updated', resource_type: 'demand', resource_id: demand_id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ id: demand_id, lifecycle_status: d.lifecycle }));
  });

  app.post('/v2/demands/:demand_id/withdraw', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const userId = req.user?.sub;
    const r = await query('SELECT * FROM v72_demands WHERE id = $1', [demand_id]);
    if (r.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'Not found'));
    if (r.rows[0].customer_id !== userId) return reply.status(404).send(errorResponse(4040, 'Not found'));
    await query('UPDATE v72_demands SET lifecycle = $1, updated_at = now() WHERE id = $2', ['withdrawn', demand_id]);
    await query("UPDATE authorization_grants SET status = 'revoked', revoked_at = now() WHERE object_id = $1 AND status = 'active'", [demand_id]);
    const v = incrementVersion(demand_id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'customer', action: 'demand_withdrawn', resource_type: 'demand', resource_id: demand_id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ id: demand_id, lifecycle_status: 'withdrawn' }));
  });

  app.post('/v2/demands/:demand_id/brief-versions/generate', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const userId = req.user?.sub;
    const r = await query('SELECT * FROM v72_demands WHERE id = $1', [demand_id]);
    if (r.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'Not found'));
    if (r.rows[0].customer_id !== userId) return reply.status(404).send(errorResponse(4040, 'Not found'));
    const sq = await query('SELECT COALESCE(MAX(sequence),0)+1 AS seq FROM brief_versions WHERE demand_id = $1', [demand_id]);
    const seq = Number(sq.rows[0].seq);
    const items = [
      { key: 'event_type', label: '活动类型', section: 'event', value: '', display_value: '待确认', classification: 'gap', source: { kind: 'customer_input' }, evidence_status: 'pending', affects: ['feasibility'], requires_customer_confirmation: true },
    ];
    await query('INSERT INTO brief_versions (demand_id, sequence, items, confirmation_status, is_current, created_by_type, created_by_id) VALUES ($1,$2,$3,$4,TRUE,$5,$6)', [demand_id, seq, JSON.stringify(items), 'draft', 'ai', userId]);
    const v = incrementVersion(demand_id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'customer', action: 'brief_generated', resource_type: 'brief_version', resource_id: demand_id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ demand_id, sequence: seq, status: 'draft' }));
  });

  app.post('/v2/demands/:demand_id/brief-versions/:brief_version_id/confirm', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id, brief_version_id } = req.params;
    const userId = req.user?.sub;
    const r = await query('SELECT * FROM brief_versions WHERE id = $1 AND demand_id = $2', [brief_version_id, demand_id]);
    if (r.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'Not found'));
    await query('UPDATE brief_versions SET confirmation_status = $1, confirmed_by_id = $2, confirmed_at = now() WHERE id = $3', ['confirmed', userId, brief_version_id]);
    await query('UPDATE v72_demands SET lifecycle = $1 WHERE id = $2', ['pending_consent', demand_id]);
    const v = incrementVersion(demand_id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'customer', action: 'brief_confirmed', resource_type: 'brief_version', resource_id: brief_version_id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ demand_id, brief_version_id, confirmation_status: 'confirmed', lifecycle_status: 'pending_consent' }));
  });

  app.post('/v2/demands/:demand_id/matching-consents', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const userId = req.user?.sub;
    const r = await query('SELECT * FROM v72_demands WHERE id = $1', [demand_id]);
    if (r.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'Not found'));
    if (r.rows[0].customer_id !== userId) return reply.status(404).send(errorResponse(4040, 'Not found'));
    if (r.rows[0].lifecycle !== 'pending_consent') return reply.status(409).send(errorResponse(4092, 'Confirm Brief first'));
    const exp = new Date(Date.now() + 7*86400000).toISOString();
    const g = await query('INSERT INTO authorization_grants (grantor_id, object_type, object_id, scope, scope_version, purpose, status, expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [userId, 'demand', demand_id, 'matching_minimum_fields', 'v1', 'find_main_service', 'active', exp]);
    await query('UPDATE v72_demands SET lifecycle = $1 WHERE id = $2', ['matchable', demand_id]);
    const v = incrementVersion(demand_id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'customer', action: 'matching_consent_granted', resource_type: 'authorization_grant', resource_id: g.rows[0].id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ grant_id: g.rows[0].id, status: 'active', expires_at: exp, lifecycle_status: 'matchable' }));
  });

  app.post('/v2/demands/:demand_id/matching-consents/:grant_id/revoke', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id, grant_id } = req.params;
    const userId = req.user?.sub;
    await query("UPDATE authorization_grants SET status = 'revoked', revoked_at = now() WHERE id = $1 AND grantor_id = $2 AND status = 'active'", [grant_id, userId]);
    await query('UPDATE v72_demands SET lifecycle = $1 WHERE id = $2', ['withdrawn', demand_id]);
    const v = incrementVersion(demand_id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'customer', action: 'matching_consent_revoked', resource_type: 'authorization_grant', resource_id: grant_id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ grant_id, status: 'revoked', lifecycle_status: 'withdrawn' }));
  });

  app.get('/v2/tenant/demands/:demand_id/brief', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const tid = req.user?.tenant_id;
    if (!tid) return reply.status(404).send(errorResponse(4040, 'No tenant'));
    const a = await query("SELECT * FROM tenant_brief_access_grants WHERE tenant_id = $1 AND demand_id = $2 AND status = 'active'", [tid, demand_id]);
    if (a.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'Not authorized'));
    const d = await query('SELECT * FROM v72_demands WHERE id = $1', [demand_id]);
    const b = await query('SELECT * FROM brief_versions WHERE demand_id = $1 AND is_current = TRUE ORDER BY sequence DESC LIMIT 1', [demand_id]);
    const v = getVersion(demand_id); setETag(reply, v);
    await audit({ actor_id: tid, actor_type: 'tenant_admin', action: 'tenant_brief_read', resource_type: 'demand', resource_id: demand_id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ demand: { id: d.rows[0].id, display_code: d.rows[0].display_code }, shared_brief: b.rows[0] || null, authorization: { grant_id: a.rows[0].id }, tenant_suggestions: [], clarification_requests: [] }));
  });


  app.patch('/v2/demands/:demand_id/brief-versions/:brief_version_id', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id, brief_version_id } = req.params;
    const userId = req.user?.sub;
    const r = await query('SELECT * FROM brief_versions WHERE id = $1 AND demand_id = $2', [brief_version_id, demand_id]);
    if (r.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'Not found'));
    if (r.rows[0].confirmation_status !== 'draft') return reply.status(409).send(errorResponse(4092, 'Only draft editable'));
    const body = req.body;
    if (body.changes) {
      const items = r.rows[0].items || [];
      for (const ch of body.changes) {
        const idx = items.findIndex((i) => i.key === ch.key);
        if (idx >= 0) items[idx] = { ...items[idx], ...ch, source: { kind: 'customer_input', reference_id: null, captured_at: new Date().toISOString() } };
      }
      await query('UPDATE brief_versions SET items = $1 WHERE id = $2', [JSON.stringify(items), brief_version_id]);
    }
    const v = incrementVersion(demand_id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'customer', action: 'brief_revised', resource_type: 'brief_version', resource_id: brief_version_id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ brief_version_id, status: 'draft' }));
  });

  app.post('/v2/demands/:demand_id/brief-versions/:brief_version_id/revise', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id, brief_version_id } = req.params;
    const userId = req.user?.sub;
    const r = await query('SELECT * FROM brief_versions WHERE id = $1', [brief_version_id]);
    if (r.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'Not found'));
    const b = r.rows[0];
    if (b.confirmation_status === 'ready_for_confirmation') {
      await query('UPDATE brief_versions SET confirmation_status = $1 WHERE id = $2', ['draft', brief_version_id]);
      await query('UPDATE v72_demands SET lifecycle = $1 WHERE id = $2', ['draft', demand_id]);
    } else if (b.confirmation_status === 'confirmed') {
      await query('UPDATE brief_versions SET is_current = FALSE WHERE id = $1', [brief_version_id]);
      const sq = await query('SELECT COALESCE(MAX(sequence),0)+1 AS seq FROM brief_versions WHERE demand_id = $1', [demand_id]);
      await query('INSERT INTO brief_versions (demand_id, sequence, items, confirmation_status, is_current, created_by_type, created_by_id, superseded_by_id) VALUES ($1,$2,$3,$4,TRUE,$5,$6,$7)', [demand_id, Number(sq.rows[0].seq), JSON.stringify(b.items || []), 'draft', 'customer', userId, brief_version_id]);
    } else {
      return reply.status(409).send(errorResponse(4092, 'Cannot revise superseded version'));
    }
    const v = incrementVersion(demand_id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'customer', action: 'brief_revised', resource_type: 'brief_version', resource_id: brief_version_id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ demand_id, status: 'draft' }));
  });

  app.post('/v2/demands/:demand_id/brief-versions/:brief_version_id/prepare-confirmation', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id, brief_version_id } = req.params;
    const userId = req.user?.sub;
    const r = await query('SELECT * FROM brief_versions WHERE id = $1', [brief_version_id]);
    if (r.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'Not found'));
    const items = r.rows[0].items || [];
    const blockers = [];
    for (const item of items) {
      if (item.classification === 'conflict') blockers.push(item.key);
      if (item.classification === 'gap' && item.requires_customer_confirmation) blockers.push(item.key);
    }
    if (blockers.length > 0) {
      await query('UPDATE brief_versions SET blocker_keys = $1 WHERE id = $2', [JSON.stringify(blockers), brief_version_id]);
      return reply.status(422).send(errorResponse(4221, 'Blockers found'));
    }
    await query('UPDATE brief_versions SET confirmation_status = $1, blocker_keys = $2 WHERE id = $3', ['ready_for_confirmation', JSON.stringify([]), brief_version_id]);
    await query('UPDATE v72_demands SET lifecycle = $1 WHERE id = $2', ['pending_consent', demand_id]);
    const v = incrementVersion(demand_id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'customer', action: 'brief_prepared', resource_type: 'brief_version', resource_id: brief_version_id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ demand_id, status: 'ready_for_confirmation', blocker_keys: [] }));
  });

  app.post('/v2/tenant/demands/:demand_id/clarification-requests', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const tid = req.user?.tenant_id;
    const userId = req.user?.sub;
    if (!tid) return reply.status(404).send(errorResponse(4040, 'No tenant'));
    const body = req.body;
    await query('INSERT INTO clarification_requests (tenant_id, demand_id, brief_item_key, reason, status) VALUES ($1,$2,$3,$4,$5)', [tid, demand_id, body.brief_item_key, body.reason, 'requested']);
    const v = incrementVersion(demand_id); setETag(reply, v);
    await audit({ actor_id: userId, actor_type: 'tenant_admin', action: 'clarification_requested', resource_type: 'clarification_request', resource_id: demand_id, resource_version: v, result: 'success' });
    return reply.status(201).send(successResponse({ status: 'requested' }));
  });

  app.get('/v2/idempotent-operations/:key', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { key } = req.params;
    const opResult = await query('SELECT * FROM idempotent_operations WHERE key = $1', [key]);
    if (opResult.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'Operation not found'));
    const op = opResult.rows[0];
    return reply.send(successResponse({
      key: op.key, status: op.status, method: op.method,
      resource_location: op.route, http_status: op.http_status,
      error_code: op.error_code, started_at: op.started_at, completed_at: op.completed_at,
    }));
  });


  // ---- MSA: POST candidate ----
  app.post('/v2/demands/:demand_id/main-service-assignments', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { demand_id } = req.params;
    const body = req.body;
    const existing = await query("SELECT * FROM main_service_assignments WHERE demand_id = $1 AND lifecycle_status = 'active'", [demand_id]);
    if (existing.rows.length > 0) return reply.status(409).send(errorResponse(4092, 'Active assignment exists'));

    const r = await query(
      'INSERT INTO main_service_assignments (demand_id, tenant_id, customer_decision, tenant_decision, lifecycle_status) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [demand_id, body.tenant_id, 'pending', 'pending', 'proposed']
    );
    const v = incrementVersion(demand_id); setETag(reply, v);
    await audit({ actor_id: req.user?.sub, actor_type: 'customer', action: 'msa_proposed', resource_type: 'main_service_assignment', resource_id: r.rows[0].id, resource_version: v, result: 'success' });
    return reply.status(201).send(successResponse(r.rows[0]));
  });

  // ---- MSA: PATCH customer_decision ----
  app.patch('/v2/main-service-assignments/:id/customer-decision', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params; const { decision } = req.body;
    if (!['selected','rejected','withdrawn'].includes(decision)) return reply.status(400).send(errorResponse(4000, 'Invalid decision'));
    await query('UPDATE main_service_assignments SET customer_decision = $1, updated_at = now() WHERE id = $2', [decision, id]);
    const v = incrementVersion(id); setETag(reply, v);
    await audit({ actor_id: req.user?.sub, actor_type: 'customer', action: 'msa_customer_' + decision, resource_type: 'main_service_assignment', resource_id: id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ id, customer_decision: decision }));
  });

  // ---- MSA: PATCH tenant_decision ----
  app.patch('/v2/main-service-assignments/:id/tenant-decision', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params; const { decision } = req.body;
    if (!['accepted','declined'].includes(decision)) return reply.status(400).send(errorResponse(4000, 'Invalid decision'));
    await query('UPDATE main_service_assignments SET tenant_decision = $1, updated_at = now() WHERE id = $2', [decision, id]);
    const v = incrementVersion(id); setETag(reply, v);
    await audit({ actor_id: req.user?.sub, actor_type: 'tenant_admin', action: 'msa_tenant_' + decision, resource_type: 'main_service_assignment', resource_id: id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ id, tenant_decision: decision }));
  });

  // ---- MSA: POST activate (system gate) ----
  app.post('/v2/main-service-assignments/:id/activate', { preHandler: [authMiddleware] }, async (req, reply) => {
    const { id } = req.params;
    const r = await query('SELECT * FROM main_service_assignments WHERE id = $1', [id]);
    if (r.rows.length === 0) return reply.status(404).send(errorResponse(4040, 'Not found'));
    const a = r.rows[0];
    if (a.customer_decision !== 'selected') return reply.status(409).send(errorResponse(4092, 'Customer not selected'));
    if (a.tenant_decision !== 'accepted') return reply.status(409).send(errorResponse(4092, 'Tenant not accepted'));
    if (a.lifecycle_status !== 'proposed' && a.lifecycle_status !== 'pending_dual_confirmation') return reply.status(409).send(errorResponse(4092, 'Invalid lifecycle for activation'));

    await query("UPDATE main_service_assignments SET lifecycle_status = 'active', activated_at = now(), updated_at = now() WHERE id = $1", [id]);
    const v = incrementVersion(id); setETag(reply, v);
    await audit({ actor_id: req.user?.sub, actor_type: 'system', action: 'msa_activated', resource_type: 'main_service_assignment', resource_id: id, resource_version: v, result: 'success' });
    return reply.send(successResponse({ id, lifecycle_status: 'active' }));
  });

  // ---- Health check for slice1 ----
  app.get('/v2/slice1/health', async (_req, reply) => {
    const ok = await (await import('../../utils/db.js')).healthCheck();
    reply.send({ status: ok ? 'ok' : 'degraded', module: 'slice1' });
  });
}
