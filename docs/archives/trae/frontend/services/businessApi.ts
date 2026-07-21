import api from './api'

// 业务API
export const businessApi = {
  // 需求管理
  activateDemand: (demandId: string) => api.post(`/business/demands/${demandId}/activate`),
  publishDemand: (demandId: string) => api.post(`/business/demands/${demandId}/publish`),

  // 主服务指派
  createAssignment: (demandId: string, tenantId: string) =>
    api.post('/business/assignments', { demand_id: demandId, tenant_id: tenantId }),
  acceptAssignment: (assignmentId: string) => api.post(`/business/assignments/${assignmentId}/accept`),
  activateAssignment: (assignmentId: string) => api.post(`/business/assignments/${assignmentId}/activate`),

  // 租户承接
  createEngagement: (demandId: string, tenantId: string, engagementType: string = 'main_service') =>
    api.post('/business/engagements', { demand_id: demandId, tenant_id: tenantId, engagement_type: engagementType }),
  acceptEngagement: (engagementId: string) => api.post(`/business/engagements/${engagementId}/accept`),
  activateEngagement: (engagementId: string) => api.post(`/business/engagements/${engagementId}/activate`),

  // 项目管理
  createProjectFromEngagement: (engagementId: string, title: string, description?: string) =>
    api.post('/business/projects/from-engagement', { engagement_id: engagementId, title, description }),
  activateProject: (projectId: string) => api.post(`/business/projects/${projectId}/activate`),
  completeProject: (projectId: string) => api.post(`/business/projects/${projectId}/complete`),

  // 协作管理
  inviteCollaborator: (projectId: string, tenantId: string) =>
    api.post('/business/collaborations/invite', { project_id: projectId, tenant_id: tenantId }),
  acceptCollaboration: (collaborationId: string) =>
    api.post(`/business/collaborations/${collaborationId}/accept`),

  // 报价管理
  createQuote: (projectId: string, totalAmount: number, items: any[], description?: string, aiGenerated: boolean = false) =>
    api.post('/business/quotes', { project_id: projectId, total_amount: totalAmount, items, description, ai_generated: aiGenerated }),
  sendQuote: (quoteId: string) => api.post(`/business/quotes/${quoteId}/send`),
  acceptQuote: (quoteId: string) => api.post(`/business/quotes/${quoteId}/accept`),

  // 可收费价值
  createChargeableValue: (projectId: string, amount: number, attributionType: string = 'platform_sourced') =>
    api.post('/business/chargeable-values', { project_id: projectId, amount, attribution_type: attributionType }),
  listChargeableValues: (projectId: string) => api.get(`/business/chargeable-values`, { params: { project_id: projectId } }),
  reconcile: (projectId: string) => api.post(`/business/projects/${projectId}/reconcile`),
  reconcilePayments: (projectId: string) => api.post(`/business/projects/${projectId}/reconcile`),

  // 协作列表
  listCollaborations: (projectId: string) => api.get(`/business/collaborations`, { params: { project_id: projectId } }),

  // AI助手
  analyzeDemandMaturity: (demandId: string) => api.get(`/business/ai/demands/${demandId}/analyze-maturity`),
  suggestSuppliers: (demandId: string) => api.get(`/business/ai/demands/${demandId}/suggest-suppliers`),
  draftQuote: (projectId: string) => api.get(`/business/ai/projects/${projectId}/draft-quote`),
  projectSummary: (projectId: string) => api.get(`/business/ai/projects/${projectId}/summary`),
}

export default businessApi
