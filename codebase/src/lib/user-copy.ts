// ── 用户语言治理层 (Role-aware Copy Layer) ──
// PRD §6.3: 内部模型必须精确，用户语言必须简单。
// 不替换 Domain 名称，只控制用户可见的文案投影。

export type UserRole = "public" | "customer" | "tenant" | "actor" | "platform";

export type CopyContext = "navigation" | "status" | "action" | "detail" | "error" | "empty" | "help";

// ── Domain → 用户语言映射 ──
// 规则：同一 Domain 在不同角色下使用不同语言

export const domainCopy = {
  MainServiceAssignment: {
    customer: "主服务方",
    tenant: "主服务项目",
    actor: "活动项目",
    platform: "MainServiceAssignment / 主服务指派",
    public: "服务团队",
  },
  PlanItem: {
    customer: "节目",
    tenant: "方案模块",
    actor: "演出任务",
    platform: "PlanItem",
    public: "节目内容",
  },
  ServiceOffering: {
    customer: "服务产品",
    tenant: "服务产品",
    actor: "演出服务",
    platform: "ServiceOffering",
    public: "服务方案",
  },
  TenantEngagement: {
    customer: "服务沟通",
    tenant: "经营机会",
    actor: "合作邀约",
    platform: "TenantEngagement",
    public: "服务咨询",
  },
  EvidenceState: {
    customer: "确认状态",
    tenant: "证据状态",
    actor: "状态",
    platform: "EvidenceState",
    public: "信息状态",
  },
  CollaborationCredential: {
    customer: "合作凭证",
    tenant: "合作凭证",
    actor: "合作确认",
    platform: "CollaborationCredential",
    public: "合作确认",
  },
  FulfillmentCollaboration: {
    customer: "协作团队",
    tenant: "协作关系",
    actor: "协作任务",
    platform: "FulfillmentCollaboration",
    public: "协作团队",
  },
} as const;

// ── 状态文案治理 ──
// 避免直接暴露 internal state key

export const statusCopy: Record<string, { label: string; description: string }> = {
  pending_dual_confirmation: {
    label: "等待双方确认",
    description: "客户已选择，等待你确认承担整体服务责任",
  },
  pending_customer: {
    label: "等待客户决定",
    description: "已提交方案，等待客户做出选择",
  },
  proposed: {
    label: "新机会",
    description: "一个新的服务机会，请查看详情并决定是否参与",
  },
  active: {
    label: "进行中",
    description: "项目已启动，按计划推进中",
  },
  expired: {
    label: "已过期",
    description: "超过有效期，如需继续请联系平台",
  },
};

// ── 角色感知的获取函数 ──

export function getDomainLabel(domain: keyof typeof domainCopy, role: UserRole): string {
  const map = domainCopy[domain];
  return (map as Record<string, string>)[role] || (map as Record<string, string>).public || domain;
}

export function getStatusDisplay(state: string): { label: string; description: string } {
  return statusCopy[state] || { label: state, description: "" };
}
