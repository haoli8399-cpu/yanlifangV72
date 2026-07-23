// ── V7.2 API 客户端 ──
// 通用请求包装，后端默认 localhost:3002，可通过环境变量 API_BASE 覆盖

const BASE_URL = typeof process !== "undefined" && process.env.API_BASE
  ? process.env.API_BASE
  : "http://localhost:3002";

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${method} ${path}: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data as T;
}

// ---- 类型定义 ----

export interface V2ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface MSACandidate {
  demand_id: string;
  tenant_id: string;
}

export interface MSADecision {
  decision: "selected" | "rejected" | "withdrawn" | "accepted" | "declined";
}

export interface MSAActivation {
  assignment_id: string;
  status: "active";
  project_id: string;
}

// ---- Demand + MSA ----

export async function createMSACandidate(demandId: string, tenantId: string) {
  return request<V2ApiResponse<{ id: string }>>("POST", `/v2/demands/${demandId}/main-service-assignments`, { tenant_id: tenantId });
}

export async function patchCustomerDecision(assignmentId: string, decision: MSADecision["decision"]) {
  return request<V2ApiResponse<{ status: string }>>("PATCH", `/v2/main-service-assignments/${assignmentId}/customer-decision`, { decision });
}

export async function patchTenantDecision(assignmentId: string, decision: MSADecision["decision"]) {
  return request<V2ApiResponse<{ status: string }>>("PATCH", `/v2/main-service-assignments/${assignmentId}/tenant-decision`, { decision });
}

export async function activateMSA(assignmentId: string) {
  return request<V2ApiResponse<MSAActivation>>("POST", `/v2/main-service-assignments/${assignmentId}/activate`);
}

// ---- TenantEngagement ----

export interface TenantEngagement {
  id: string;
  demand_id: string;
  tenant_id: string;
  engagement_type: "main_service" | "module_collaboration";
  lifecycle_status: string;
  response_deadline: string | null;
  responded_at: string | null;
  response_notes: string | null;
  created_at: string;
}

export async function createEngagement(demandId: string, tenantId: string, type: string = "main_service") {
  return request<V2ApiResponse<TenantEngagement>>("POST", `/v2/demands/${demandId}/engagements`, { tenant_id: tenantId, engagement_type: type });
}

export async function listEngagements(demandId: string) {
  return request<V2ApiResponse<TenantEngagement[]>>("GET", `/v2/demands/${demandId}/engagements`);
}

export async function respondEngagement(id: string, decision: "accepted" | "declined" | "request_supplement", notes?: string) {
  return request<V2ApiResponse<{ lifecycle_status: string }>>("PATCH", `/v2/engagements/${id}/respond`, { decision, notes });
}

export async function changeEngagementStatus(id: string, status: string) {
  return request<V2ApiResponse<{ lifecycle_status: string }>>("POST", `/v2/engagements/${id}/change-status`, { status });
}

// ---- RoutingDecision ----

export interface RoutingCandidate {
  tenant_id: string;
  reason: string;
  sort_order: number;
}

export async function createRoutingDecision(demandId: string, candidates: RoutingCandidate[], excludedTenants?: Array<{ tenant_id: string; reason: string }>, sourceDesc?: string) {
  return request<V2ApiResponse<{ routing_id: string; candidate_count: number }>>("POST", `/v2/demands/${demandId}/routing`, {
    candidates,
    excluded_tenants: excludedTenants,
    source_description: sourceDesc,
  });
}

export async function getRoutingDecision(demandId: string) {
  return request<V2ApiResponse<any>>("GET", `/v2/demands/${demandId}/routing`);
}

export async function selectTenant(demandId: string, tenantId: string, isReplacement: boolean = false) {
  return request<V2ApiResponse<{ selected_tenant_id: string; lifecycle_status: string }>>("POST", `/v2/demands/${demandId}/routing/select`, { tenant_id: tenantId, is_replacement: isReplacement });
}

export async function reassignRouting(demandId: string, reason: string, newCandidates: RoutingCandidate[]) {
  return request<V2ApiResponse<{ new_candidate_count: number; lifecycle_status: string }>>("POST", `/v2/demands/${demandId}/routing/reassign`, { reason, new_candidates: newCandidates });
}

export async function withdrawRouting(demandId: string) {
  return request<V2ApiResponse<{ lifecycle_status: string }>>("POST", `/v2/demands/${demandId}/routing/withdraw`);
}

// ---- ActivityProject ----

export interface ProjectSummary {
  id: string;
  display_code: string;
  title: string;
  lifecycle_status: string;
  main_tenant_id: string;
  demand_id: string;
  created_at: string;
}

export async function createProject(demandId: string, msaId: string, mainTenantId: string, title?: string) {
  return request<V2ApiResponse<ProjectSummary>>("POST", `/v2/projects`, { demand_id: demandId, msa_id: msaId, main_tenant_id: mainTenantId, title });
}

export async function getProject(projectId: string) {
  return request<V2ApiResponse<any>>("GET", `/v2/projects/${projectId}`);
}

export async function changeProjectStatus(projectId: string, status: string) {
  return request<V2ApiResponse<{ lifecycle_status: string }>>("POST", `/v2/projects/${projectId}/change-status`, { status });
}

// ---- PlanVersion ----

export interface PlanVersionSummary {
  id: string;
  project_id: string;
  version_number: number;
  title: string;
  status: string;
  created_at: string;
}

export async function createPlan(projectId: string, title?: string, goal?: string, offeringSnapshot?: Record<string, unknown>) {
  return request<V2ApiResponse<PlanVersionSummary>>("POST", `/v2/projects/${projectId}/plans`, { title, overall_goal: goal, offering_snapshot: offeringSnapshot });
}

export async function listPlans(projectId: string) {
  return request<V2ApiResponse<PlanVersionSummary[]>>("GET", `/v2/projects/${projectId}/plans`);
}

export async function getPlan(planId: string) {
  return request<V2ApiResponse<any>>("GET", `/v2/plans/${planId}`);
}

export async function submitPlanForReview(planId: string) {
  return request<V2ApiResponse<{ status: string }>>("POST", `/v2/plans/${planId}/submit-review`);
}

export async function reviewPlan(planId: string, decision: "approved" | "rejected") {
  return request<V2ApiResponse<{ status: string }>>("POST", `/v2/plans/${planId}/review`, { decision });
}

// ---- PlanItem ----

export interface PlanItemInput {
  source_snapshot: { root_type: string; root_id: string; version_id?: string };
  responsible_party_id: string;
  responsible_party_type: string;
  name?: string;
  target_duration_minutes?: number;
  sequence_order?: number;
}

export async function createPlanItem(planId: string, item: PlanItemInput) {
  return request<V2ApiResponse<any>>("POST", `/v2/plans/${planId}/items`, item);
}

export async function listPlanItems(planId: string) {
  return request<V2ApiResponse<any[]>>("GET", `/v2/plans/${planId}/items`);
}

export async function updatePlanItemStatus(itemId: string, axis: string, status: string) {
  return request<V2ApiResponse<any>>("PATCH", `/v2/plan-items/${itemId}/status`, { axis, status });
}

// ---- ChangeRequest ----

export async function createChangeRequest(projectId: string, title: string, reason: string, affectedObjects?: Array<{ object_type: string; object_id: string }>, impactSummary?: string) {
  return request<V2ApiResponse<{ id: string; status: string }>>("POST", `/v2/projects/${projectId}/change-requests`, {
    title, reason, affected_objects: affectedObjects, impact_summary: impactSummary,
  });
}

export async function listChangeRequests(projectId: string) {
  return request<V2ApiResponse<any[]>>("GET", `/v2/projects/${projectId}/change-requests`);
}

export async function submitChangeRequest(crId: string) {
  return request<V2ApiResponse<{ status: string }>>("POST", `/v2/change-requests/${crId}/submit`);
}

export async function approveChangeRequest(crId: string, decision: "approved" | "rejected") {
  return request<V2ApiResponse<{ status: string }>>("POST", `/v2/change-requests/${crId}/approve`, { decision });
}

// ---- Quote ----

export interface QuoteInput {
  total_amount: string;
  items?: Array<{ name: string; description?: string; quantity?: number; unit_price: string; total: string; plan_item_id?: string }>;
  includes?: string[];
  excludes?: string[];
  valid_until?: string;
  tax_amount?: string;
  payment_terms?: Array<{ node_name: string; percentage?: number; amount?: string; trigger?: string; due_days?: number }>;
}

export async function acceptQuote(quoteId: string) {
  return request<V2ApiResponse<{ status: string; project_status: string }>>("POST", `/v2/quotes/${quoteId}/accept`, { accept: true });
}

export async function rejectQuote(quoteId: string, reason?: string) {
  return request<V2ApiResponse<{ status: string }>>("POST", `/v2/quotes/${quoteId}/reject`, { reason });
}

export async function createQuote(projectId: string, input: QuoteInput) {
  return request<V2ApiResponse<any>>("POST", `/v2/projects/${projectId}/quotes`, input);
}

export async function listQuotes(projectId: string) {
  return request<V2ApiResponse<any[]>>("GET", `/v2/projects/${projectId}/quotes`);
}

export async function getQuote(quoteId: string) {
  return request<V2ApiResponse<any>>("GET", `/v2/quotes/${quoteId}`);
}

export async function submitQuoteForApproval(quoteId: string) {
  return request<V2ApiResponse<{ status: string }>>("POST", `/v2/quotes/${quoteId}/submit-approval`);
}

export async function approveQuote(quoteId: string, decision: "approved" | "rejected") {
  return request<V2ApiResponse<{ status: string }>>("POST", `/v2/quotes/${quoteId}/approve`, { decision });
}

export async function sendQuote(quoteId: string) {
  return request<V2ApiResponse<{ status: string }>>("POST", `/v2/quotes/${quoteId}/send`);
}

// ---- Legacy Commercial API (compatibility) ----

export async function confirmCredential(credentialId: string) {
  return request<V2ApiResponse<{ status: string }>>("POST", `/v2/credentials/${credentialId}/confirm`);
}

export async function declarePayment(paymentId: string) {
  return request<V2ApiResponse<{ status: string }>>("POST", `/v2/payments/${paymentId}/declare`);
}

// ---- Eligibility + Capacity ----

export interface EligibilityRecord {
  id: string; tenant_id: string; city: string; event_type: string;
  scale_max: number | null; status: string; evidence: Record<string, unknown>;
  assessed_by: string | null; assessed_at: string | null; expires_at: string | null;
}

export interface CapacityDeclaration {
  id: string; tenant_id: string; status: string; scope_notes: string | null;
  declared_by: string | null; effective_until: string;
}

export async function createEligibility(data: { tenant_id: string; city: string; event_type: string; scale_max?: number }) {
  return request<V2ApiResponse<EligibilityRecord>>("POST", "/v2/eligibility", data);
}

export async function listEligibility(tenantId: string) {
  return request<V2ApiResponse<EligibilityRecord[]>>("GET", `/v2/eligibility/tenant/${tenantId}`);
}

export async function assessEligibility(id: string, status: string) {
  return request<V2ApiResponse<{ status: string }>>("PATCH", `/v2/eligibility/${id}/assess`, { status });
}

export async function createCapacity(data: { tenant_id: string; status: string; effective_until: string; scope_notes?: string }) {
  return request<V2ApiResponse<CapacityDeclaration>>("POST", "/v2/capacity", data);
}

export async function getCapacity(tenantId: string) {
  return request<V2ApiResponse<CapacityDeclaration[]>>("GET", `/v2/capacity/tenant/${tenantId}`);
}

// ---- Attribution + ChargeableValue ----

export async function createAttribution(data: { demand_id: string; source_type: string; project_id?: string }) {
  return request<V2ApiResponse<any>>("POST", "/v2/attributions", data);
}

export async function listAttributions(demandId: string) {
  return request<V2ApiResponse<any[]>>("GET", `/v2/attributions/demand/${demandId}`);
}

export async function disputeAttribution(id: string, reason: string) {
  return request<V2ApiResponse<{ status: string }>>("POST", `/v2/attributions/${id}/dispute`, { reason });
}

export async function createChargeableValue(data: { project_id: string; attribution_id: string; allocated_amount: string; net_revenue_atom_id?: string }) {
  return request<V2ApiResponse<any>>("POST", "/v2/chargeable-values", data);
}

export async function listChargeableValues(projectId: string) {
  return request<V2ApiResponse<any[]>>("GET", `/v2/chargeable-values/project/${projectId}`);
}
