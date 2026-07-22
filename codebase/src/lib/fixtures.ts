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
    signatureProgram: "prog_openyear",
    representativeCases: ["case_finconf", "case_scitech"],
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
    signatureProgram: "prog_impro",
    representativeCases: ["case_scitech"],
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
    signatureProgram: "prog_magicset",
    representativeCases: ["case_auto"],
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
    signatureProgram: "prog_guqin",
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
    signatureProgram: "prog_zpk",
    representativeCases: ["case_finconf"],
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
    id: "prog_openyear",
    title: "《开年·笑》定制脱口秀开场",
    type: "单口喜剧",
    duration: "18–25 分钟",
    audienceFit: ["企业年会", "客户答谢"],
    actors: ["act_hexuan"],
    summary: "以公司过去一年关键词为素材的定制脱口秀开场,含 2 轮内容评审,规避行业敏感话题。",
    status: "verified",
  },
  {
    id: "prog_impro",
    title: "互动脱口秀 ·《团儿秀》",
    type: "互动脱口秀",
    duration: "30–40 分钟",
    audienceFit: ["团建", "员工关怀", "客户答谢"],
    actors: ["act_linshu"],
    summary: "从现场话题即兴出梗,并邀请观众上台互动,替代传统颁奖流程的高互动性环节。",
    status: "verified",
  },
  {
    id: "prog_magicset",
    title: "个人专场摘段《太阳照常升起》",
    type: "单口喜剧",
    duration: "15–25 分钟",
    audienceFit: ["品牌活动", "文化主题晚宴"],
    actors: ["act_zhouye"],
    summary: "从新疆到成都的跨地域故事,适合作为品牌'向新而行/多元共生'主题活动的内容环节。",
    status: "verified",
  },
  {
    id: "prog_guqin",
    title: "家庭视角脱口秀",
    type: "单口喜剧",
    duration: "15–20 分钟",
    audienceFit: ["家庭日", "员工关怀"],
    actors: ["act_muyao"],
    summary: "以家庭日常与\"老公素材\"为主线的段子集,适合家长/员工家属同席的场景。",
    status: "pending",
  },
  {
    id: "prog_zpk",
    title: "全能双拼《成都玩家》Player1",
    type: "单口 + 新喜剧",
    duration: "35–45 分钟",
    audienceFit: ["高净值客户答谢", "品牌活动"],
    actors: ["act_arknight"],
    summary: "主持 + 单口 + 新喜剧一人包场,小场景/精品客户答谢首选,减少舞台人员进出。",
    status: "verified",
  },
];

// 案例保留稳定的旧 id;内容基于 real-cases.ts(后仰喜剧公开活动画像整理),
// 不虚构具体客户名/成交金额。gallery 为占位图。
export const cases: CaseStudy[] = [
  {
    id: "case_finconf",
    title: "本地财富管理 · 高净值客户答谢(示例画像)",
    industry: "金融",
    scale: "80 人 · 精品酒店",
    city: "成都",
    budgetBand: "示例 · 10–18 万",
    outcome: "小场景客户,主持+表演一人包场,内容 2 轮内评审,规避金融合规敏感表达。",
    highlights: [
      "77·88 全能双拼,主持 + 单口一人包场",
      "定制段子内容评审 2 轮,规避金融合规风险",
      "小场景避免多人进出干扰 VIP 体验",
    ],
    gallery: [
      "https://picsum.photos/seed/case-finance-1/1400/900",
      "https://picsum.photos/seed/case-finance-2/1400/900",
      "https://picsum.photos/seed/case-finance-3/1400/900",
      "https://picsum.photos/seed/case-finance-4/1400/900",
    ],
  },
  {
    id: "case_scitech",
    title: "互联网公司 · 成都研发中心员工关怀之夜(示例画像)",
    industry: "互联网",
    scale: "220 人 · 内部",
    city: "成都",
    budgetBand: "示例 · 6–10 万",
    outcome: "以\"打工人共情\"为主线,互动脱口秀让员工上台参与,替代传统颁奖流程。",
    highlights: [
      "团儿互动脱口秀,现场员工上台参与",
      "职场吐槽段子经 HR 筛过,避开涉密/人事敏感",
      "冯子豪定制开场紧扣公司年度关键词",
    ],
    gallery: [
      "https://picsum.photos/seed/case-it-1/1400/900",
      "https://picsum.photos/seed/case-it-2/1400/900",
      "https://picsum.photos/seed/case-it-3/1400/900",
    ],
  },
  {
    id: "case_auto",
    title: "新势力车企 · 成都经销商答谢(示例画像)",
    industry: "汽车",
    scale: "180 人 · 品牌体验中心",
    city: "成都",
    budgetBand: "示例 · 12–20 万",
    outcome: "跨地域故事呼应品牌'向新而行'主线,取材公开个人专场,规避商演内容偏差风险。",
    highlights: [
      "艾克专场摘段作为品牌内容环节",
      "文化跨界主题串场,与主视觉调性一致",
      "内容 2 轮内评审,规避汽车行业敏感话题",
    ],
    gallery: [
      "https://picsum.photos/seed/case-auto-1/1400/900",
      "https://picsum.photos/seed/case-auto-2/1400/900",
      "https://picsum.photos/seed/case-auto-3/1400/900",
      "https://picsum.photos/seed/case-auto-4/1400/900",
    ],
  },
];



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
export function getProgram(id: string) {
  return programs.find((p) => p.id === id);
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
  agentAdvice?: string;
};

export const serviceProducts: PerformanceServiceProduct[] = [
  {
    id: "sp_annual_signature",
    tenantId: "ten_houyang",
    tenantName: "后仰喜剧",
    title: "年会主服务全案 · 内容驱动型",
    oneLiner:
      "以定制脱口秀 + 双语主持为主线的年度活动全案统筹,后仰喜剧作为唯一主服务方对整场负责。",
    coverImage: "https://picsum.photos/seed/sp-annual-cover/1400/700",
    gallery: [
      "https://picsum.photos/seed/sp-annual-1/1200/800",
      "https://picsum.photos/seed/sp-annual-2/1200/800",
      "https://picsum.photos/seed/sp-annual-3/1200/800",
    ],
    completeness: "complete",
    version: "v2.3",
    versionHistory: [
      { version: "v2.3", publishedAt: "2026-06-10", changelog: "更新价格区间;补充 2 项典型场景。" },
      { version: "v2.2", publishedAt: "2026-03-04", changelog: "新增舞美协作依赖说明。" },
      { version: "v2.1", publishedAt: "2025-11-18", changelog: "首次纳入双语主持模块。" },
    ],
    includedPrograms: ["prog_openyear"],
    includedModules: [
      { kind: "content", label: "内容定制", responsible: "后仰喜剧 · 内容组", scope: "开场脱口秀 + 主持稿 2 轮评审" },
      { kind: "host", label: "双语主持", responsible: "方骑(签约)", scope: "全程串联 + 高潮环节调度" },
      { kind: "director", label: "现场导演", responsible: "后仰喜剧 · 张策", scope: "彩排 1 次 + 现场分镜" },
      { kind: "producer", label: "全案统筹", responsible: "后仰喜剧", scope: "对客户唯一负责,含时间轴、供应商协调" },
    ],
    dependencies: [
      { kind: "venue", label: "宴会厅或剧场空间", note: "≥ 300 平,层高 ≥ 4.5m" },
      { kind: "tech", label: "专业音响与追光", note: "由主服务方推荐供应商或客户直采" },
      { kind: "people", label: "客户方对接人 1 名", note: "用于内容评审与流程确认" },
    ],
    ownership: "tenant-owned",
    combinationWillingness: "solo",
    priceBand: "¥ 85 – 120 万",
    durationBand: "150-180 分钟",
    audienceScale: "300 – 600 人",
    typicalScenes: ["年度客户答谢", "私行专场晚宴", "战略客户 Kickoff"],
    status: "listed",
    reuseCount: 12,
    npsAvg: 68,
    relatedCaseIds: ["case_finconf"],
    agentAdvice:
      "近 30 天被 3 位客户查看,建议在版本 v2.4 中补充「同城多演员差旅口径」以减少报价来回。",
  },
  {
    id: "sp_launch_visual",
    tenantId: "ten_houyang",
    tenantName: "后仰喜剧",
    title: "新品发布 · 视觉+内容双主线",
    oneLiner:
      "古筝电声开场 + 近景魔术组套 + 现场统筹,适合品牌需要强视觉冲击的发布会。",
    coverImage: "https://picsum.photos/seed/sp-launch-cover/1400/700",
    gallery: [
      "https://picsum.photos/seed/sp-launch-1/1200/800",
      "https://picsum.photos/seed/sp-launch-2/1200/800",
    ],
    completeness: "complete",
    version: "v1.4",
    versionHistory: [
      { version: "v1.4", publishedAt: "2026-05-22", changelog: "增补舞美依赖清单。" },
      { version: "v1.2", publishedAt: "2026-01-09", changelog: "调整魔术组套时长为 45+8 分钟。" },
    ],
    includedPrograms: ["prog_guqin", "prog_magicset"],
    includedModules: [
      { kind: "content", label: "主题内容", responsible: "后仰喜剧 · 内容组", scope: "结合品牌关键词的定制串场" },
      { kind: "stage", label: "舞美灯光协作", responsible: "光弦舞美(邀请协作)", scope: "由主服务方分包并统一交付" },
      { kind: "producer", label: "全案统筹", responsible: "后仰喜剧", scope: "唯一整体责任方" },
    ],
    dependencies: [
      { kind: "tech", label: "专业 LED 与追光", note: "需现场堪场,场地音响需支持 5.1" },
      { kind: "people", label: "品牌方内容对接 1 名", note: "用于关键词与产品信息交付" },
      { kind: "external", label: "版权音乐授权", note: "由主服务方代购,含在报价内" },
    ],
    ownership: "co-owned",
    combinationWillingness: "invite-only",
    priceBand: "¥ 105 – 140 万",
    durationBand: "120-150 分钟",
    audienceScale: "200 – 500 人",
    typicalScenes: ["新品发布", "品牌年度沟通", "文化主题晚宴"],
    status: "listed",
    reuseCount: 6,
    npsAvg: 71,
    relatedCaseIds: ["case_auto"],
  },
  {
    id: "sp_improv_module",
    tenantId: "ten_houyang",
    tenantName: "后仰喜剧",
    title: "即兴共创模块 · 30-40 分钟",
    oneLiner:
      "作为其他主服务方方案中的高潮模块,可被邀请嵌入他方年会 / 团建 / 创新论坛。",
    coverImage: "https://picsum.photos/seed/sp-improv-cover/1400/700",
    gallery: [
      "https://picsum.photos/seed/sp-improv-1/1200/800",
      "https://picsum.photos/seed/sp-improv-2/1200/800",
    ],
    completeness: "partial",
    version: "v1.1",
    versionHistory: [
      { version: "v1.1", publishedAt: "2026-04-02", changelog: "明确不含全案统筹责任。" },
      { version: "v1.0", publishedAt: "2025-12-01", changelog: "首次发布。" },
    ],
    includedPrograms: ["prog_impro"],
    includedModules: [
      { kind: "content", label: "关键词共创内容", responsible: "林舒 · 编导", scope: "与客户 1 轮线上沟通即可" },
      { kind: "logistics", label: "模块级落地执行", responsible: "后仰喜剧", scope: "仅对本模块负责,不承担全场统筹" },
    ],
    dependencies: [
      { kind: "venue", label: "开阔互动区", note: "≥ 80 平,可站立互动" },
      { kind: "people", label: "主服务方对接人", note: "由主服务方指定,用于时间轴衔接" },
    ],
    ownership: "actor-authorized",
    authorizationExpiresAt: "2027-06-30",
    combinationWillingness: "open",
    priceBand: "¥ 5.4 – 7.2 万",
    durationBand: "30-40 分钟",
    audienceScale: "80 – 300 人",
    typicalScenes: ["团建", "创新论坛", "年会高潮环节"],
    status: "listed",
    reuseCount: 9,
    npsAvg: 74,
    relatedCaseIds: ["case_scitech"],
    agentAdvice:
      "该产品为局部型,注意在方案页明确「不承担全案统筹责任」,避免客户误认为主服务方。",
  },
  {
    id: "sp_vip_intimate",
    tenantId: "ten_houyang",
    tenantName: "后仰喜剧",
    title: "VIP 私宴 · 近景魔术 + 双语主持",
    oneLiner:
      "面向 80-150 人小型 VIP 私宴的完整服务产品,含近景巡桌 + 简约主持 + 现场统筹。",
    coverImage: "https://picsum.photos/seed/sp-vip-cover/1400/700",
    gallery: ["https://picsum.photos/seed/sp-vip-1/1200/800"],
    completeness: "complete",
    version: "v1.0",
    versionHistory: [
      { version: "v1.0", publishedAt: "2026-06-18", changelog: "首次发布,基于 3 场私宴复用形成。" },
    ],
    includedPrograms: ["prog_magicset"],
    includedModules: [
      { kind: "host", label: "双语主持", responsible: "方骑(签约)", scope: "轻量串场" },
      { kind: "producer", label: "现场统筹", responsible: "后仰喜剧", scope: "含流程 / 供应商 / 客户沟通" },
    ],
    dependencies: [
      { kind: "venue", label: "私宴厅 / 会所", note: "10-15 桌" },
      { kind: "people", label: "客户方礼宾对接", note: "含 VIP 到场提醒" },
    ],
    ownership: "tenant-owned",
    combinationWillingness: "solo",
    priceBand: "¥ 42 – 58 万",
    durationBand: "120 分钟",
    audienceScale: "80 – 150 人",
    typicalScenes: ["私行 VIP 晚宴", "高端答谢私宴"],
    status: "listed",
    reuseCount: 4,
    npsAvg: 76,
    relatedCaseIds: ["case_finconf"],
  },
  {
    id: "sp_kickoff_light",
    tenantId: "ten_houyang",
    tenantName: "后仰喜剧",
    title: "极简 Kickoff · 内容纯粹型",
    oneLiner:
      "仅保留脱口秀 + 双语主持,预算集中在内容质量,适合内部 Kickoff 与创新论坛。",
    coverImage: "https://picsum.photos/seed/sp-kickoff-cover/1400/700",
    gallery: ["https://picsum.photos/seed/sp-kickoff-1/1200/800"],
    completeness: "complete",
    version: "v1.2",
    versionHistory: [
      { version: "v1.2", publishedAt: "2026-05-05", changelog: "调整为 3 轮内容评审。" },
      { version: "v1.0", publishedAt: "2025-10-20", changelog: "首次发布。" },
    ],
    includedPrograms: ["prog_openyear"],
    includedModules: [
      { kind: "content", label: "深度定制脱口秀", responsible: "何轩(签约)", scope: "3 轮内容评审" },
      { kind: "producer", label: "轻量统筹", responsible: "后仰喜剧", scope: "含时间轴、彩排 1 次" },
    ],
    dependencies: [
      { kind: "venue", label: "会议室 / 剧场式排座", note: "≥ 150 平" },
      { kind: "people", label: "客户方内容对接", note: "用于关键事件采集" },
    ],
    ownership: "actor-authorized",
    authorizationExpiresAt: "2027-12-31",
    combinationWillingness: "solo",
    priceBand: "¥ 32 – 48 万",
    durationBand: "90-120 分钟",
    audienceScale: "150 – 300 人",
    typicalScenes: ["年度 Kickoff", "内部年会", "创新论坛开场"],
    status: "listed",
    reuseCount: 8,
    npsAvg: 70,
    relatedCaseIds: ["case_scitech"],
  },
  {
    id: "sp_hosted_forum",
    tenantId: "ten_houyang",
    tenantName: "后仰喜剧",
    title: "论坛主持模块 · 双语",
    oneLiner:
      "仅提供双语主持能力,作为其他主服务方论坛方案的可嵌入模块。",
    coverImage: "https://picsum.photos/seed/sp-forum-cover/1400/700",
    gallery: ["https://picsum.photos/seed/sp-forum-1/1200/800"],
    completeness: "partial",
    version: "v1.0",
    versionHistory: [
      { version: "v1.0", publishedAt: "2026-02-14", changelog: "首次发布。" },
    ],
    includedPrograms: [],
    includedModules: [
      { kind: "host", label: "双语主持", responsible: "方骑(签约)", scope: "半天 / 全天两档" },
    ],
    dependencies: [
      { kind: "content", label: "议程与嘉宾资料", note: "由主服务方提前 5 天交付" },
    ],
    ownership: "actor-authorized",
    authorizationExpiresAt: "2027-06-30",
    combinationWillingness: "open",
    priceBand: "¥ 2.8 – 4.2 万",
    durationBand: "半天 / 全天",
    audienceScale: "任意",
    typicalScenes: ["国际论坛", "颁奖典礼", "跨国发布会"],
    status: "listed",
    reuseCount: 15,
    npsAvg: 72,
    relatedCaseIds: ["case_finconf"],
  },
  {
    id: "sp_experiment_workshop",
    tenantId: "ten_houyang",
    tenantName: "后仰喜剧",
    title: "喜剧工作坊 · 团建整日",
    oneLiner:
      "面向 40-80 人团队的整日喜剧工作坊 + 结营演出,含内容设计与轻量统筹。",
    coverImage: "https://picsum.photos/seed/sp-workshop-cover/1400/700",
    gallery: [],
    completeness: "complete",
    version: "v0.9",
    versionHistory: [
      { version: "v0.9", publishedAt: "2026-07-01", changelog: "草稿版,复用尚少。" },
    ],
    includedPrograms: ["prog_impro"],
    includedModules: [
      { kind: "content", label: "工作坊设计", responsible: "林舒 · 编导", scope: "含前 1 周问卷" },
      { kind: "director", label: "结营演出导演", responsible: "后仰喜剧", scope: "结营 40 分钟展示" },
      { kind: "logistics", label: "整日落地执行", responsible: "后仰喜剧", scope: "含道具 / 分组 / 计时" },
    ],
    dependencies: [
      { kind: "venue", label: "整日可锁场地", note: "含分组小空间" },
      { kind: "people", label: "客户方 HR 对接", note: "用于分组与目标设定" },
    ],
    ownership: "tenant-owned",
    combinationWillingness: "solo",
    priceBand: "¥ 12 – 18 万",
    durationBand: "整日 6-8 小时",
    audienceScale: "40 – 80 人",
    typicalScenes: ["高管团建", "跨部门融合", "新员工融入"],
    status: "draft",
    reuseCount: 1,
    npsAvg: 65,
    relatedCaseIds: [],
    agentAdvice: "复用次数尚少,建议先在私域 3 家客户试点后再发布至公共发现频道。",
  },
];

export function getServiceProduct(id: string) {
  return serviceProducts.find((p) => p.id === id);
}

export const serviceProductCompletenessLabel: Record<ServiceProductCompleteness, string> = {
  complete: "完整型 · 可整体承接",
  partial: "局部型 · 仅作模块提供",
};

export const serviceProductCombinationLabel: Record<ServiceProductCombinationWillingness, string> = {
  open: "开放组合 · 接受他方邀请",
  "invite-only": "定向组合 · 仅限特定伙伴",
  solo: "独立承接 · 不作为模块拆分",
};

export const serviceProductOwnershipLabel: Record<ServiceProductOwnership, string> = {
  "tenant-owned": "Tenant 自有",
  "actor-authorized": "演员授权",
  "co-owned": "联合所有",
};

export const serviceProductStatusLabel: Record<ServiceProductStatus, { label: string; state: EvidenceState }> = {
  draft: { label: "草稿", state: "pending" },
  listed: { label: "已发布", state: "verified" },
  paused: { label: "已下架", state: "expired" },
};
