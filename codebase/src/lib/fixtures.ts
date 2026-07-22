// DEMO DATA — 非真实业务事实。仅用于演立方 V7.2 前端演示。

export type EvidenceState =
  | "declared"      // 主体声明
  | "supported"     // 来源支持（新增 PRD §15.1）
  | "verified"      // 已核验
  | "pending"       // 待确认
  | "conflict"      // 存在冲突（新增 PRD §15.1）
  | "expired"       // 已过期
  | "not_public";    // 不可公开

// 前端兼容旧枚举值「ai」（逐步迁移到 supported/declared）
export type EvidenceStateCompat = EvidenceState | "ai"; // 已过期

export type Actor = {
  id: string;
  name: string;
  title: string;
  city: string;
  tags: string[];
  bio: string;
  verified: boolean;
  scheduleState: "open" | "tight" | "busy";
  signatureProgram: string;
  representativeCases: string[];
  fitFor: string[];
  avatarSeed: string;
  gallery?: string[];
};

// 客户端投影：只包含客户有权看到的信息
export type ProjectClientView = Pick<Project,
  'id' | 'title' | 'date' | 'city' | 'scale' | 'stage' |
  'headline' | 'nextAction' | 'waitingFor' | 'brief' | 'snapshot' | 'plans'
> & {
  team: { main?: Pick<Party, 'name' | 'scope'>; actors: Pick<Party, 'name' | 'role' | 'confirmed'>[] };
  quote?: { total: string; validUntil: string; status: string };
  paymentSchedule?: Array<{
    label: string;
    amount: string;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
  }>;
  credential?: {
    type: 'platform_e_contract' | 'external_contract' | 'framework_order' | 'simplified_confirmation';
    status: 'draft' | 'pending' | 'effective' | 'expired';
    title: string;
    signUrl?: string;
  };
  timeline: TimelineEntry[];
};
// Tenant 端投影：含内部报价、协作方、付款详情
export type ProjectTenantView = Project;

// 演员端投影：仅本人相关 PlanItem
export type ProjectActorView = Pick<Project, 'id' | 'title' | 'date' | 'city' | 'stage'> & { 
  myItems: Array<{ title: string; owner: string; state: EvidenceState }>; 
};

export type Program = {
  id: string;
  title: string;
  type: string;
  duration: string;
  audienceFit: string[];
  actors: string[]; // actor ids
  summary: string;
  status: EvidenceState;
};

export type CaseStudy = {
  id: string;
  title: string;
  industry: string;
  scale: string;
  city: string;
  budgetBand: string;
  outcome: string;
  highlights: string[];
  gallery?: string[];
};

export type Party = {
  id: string;
  name: string;
  role: "main" | "collaborator" | "actor";
  scope: string;
  contact?: string;
  confirmed: boolean;
};

export type PlanOption = {
  id: string;
  label: string; // A / B / C
  title: string;
  positioning: string;
  budgetBand: string;
  strengths: string[];
  tradeoffs: string[];
  unfit: string[];
  pending: string[];
  storyboard: {
    phase: string;
    duration: string;
    title: string;
    detail: string;
  }[];
  modules: { title: string; owner: string; state: EvidenceState }[];
};

export type ProjectStage =
  | "exploring" // 探索
  | "planning" // 方案
  | "quoting" // 报价
  | "waiting" // 等待
  | "executing" // 履约
  | "completed"; // 完成

export type TimelineEntry = {
  at: string;
  kind: "system" | "agent" | "human";
  who: string;
  text: string;
};

export type Project = {
  id: string;
  title: string;
  client: string;
  date: string;
  city: string;
  scale: string;
  path: "A" | "B" | "C" | "D";
  stage: ProjectStage;
  headline: string; // 一句话概述
  nextAction: string;
  waitingFor?: string;
  brief: {
    goal: string;
    audience: string;
    style: string;
    mustHave: string[];
    mustAvoid: string[];
    budgetBand: string;
    updatedAt: string;
  };
  snapshot: {
    includes: string[];
    excludes: string[];
    priceDrivers: string[];
    risks: string[];
    pending: string[];
  };
  plans: PlanOption[];
  selectedPlanId?: string;
  team: {
    main?: Party;
    collaborators: Party[];
    actors: Party[];
  };
  quote?: {
    total: string;
    validUntil: string;
    breakdown: { label: string; amount: string; note?: string }[];
    status: "draft" | "sent" | "confirmed";
  };
  timeline: TimelineEntry[];
  outcome?: {
    story: string;
    highlights: string[];
    photos: number;
    npsBand: string;
  };
  aiIncident?: {
    what: string;
    impact: string[];
    corrected: string;
    needReconfirm: string[];
  };
};

// 演员数据以 real-actors.ts(基于用户上传《演员介绍》)为事实源;
// 这里保留稳定的旧 id,避免跨页链接失效,内容全部替换为真实素材。
// 图片附件未提供,统一使用 picsum 占位,seed 使用真实姓名拼音以保证唯一性。
export const actors: Actor[] = [
  {
    id: "act_hexuan",
    name: "冯子豪",
    title: "00 后单口喜剧演员 · 后仰喜剧总编剧",
    city: "成都",
    tags: ["单口喜剧", "漫才", "校园/职场", "定制开场"],
    bio: "《脱口秀和 ta 的朋友们 3》卡司。漫才组合「逢考必过」吐槽担当,自带笑点的山东人,本职是老师,闯荡成都后的各种趣事是他段子的主线。",
    verified: true,
    scheduleState: "tight",
    signatureProgram: "prog_standup_20min",
    representativeCases: ["vc_aia", "vc_philips"],
    fitFor: ["年会开场", "员工关怀", "教育/校园活动"],
    avatarSeed: "fengzihao",
    gallery: [
      "https://picsum.photos/seed/fengzihao-1/1200/800",
      "https://picsum.photos/seed/fengzihao-2/1200/800",
      "https://picsum.photos/seed/fengzihao-3/1200/800",
      "https://picsum.photos/seed/fengzihao-4/1200/800",
    ],
  },
  {
    id: "act_linshu",
    name: "团儿",
    title: "00 后 · 主持 & 段子双修",
    city: "成都",
    tags: ["主持", "互动脱口秀", "现场氛围"],
    bio: "后仰喜剧常驻主持人。段子简单轻松,擅长从生活小事挖掘笑点,互动视频播放量超千万。",
    verified: true,
    scheduleState: "open",
    signatureProgram: "prog_standup_20min",
    representativeCases: ["vc_philips"],
    fitFor: ["年会主持", "团建互动", "客户答谢串场"],
    avatarSeed: "tuaner",
    gallery: [
      "https://picsum.photos/seed/tuaner-1/1200/800",
      "https://picsum.photos/seed/tuaner-2/1200/800",
      "https://picsum.photos/seed/tuaner-3/1200/800",
    ],
  },
  {
    id: "act_zhouye",
    name: "艾克",
    title: "脱口秀演员 · 蓉漂人才代表",
    city: "成都",
    tags: ["单口喜剧", "个人专场", "文化跨界"],
    bio: "新疆人,从事脱口秀 7 年,全网视频播放量破千万,青年蓉漂人才代表。个人专场《太阳照常升起》。",
    verified: true,
    scheduleState: "open",
    signatureProgram: "prog_standup_20min",
    representativeCases: ["vc_eastern_industry"],
    fitFor: ["品牌活动", "文化主题晚宴", "城市推广活动"],
    avatarSeed: "aike",
    gallery: [
      "https://picsum.photos/seed/aike-1/1200/800",
      "https://picsum.photos/seed/aike-2/1200/800",
      "https://picsum.photos/seed/aike-3/1200/800",
      "https://picsum.photos/seed/aike-4/1200/800",
    ],
  },
  {
    id: "act_muyao",
    name: "杨鑫",
    title: "脱口秀演员 · 生活/家庭视角",
    city: "成都",
    tags: ["单口喜剧", "生活观察", "女性视角"],
    bio: "《脱口秀和 ta 的朋友们 3》卡司,笑嘛黑马赛冠军。段子聚焦家庭日常,有笑点更有烟火气。",
    verified: false,
    scheduleState: "busy",
    signatureProgram: "prog_standup_20min",
    representativeCases: [],
    fitFor: ["家庭日", "员工关怀", "女性主题活动"],
    avatarSeed: "yangxin",
    gallery: [
      "https://picsum.photos/seed/yangxin-1/1200/800",
      "https://picsum.photos/seed/yangxin-2/1200/800",
      "https://picsum.photos/seed/yangxin-3/1200/800",
    ],
  },
  {
    id: "act_arknight",
    name: "77·88",
    title: "后仰喜剧签约 · 全能双拼",
    city: "成都",
    tags: ["单口喜剧", "新喜剧", "主持"],
    bio: "脱口秀和新喜剧双开花,主持、喜剧、单口一人包揽。双拼秀《成都玩家》、单口专场《垃圾飞行指南》。",
    verified: true,
    scheduleState: "open",
    signatureProgram: "prog_standup_20min",
    representativeCases: ["vc_aia"],
    fitFor: ["主持+表演一人包场", "线下品牌活动", "VIP 私宴"],
    avatarSeed: "7788",
    gallery: [
      "https://picsum.photos/seed/7788-1/1200/800",
      "https://picsum.photos/seed/7788-2/1200/800",
      "https://picsum.photos/seed/7788-3/1200/800",
    ],
  },
];

export const programs: Program[] = [
  {
    id: "prog_standup_20min",
    title: "单口喜剧 20min",
    type: "单口喜剧",
    duration: "20 分钟",
    audienceFit: ["年会开场", "客户答谢", "品牌活动暖场"],
    actors: ["act_hexuan", "act_linshu", "act_zhouye"],
    summary: "1 名演员单口喜剧演出，含基础内容编排。标准价格不指定演员。",
    status: "verified",
  },
  {
    id: "prog_standup_40min",
    title: "单口喜剧 40min",
    type: "单口喜剧",
    duration: "40 分钟",
    audienceFit: ["客户活动", "庆典活动"],
    actors: ["act_hexuan", "act_zhouye"],
    summary: "一般 2 名演员。适合客户活动、庆典活动。",
    status: "verified",
  },
  {
    id: "prog_standup_60min",
    title: "单口喜剧 60min",
    type: "单口喜剧",
    duration: "60 分钟",
    audienceFit: ["企业年会", "主题活动"],
    actors: ["act_hexuan", "act_linshu", "act_zhouye"],
    summary: "一般 3 名演员。适合企业年会、主题活动。",
    status: "verified",
  },
  {
    id: "prog_standup_90min",
    title: "单口喜剧专场 90min",
    type: "单口喜剧专场",
    duration: "90 分钟",
    audienceFit: ["完整专场", "大型活动"],
    actors: ["act_hexuan", "act_linshu", "act_zhouye", "act_muyao", "act_arknight"],
    summary: "一般 5 名演员，完整脱口秀专场。",
    status: "verified",
  },
  {
    id: "prog_brand_custom",
    title: "品牌定制脱口秀内容",
    type: "定制内容",
    duration: "3 分钟起订",
    audienceFit: ["品牌定制", "产品植入"],
    actors: [],
    summary: "围绕品牌主题与产品信息创作，编剧团队审核。¥3,000/分钟，3 分钟起订。",
    status: "verified",
  },
  {
    id: "prog_interactive",
    title: "喜剧互动与社交游戏",
    type: "互动喜剧",
    duration: "按活动设计",
    audienceFit: ["青年社交", "商场活动", "联谊"],
    actors: ["act_linshu"],
    summary: "脱口秀、喜剧互动、签到破冰及青年社交游戏。",
    status: "verified",
  },
];

// 案例保留稳定的旧 id];

// 案例保留稳定的旧 id;内容基于 real-cases.ts(后仰喜剧公开活动画像整理),
// 不虚构具体客户名/成交金额。gallery 为占位图。
export const cases: CaseStudy[] = [
  {
    id: "vc_aia",
    title: "友邦人寿 × 后仰喜剧",
    industry: "保险/金融",
    scale: "客户答谢活动",
    city: "成都",
    budgetBand: "未公开",
    outcome: "品牌定制脱口秀，将保险理念融入喜剧，在笑声中传递品牌温度。",
    highlights: ["金融行业定制段子", "合规内容审核", "客户答谢场景"],
    date: "2026",
    tenantName: "后仰喜剧",
    summary: "友邦人寿在客户答谢活动中融入喜剧元素，创造轻松有共鸣的品牌体验。",
    tags: ["金融", "客户答谢", "品牌定制"],
    images: [],
  },
  {
    id: "vc_philips",
    title: "飞利浦 × 后仰喜剧",
    industry: "消费品/家电",
    scale: "品牌产品推广活动",
    city: "成都",
    budgetBand: "未公开",
    outcome: "围绕飞利浦产品使用场景创作喜剧内容，将产品卖点转化为生活段子。",
    highlights: ["消费品品牌喜剧化", "产品功能段子化"],
    date: "2026",
    tenantName: "后仰喜剧",
    summary: "飞利浦通过喜剧形式推广品牌理念，让年轻消费者轻松感知产品价值。",
    tags: ["消费品", "产品推广", "年轻化"],
    images: [],
  },
  {
    id: "vc_eastern_industry",
    title: "东部产业集团 × 后仰喜剧",
    industry: "产业园区/地产",
    scale: "青年社交局联谊会",
    city: "成都",
    budgetBand: "未公开",
    outcome: "以脱口秀+互动游戏打造青年社交活动，让参与者在笑声中自然破冰。",
    highlights: ["青年社交喜剧化", "大型联谊活动"],
    date: "2026",
    tenantName: "后仰喜剧",
    summary: "东部产业集团为园区青年策划喜剧联谊活动，打破社交尴尬。",
    tags: ["地产", "青年社交", "联谊"],
    images: [],
  },
];

export const stageLabel: Record<ProjectStage, string> = {
  exploring: "探索中",
  planning: "方案中",
  quoting: "报价中",
  waiting: "等待中",
  executing: "执行中",
  completed: "已完成",
};

// 面向用户的默认状态文案(角色无关的最短表达)。
// 需要更细的"谁在等什么"文案请使用 @/lib/status-copy 的 evidenceCopy(state, role)。
export const evidenceLabel: Record<EvidenceState, string> = {
  verified: "已确认",
  declared: "已声明",
  ai: "AI 建议",
  pending: "等待中",
  expired: "已过期",
};

export function getProject(id: string) {
  return projects.find((p) => p.id === id);
}
export function getActor(id: string) {
  return actors.find((a) => a.id === id);
}
export function getCase(id: string) {
  return cases.find((c) => c.id === id);
}

// ---------------------------------------------------------------------------
// 演出服务产品 PerformanceServiceProduct(PRD V7.2 §6.2 §6.4 §8.3 §10 §18.1 §18.3)
// 与"节目 Program"并列的可交付供给对象:把节目 + 演出服务(主持/导演/统筹/舞美/落地)
// 打包为客户可采购的"服务产品 SKU",带版本、组合意愿、完整/局部标识、依赖清单。
// ---------------------------------------------------------------------------

export type ServiceProductCompleteness = "complete" | "partial";
export type ServiceProductOwnership =
  | "tenant-owned"
  | "actor-authorized"
  | "co-owned";
export type ServiceProductCombinationWillingness =
  | "open" // 可被其他 Tenant 邀请作为组合模块
  | "invite-only" // 仅接受特定协作邀请
  | "solo"; // 仅作为主服务方独立承接
export type ServiceProductStatus = "draft" | "listed" | "paused";

export type ServiceModuleKind =
  | "host"
  | "director"
  | "producer"
  | "stage"
  | "content"
  | "logistics";

export type ServiceModule = {
  kind: ServiceModuleKind;
  label: string;
  responsible: string;
  scope: string;
};

export type ServiceProductDependency = {
  kind: "venue" | "tech" | "people" | "content" | "external";
  label: string;
  note: string;
};

export type ServiceProductVersion = {
  version: string;
  publishedAt: string;
  changelog: string;
};

export type PriceTier = {
  label: string;
  price: string;
};

export type AddOnService = {
  label: string;
  price: string;
};

export type PerformanceServiceProduct = {
  id: string;
  tenantId: string;
  tenantName: string;
  title: string;
  oneLiner: string;
  coverImage: string;
  gallery: string[];
  completeness: ServiceProductCompleteness;
  version: string;
  versionHistory: ServiceProductVersion[];
  includedPrograms: string[];
  includedModules: ServiceModule[];
  dependencies: ServiceProductDependency[];
  ownership: ServiceProductOwnership;
  authorizationExpiresAt?: string;
  combinationWillingness: ServiceProductCombinationWillingness;
  priceBand: string;
  durationBand: string;
  audienceScale: string;
  typicalScenes: string[];
  status: ServiceProductStatus;
  reuseCount: number;
  npsAvg: number;
  relatedCaseIds: string[];
  pricingTiers?: PriceTier[];
  addOns?: AddOnService[];
  agentAdvice?: string;
};

export const serviceProducts: PerformanceServiceProduct[] = [
  {
    id: "sp_sponsorship_wangfujing_1",
    tenantId: "ten_houyang", tenantName: "后仰喜剧",
    title: "商演赞助 · 王府井1号馆310座",
    oneLiner: "借助后仰喜剧现有商业演出，触达稳定的线下年轻观众。标准报价¥6,000–¥8,000/场。",
    coverImage: "https://picsum.photos/seed/sp-wfj1/1400/700",
    gallery: [],
    completeness: "partial",
    version: "v1.0", versionHistory: [],
    includedPrograms: [], includedModules: [],
    dependencies: [],
    ownership: "tenant-owned",
    combinationWillingness: "open",
    priceBand: "¥6,000–¥8,000/场",
    durationBand: "按演出档期",
    audienceScale: "310座", typicalScenes: ["品牌曝光", "线下引流"],
    status: "listed", reuseCount: 0, npsAvg: 0, relatedCaseIds: [],
    pricingTiers: [
      { label: "周一至周四", price: "¥6,000/场" },
      { label: "周五至周日", price: "¥8,000/场" },
    ],
    addOns: [
      { label: "品牌定制脱口秀内容", price: "¥3,000/分钟 · 3分钟起订" },
      { label: "视频拍摄及剪辑", price: "另行报价" },
    ],
    agentAdvice: "商演赞助不改变演出主体内容，适合品牌曝光而非专属活动需求。",
  },
  {
    id: "sp_sponsorship_wangfujing_2",
    tenantId: "ten_houyang", tenantName: "后仰喜剧",
    title: "商演赞助 · 王府井2号馆/招商大魔方150座",
    oneLiner: "借助后仰喜剧现有商业演出。标准报价¥3,000–¥5,000/场。",
    coverImage: "https://picsum.photos/seed/sp-wfj2/1400/700",
    gallery: [], completeness: "partial", version: "v1.0", versionHistory: [],
    includedPrograms: [], includedModules: [], dependencies: [],
    ownership: "tenant-owned", combinationWillingness: "open",
    priceBand: "¥3,000–¥5,000/场", durationBand: "按演出档期",
    audienceScale: "150座", typicalScenes: ["品牌曝光", "线下引流"],
    status: "listed", reuseCount: 0, npsAvg: 0, relatedCaseIds: [],
    pricingTiers: [
      { label: "周一至周四", price: "¥3,000/场" },
      { label: "周五至周日", price: "¥5,000/场" },
    ],
    addOns: [
      { label: "品牌定制脱口秀内容", price: "¥3,000/分钟 · 3分钟起订" },
      { label: "视频拍摄及剪辑", price: "另行报价" },
    ],
    agentAdvice: "150座小剧场，适合精准客群曝光。",
  },
  {
    id: "sp_theatre_buyout_wfj1",
    tenantId: "ten_houyang", tenantName: "后仰喜剧",
    title: "剧场包场 · 王府井1号馆310座",
    oneLiner: "独占指定剧场和约定场次，适合企业或品牌专属活动。标准报价¥18,000–¥26,000。",
    coverImage: "https://picsum.photos/seed/sp-tb1/1400/700",
    gallery: [], completeness: "complete", version: "v1.0", versionHistory: [],
    includedPrograms: ["prog_standup_20min"], includedModules: [
      { kind: "host", label: "主持与流程统筹", responsible: "后仰喜剧", scope: "整场" },
    ], dependencies: [],
    ownership: "tenant-owned", combinationWillingness: "invite-only",
    priceBand: "¥18,000–¥26,000", durationBand: "按约定场次",
    audienceScale: "310座", typicalScenes: ["企业年会", "品牌专属活动", "客户答谢"],
    status: "listed", reuseCount: 3, npsAvg: 92, relatedCaseIds: ["vc_aia"],
    pricingTiers: [
      { label: "周一至周四", price: "¥20,000" },
      { label: "周五至周日", price: "¥26,000" },
      { label: "其他未排演出时间", price: "¥18,000" },
    ],
    addOns: [
      { label: "品牌定制脱口秀内容", price: "¥3,000/分钟 · 3分钟起订" },
      { label: "增加演员/延长时长", price: "另行报价" },
      { label: "摄影摄像/视频剪辑", price: "另行报价" },
    ],
    agentAdvice: "包场独占整场演出，标准价格不含定制内容。推荐加购¥9,000起定制段子。",
  },
  {
    id: "sp_theatre_buyout_wfj2",
    tenantId: "ten_houyang", tenantName: "后仰喜剧",
    title: "剧场包场 · 王府井2号馆/招商大魔方150座",
    oneLiner: "独占指定剧场。标准报价¥13,000–¥16,000。",
    coverImage: "https://picsum.photos/seed/sp-tb2/1400/700",
    gallery: [], completeness: "complete", version: "v1.0", versionHistory: [],
    includedPrograms: ["prog_standup_20min"], includedModules: [], dependencies: [],
    ownership: "tenant-owned", combinationWillingness: "invite-only",
    priceBand: "¥13,000–¥16,000", durationBand: "按约定场次",
    audienceScale: "150座", typicalScenes: ["企业专属活动", "客户答谢"],
    status: "listed", reuseCount: 5, npsAvg: 90, relatedCaseIds: [],
    pricingTiers: [
      { label: "周一至周四正常档期", price: "¥13,000" },
      { label: "周五至周日正常档期", price: "¥16,000" },
      { label: "其他未排演出时间", price: "¥16,000" },
    ],
    addOns: [
      { label: "品牌定制脱口秀内容", price: "¥3,000/分钟 · 3分钟起订" },
    ],
    agentAdvice: "150座小剧场包场性价比高，推荐加定制内容。",
  },
  {
    id: "sp_enterprise_20min",
    tenantId: "ten_houyang", tenantName: "后仰喜剧",
    title: "企业外出演出 · 20分钟",
    oneLiner: "演员到甲方指定场地完成脱口秀演出。标准报价¥5,000起。",
    coverImage: "https://picsum.photos/seed/sp-ent-20/1400/700",
    gallery: [], completeness: "partial", version: "v1.0", versionHistory: [],
    includedPrograms: ["prog_standup_20min"], includedModules: [], dependencies: [],
    ownership: "tenant-owned", combinationWillingness: "open",
    priceBand: "¥5,000", durationBand: "20分钟",
    audienceScale: "不限", typicalScenes: ["开场暖场", "短时节目"],
    status: "listed", reuseCount: 0, npsAvg: 0, relatedCaseIds: [],
    pricingTiers: [
      { label: "成都绕城内标准价", price: "¥5,000" },
      { label: "成都绕城外·大成都", price: "¥5,000 + ¥300/人远程费" },
      { label: "四川省内·成都外", price: "¥5,000 + ¥1,000/人/天" },
    ],
    addOns: [
      { label: "品牌定制内容", price: "¥3,000/分钟 · 3分钟起订" },
      { label: "增加演员", price: "另行报价" },
      { label: "摄影摄像/视频剪辑", price: "另行报价" },
    ],
    agentAdvice: "20分钟¥5,000起，适合开场暖场。如需定制内容加¥9,000起。",
  },
  {
    id: "sp_competition",
    tenantId: "ten_houyang", tenantName: "后仰喜剧",
    title: "品牌主题脱口秀大赛",
    oneLiner: "适合打造大型品牌事件、行业话题和长期内容资产。¥80,000/场。",
    coverImage: "https://picsum.photos/seed/sp-comp/1400/700",
    gallery: [], completeness: "complete", version: "v1.0", versionHistory: [],
    includedPrograms: ["prog_brand_custom"], includedModules: [
      { kind: "content", label: "内容创作", responsible: "编剧团队", scope: "不少于20分钟原创品牌内容" },
      { kind: "producer", label: "策划执行", responsible: "后仰喜剧", scope: "赛事流程+选手管理+舞台统筹" },
      { kind: "director", label: "品牌与传播", responsible: "后仰喜剧", scope: "舞台植入+高清录制+推广3次" },
    ], dependencies: [],
    ownership: "tenant-owned", combinationWillingness: "solo",
    priceBand: "¥80,000/场", durationBand: "约120分钟",
    audienceScale: "不限", typicalScenes: ["大型品牌事件", "行业话题", "内容资产沉淀"],
    status: "listed", reuseCount: 1, npsAvg: 95, relatedCaseIds: [],
    pricingTiers: [
      { label: "标准价", price: "¥80,000/场" },
    ],
    addOns: [
      { label: "特殊舞美/额外灯光音响", price: "另行报价" },
      { label: "付费投流/电视/户外", price: "另行报价" },
      { label: "延长肖像或内容授权", price: "另行报价" },
    ],
    agentAdvice: "¥80,000/场包含不少于20分钟原创品牌内容和推广3次，适合大型品牌事件。",
  },
  {
    id: "sp_speed_dating",
    tenantId: "ten_houyang", tenantName: "后仰喜剧",
    title: "「有点意思·看对眼大会」青年社交IP",
    oneLiner: "商业体年轻客群招募、互动体验与持续运营。¥20,000/场起。",
    coverImage: "https://picsum.photos/seed/sp-dating/1400/700",
    gallery: [], completeness: "complete", version: "v1.0", versionHistory: [],
    includedPrograms: ["prog_interactive"], includedModules: [
      { kind: "producer", label: "策划与流程", responsible: "后仰喜剧", scope: "主题设计+用户招募+现场执行" },
      { kind: "host", label: "主持人+演员", responsible: "后仰喜剧", scope: "1名主持人+1名演员+约6名工作人员" },
      { kind: "logistics", label: "基础物料", responsible: "后仰喜剧", scope: "资料卡/号码牌/Bingo卡/游戏币/手环/玫瑰" },
    ], dependencies: [],
    ownership: "tenant-owned", combinationWillingness: "solo",
    priceBand: "¥20,000/场", durationBand: "约4小时",
    audienceScale: "50人起", typicalScenes: ["商业体引流", "青年社交", "联谊活动"],
    status: "listed", reuseCount: 6, npsAvg: 88, relatedCaseIds: [],
    pricingTiers: [
      { label: "单场", price: "¥20,000" },
      { label: "季度合作(3场)", price: "¥19,000/场" },
      { label: "半年合作(6场)", price: "¥18,000/场" },
      { label: "年度合作(12场)", price: "¥17,000/场" },
    ],
    addOns: [
      { label: "扩大人数(每+50人)", price: "+¥5,000" },
      { label: "定制主题与特殊视觉", price: "另行报价" },
      { label: "线上社群运营", price: "另行报价" },
    ],
    agentAdvice: "¥20,000/场起，含50名单身青年招募。长期合作阶梯价可降至¥17,000/场。",
  },
];

export const serviceProductCompletenessLabel: Record<ServiceProductCompleteness, string> = {
  complete: "完整解决方案",
  partial: "独立节目/局部服务",
};

export function getServiceProduct(id: string) {
  return serviceProducts.find((p) => p.id === id);
}

export function getProgram(id: string) {
  return programs.find((p) => p.id === id);
}


export const serviceProductCombinationLabel: Record<string, string> = {
  open: "开放协作",
  "invite-only": "仅邀请协作",
  solo: "独立承接",
};

export const serviceProductOwnershipLabel: Record<string, string> = {
  "tenant-owned": "本机构自有",
  "actor-authorized": "演员授权",
  "co-owned": "共同持有",
};

export const msaFixtures: import("./fixtures").MainServiceAssignment[] = [];

export const serviceProductStatusLabel: Record<string, string> = {
  draft: "草稿",
  listed: "已上架",
  paused: "已暂停",
};
export const projects: Project[] = [
  {
    id: "proj_neoyear",
    title: "Neo 银行 · 2027 年度客户答谢晚宴",
    client: "Neo 银行 · 战略客户部",
    date: "2027-01-18",
    city: "上海",
    scale: "480 人 · 五星酒店",
    path: "A",
    stage: "planning",
    headline: "3 个方案已生成,待你比较后确认方向",
    nextAction: "在《方案》页比较 A/B/C 三个方向,选定后推进报价",
    brief: {
      goal: "感谢过去一年重点私行客户,同时释放 2027 年财富管理主张",
      audience: "私行客户及配偶,平均年龄 45-58,一线城市高净值",
      style: "克制、国际化、有内容不喧宾夺主",
      mustHave: ["中英双语主持", "定制化内容开场", "可发朋友圈的记忆点"],
      mustAvoid: ["土味综艺互动", "过度品牌硬植入", "深夜结束"],
      budgetBand: "80–120 万",
      updatedAt: "2 小时前",
    },
    snapshot: {
      includes: [
        "18 分钟定制脱口秀开场(2 轮内容评审)",
        "双语主持全程串联",
        "近景魔术 VIP 巡桌 45 分钟",
        "唯一主服务方 · 后仰喜剧 全案统筹",
      ],
      excludes: [
        "宴会 F&B 及酒店场地(客户直采)",
        "航拍及大型舞美结构",
        "宾客礼品(建议单独立项)",
      ],
      priceDrivers: [
        "定制脱口秀内容评审轮次",
        "近景魔术演员档期(1 月上海旺季)",
        "同城 vs 跨城演员差旅",
      ],
      risks: [
        "1 月上海头部演员档期紧张,需在 3 周内锁档",
        "客户内部审批链路较长,合同签署需预留 10 天",
      ],
      pending: [
        "最终宾客人数(±10%)",
        "是否安排 CEO 现场发言(影响流程)",
        "是否需要英文翻译屏幕",
      ],
    },
    plans: [
      {
        id: "plan_A",
        label: "A",
        title: "克制 · 国际化路线",
        positioning: "以内容与主持为主线,舞美克制,突出品牌调性",
        budgetBand: "88–95 万",
        strengths: ["调性最贴合私行客户", "内容驱动,记忆点集中在开场", "预算可控"],
        tradeoffs: ["视觉冲击较弱", "对主持人依赖较高"],
        unfit: ["以年轻员工为主的活动", "希望现场高互动的活动"],
        pending: ["主持人档期需 3 天内确认"],
        storyboard: [
          { phase: "签到", duration: "30′", title: "静态迎宾", detail: "钢琴现场 + 品牌背板互动装置" },
          { phase: "开场", duration: "18′", title: "定制脱口秀", detail: "何轩 · 紧扣客户过去一年财富事件" },
          { phase: "主环节", duration: "60′", title: "双语晚宴串联", detail: "方骑主持 · 穿插客户故事短片" },
          { phase: "高潮", duration: "12′", title: "近景魔术巡桌", detail: "周晔 · 定制品牌悬浮效果" },
          { phase: "收尾", duration: "10′", title: "CEO 致辞 + 静谧退场", detail: "无强制留人环节" },
        ],
        modules: [
          { title: "定制脱口秀开场", owner: "何轩", state: "pending" },
          { title: "双语主持", owner: "方骑", state: "verified" },
          { title: "近景魔术", owner: "周晔", state: "verified" },
          { title: "全案统筹", owner: "后仰喜剧(主服务方)", state: "verified" },
        ],
      },
      {
        id: "plan_B",
        label: "B",
        title: "内容 + 视觉双主线",
        positioning: "在 A 的基础上增加古筝电声开场,视觉更强",
        budgetBand: "105–118 万",
        strengths: ["开场视觉冲击强", "国乐调性有文化厚度"],
        tradeoffs: ["预算上升 15-20%", "需专业音响支持"],
        unfit: ["场地音响条件受限时"],
        pending: ["古筝电声演员档期未确认", "场地音响需现场堪场"],
        storyboard: [
          { phase: "签到", duration: "30′", title: "静态迎宾", detail: "同 A" },
          { phase: "开场", duration: "10′", title: "古筝电声《弦外》", detail: "沐遥 · 灯光配合" },
          { phase: "承接", duration: "15′", title: "脱口秀串场", detail: "何轩 · 缩短至 15 分钟" },
          { phase: "主环节", duration: "60′", title: "双语晚宴串联", detail: "方骑主持" },
          { phase: "高潮", duration: "12′", title: "近景魔术", detail: "周晔" },
          { phase: "收尾", duration: "10′", title: "CEO 致辞 + 退场", detail: "同 A" },
        ],
        modules: [
          { title: "古筝电声开场", owner: "沐遥", state: "pending" },
          { title: "脱口秀串场", owner: "何轩", state: "pending" },
          { title: "双语主持", owner: "方骑", state: "verified" },
          { title: "近景魔术", owner: "周晔", state: "verified" },
          { title: "全案统筹", owner: "后仰喜剧(主服务方)", state: "verified" },
        ],
      },
      {
        id: "plan_C",
        label: "C",
        title: "极简 · 内容纯粹",
        positioning: "只保留脱口秀 + 主持,预算集中在内容质量与评审轮次",
        budgetBand: "62–72 万",
        strengths: ["预算最低", "内容打磨最充分", "风险最小"],
        tradeoffs: ["缺少视觉/互动高潮", "对内容质量要求极高"],
        unfit: ["需要向合作方展示品牌规模感的场合"],
        pending: [],
        storyboard: [
          { phase: "签到", duration: "30′", title: "静态迎宾", detail: "钢琴现场" },
          { phase: "开场", duration: "25′", title: "深度定制脱口秀", detail: "何轩 · 3 轮内容评审" },
          { phase: "主环节", duration: "70′", title: "双语晚宴串联", detail: "方骑主持" },
          { phase: "收尾", duration: "10′", title: "CEO 致辞 + 退场", detail: "" },
        ],
        modules: [
          { title: "深度定制脱口秀", owner: "何轩", state: "pending" },
          { title: "双语主持", owner: "方骑", state: "verified" },
          { title: "全案统筹", owner: "后仰喜剧(主服务方)", state: "verified" },
        ],
      },
    ],
    team: {
      main: {
        id: "ten_houyang",
        name: "后仰喜剧",
        role: "main",
        scope: "全案统筹 · 唯一整体责任方",
        contact: "张策 · 项目负责人",
        confirmed: true,
      },
      collaborators: [
        { id: "ten_stage", name: "光弦舞美", role: "collaborator", scope: "灯光音响 · 由主服务方分包", confirmed: false },
      ],
      actors: [
        { id: "act_hexuan", name: "何轩", role: "actor", scope: "脱口秀开场", confirmed: false },
        { id: "act_arknight", name: "方骑", role: "actor", scope: "双语主持", confirmed: true },
        { id: "act_zhouye", name: "周晔", role: "actor", scope: "近景魔术(方案 A/B)", confirmed: true },
      ],
    },
    quote: {
      total: "¥ 88 万",
      validUntil: "2027-01-10",
      status: "draft",
      breakdown: [
        { label: "定制脱口秀开场", amount: "¥ 22 万", note: "含 2 轮内容评审" },
        { label: "双语主持", amount: "¥ 12 万" },
        { label: "近景魔术VIP巡桌", amount: "¥ 18 万" },
        { label: "全案统筹", amount: "¥ 36 万" },
      ],
    },
    paymentSchedule: [
      { label: "定金", amount: "¥ 26.4 万", dueDate: "2026-12-20", status: "pending" },
      { label: "活动前款", amount: "¥ 35.2 万", dueDate: "2027-01-10", status: "pending" },
      { label: "尾款", amount: "¥ 26.4 万", dueDate: "2027-01-25", status: "pending" },
    ],
    credential: {
      type: "platform_e_contract",
      status: "draft",
      title: "年会主服务全案合同 · Neo银行答谢宴",
      signUrl: "#",
    },
    timeline: [
      { at: "2 小时前", kind: "agent", who: "AI 顾问", text: "生成 3 个方案方向 A/B/C,并标注差异与待确认项" },
      { at: "1 天前", kind: "human", who: "张策(后仰喜剧)", text: "确认已接受主服务方责任,进入方案阶段" },
      { at: "1 天前", kind: "system", who: "系统", text: "Neo 银行提交需求,分配唯一主服务方" },
    ],
  },
  {
    id: "proj_waiting",
    title: "Miracle 汽车 · 新车区域上市",
    client: "Miracle 汽车 · 华东市场部",
    date: "2026-09-14",
    city: "杭州",
    scale: "220 人",
    path: "B",
    stage: "waiting",
    headline: "已锁定演员周晔,等待档期最终确认",
    nextAction: "无需你操作,主服务方将在演员确认后同步",
    waitingFor: "演员周晔的经纪确认 9/14 档期(平均等待 2 天)",
    brief: {
      goal: "配合新车'不可思议'主线制造媒体记忆点",
      audience: "区域经销商 + 头部媒体",
      style: "有惊喜、不媚俗、克制",
      mustHave: ["近景魔术呼应'不可思议'"],
      mustAvoid: ["硬性产品讲解穿插演出"],
      budgetBand: "50–70 万",
      updatedAt: "3 天前",
    },
    snapshot: {
      includes: ["近景魔术 VIP 巡桌", "定制舞台收官 8 分钟", "全案统筹"],
      excludes: ["场地", "F&B", "试驾环节"],
      priceDrivers: ["演员差旅", "定制道具"],
      risks: ["档期紧"],
      pending: ["最终桌数"],
    },
    plans: [],
    team: {
      main: {
        id: "ten_houyang",
        name: "后仰喜剧",
        role: "main",
        scope: "全案统筹",
        confirmed: true,
      },
      collaborators: [],
      actors: [
        { id: "act_zhouye", name: "周晔", role: "actor", scope: "近景魔术", confirmed: false },
      ],
    },
    quote: {
      total: "¥ 58.8 万",
      validUntil: "2026-08-01",
      status: "sent",
      breakdown: [
        { label: "近景魔术 · 巡桌 + 舞台", amount: "¥ 32 万", note: "含 2 名助演" },
        { label: "全案统筹与执行", amount: "¥ 18 万" },
        { label: "定制道具与差旅", amount: "¥ 8.8 万" },
      ],
    },
    paymentSchedule: [
      { label: "定金", amount: "¥ 17.6 万", dueDate: "2026-08-01", status: "pending" },
      { label: "尾款", amount: "¥ 41.2 万", dueDate: "2026-09-20", status: "pending" },
    ],
    credential: {
      type: "platform_e_contract",
      status: "pending",
      title: "Miracle汽车 · 新车上市活动服务合同",
      signUrl: "#",
    },
    timeline: [
      { at: "刚刚", kind: "agent", who: "AI 顾问", text: "档期确认平均耗时 2 天,我会持续跟进并在有变化时通知你" },
      { at: "3 小时前", kind: "system", who: "系统", text: "报价已发送,等待客户确认" },
      { at: "1 天前", kind: "human", who: "张策(后仰喜剧)", text: "向周晔经纪发出锁档申请" },
    ],
  },
  {
    id: "proj_reuse",
    title: "SciTech 2026 年度 Kickoff",
    client: "SciTech · 内部年会",
    date: "2026-02-05",
    city: "杭州",
    scale: "320 人",
    path: "C",
    stage: "completed",
    headline: "已完成 · 客户已启动 2027 年复购流程",
    nextAction: "从这次活动一键再办一次",
    brief: {
      goal: "全员 Kickoff,凝聚组织",
      audience: "全员 300+",
      style: "现代、有互动、不端着",
      mustHave: ["即兴共创环节"],
      mustAvoid: ["传统颁奖冗长"],
      budgetBand: "30–50 万",
      updatedAt: "已归档",
    },
    snapshot: {
      includes: ["即兴共创 40 分钟", "定制脱口秀 15 分钟", "全案统筹"],
      excludes: [],
      priceDrivers: [],
      risks: [],
      pending: [],
    },
    plans: [],
    team: {
      main: { id: "ten_houyang", name: "后仰喜剧", role: "main", scope: "全案统筹", confirmed: true },
      collaborators: [],
      actors: [
        { id: "act_linshu", name: "林舒", role: "actor", scope: "即兴共创", confirmed: true },
        { id: "act_hexuan", name: "何轩", role: "actor", scope: "脱口秀串场", confirmed: true },
      ],
    },
    timeline: [
      { at: "2026-02-06", kind: "system", who: "系统", text: "活动执行完成,进入成果沉淀" },
      { at: "2026-02-05", kind: "human", who: "张策", text: "现场执行完毕,客户当晚表达续办意向" },
    ],
    outcome: {
      story: "300 人的 Kickoff 从'CEO 讲话 + 颁奖'的老框架里跳出来。林舒把品牌关键词转成即兴段子,员工从台下笑到台上;何轩收尾时把过去一年的产品事故翻成了两句梗,现场没有人尴尬。CEO 当晚就要求次年沿用同一主服务方。",
      highlights: [
        "内部满意度 4.7 / 5",
        "CEO 直接指定次年主服务方",
        "策划人从初稿到定稿 6 天,复用了 3 个模块",
      ],
      photos: 42,
      npsBand: "极高",
    },
  },
  {
    id: "proj_rfp",
    title: "AlphaBio · 产品发布会(已有方案)",
    client: "AlphaBio · 品牌部",
    date: "2026-10-22",
    city: "北京",
    scale: "180 人",
    path: "D",
    stage: "exploring",
    headline: "已上传你的方案,缺口检查发现 5 项待补充",
    nextAction: "在《理解》页确认 5 项待补充信息",
    brief: {
      goal: "全球产品发布,面向媒体与 KOL",
      audience: "医药媒体 + 行业 KOL",
      style: "严谨、有质感、突出研发实力",
      mustHave: ["中英双语主持", "科技感开场"],
      mustAvoid: ["娱乐化过重的互动"],
      budgetBand: "60–100 万",
      updatedAt: "刚刚",
    },
    snapshot: {
      includes: ["按你上传方案初步识别: 主持 + 开场 + 全案"],
      excludes: ["场地"],
      priceDrivers: ["科技感开场制作难度", "双语主持等级"],
      risks: ["原方案未指定主服务方,需先分配"],
      pending: [
        "是否希望复用 SciTech 案例中的即兴共创元素",
        "是否需要 AI 顾问介入内容脚本",
        "科技感开场是希望音乐 / 装置 / 视觉哪一种主导",
        "预算区间是否包含道具制作",
        "是否已有既定演员意向",
      ],
    },
    plans: [],
    team: { collaborators: [], actors: [] },
    timeline: [
      { at: "刚刚", kind: "agent", who: "AI 顾问", text: "已解析你上传的方案,发现 5 项影响推进的关键缺口" },
      { at: "刚刚", kind: "system", who: "系统", text: "已上传原方案 PDF · 12 页" },
    ],
    aiIncident: {
      what: "在初次解析中,我把'临床线专家致辞'误识别为'嘉宾脱口秀'环节",
      impact: [
        "方案第 2 段的定位描述受影响",
        "预算测算中的'内容评审轮次'一项需要重新核算",
      ],
      corrected: "已把该环节改回'专家致辞',并把预算测算标记为需重新审阅",
      needReconfirm: ["策划人复核修正后的定位段落", "重新确认预算测算"],
    },
  },
];

