// 演立方 · 内部术语 → 用户语言映射词典
// 单一事实源。UI 请使用 term(key, role) 或 termFor.tenant(key) 取用户可读文案，
// 禁止在页面直接写内部对象名（Demand / PlanItem / HandoffPackage 等）。

export type UserRole = "client" | "tenant" | "actor" | "admin";

type Entry = {
  /** 内部对象名 / PRD 术语 */
  key: string;
  /** 允许直接展示给用户吗？false = 只能出现在开发注释/数据结构中 */
  publicSafe: boolean;
  /** 三套用户视角的用词 */
  client: string;
  tenant: string;
  actor: string;
  /** 平台运营端使用；缺省时回落到 tenant 用语 */
  admin?: string;
  /** 一句话解释——用于 tooltip / 帮助文案 */
  hint?: string;
};

export const GLOSSARY: Record<string, Entry> = {
  Demand: {
    key: "Demand",
    publicSafe: false,
    client: "活动需求",
    tenant: "客户需求",
    actor: "活动需求",
    hint: "你想办的这场活动、目标、预算、时间和必须条件的合集。",
  },
  Tenant: {
    key: "Tenant",
    publicSafe: false,
    client: "服务方",
    tenant: "我们（服务方）",
    actor: "服务方",
    admin: "服务方（Tenant）",
    hint: "承接你活动的公司或团队。",
  },
  TenantEngagement: {
    key: "TenantEngagement",
    publicSafe: false,
    client: "服务方跟进",
    tenant: "商机 / 客户跟进",
    actor: "服务方跟进",
    hint: "服务方开始正式跟进你需求的过程。",
  },
  ActivityProject: {
    key: "ActivityProject",
    publicSafe: false,
    client: "我的活动",
    tenant: "服务项目",
    actor: "参与的活动",
    hint: "从需求到执行完成的一整场活动。",
  },
  DiscoverySession: {
    key: "DiscoverySession",
    publicSafe: false,
    client: "AI 陪你想清楚",
    tenant: "客户需求诊断",
    actor: "活动了解",
    hint: "由 AI 帮你把模糊想法整理成清晰活动画像的一次对话。",
  },
  ProgramModule: {
    key: "ProgramModule",
    publicSafe: false,
    client: "节目",
    tenant: "节目",
    actor: "我的节目",
    hint: "一段可以独立上台的表演。",
  },
  ServiceOffering: {
    key: "ServiceOffering",
    publicSafe: false,
    client: "服务内容",
    tenant: "服务产品",
    actor: "服务包",
    hint: "服务方对外可以提供的一个成型服务组合。",
  },
  PlanVersion: {
    key: "PlanVersion",
    publicSafe: false,
    client: "活动方案",
    tenant: "客户方案",
    actor: "活动方案",
    hint: "针对这场活动的一份完整方案（可能有多稿）。",
  },
  PlanItem: {
    key: "PlanItem",
    publicSafe: false,
    client: "方案内容",
    tenant: "执行模块",
    actor: "我的演出任务",
    hint: "方案中的一项——比如一个节目、一次主持、一段互动。",
  },
  QuoteVersion: {
    key: "QuoteVersion",
    publicSafe: false,
    client: "正式报价",
    tenant: "客户报价",
    actor: "合作报价",
    hint: "带明细的正式报价单，可以直接发给客户方决策。",
  },
  MainServiceAssignment: {
    key: "MainServiceAssignment",
    publicSafe: false,
    client: "主服务方确认",
    tenant: "主服务责任确认",
    actor: "主服务方",
    hint: "这场活动的总负责服务方，只有一个。",
  },
  FulfillmentCollaboration: {
    key: "FulfillmentCollaboration",
    publicSafe: false,
    client: "协作团队",
    tenant: "履约协作",
    actor: "合作邀请",
    hint: "主服务方拉进来共同交付这场活动的其他团队/演员。",
  },
  CollaborationQuoteVersion: {
    key: "CollaborationQuoteVersion",
    publicSafe: false,
    client: "协作报价",
    tenant: "协作方报价",
    actor: "我的报价",
    hint: "协作方或演员报给主服务方的价格。",
  },
  CollaborationPayable: {
    key: "CollaborationPayable",
    publicSafe: false,
    client: "待结算",
    tenant: "应付协作款",
    actor: "我的应收",
    hint: "活动结束后应结算给协作方/演员的金额。",
  },
  AuthorizationGrant: {
    key: "AuthorizationGrant",
    publicSafe: false,
    client: "授权范围",
    tenant: "授权范围",
    actor: "授权范围",
    admin: "授权配置（ShareGrant）",
    hint: "谁可以看到哪些信息、可以做哪些动作。",
  },
  Evidence: {
    key: "Evidence",
    publicSafe: false,
    client: "来源",
    tenant: "依据",
    actor: "依据",
    admin: "证据（Evidence）",
    hint: "这条信息来自哪里、什么时候、由谁产生。",
  },
  Commitment: {
    key: "Commitment",
    publicSafe: false,
    client: "承诺",
    tenant: "对客承诺",
    actor: "我的承诺",
    hint: "对客户或合作方做出的、有依据的正式承诺。",
  },
  Outcome: {
    key: "Outcome",
    publicSafe: false,
    client: "活动成果",
    tenant: "履约成果",
    actor: "演出记录",
    hint: "活动结束后的可复盘结果与素材。",
  },
  OutcomeSummary: {
    key: "OutcomeSummary",
    publicSafe: false,
    client: "活动总结",
    tenant: "结项总结",
    actor: "演出总结",
    hint: "活动结束后一键生成的、可对外/复盘的总结。",
  },
  AttributionRecord: {
    key: "AttributionRecord",
    publicSafe: false,
    client: "归属确认",
    tenant: "客户/演员归属",
    actor: "归属",
    admin: "归属记录（Attribution）",
    hint: "这条客户/合作是谁引入平台的。",
  },
  HandoffPackage: {
    key: "HandoffPackage",
    publicSafe: false,
    client: "交接包",
    tenant: "现场交接包",
    actor: "开演资料",
    hint: "开演前一次性打包的资料：流程、联系人、动线、注意事项。",
  },
  AIErrorIncident: {
    key: "AIErrorIncident",
    publicSafe: false,
    client: "系统提示有问题",
    tenant: "AI 异常事件",
    actor: "系统提示",
    admin: "AI 差错工单（Incident）",
    hint: "AI 判断可能出错、需要人工确认的一次事件。",
  },
  readiness_level: {
    key: "readiness_level",
    publicSafe: false,
    client: "准备度",
    tenant: "成熟度",
    actor: "准备度",
    admin: "成熟度（readiness）",
    hint: "这份资料是草稿、可对内、还是可对客展示。",
  },
  matchable: {
    key: "matchable",
    publicSafe: false,
    client: "可推荐",
    tenant: "可上架推荐",
    actor: "可被邀请",
    hint: "资料完整度达标，允许出现在推荐结果里。",
  },
  quotable: {
    key: "quotable",
    publicSafe: false,
    client: "可正式报价",
    tenant: "可正式报价",
    actor: "可正式接活",
    hint: "价格与档期已确认，可以进入正式报价环节。",
  },
  publishable: {
    key: "publishable",
    publicSafe: false,
    client: "可对客展示",
    tenant: "可对客展示",
    actor: "可对外展示",
    hint: "内容与授权都到位，可以对外分享。",
  },
};

/** 取一个术语在指定角色下的用户可读文案；未登记则原样返回。 */
export function term(key: string, role: UserRole = "client"): string {
  const entry = GLOSSARY[key];
  if (!entry) return key;
  if (role === "admin") return entry.admin ?? entry.tenant;
  return entry[role];
}

/** 便捷调用：termFor.client("PlanVersion") */
export const termFor = {
  client: (k: string) => term(k, "client"),
  tenant: (k: string) => term(k, "tenant"),
  actor: (k: string) => term(k, "actor"),
  admin: (k: string) => term(k, "admin"),
};

/** 一行说明——用于 tooltip。 */
export function termHint(key: string): string | undefined {
  return GLOSSARY[key]?.hint;
}
