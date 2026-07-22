// ============================================================
// 演立方 V7.2 · 审计日志服务
// 参考 Trae audit.py + 旧 operation_logs 表
// PRD §15.8: 所有核心动作必须可追溯
// ============================================================

export type AuditAction =
  | 'demand_created' | 'demand_updated' | 'demand_withdrawn'
  | 'brief_generated' | 'brief_revised' | 'brief_prepared' | 'brief_confirmed'
  | 'matching_consent_granted' | 'matching_consent_revoked' | 'matching_consent_expired'
  | 'tenant_brief_read' | 'clarification_requested'
  | 'state_transition' | 'operation' | 'change' | 'permission' | 'security';

export interface AuditEvent {
  actor_id: string;
  actor_type: 'customer' | 'tenant_admin' | 'actor' | 'platform_admin' | 'system';
  tenant_id?: string;
  request_id: string;
  idempotency_key?: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  resource_version?: number;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  authorization?: { grant_id: string; scope: string };
  result: 'success' | 'failure';
  ip_address?: string;
  created_at: string;
}

// Abstract logger — concrete DB implementation when PostgreSQL is ready
export interface AuditLogger {
  log(event: AuditEvent): Promise<void>;
}

export class ConsoleAuditLogger implements AuditLogger {
  async log(event: AuditEvent): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[AUDIT] ${event.action} | ${event.resource_type}:${event.resource_id} | ${event.actor_type}:${event.actor_id} | ${event.result}`);
  }
}

let logger: AuditLogger = new ConsoleAuditLogger();

export function setAuditLogger(l: AuditLogger): void { logger = l; }

export async function audit(event: Omit<AuditEvent, 'created_at'>): Promise<void> {
  await logger.log({ ...event, created_at: new Date().toISOString() });
}
