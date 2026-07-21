// Types for MVP-SLICE1-DEMAND-BRIEF (演立方 V7.2)
// 当前已冻结原型所需 View 类型；真实 Request、认证、幂等和错误响应在 API 接入阶段确认。
// 禁止扩展未定义业务字段。

export type ApiResponse<T> = {
  code: number;
  data: T | null;
  message: string;
  error?: ApiErrorDetails | null;
};

export type ApiErrorDetails = {
  field_errors?: Array<{
    field: string;
    code: "REQUIRED" | "INVALID_FORMAT" | "OUT_OF_RANGE" | "CONFLICTING_SOURCE";
    message: string;
  }>;
  conflict?: {
    kind: "resource_version" | "state_transition" | "idempotency_key_reuse";
    current_version: number | null;
    current_resource_location: string | null;
  };
  trace_id?: string;
  retryable?: boolean;
  next_action?:
    | "refresh_resource"
    | "query_operation"
    | "retry"
    | "manual_continue"
    | "contact_support";
};

export type ResourceEnvelope<T> = {
  resource: T;
  meta: {
    request_id: string;
    resource_version: number;
    display_status: string;
    available_actions: string[];
    operation?: {
      idempotency_key: string;
      status: "processing" | "completed" | "failed";
      replayed: boolean;
    };
  };
};

export type DemandLifecycleStatus =
  | "draft"
  | "pending_consent"
  | "matchable"
  | "routing"
  | "routed"
  | "withdrawn"
  | "expired";

export type DemandFacts = {
  event_name: string | null;
  event_type: { code: string; label: string } | null;
  event_goals: Array<{ code: string; label: string }>;
  event_date: {
    kind: "exact" | "range";
    start_date: string;
    end_date: string;
    flexibility: "fixed" | "plus_minus_3_days" | "within_month" | "negotiable";
  } | null;
  city: { code: string; label: string } | null;
  venue_status: "unknown" | "searching" | "tentative" | "confirmed_by_customer";
  audience_size: { min: number; max: number } | null;
  budget_range: {
    currency: "CNY";
    min: string | null;
    max: string | null;
    tax_basis: "tax_included" | "tax_excluded" | "unknown";
  } | null;
  service_need: { summary: string; expected_duration_minutes: number | null } | null;
  content_constraints: string[];
};

export type SourceIntentView = {
  resource_type: "actor_profile" | "program_module_version";
  resource_id: string;
  resource_version_id: string;
  display_name: string;
  kind_label: "演员" | "节目";
  cover_image_url: string | null;
  preference_strength: "reference" | "preferred" | "only_consider";
  preference_label: "作为参考" | "优先考虑" | "仅考虑";
  public_updated_at: string;
  evidence_status: "supported" | "verified" | "pending" | "expired";
  non_commitment_notice: string;
};

export type PublicEvidenceSummary = {
  status: "supported" | "verified";
  source_label: string;
  last_verified_at: string;
};

export type PublicActorView = {
  id: string;
  public_version_id: string;
  display_name: string;
  avatar_url: string | null;
  short_bio: string;
  style_tags: string[];
  suitable_event_types: Array<{ code: string; label: string }>;
  service_cities: Array<{ code: string; label: string }>;
  representative_programs: Array<{
    program_version_id: string;
    name: string;
    summary: string;
  }>;
  evidence: PublicEvidenceSummary;
  non_commitment_notice: string;
};

export type BriefItem = {
  key: string;
  label: string;
  section: "event" | "audience" | "budget" | "service" | "constraints" | "source_intent";
  value: unknown;
  display_value: string | null;
  classification: "fact" | "inference" | "gap" | "conflict";
  source: {
    kind: "customer_input" | "public_content" | "ai_inference";
    reference_id: string | null;
    captured_at: string;
  };
  evidence_status: "declared" | "supported" | "verified" | "pending" | "conflicted" | "expired";
  affects: Array<"feasibility" | "price" | "rights" | "responsibility">;
  requires_customer_confirmation: boolean;
  // Extended optional display metadata (allowed as it's presentation-only, not new business fields)
  conflict_sources?: Array<{ label: string; value: string; kind: BriefItem["source"]["kind"] }>;
  inference_basis?: string;
  gap_impact?: string;
};

export type BriefVersionView = {
  id: string;
  sequence: number;
  confirmation_status: "draft" | "ready_for_confirmation" | "confirmed" | "superseded";
  is_current: boolean;
  items: BriefItem[];
  blocker_keys: string[];
  ai_assisted: boolean;
  created_by: { actor_type: "customer" | "ai"; display_name: string };
  created_at: string;
  updated_at: string;
  confirmed_by: { user_id: string; display_name: string } | null;
  confirmed_at: string | null;
  superseded_by_brief_version_id: string | null;
};

export type MatchingSharedFieldKey =
  | "event_type"
  | "event_goals"
  | "event_date"
  | "city"
  | "venue_status"
  | "audience_size"
  | "budget_range"
  | "service_need"
  | "content_constraints"
  | "source_intent";

export type MatchingConsentView = {
  grant_id: string;
  status: "active" | "revoked" | "expired";
  authorized_object: { type: "brief_version"; id: string; sequence: number };
  scope: "matching_minimum_fields";
  scope_version: "matching_minimum_fields_v1";
  purpose: "find_qualified_main_service_provider";
  recipient_policy_code: "qualified_main_service_candidates_v1";
  recipient_policy_version: 1;
  recipient_rule_display: string;
  shared_fields: Array<{ key: MatchingSharedFieldKey; label: string }>;
  granted_by: { user_id: string; display_name: string };
  granted_at: string;
  expires_at: string;
  revoked_at: string | null;
} | null;

export type ConfirmationReceiptView = {
  receipt_type: "brief_confirmation" | "matching_consent" | "matching_consent_revocation";
  receipt_id: string;
  object_id: string;
  object_version: number;
  actor_display_name: string;
  occurred_at: string;
  effect_summary: string;
  next_step: string;
};

export type DemandBriefCustomerView = {
  id: string;
  display_code: string;
  demand_mode: "explicit_fast_execution";
  lifecycle_status: DemandLifecycleStatus;
  source_intent: SourceIntentView;
  facts: DemandFacts;
  current_brief: BriefVersionView | null;
  matching_consent: MatchingConsentView;
  latest_receipts: ConfirmationReceiptView[];
  created_at: string;
  updated_at: string;
};

export type TenantBriefWorkspaceView = {
  demand: {
    id: string;
    display_code: string;
    mode_label: string;
    source_intent: SourceIntentView;
  };
  shared_brief: BriefVersionView;
  authorization: {
    grant_id: string;
    recipient_tenant_id: string;
    scope_version: "tenant_brief_workspace_v1";
    scope_label: string;
    shared_field_keys: MatchingSharedFieldKey[];
    granted_at: string;
    expires_at: string;
  };
  tenant_suggestions: Array<{
    id: string;
    content: string;
    created_by_display_name: string;
    created_at: string;
  }>;
  clarification_requests: Array<{
    id: string;
    brief_item_key: string;
    reason: string;
    status: "requested" | "answered" | "cancelled";
    requested_at: string;
  }>;
};

export type BusinessAction =
  | "demand.create"
  | "demand.read_own"
  | "demand.edit_own"
  | "demand.withdraw_own"
  | "brief.generate_own"
  | "brief.edit_own"
  | "brief.prepare_confirmation_own"
  | "brief.revise_own"
  | "brief.confirm_own"
  | "demand.matching_consent.manage_own"
  | "tenant.demand.read_authorized"
  | "tenant.demand.clarification.request";
