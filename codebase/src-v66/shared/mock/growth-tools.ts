// ============================================================
// 增长工具 Mock 数据
// 用于企业活动预算计算器和保险行业活动方案生成器
// ============================================================

// --------------- 预算计算器 ---------------

export interface BudgetQuestion {
  id: string;
  title: string;
  options: { label: string; value: string }[];
}

export const budgetQuestions: BudgetQuestion[] = [
  {
    id: "activityType",
    title: "你想举办什么类型的活动？",
    options: [
      { label: "年会", value: "年会" },
      { label: "团建", value: "团建" },
      { label: "客户活动", value: "客户活动" },
      { label: "保险行业活动", value: "保险行业活动" },
      { label: "品牌活动", value: "品牌活动" },
      { label: "商务沙龙", value: "商务沙龙" },
    ],
  },
  {
    id: "headcount",
    title: "预计参与人数？",
    options: [
      { label: "30人以内", value: "30人以内" },
      { label: "30-80人", value: "30-80人" },
      { label: "80-150人", value: "80-150人" },
      { label: "150-300人", value: "150-300人" },
      { label: "300人以上", value: "300人以上" },
    ],
  },
  {
    id: "city",
    title: "活动在哪个城市？",
    options: [
      { label: "成都", value: "成都" },
      { label: "其他城市", value: "其他" },
    ],
  },
  {
    id: "venue",
    title: "是否已有场地？",
    options: [
      { label: "已有", value: "已有" },
      { label: "需要推荐", value: "需要推荐" },
      { label: "不确定", value: "不确定" },
    ],
  },
  {
    id: "vibe",
    title: "想要什么样的活动效果？",
    options: [
      { label: "热闹好玩", value: "热闹好玩" },
      { label: "商务稳健", value: "商务稳健" },
      { label: "客户关系维护", value: "客户关系维护" },
      { label: "团队融合", value: "团队融合" },
      { label: "品牌传播", value: "品牌传播" },
      { label: "员工减压", value: "员工减压" },
    ],
  },
  {
    id: "budget",
    title: "你的预算范围？",
    options: [
      { label: "5千以内", value: "5千以内" },
      { label: "5千-1万", value: "5千-1万" },
      { label: "1万-2万", value: "1万-2万" },
      { label: "2万-5万", value: "2万-5万" },
      { label: "5万以上", value: "5万以上" },
      { label: "还不确定", value: "还不确定" },
    ],
  },
];

export interface BudgetResult {
  rangeLabel: string;
  rangeMin: number;
  rangeMax: number;
  verdict: string;
  recommendations: { artist: string; count: number; duration: string; note?: string }[];
  costBreakdown: { label: string; percentage: number; detail: string }[];
  tips: string[];
  risks: string[];
}

// 3套结果模板：低预算、中预算、高预算
export function getBudgetResult(answers: Record<string, string>): BudgetResult {
  const budget = answers.budget || "";
  const headcount = answers.headcount || "";
  const vibe = answers.vibe || "";

  // 低预算 (5千以内 / 5千-1万)
  if (budget === "5千以内" || budget === "5千-1万") {
    return {
      rangeLabel: budget === "5千以内" ? "3,000 - 5,000 元" : "6,000 - 10,000 元",
      rangeMin: budget === "5千以内" ? 3000 : 6000,
      rangeMax: budget === "5千以内" ? 5000 : 10000,
      verdict: "预算偏紧，但通过精选1-2个核心节目，仍能做出有记忆点的活动。",
      recommendations: [
        { artist: "脱口秀演员", count: 1, duration: "30分钟", note: "核心内容，性价比最高" },
        { artist: "即兴互动主持", count: 1, duration: "15分钟" },
      ],
      costBreakdown: [
        { label: "演员演出费", percentage: 70, detail: "约 2,800 - 7,000 元" },
        { label: "内容定制费", percentage: 15, detail: "约 600 - 1,500 元" },
        { label: "活动统筹费", percentage: 15, detail: "约 600 - 1,500 元" },
      ],
      tips: [
        "预算有限时，优先保留核心演出内容（脱口秀/音乐），互动环节可内部同事客串。",
        "选择成都本地演员可省去差旅成本。",
      ],
      risks: headcount.includes("150") || headcount.includes("300")
        ? ["人数较多但预算偏低，建议控制演出时长在30分钟内，避免过度承诺。"]
        : [],
    };
  }

  // 高预算 (2万-5万 / 5万以上)
  if (budget === "2万-5万" || budget === "5万以上") {
    return {
      rangeLabel: budget === "2万-5万" ? "20,000 - 50,000 元" : "50,000 - 120,000 元",
      rangeMin: budget === "2万-5万" ? 20000 : 50000,
      rangeMax: budget === "2万-5万" ? 50000 : 120000,
      verdict: "预算充裕，可以打造一场高品质、多层次的演出活动，给参会者留下深刻印象。",
      recommendations: [
        { artist: "脱口秀演员", count: 3, duration: "60分钟", note: "多卡司阵容，风格互补" },
        { artist: "音乐Live表演", count: 1, duration: "25分钟", note: "可选爵士/bossa nova" },
        { artist: "企业定制段子", count: 1, duration: "5分钟", note: "融入企业文化和热点" },
        { artist: "即兴互动", count: 1, duration: "20分钟" },
      ],
      costBreakdown: [
        { label: "演员演出费", percentage: 55, detail: "约 11,000 - 66,000 元" },
        { label: "内容定制费", percentage: 25, detail: "约 5,000 - 30,000 元" },
        { label: "活动统筹费", percentage: 20, detail: "约 4,000 - 24,000 元" },
      ],
      tips: [
        "建议搭配开场+主演出+互动+收尾的结构，营造完整活动体验。",
        "可考虑增加企业定制内容，增强品牌归属感。",
      ],
      risks: vibe.includes("商务")
        ? ["预算较高的情况下，注意控制娱乐内容比例，保持商务活动调性。"]
        : [],
    };
  }

  // 中预算 (1万-2万 / 不确定)
  return {
    rangeLabel: "10,000 - 20,000 元",
    rangeMin: 10000,
    rangeMax: 20000,
    verdict: "预算适中，可以做一个有品质的活动。建议把预算集中在1-2个核心节目上，效果更好。",
    recommendations: [
      { artist: "脱口秀演员", count: 2, duration: "45分钟", note: "双人组合更有层次" },
      { artist: "即兴互动", count: 1, duration: "15分钟" },
    ],
    costBreakdown: [
      { label: "演员演出费", percentage: 60, detail: "约 6,000 - 12,000 元" },
      { label: "内容定制费", percentage: 20, detail: "约 2,000 - 4,000 元" },
      { label: "活动统筹费", percentage: 20, detail: "约 2,000 - 4,000 元" },
    ],
    tips: [
      "中预算的重点是「做精不做多」——1-2个高质量节目比一堆凑数节目效果好得多。",
      "可预留10%预算作为应急备用金。",
    ],
    risks: [],
  };
}

// --------------- 保险活动方案生成器 ---------------

export interface InsuranceQuestion {
  id: string;
  title: string;
  options: { label: string; value: string }[];
}

export const insuranceQuestions: InsuranceQuestion[] = [
  {
    id: "goal",
    title: "这次活动的主要目标是什么？",
    options: [
      { label: "客户经营", value: "客户经营" },
      { label: "产说会暖场", value: "产说会暖场" },
      { label: "增员招募", value: "增员招募" },
      { label: "团队激励", value: "团队激励" },
      { label: "表彰庆典", value: "表彰庆典" },
      { label: "高端客户私享", value: "高端客户私享" },
      { label: "新人培训/团队融合", value: "新人培训" },
    ],
  },
  {
    id: "headcount",
    title: "预计参与人数？",
    options: [
      { label: "30人以内", value: "30人以内" },
      { label: "30-80人", value: "30-80人" },
      { label: "80-150人", value: "80-150人" },
      { label: "150人以上", value: "150人以上" },
    ],
  },
  {
    id: "audience",
    title: "主要参与对象是？",
    options: [
      { label: "老客户", value: "老客户" },
      { label: "高净值客户", value: "高净值客户" },
      { label: "准客户", value: "准客户" },
      { label: "代理人团队", value: "代理人团队" },
      { label: "新人团队", value: "新人团队" },
      { label: "团队主管", value: "团队主管" },
      { label: "混合人群", value: "混合人群" },
    ],
  },
  {
    id: "atmosphere",
    title: "希望现场氛围是怎样的？",
    options: [
      { label: "商务稳健", value: "商务稳健" },
      { label: "轻松破冰", value: "轻松破冰" },
      { label: "热烈互动", value: "热烈互动" },
      { label: "有仪式感", value: "有仪式感" },
      { label: "温暖走心", value: "温暖走心" },
      { label: "年轻活泼", value: "年轻活泼" },
    ],
  },
  {
    id: "budget",
    title: "活动预算范围？",
    options: [
      { label: "5千以内", value: "5千以内" },
      { label: "5千-1万", value: "5千-1万" },
      { label: "1万-2万", value: "1万-2万" },
      { label: "2万-5万", value: "2万-5万" },
      { label: "5万以上", value: "5万以上" },
      { label: "不确定", value: "不确定" },
    ],
  },
  {
    id: "insuranceIntegration",
    title: "是否需要与保险主题结合？",
    options: [
      { label: "只需要暖场", value: "只需要暖场" },
      { label: "轻度结合", value: "轻度结合" },
      { label: "需要定制内容", value: "需要定制内容" },
      { label: "需要主持串联", value: "需要主持串联" },
      { label: "不确定", value: "不确定" },
    ],
  },
  {
    id: "reportToBoss",
    title: "是否需要汇报给上级？",
    options: [
      { label: "是，需要方案材料", value: "需要方案材料" },
      { label: "否，只想先了解形式", value: "不需要" },
    ],
  },
];

export interface InsuranceResult {
  activityTypeLabel: string;
  activityTypeDesc: string;
  timeline: { phase: string; duration: string; content: string }[];
  contentCombo: { item: string; reason: string }[];
  bossReportScript: string;
  businessRisks: string[];
}

export function getInsuranceResult(
  answers: Record<string, string>
): InsuranceResult {
  const goal = answers.goal || "";
  const audience = answers.audience || "";
  const atmosphere = answers.atmosphere || "商务稳健";
  const integration = answers.insuranceIntegration || "只需要暖场";
  const needReport = answers.reportToBoss || "";

  // 根据目标确定活动类型
  const typeMap: Record<string, { label: string; desc: string }> = {
    客户经营: {
      label: "客户关系维护型活动",
      desc: "以轻松内容拉近客户关系，降低后续业务沟通门槛。适合老客户和准客户的日常经营场景。",
    },
    产说会暖场: {
      label: "产品说明会暖场型活动",
      desc: "在产品说明会前用轻松内容活跃气氛，提升客户参与度和信息接收意愿。",
    },
    增员招募: {
      label: "增员招募吸引型活动",
      desc: "通过展示团队文化和活力，吸引潜在人才关注保险行业和团队。",
    },
    团队激励: {
      label: "团队激励赋能型活动",
      desc: "以轻松互动内容缓解团队压力，提升团队凝聚力和幸福感。",
    },
    表彰庆典: {
      label: "表彰庆典仪式型活动",
      desc: "在正式表彰环节中穿插轻松演出，让庆典既有仪式感又不失温度。",
    },
    高端客户私享: {
      label: "高端客户私享型活动",
      desc: "以小规模高品质演出内容，为高净值客户打造专属私享体验。",
    },
    新人培训: {
      label: "新人融合赋能型活动",
      desc: "通过轻松互动帮助新人快速融入团队，建立归属感和职业认同。",
    },
  };

  const typeInfo = typeMap[goal] || typeMap["客户经营"];

  // 时间线推荐
  const timeline = [
    { phase: "开场暖场", duration: "5-8分钟", content: "主持人介绍活动背景，营造轻松氛围" },
    {
      phase: "核心演出",
      duration: "40-60分钟",
      content:
        atmosphere === "商务稳健"
          ? "脱口秀演员商务稳健型演出，内容聚焦职场/生活话题"
          : atmosphere === "热烈互动"
            ? "脱口秀+即兴互动，邀请观众参与，气氛热烈"
            : "脱口秀演出，风格轻松幽默，兼顾温馨和趣味",
    },
    {
      phase: "互动衔接",
      duration: "10-15分钟",
      content:
        integration === "需要定制内容" || integration === "需要主持串联"
          ? "主持人将保险主题自然融入互动，过渡到业务环节"
          : "轻松互动游戏或抽奖，营造愉快氛围",
    },
    { phase: "收尾致谢", duration: "3-5分钟", content: "主持人总结活动亮点，感谢参与" },
  ];

  // 内容组合
  const contentCombo: { item: string; reason: string }[] = [
    {
      item: "脱口秀演出",
      reason:
        audience.includes("高净值") || audience.includes("老客户")
          ? "内容偏商务/生活观察，不低俗不冒犯，适合成熟客群"
          : "轻松幽默，快速拉近距离，适合各类保险活动场景",
    },
    { item: "即兴互动", reason: "增加现场参与感，让客户/员工不是被动观看" },
  ];

  if (integration === "需要定制内容" || integration === "需要主持串联") {
    contentCombo.push({
      item: "保险主题内容嵌入",
      reason: "主持人或演员自然融入保险理念，不显突兀，提升活动与业务的关联度",
    });
  }

  if (atmosphere === "有仪式感" || goal === "表彰庆典" || goal === "高端客户私享") {
    contentCombo.push({
      item: "音乐Live表演",
      reason: "提升活动品质感，营造仪式氛围",
    });
  }

  // 商务风险
  const businessRisks: string[] = [];
  if (goal === "产说会暖场") {
    businessRisks.push("暖场时间不宜超过总活动时长的1/3，避免喧宾夺主影响产品说明效果。");
  }
  if (goal === "高端客户私享" || audience.includes("高净值")) {
    businessRisks.push("内容审查需严格把关，确保话题不涉及敏感领域，保持高端调性。");
  }
  if (atmosphere === "热烈互动") {
    businessRisks.push("互动环节需控制分寸，避免过度娱乐化影响保险行业专业形象。");
  }
  businessRisks.push(
    "建议提前与演员沟通活动性质，确保内容风格与保险行业/企业调性匹配。"
  );

  // 上级汇报话术
  const bossReportScript =
    needReport === "需要方案材料"
      ? `【活动方案汇报】\n\n本次活动定位为「${typeInfo.label}」，核心价值如下：\n\n1. **活动不是单纯娱乐**：通过轻松内容降低客户/员工沟通门槛，为后续保险业务/团队管理创造有利氛围。\n\n2. **内容策略**：选择商务稳健/轻松幽默的脱口秀作为主内容，搭配即兴互动提升参与度${integration === "需要定制内容" || integration === "需要主持串联" ? "，并融入保险主题进行软性传递" : ""}。\n\n3. **成本效益**：相比传统歌舞/场地搭建活动，脱口秀类内容投入产出比更高，且可复用性强。\n\n4. **预期效果**：提升参与度与满意度，为客户关系维护/团队建设/业务转化提供支撑。\n\n建议审批方向：同意活动方案，按预算执行。`
      : "";

  return {
    activityTypeLabel: typeInfo.label,
    activityTypeDesc: typeInfo.desc,
    timeline,
    contentCombo,
    bossReportScript,
    businessRisks,
  };
}

// --------------- 通用 ---------------

export type ToolType = "budget" | "insurance" | "annual";

// --------------- 企业年会/团建方案生成器 ---------------

export const annualPlanQuestions = [
  {
    id: "activityType",
    title: "你想举办什么类型的活动？",
    options: [
      { label: "年会", value: "年会" },
      { label: "团建", value: "团建" },
      { label: "部门活动", value: "部门活动" },
      { label: "员工减压", value: "员工减压" },
      { label: "企业文化活动", value: "企业文化活动" },
      { label: "周年庆", value: "周年庆" },
    ],
  },
  {
    id: "headcount",
    title: "预计参与人数？",
    options: [
      { label: "30人以内", value: "30人以内" },
      { label: "30-80人", value: "30-80人" },
      { label: "80-150人", value: "80-150人" },
      { label: "150-300人", value: "150-300人" },
      { label: "300人以上", value: "300人以上" },
    ],
  },
  {
    id: "ageGroup",
    title: "员工年龄层以哪类为主？",
    options: [
      { label: "95后/00后较多", value: "95后" },
      { label: "85后/90后较多", value: "85后" },
      { label: "年龄跨度大", value: "跨度大" },
      { label: "管理层较多", value: "管理层" },
    ],
  },
  {
    id: "goal",
    title: "最想解决什么问题？",
    options: [
      { label: "活跃气氛", value: "活跃气氛" },
      { label: "团队破冰", value: "团队破冰" },
      { label: "减压放松", value: "减压放松" },
      { label: "增强凝聚力", value: "增强凝聚力" },
      { label: "年终仪式感", value: "年终仪式感" },
      { label: "避免节目尴尬", value: "避免节目尴尬" },
    ],
  },
  {
    id: "budget",
    title: "预算范围？",
    options: [
      { label: "5千以内", value: "5千以内" },
      { label: "5千-1万", value: "5千-1万" },
      { label: "1万-2万", value: "1万-2万" },
      { label: "2万-5万", value: "2万-5万" },
      { label: "5万以上", value: "5万以上" },
    ],
  },
  {
    id: "venue",
    title: "是否已有场地？",
    options: [
      { label: "有", value: "有" },
      { label: "没有", value: "没有" },
      { label: "需要推荐", value: "需要推荐" },
    ],
  },
];

export interface AnnualPlanResult {
  styleAdvice: string;
  planStructure: { name: string; duration: string; detail: string }[];
  config: { item: string; reason: string }[];
  budgetAdvice: string;
  bossReport: string;
}

// 3套结果模板
function makeAnnualResult(
  styleAdvice: string,
  planStructure: { name: string; duration: string; detail: string }[],
  config: { item: string; reason: string }[],
  budgetAdvice: string,
  bossReport: string,
): AnnualPlanResult {
  return { styleAdvice, planStructure, config, budgetAdvice, bossReport };
}

export function getAnnualPlanResult(answers: Record<string, string>): AnnualPlanResult {
  const activityType = answers.activityType || "";
  const headcount = answers.headcount || "";
  const goal = answers.goal || "";
  const ageGroup = answers.ageGroup || "";
  const budget = answers.budget || "";
  const venue = answers.venue || "";

  // 模板1：年会方案（年会 + 150-300人 + 活跃气氛）
  if (activityType === "年会" && (headcount === "150-300人" || headcount === "300人以上") && (goal === "活跃气氛" || goal === "避免节目尴尬" || goal === "年终仪式感")) {
    return makeAnnualResult(
      "建议走「轻量脱口秀 + 即兴互动」路线，轻松幽默但不失仪式感。避免传统歌舞节目的排练压力和高成本，用专业演员撑起全场气氛。",
      [
        { name: "主持开场", duration: "5分钟", detail: "专业主持人破冰暖场，快速带起轻松氛围" },
        { name: "脱口秀演出", duration: "45-60分钟", detail: "2-3位脱口秀演员轮番上阵，内容覆盖职场、生活话题" },
        { name: "企业定制段子", duration: "3-5分钟", detail: "融入公司文化和年度热梗，专属定制笑点" },
        { name: "即兴互动", duration: "15分钟", detail: "邀请员工上台参与即兴游戏，全场爆笑" },
        { name: "合影/收尾", duration: "5分钟", detail: "全员合影，仪式感收尾" },
      ],
      [
        { item: "脱口秀演出", reason: "核心内容，性价比高、不挑场地、员工接受度好" },
        { item: "企业定制内容", reason: "融入公司文化，让员工有归属感和自豪感" },
        { item: "即兴互动", reason: "打破传统年会「台上演、台下看」的尴尬，让每一个人都可能成为焦点" },
      ],
      budget === "5万以上" || budget === "2万-5万"
        ? `预算${budget}，可以配置2-3位优质脱口秀演员 + 主持人 + 即兴环节，整体品质有保障。如含差旅需另计。`
        : `预算${budget || "有限"}，建议精简为1-2位演员加主持人组合，聚焦核心演出质量而非数量。`,
      `【年会活动方案建议】\n\n一、核心问题：传统年会员工参与度低，节目排练压力大。\n\n二、解决方案：引入专业脱口秀+即兴互动形式，替代传统歌舞排练，降低组织成本。\n\n三、预期效果：\n· 员工参与度提升：即兴互动环节让员工成为参与者\n· 组织成本降低：无需员工排练，专业演员直接演出\n· 传播价值：脱口秀内容适合拍照/录视频传播\n\n四、预算：${budget || "待定"}元，含演员费、内容定制费、统筹费。`,
    );
  }

  // 模板2：团建方案（团建 + 30-80人 + 团队破冰）
  if (activityType === "团建" || goal === "团队破冰" || goal === "增强凝聚力" || activityType === "部门活动") {
    return makeAnnualResult(
      "走「即兴喜剧 + 团队共创游戏」路线，用轻松互动替代传统拓展训练。不喊口号、不搞体能，用笑声让团队自然靠近。",
      [
        { name: "破冰暖场", duration: "10分钟", detail: "即兴演员带领趣味破冰游戏，快速消除陌生感" },
        { name: "即兴喜剧表演", duration: "30分钟", detail: "邀请员工作为灵感来源，即兴创作喜剧场景" },
        { name: "团队共创游戏", duration: "20-30分钟", detail: "即兴工作坊形式，协作完成趣味挑战" },
        { name: "分享交流", duration: "15分钟", detail: "轻松氛围下的团队感受分享" },
      ],
      [
        { item: "即兴喜剧演出", reason: "互动性强，每个人都可以参与，打破层级壁垒" },
        { item: "团队共创游戏", reason: "不需要体力、不需要特长，所有人都能玩起来" },
        { item: "主持人引导", reason: "专业主持人控场，确保氛围轻松但不散漫" },
      ],
      headcount === "30人以内"
        ? `${headcount}规模，预算${budget || "适中"}，1-2位即兴演员 + 主持人即可。资金使用效率高。`
        : headcount === "30-80人"
          ? `${headcount}规模，预算${budget || "适中"}，建议2-3位演员保证互动覆盖。`
          : `建议增加演员人数以确保互动质量。`,
      `【团建活动方案建议】\n\n一、背景：传统团建（拓展训练/聚餐/KTV）参与度低，形式雷同。\n\n二、创新方案：即兴喜剧+团队共创，用幽默打破隔阂，在笑声中自然建立信任。\n\n三、核心优势：\n· 不挑场地：办公室/会议室/餐厅均可\n· 不挑体能：全员可参与，无需特殊技能\n· 情绪价值高：笑声是最好的团建\n\n四、预算：${budget || "待定"}元。`,
    );
  }

  // 模板3：员工减压方案（减压 + 95后为主 + 轻互动）
  return makeAnnualResult(
    "推荐「轻互动脱口秀 + 自由交流」的形式。轻松不沉重，让大家在笑声中释放压力。不需要复杂的组织流程，主打松弛感和真实感。",
    [
      { name: "脱口秀暖场", duration: "30分钟", detail: "演员带来轻松幽默的职场/生活段子，快速解压" },
      { name: "互动游戏", duration: "15分钟", detail: "轻量级互动，自愿参与不强制" },
      { name: "自由交流", duration: "不限", detail: "活动后自由社交，轻松延续" },
    ],
    [
      { item: "脱口秀演出", reason: "轻松幽默，不占用太多注意力，适合放松场景" },
      { item: "轻互动环节", reason: "给想参与的人提供机会，不强迫社交" },
      { item: "茶歇/饮品", reason: "搭配轻松氛围，提升整体体验" },
    ],
    budget === "5千以内"
      ? `预算偏紧但可行：1位脱口秀演员30分钟演出，重点放在演出质量和氛围营造。`
      : `预算${budget || "适中"}，可配置1-2位演员和茶歇安排，性价比高。`,
    `【员工减压活动建议】\n\n一、洞察：${ageGroup === "95后" ? "95后员工偏好轻松真实的体验，排斥形式化活动" : "员工需要真正放松的活动，而非额外的负担"}。\n\n二、方案：轻量脱口秀+自由交流，把「解压」真正落到实处。\n\n三、亮点：\n· 不强制参与：自由来去\n· 不占用休息时间\n· 有品质的内容体验\n\n四、预算：${budget || "待定"}元。`,
  );
}

export interface LeadData {
  name: string;
  company: string;
  phone: string;
  wechat?: string;
  trigger: "download" | "advisor" | "formal";
}
