// ── V7.2 API 客户端 ──
// 后端地址：默认 localhost:3002，可通过环境变量覆盖
const BASE_URL = typeof process !== "undefined" && process.env.API_BASE
  ? process.env.API_BASE
  : "http://localhost:3002";

// ── 通用请求包装 ──

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

// ── MSA API ──

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

export async function createMSACandidate(demandId: string, tenantId: string) {
  return request<{ id: string }>("POST", `/v2/demands/${demandId}/main-service-assignments`, {
    tenant_id: tenantId,
  });
}

export async function patchCustomerDecision(
  assignmentId: string,
  decision: MSADecision["decision"],
) {
  return request<{ status: string }>("PATCH", `/v2/assignments/${assignmentId}/customer-decision`, {
    decision,
  });
}

export async function patchTenantDecision(
  assignmentId: string,
  decision: MSADecision["decision"],
) {
  return request<{ status: string }>("PATCH", `/v2/assignments/${assignmentId}/tenant-decision`, {
    decision,
  });
}

export async function activateMSA(assignmentId: string) {
  return request<MSAActivation>("POST", `/v2/assignments/${assignmentId}/activate`);
}

// ── Quote API ──

export async function acceptQuote(quoteId: string) {
  return request<{ status: string }>("POST", `/v2/quotes/${quoteId}/accept`);
}

// ── Commercial API ──

export async function confirmCredential(credentialId: string) {
  return request<{ status: string }>("POST", `/v2/credentials/${credentialId}/confirm`);
}

export async function declarePayment(paymentId: string) {
  return request<{ status: string }>("POST", `/v2/payments/${paymentId}/declare`);
}
