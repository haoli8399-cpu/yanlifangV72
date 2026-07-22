// 演立方 · 真实案例骨架(基于后仰喜剧公开活动画像整理)
//
// 边界声明:
// - 微信公众号内容涉及登录墙且明确禁止后端抓取,本文件为「基于公开活动类型/行业画像」的手写整理
// - 具体客户名一律用行业化描述("某互联网公司 / 某本地科技公司"),不虚构具体公司名
// - 成交金额、内部成本、毛利、演员结算价一律不列入
// - 若字段是为了 UI 完整性补足的示例数据,统一在 note 字段标注「示例」
// - 只保留可以合法引用的公开画像:活动类型、行业、大致规模、演出内容、参与演员
//
// 更新方式:后续若拿到公众号具体案例的公开授权,可在此文件补齐 title / 图片。

export type RealCase = {
  id: string;
  /** 活动画像标题(非真实客户名) */
  title: string;
  industry: string;
  scale: string;
  city: string;
  /** 预算区间——按行业画像估计,前端展示时会标注"示例" */
  budgetBand: string;
  /** 活动类型 */
  eventType: string;
  /** 后仰喜剧提供的核心服务 */
  services: string[];
  /** 参与演员(real-actors.ts 中的 id) */
  actorIds: string[];
  /** 现场亮点(来自演出内容合理归纳,不含具体客户结果) */
  highlights: string[];
  /** 说明数据边界 */
  note: string;
};

export const realCases: RealCase[] = [
  {
    id: "case_tech_kickoff",
    title: "成都本土科技公司 · 年度全员大会开场",
    industry: "科技 / 互联网",
    scale: "示例 · 300 人 · 酒店宴会厅",
    city: "成都",
    budgetBand: "示例 · 8–15 万",
    eventType: "年度全员大会 / Kickoff",
    services: [
      "定制脱口秀开场(20 分钟)",
      "主持串场",
      "公司年度关键词二次创作",
    ],
    actorIds: ["real_fengzihao", "real_7788"],
    highlights: [
      "以公司年度关键词做定制段子,替代 CEO 长篇致辞",
      "主持+段子一人包场,减少舞台人员进出",
      "内容 2 轮内评审,规避行业敏感话题",
    ],
    note: "示例活动画像 · 非具体客户;成交金额、客户结果不做真实事实性主张",
  },
  {
    id: "case_carbrand_dealer",
    title: "新势力车企 · 成都经销商答谢",
    industry: "汽车",
    scale: "示例 · 180 人 · 品牌体验中心",
    city: "成都",
    budgetBand: "示例 · 12–20 万",
    eventType: "经销商答谢 / 品牌活动",
    services: [
      "个人专场摘段表演(15 分钟)",
      "文化跨界主题串场",
    ],
    actorIds: ["real_aike"],
    highlights: [
      "从新疆到成都的跨地域故事呼应品牌'向新而行'主线",
      "取材公开个人专场,规避商演内容偏差风险",
      "与主视觉/宣传物料统一色调调性",
    ],
    note: "示例活动画像 · 非具体客户",
  },
  {
    id: "case_it_employee_care",
    title: "互联网公司 · 成都研发中心员工关怀之夜",
    industry: "互联网",
    scale: "示例 · 220 人 · 内部",
    city: "成都",
    budgetBand: "示例 · 6–10 万",
    eventType: "员工关怀 / 团建",
    services: [
      "互动脱口秀(30 分钟)",
      "现场氛围主持",
      "职场吐槽段子定制",
    ],
    actorIds: ["real_tuaner", "real_sangqiu", "real_litiechui"],
    highlights: [
      "以\"打工人共情\"为主线,替代传统颁奖流程",
      "互动脱口秀让现场员工上台参与,而非单向观看",
      "内容筛过 HR,避开涉密项目与人事敏感话题",
    ],
    note: "示例活动画像 · 非具体客户",
  },
  {
    id: "case_pharma_annual",
    title: "医药公司 · 年会健康主题晚宴",
    industry: "医药 / 健康",
    scale: "示例 · 260 人 · 五星酒店",
    city: "成都",
    budgetBand: "示例 · 15–25 万",
    eventType: "年会 / 客户答谢",
    services: [
      "健康主题脱口秀专场(25 分钟)",
      "开场主持",
    ],
    actorIds: ["real_qianlaoye", "real_fengzihao"],
    highlights: [
      "以身体调侃方式温和呼应行业主题,避免\"卖惨\"",
      "音乐(吉他)+脱口秀跨界作为收官高潮",
    ],
    note: "示例活动画像 · 非具体客户",
  },
  {
    id: "case_edu_openday",
    title: "教育机构 · 校园开放日家庭活动",
    industry: "教育",
    scale: "示例 · 400 人 · 校园礼堂",
    city: "成都",
    budgetBand: "示例 · 5–8 万",
    eventType: "开放日 / 家庭日",
    services: [
      "亲子友好脱口秀(2×15 分钟)",
      "校园主题主持",
    ],
    actorIds: ["real_yangxin", "real_xiaoyuan"],
    highlights: [
      "家庭视角段子适合家长+学生同席场景",
      "校园/农学梗贴近学生群体,不过度讨好",
    ],
    note: "示例活动画像 · 非具体客户",
  },
  {
    id: "case_finance_topclient",
    title: "本地财富管理 · 高净值客户答谢",
    industry: "金融",
    scale: "示例 · 80 人 · 精品酒店",
    city: "成都",
    budgetBand: "示例 · 10–18 万",
    eventType: "高净值客户答谢 / VIP 私宴",
    services: [
      "全能双拼 · 主持+单口一人包场(40 分钟)",
      "定制段子内容评审",
    ],
    actorIds: ["real_7788"],
    highlights: [
      "小场景客户,主持+表演统一人设,减少人员进出",
      "内容 2 轮内评审,规避金融合规敏感表达",
    ],
    note: "示例活动画像 · 非具体客户",
  },
];

export function realCaseById(id: string): RealCase | undefined {
  return realCases.find((c) => c.id === id);
}
