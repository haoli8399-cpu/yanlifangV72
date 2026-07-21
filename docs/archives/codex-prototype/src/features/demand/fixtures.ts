import type {
  ApiResponse,
  BriefVersionView,
  DemandBriefCustomerView,
  PublicActorView,
  ResourceEnvelope,
  TenantBriefWorkspaceView,
} from "./types";

// ============================================================
// 演示 Fixture —— 全部脱敏，禁止真实姓名/手机号/价格/合同
// ============================================================

const NOW = "2026-07-17T09:20:00+08:00";
const UPDATED = "2026-07-15T18:00:00+08:00";

// 公开演员 —— 页面 A
export const publicActorLinZhou: PublicActorView = {
  id: "actor-linzhou",
  public_version_id: "actor-linzhou@v3",
  display_name: "林舟",
  avatar_url: null,
  short_bio:
    "以观察式生活喜剧见长的脱口秀演员，擅长在职场与城市生活里发现共鸣。以下为公开授权信息，具体合作条件待核验。",
  style_tags: ["观察式喜剧", "职场共鸣", "克制表达", "适合企业专场"],
  suitable_event_types: [
    { code: "corp_annual", label: "企业年会 / 团建" },
    { code: "brand_activation", label: "品牌互动之夜" },
    { code: "internal_kickoff", label: "内部启动会暖场" },
  ],
  service_cities: [
    { code: "shanghai", label: "上海" },
    { code: "hangzhou", label: "杭州" },
    { code: "suzhou", label: "苏州" },
  ],
  representative_programs: [
    {
      program_version_id: "prog-office-60@v2",
      name: "企业喜剧专场·60分钟",
      summary: "面向公司团队的中场专场，覆盖职场共鸣与轻度互动，可按场景微调。",
    },
    {
      program_version_id: "prog-warmup-20@v1",
      name: "开场暖场·20分钟",
      summary: "适合活动开场或颁奖前场，节奏轻快、不涉具体品牌调侃。",
    },
  ],
  evidence: {
    status: "verified",
    source_label: "演员公开档案（艺人本人授权）",
    last_verified_at: UPDATED,
  },
  non_commitment_notice: "公开资料，具体档期、价格与合作条件以主服务方核验为准。",
};

// ==== Fixture 1: actor_intent_draft ====
const fx_actor_intent_draft: DemandBriefCustomerView = {
  id: "demand-fx1",
  display_code: "DM-2026-0001",
  demand_mode: "explicit_fast_execution",
  lifecycle_status: "draft",
  source_intent: {
    resource_type: "actor_profile",
    resource_id: publicActorLinZhou.id,
    resource_version_id: publicActorLinZhou.public_version_id,
    display_name: "林舟",
    kind_label: "演员",
    cover_image_url: null,
    preference_strength: "preferred",
    preference_label: "优先考虑",
    public_updated_at: UPDATED,
    evidence_status: "verified",
    non_commitment_notice: "演员偏好已保留，档期与合作条件待核验。",
  },
  facts: {
    event_name: null,
    event_type: null,
    event_goals: [],
    event_date: {
      kind: "exact",
      start_date: "2026-12-18",
      end_date: "2026-12-18",
      flexibility: "plus_minus_3_days",
    },
    city: { code: "shanghai", label: "上海" },
    venue_status: "unknown",
    audience_size: { min: 180, max: 220 },
    budget_range: {
      currency: "CNY",
      min: "50000",
      max: "80000",
      tax_basis: "unknown",
    },
    service_need: null,
    content_constraints: [],
  },
  current_brief: null,
  matching_consent: null,
  latest_receipts: [],
  created_at: NOW,
  updated_at: NOW,
};

// helpers to shorten brief item building
const src = (kind: "customer_input" | "public_content" | "ai_inference", ref: string | null) => ({
  kind,
  reference_id: ref,
  captured_at: NOW,
});

// ==== Fixture 2: program_intent_ready ====
const brief_v1_ready: BriefVersionView = {
  id: "brief-fx2-v1",
  sequence: 1,
  confirmation_status: "ready_for_confirmation",
  is_current: true,
  items: [
    {
      key: "event_type",
      label: "活动类型",
      section: "event",
      value: "corp_annual",
      display_value: "企业年会",
      classification: "fact",
      source: src("customer_input", "form-1"),
      evidence_status: "declared",
      affects: ["feasibility", "responsibility"],
      requires_customer_confirmation: true,
    },
    {
      key: "event_goals",
      label: "活动目标",
      section: "event",
      value: ["团队激励", "回顾年度"],
      display_value: "团队激励、回顾年度",
      classification: "fact",
      source: src("customer_input", "form-1"),
      evidence_status: "declared",
      affects: ["responsibility"],
      requires_customer_confirmation: false,
    },
    {
      key: "event_date",
      label: "活动日期",
      section: "event",
      value: "2026-12-18",
      display_value: "2026-12-18（可 ±3 天）",
      classification: "fact",
      source: src("customer_input", "form-1"),
      evidence_status: "declared",
      affects: ["feasibility", "price"],
      requires_customer_confirmation: true,
    },
    {
      key: "city",
      label: "城市",
      section: "event",
      value: "shanghai",
      display_value: "上海",
      classification: "fact",
      source: src("customer_input", "form-1"),
      evidence_status: "declared",
      affects: ["feasibility"],
      requires_customer_confirmation: false,
    },
    {
      key: "venue_status",
      label: "场地状态",
      section: "event",
      value: "tentative",
      display_value: "已初步锁定场地",
      classification: "fact",
      source: src("customer_input", "form-1"),
      evidence_status: "declared",
      affects: ["feasibility"],
      requires_customer_confirmation: false,
    },
    {
      key: "audience_size",
      label: "观众规模",
      section: "audience",
      value: { min: 180, max: 220 },
      display_value: "180 – 220 人",
      classification: "fact",
      source: src("customer_input", "form-1"),
      evidence_status: "declared",
      affects: ["feasibility", "price"],
      requires_customer_confirmation: false,
    },
    {
      key: "budget_range",
      label: "预算范围",
      section: "budget",
      value: "50000-80000",
      display_value: "¥50,000 – ¥80,000（含税待确认）",
      classification: "fact",
      source: src("customer_input", "form-1"),
      evidence_status: "declared",
      affects: ["price", "rights"],
      requires_customer_confirmation: true,
    },
    {
      key: "service_need",
      label: "所需服务",
      section: "service",
      value: "program",
      display_value: "企业喜剧专场·60 分钟",
      classification: "fact",
      source: src("public_content", "prog-office-60@v2"),
      evidence_status: "supported",
      affects: ["feasibility", "price"],
      requires_customer_confirmation: false,
    },
    {
      key: "content_constraints",
      label: "内容禁忌",
      section: "constraints",
      value: [],
      display_value: "暂无",
      classification: "inference",
      source: src("ai_inference", "ai-1"),
      evidence_status: "pending",
      affects: ["rights", "responsibility"],
      requires_customer_confirmation: true,
      inference_basis: "根据活动类型与目标推断；请客户确认是否有具体禁忌。",
    },
    {
      key: "source_intent",
      label: "来源意向",
      section: "source_intent",
      value: "actor:林舟",
      display_value: "优先考虑：林舟（公开演员档案）",
      classification: "fact",
      source: src("public_content", "actor-linzhou@v3"),
      evidence_status: "supported",
      affects: ["feasibility"],
      requires_customer_confirmation: false,
    },
  ],
  blocker_keys: [],
  ai_assisted: true,
  created_by: { actor_type: "ai", display_name: "演立方 AI 整理" },
  created_at: NOW,
  updated_at: NOW,
  confirmed_by: null,
  confirmed_at: null,
  superseded_by_brief_version_id: null,
};

const fx_program_intent_ready: DemandBriefCustomerView = {
  id: "demand-fx2",
  display_code: "DM-2026-0002",
  demand_mode: "explicit_fast_execution",
  lifecycle_status: "pending_consent",
  source_intent: {
    resource_type: "program_module_version",
    resource_id: "prog-office-60",
    resource_version_id: "prog-office-60@v2",
    display_name: "企业喜剧专场·60分钟",
    kind_label: "节目",
    cover_image_url: null,
    preference_strength: "preferred",
    preference_label: "优先考虑",
    public_updated_at: UPDATED,
    evidence_status: "verified",
    non_commitment_notice: "节目为公开标准模块，具体演出方、档期与价格待核验。",
  },
  facts: {
    event_name: "澄光科技 2026 冬季答谢会",
    event_type: { code: "corp_annual", label: "企业年会" },
    event_goals: [
      { code: "morale", label: "团队激励" },
      { code: "year_review", label: "回顾年度" },
    ],
    event_date: {
      kind: "exact",
      start_date: "2026-12-18",
      end_date: "2026-12-18",
      flexibility: "plus_minus_3_days",
    },
    city: { code: "shanghai", label: "上海" },
    venue_status: "tentative",
    audience_size: { min: 180, max: 220 },
    budget_range: {
      currency: "CNY",
      min: "50000",
      max: "80000",
      tax_basis: "unknown",
    },
    service_need: { summary: "企业喜剧专场·60 分钟", expected_duration_minutes: 60 },
    content_constraints: [],
  },
  current_brief: brief_v1_ready,
  matching_consent: null,
  latest_receipts: [],
  created_at: NOW,
  updated_at: NOW,
};

// ==== Fixture 3: brief_confirmed_pending_consent ====
const brief_confirmed_v2: BriefVersionView = {
  ...brief_v1_ready,
  id: "brief-fx3-v2",
  sequence: 2,
  confirmation_status: "confirmed",
  confirmed_by: { user_id: "u-chen", display_name: "陈女士" },
  confirmed_at: "2026-07-17T10:12:00+08:00",
};

const fx_brief_confirmed_pending_consent: DemandBriefCustomerView = {
  ...fx_program_intent_ready,
  id: "demand-fx3",
  display_code: "DM-2026-0003",
  current_brief: brief_confirmed_v2,
  lifecycle_status: "pending_consent",
  latest_receipts: [
    {
      receipt_type: "brief_confirmation",
      receipt_id: "rcpt-fx3-1",
      object_id: brief_confirmed_v2.id,
      object_version: 2,
      actor_display_name: "陈女士",
      occurred_at: "2026-07-17T10:12:00+08:00",
      effect_summary: "已确认需求版本 v2 为当前需求。",
      next_step: "查看共享范围",
    },
  ],
};

// ==== Fixture 4: brief_matchable ====
const fx_brief_matchable: DemandBriefCustomerView = {
  ...fx_brief_confirmed_pending_consent,
  id: "demand-fx4",
  display_code: "DM-2026-0004",
  lifecycle_status: "matchable",
  matching_consent: {
    grant_id: "grant-fx4",
    status: "active",
    authorized_object: { type: "brief_version", id: brief_confirmed_v2.id, sequence: 2 },
    scope: "matching_minimum_fields",
    scope_version: "matching_minimum_fields_v1",
    purpose: "find_qualified_main_service_provider",
    recipient_policy_code: "qualified_main_service_candidates_v1",
    recipient_policy_version: 1,
    recipient_rule_display: "符合平台资质的候选主服务方（不含平台运营方特权）",
    shared_fields: [
      { key: "event_type", label: "活动类型" },
      { key: "event_goals", label: "活动目标" },
      { key: "event_date", label: "活动日期" },
      { key: "city", label: "城市" },
      { key: "venue_status", label: "场地状态" },
      { key: "audience_size", label: "观众规模" },
      { key: "budget_range", label: "预算范围" },
      { key: "service_need", label: "所需服务" },
      { key: "content_constraints", label: "内容禁忌" },
      { key: "source_intent", label: "来源意向（不含个人身份）" },
    ],
    granted_by: { user_id: "u-chen", display_name: "陈女士" },
    granted_at: "2026-07-17T10:20:00+08:00",
    expires_at: "2026-08-16T10:20:00+08:00",
    revoked_at: null,
  },
  latest_receipts: [
    ...fx_brief_confirmed_pending_consent.latest_receipts,
    {
      receipt_type: "matching_consent",
      receipt_id: "rcpt-fx4-2",
      object_id: "grant-fx4",
      object_version: 1,
      actor_display_name: "陈女士",
      occurred_at: "2026-07-17T10:20:00+08:00",
      effect_summary: "已授权将 Brief v2 的最小字段共享给候选主服务方，用于寻找合适服务方。",
      next_step: "等待进入服务方核验",
    },
  ],
};

// ==== Fixture 5: brief_conflict ====
const brief_conflict: BriefVersionView = {
  ...brief_v1_ready,
  id: "brief-fx5-v1",
  items: brief_v1_ready.items.map((it) =>
    it.key === "budget_range"
      ? {
          ...it,
          classification: "conflict",
          evidence_status: "conflicted",
          display_value: "存在冲突：¥50,000–¥80,000 与 ¥100,000–¥120,000",
          conflict_sources: [
            { label: "表单填写", value: "¥50,000 – ¥80,000", kind: "customer_input" },
            { label: "上传说明文件", value: "¥100,000 – ¥120,000", kind: "customer_input" },
          ],
        }
      : it,
  ),
  blocker_keys: ["budget_range"],
};

const fx_brief_conflict: DemandBriefCustomerView = {
  ...fx_program_intent_ready,
  id: "demand-fx5",
  display_code: "DM-2026-0005",
  current_brief: brief_conflict,
};

// ==== Fixture 6: ai_unavailable —— 复用 fx1 但标记 AI 不可用 ====
const fx_ai_unavailable: DemandBriefCustomerView = {
  ...fx_actor_intent_draft,
  id: "demand-fx6",
  display_code: "DM-2026-0006",
};

// ==== Fixture 7: brief_superseded ====
const brief_superseded_v1: BriefVersionView = {
  ...brief_v1_ready,
  id: "brief-fx7-v1",
  confirmation_status: "superseded",
  is_current: false,
  superseded_by_brief_version_id: "brief-fx7-v2",
};

const fx_brief_superseded: DemandBriefCustomerView = {
  ...fx_program_intent_ready,
  id: "demand-fx7",
  display_code: "DM-2026-0007",
  current_brief: brief_superseded_v1,
};

// ==== Fixture 8: tenant_authorized_workspace ====
const fx_tenant_authorized_workspace: TenantBriefWorkspaceView = {
  demand: {
    id: "demand-fx8",
    display_code: "DM-2026-0008",
    mode_label: "客户需求较明确",
    source_intent: fx_brief_matchable.source_intent,
  },
  shared_brief: brief_confirmed_v2,
  authorization: {
    grant_id: "grant-fx8",
    recipient_tenant_id: "tenant-houyang",
    scope_version: "tenant_brief_workspace_v1",
    scope_label: "Brief 工作台（客户授权投影）",
    shared_field_keys: [
      "event_type",
      "event_goals",
      "event_date",
      "city",
      "venue_status",
      "audience_size",
      "budget_range",
      "service_need",
      "content_constraints",
      "source_intent",
    ],
    granted_at: "2026-07-17T10:20:00+08:00",
    expires_at: "2026-08-16T10:20:00+08:00",
  },
  tenant_suggestions: [
    {
      id: "sug-1",
      content: "考虑到 60 分钟专场 + 180–220 人，建议在核验时确认场地音响与后台条件。",
      created_by_display_name: "策划 · 小周",
      created_at: NOW,
    },
  ],
  clarification_requests: [],
};

// ==== Fixture 9: tenant_not_related —— 前端渲染 null ====
// 由页面处理 404/no-relation 状态。

// ==== Fixture 10: demand_withdrawn ====
const fx_demand_withdrawn: DemandBriefCustomerView = {
  ...fx_brief_confirmed_pending_consent,
  id: "demand-fx10",
  display_code: "DM-2026-0010",
  lifecycle_status: "withdrawn",
  matching_consent: null,
  latest_receipts: [
    {
      receipt_type: "matching_consent_revocation",
      receipt_id: "rcpt-fx10",
      object_id: "grant-fx10",
      object_version: 1,
      actor_display_name: "陈女士",
      occurred_at: "2026-07-17T11:00:00+08:00",
      effect_summary: "已撤回匹配授权，本次需求已同步进入 withdrawn。",
      next_step: "如仍需办活动，可重新发起需求。",
    },
  ],
};

// ==== Fixture 11: demand_authorization_expired ====
const fx_demand_authorization_expired: DemandBriefCustomerView = {
  ...fx_brief_matchable,
  id: "demand-fx11",
  display_code: "DM-2026-0011",
  lifecycle_status: "expired",
  matching_consent: fx_brief_matchable.matching_consent
    ? {
        ...fx_brief_matchable.matching_consent,
        status: "expired",
      }
    : null,
};

// ============================================================
// 客户端 fixture 索引
// ============================================================

export type FixtureKey =
  | "actor_intent_draft"
  | "program_intent_ready"
  | "brief_confirmed_pending_consent"
  | "brief_matchable"
  | "brief_conflict"
  | "ai_unavailable"
  | "brief_superseded"
  | "tenant_authorized_workspace"
  | "tenant_not_related"
  | "demand_withdrawn"
  | "demand_authorization_expired";

export const FIXTURE_LABELS: Record<FixtureKey, string> = {
  actor_intent_draft: "1. 演员意向草稿",
  program_intent_ready: "2. 节目意向 · 待确认",
  brief_confirmed_pending_consent: "3. Brief 已确认 · 待授权",
  brief_matchable: "4. 已授权 · matchable",
  brief_conflict: "5. 存在冲突（阻断）",
  ai_unavailable: "6. AI 暂不可用",
  brief_superseded: "7. 旧版本 · 只读",
  tenant_authorized_workspace: "8. Tenant 工作台",
  tenant_not_related: "9. Tenant 无对象关系",
  demand_withdrawn: "10. Demand 已撤回",
  demand_authorization_expired: "11. 授权已过期",
};

// 服务端 available_actions 映射（brief 表格 6.）
function actionsFor(view: DemandBriefCustomerView): string[] {
  const brief = view.current_brief;
  const st = view.lifecycle_status;
  if (st === "withdrawn" || st === "expired") return [];
  if (brief?.confirmation_status === "superseded") return [];
  if (!brief && st === "draft") {
    return ["demand.edit_own", "brief.generate_own", "demand.withdraw_own"];
  }
  if (brief?.confirmation_status === "draft") {
    return [
      "demand.edit_own",
      "brief.edit_own",
      "brief.prepare_confirmation_own",
      "brief.generate_own",
      "demand.withdraw_own",
    ];
  }
  if (brief?.confirmation_status === "ready_for_confirmation" && st === "pending_consent") {
    return ["brief.confirm_own", "brief.revise_own", "demand.withdraw_own"];
  }
  if (brief?.confirmation_status === "confirmed" && st === "pending_consent") {
    return ["brief.revise_own", "demand.matching_consent.manage_own", "demand.withdraw_own"];
  }
  if (st === "matchable" && view.matching_consent?.status === "active") {
    return ["demand.matching_consent.manage_own", "demand.withdraw_own"];
  }
  return [];
}

function displayStatusFor(view: DemandBriefCustomerView): string {
  const b = view.current_brief;
  if (view.lifecycle_status === "withdrawn") return "已撤回";
  if (view.lifecycle_status === "expired") return "授权已过期";
  if (b?.confirmation_status === "superseded") return "旧版本 · 已被替代";
  if (view.lifecycle_status === "draft") return "补充必要信息";
  if (b?.confirmation_status === "ready_for_confirmation") return "请确认当前需求版本";
  if (b?.confirmation_status === "confirmed" && view.lifecycle_status === "pending_consent")
    return "已确认需求 · 请决定是否授权匹配";
  if (view.lifecycle_status === "matchable") return "已授权 · 等待进入服务方核验";
  return "进行中";
}

function envelope<T>(resource: T, actions: string[], display: string): ResourceEnvelope<T> {
  return {
    resource,
    meta: {
      request_id: `req-${Math.random().toString(36).slice(2, 10)}`,
      resource_version: 1,
      display_status: display,
      available_actions: actions,
    },
  };
}

function ok<T>(env: ResourceEnvelope<T>): ApiResponse<ResourceEnvelope<T>> {
  return { code: 0, data: env, message: "OK", error: null };
}

const customerFixtureMap: Partial<Record<FixtureKey, DemandBriefCustomerView>> = {
  actor_intent_draft: fx_actor_intent_draft,
  program_intent_ready: fx_program_intent_ready,
  brief_confirmed_pending_consent: fx_brief_confirmed_pending_consent,
  brief_matchable: fx_brief_matchable,
  brief_conflict: fx_brief_conflict,
  ai_unavailable: fx_ai_unavailable,
  brief_superseded: fx_brief_superseded,
  demand_withdrawn: fx_demand_withdrawn,
  demand_authorization_expired: fx_demand_authorization_expired,
};

export function getCustomerFixture(
  key: FixtureKey,
): ApiResponse<ResourceEnvelope<DemandBriefCustomerView>> | null {
  const v = customerFixtureMap[key];
  if (!v) return null;
  return ok(envelope(v, actionsFor(v), displayStatusFor(v)));
}

export function getTenantFixture(
  key: FixtureKey,
): ApiResponse<ResourceEnvelope<TenantBriefWorkspaceView> | null> {
  if (key === "tenant_authorized_workspace") {
    return ok(
      envelope(
        fx_tenant_authorized_workspace,
        ["tenant.demand.read_authorized", "tenant.demand.clarification.request"],
        "已授权工作台",
      ),
    );
  }
  // tenant_not_related & others: 404 / no relation
  return {
    code: 404,
    data: null,
    message: "资源不存在或您没有对象关系",
    error: { next_action: "contact_support" },
  };
}

export function getPublicActor(): ApiResponse<ResourceEnvelope<PublicActorView>> {
  return ok(envelope(publicActorLinZhou, ["demand.create"], "公开演员档案 · 已核验"));
}

// AI 不可用响应
export function aiUnavailableResponse(): ApiResponse<null> {
  return {
    code: 503,
    data: null,
    message: "AI 服务暂不可用",
    error: { retryable: true, next_action: "retry" },
  };
}
