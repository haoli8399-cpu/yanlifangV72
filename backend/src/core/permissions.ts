// ============================================================
// 演立方 V7.2 · RBAC + ABAC + 数据隔离 三层权限
// 参考 Trae permissions.py → TypeScript
// ============================================================

export type V7Role = 'customer' | 'tenant_admin' | 'actor' | 'platform_admin';
export type ResourceType = 'user' | 'tenant' | 'actor' | 'demand' | 'tenant_engagement' | 'activity_project' | 'program_module' | 'service_offering' | 'plan_item' | 'quote' | 'credential' | 'payment' | 'evidence' | 'audit_log' | 'main_service_assignment' | 'main_service_eligibility' | 'capacity_declaration';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'publish' | 'activate' | 'complete' | 'cancel' | 'assign' | 'accept' | 'reject' | 'invite' | 'confirm';

// RBAC 矩阵: {角色: {资源: 允许操作}}
const RBAC: Record<V7Role, Partial<Record<ResourceType, Action[]>>> = {
  platform_admin: {
    user: ['create','read','update','delete'],
    tenant: ['create','read','update','delete','publish','activate'],
    actor: ['create','read','update','delete','publish'],
    demand: ['read','update','delete','activate','complete'],
    tenant_engagement: ['read','activate'],
    activity_project: ['read','update','complete'],
    program_module: ['read','update','publish','activate'],
    service_offering: ['read','update','publish'],
    plan_item: ['read','update','confirm'],
    quote: ['read'],
    credential: ['read'],
    payment: ['read','confirm'],
    evidence: ['create','read','update'],
    audit_log: ['read'],
  },
  tenant_admin: {
    main_service_assignment: ['read','accept','reject','activate'],
    main_service_eligibility: ['read'],
    capacity_declaration: ['create','read','update'],
    tenant: ['read','update'],
    actor: ['read'],
    demand: ['read','update','activate','complete'],
    tenant_engagement: ['read','accept','reject','activate'],
    activity_project: ['create','read','update','complete'],
    program_module: ['create','read','update','publish','activate'],
    service_offering: ['create','read','update','publish'],
    plan_item: ['create','read','update','confirm','complete'],
    quote: ['create','read','update'],
    credential: ['create','read','update','confirm'],
    payment: ['read','confirm'],
    evidence: ['create','read'],
  },
  actor: {
    actor: ['read','update'],
    program_module: ['read'],
    activity_project: ['read'],
    plan_item: ['read','update'],
  },
  customer: {
    main_service_assignment: ['create','read','assign'],
    main_service_eligibility: ['read'],
    capacity_declaration: ['read'],
    tenant: ['read'],
    actor: ['read'],
    demand: ['create','read','update','delete','publish'],
    tenant_engagement: ['read','assign'],
    activity_project: ['read'],
    quote: ['read','accept','reject'],
    payment: ['create','read'],
  },
};

// ABAC 规则
function abacCheck(_resourceType: string, action: Action, state: Record<string,unknown>): boolean {
  if (action === 'update' || action === 'delete') {
    const lifecycle = state.lifecycle || state.status;
    if (lifecycle === 'completed' || lifecycle === 'cancelled' || lifecycle === 'archived') return false;
  }
  if (action === 'delete' && state.publication === 'published') return false;
  return true;
}

// 数据隔离
export function checkIsolation(
  role: V7Role,
  userTenantId?: string,
  userActorId?: string,
  userId?: string,
  resourceTenantId?: string,
  resourceOwnerId?: string,
  resourceCustomerId?: string,
): boolean {
  if (role === 'platform_admin') return true;
  if (role === 'tenant_admin') return resourceTenantId !== undefined && userTenantId === resourceTenantId;
  if (role === 'actor') return resourceOwnerId !== undefined && userActorId === resourceOwnerId;
  if (role === 'customer') return resourceCustomerId !== undefined && userId === resourceCustomerId;
  return false;
}

// 统一检查
export function checkPermission(role: V7Role, resource: ResourceType, action: Action, state?: Record<string,unknown>): boolean {
  const allowed = RBAC[role]?.[resource] || [];
  if (!allowed.includes(action)) return false;
  if (state && !abacCheck(resource, action, state)) return false;
  return true;
}
