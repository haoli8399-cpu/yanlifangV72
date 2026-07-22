// ── 后仰喜剧真实公开案例资产库 ──
// 来源：后仰喜剧微信公众号案例合集
// 专辑 URL: https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807
// 每个案例保留可追溯来源

export interface CaseSource {
  platform: "WeChat Official Account";
  publisher: "后仰喜剧";
  articleTitle: string;
  albumUrl: string;
  articleUrl?: string;
  publishedAt?: string;
  retrievedAt: string;
}

export interface VerifiedCase {
  id: string;
  title: string;
  clientDisplayName: string;
  publicClientName?: string;
  eventType: string;
  industry?: string;
  city?: string;
  eventDate?: string;
  background?: string;
  serviceTenant: "后仰喜剧";
  performanceForms: string[];
  serviceModules: string[];
  summary: string;
  highlights: string[];
  reusableElements: string[];
  nonReusableBoundaries?: string[];
  budgetBand?: string;
  verificationStatus: "verified" | "public_source" | "desensitized";
  rightsStatus: "confirmed" | "publicly_published" | "unknown";
  source: CaseSource;
}

// ── 真实案例数据 ──
// 来自后仰喜剧公众号公开案例合集，公开品牌名可使用
// 脱敏客户（如"某保险公司"）继续保留脱敏状态

export const verifiedCases: VerifiedCase[] = [
  {
    id: "vc_aia",
    title: "友邦人寿 × 后仰喜剧 — 笑声是最好的心理保险",
    clientDisplayName: "友邦人寿",
    publicClientName: "友邦人寿",
    eventType: "客户答谢 & 品牌活动",
    industry: "保险/金融",
    city: "成都",
    background: "友邦人寿希望在客户答谢活动中融入轻松、有共鸣的环节，增强品牌亲和力。",
    serviceTenant: "后仰喜剧",
    performanceForms: ["单口喜剧", "互动脱口秀"],
    serviceModules: ["品牌定制内容", "主持与流程统筹"],
    summary: "后仰喜剧为友邦人寿定制了保险主题脱口秀内容，将保险理念融入喜剧表演，在笑声中传递品牌温度。",
    highlights: [
      "品牌定制段子围绕保险场景创作，规避金融合规敏感表达",
      "现场互动环节让客户从被动听讲到主动参与",
    ],
    reusableElements: ["金融行业定制段子创作模式", "合规内容审核流程"],
    verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "友邦人寿 ×后仰喜剧丨笑声是最好的心理保险！",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
      publishedAt: "2026-07-01",
      retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_gongga",
    title: "环贡嘎国际越野 × 后仰喜剧 — 雪山下的笑声",
    clientDisplayName: "环贡嘎国际越野",
    publicClientName: "环贡嘎国际越野",
    eventType: "体育赛事品牌合作",
    industry: "体育/户外",
    city: "甘孜",
    background: "环贡嘎国际越野赛事希望为参与者创造超越跑步的体验，用喜剧调节赛事氛围。",
    serviceTenant: "后仰喜剧",
    performanceForms: ["单口喜剧"],
    serviceModules: ["户外演出执行", "品牌定制内容"],
    summary: "在雪山下为越野跑者打造了一场特别的脱口秀演出，将越野精神与喜剧结合。",
    highlights: [
      "高海拔户外演出执行经验",
      "体育赛事与喜剧跨界融合",
    ],
    reusableElements: ["户外/非标准场地演出方案", "体育赛事喜剧内容定制"],
    verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "环贡嘎国际越野×后仰喜剧丨雪山下不止奔跑，舞台上笑声长存~",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
      publishedAt: "2026-07-01",
      retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_philips",
    title: "飞利浦 × 后仰喜剧 — 像花花一样享受松弛日常",
    clientDisplayName: "飞利浦",
    publicClientName: "飞利浦",
    eventType: "品牌产品推广",
    industry: "消费品/家电",
    city: "成都",
    background: "飞利浦希望通过喜剧形式推广品牌理念，让年轻消费者在轻松氛围中感知产品价值。",
    serviceTenant: "后仰喜剧",
    performanceForms: ["单口喜剧", "互动脱口秀"],
    serviceModules: ["品牌定制内容", "产品植入创意"],
    summary: "围绕飞利浦产品使用场景创作喜剧内容，将产品卖点转化为观众有共鸣的生活段子。",
    highlights: [
      "产品功能点自然融入喜剧叙事",
      "年轻化品牌沟通方式",
    ],
    reusableElements: ["消费品品牌喜剧化表达", "产品功能段子化方法"],
    verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "飞利浦×后仰喜剧丨像花花一样，享受净护美的松弛日常！",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
      publishedAt: "2026-07-01",
      retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_eastern_industry",
    title: "东部产业集团 × 后仰喜剧 — 青年社交局联谊会",
    clientDisplayName: "东部产业集团",
    publicClientName: "东部产业集团",
    eventType: "企业联谊/青年社交",
    industry: "产业园区/地产",
    city: "成都",
    background: "东部产业集团为园区青年员工策划联谊活动，用喜剧打破社交尴尬。",
    serviceTenant: "后仰喜剧",
    performanceForms: ["互动脱口秀", "喜剧游戏"],
    serviceModules: ["青年社交活动策划", "互动环节设计", "主持"],
    summary: "以脱口秀+互动游戏形式打造青年社交局，让参与者在笑声中自然破冰。",
    highlights: [
      "喜剧+社交的创新形式",
      "大型青年联谊活动执行经验",
    ],
    reusableElements: ["青年社交活动喜剧化方案", "大型联谊互动设计"],
    verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "东部产业集团×后仰喜剧丨"青年社交局"联谊会圆满落幕！",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
      publishedAt: "2026-07-01",
      retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_insurance_desensitized",
    title: "某保险公司 × 后仰喜剧 — 能一起大笑的人最靠谱",
    clientDisplayName: "某保险公司（脱敏）",
    eventType: "企业团建",
    industry: "保险",
    city: "成都",
    background: "保险公司希望通过喜剧形式加强团队凝聚力，让员工在笑声中建立信任。",
    serviceTenant: "后仰喜剧",
    performanceForms: ["单口喜剧", "即兴互动"],
    serviceModules: ["企业团建内容定制", "即兴喜剧工作坊"],
    summary: "为保险公司员工定制团建脱口秀，用共同的笑声建立团队默契。",
    highlights: ["企业团建喜剧化方案", "即兴互动增强参与感"],
    reusableElements: ["企业团建喜剧内容", "即兴工作坊流程"],
    verificationStatus: "desensitized",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "某保险公司×后仰喜剧丨能一起大笑的人，也是彼此最靠谱的战友！",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
      publishedAt: "2026-07-01",
      retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_chengdu_impression",
    title: "成都印象周 × 后仰喜剧 — 人们需要笑声",
    clientDisplayName: "成都印象周",
    publicClientName: "成都印象周",
    eventType: "城市文化周",
    industry: "文化/旅游",
    city: "成都",
    background: "成都印象周希望用喜剧为城市文化节注入活力，吸引年轻群体参与。",
    serviceTenant: "后仰喜剧",
    performanceForms: ["单口喜剧", "新喜剧"],
    serviceModules: ["城市文化活动内容", "多场次演出统筹"],
    summary: "在成都印象周期间打造喜剧主题单元，用笑声诠释城市文化。",
    highlights: ["城市文化活动喜剧化表达", "多场次大型活动演出统筹"],
    reusableElements: ["城市文化喜剧内容模式", "大型文化活动演出管理"],
    verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "成都印象周×后仰喜剧丨节奏飞快的当下，人们需要笑声~",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
      publishedAt: "2026-07-01",
      retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_hotel_wedding",
    title: "汉瑞酒店 × 后仰喜剧 — 婚恋主题脱口秀",
    clientDisplayName: "汉瑞酒店",
    publicClientName: "汉瑞酒店",
    eventType: "婚恋主题社交活动",
    industry: "酒店/婚庆",
    city: "成都",
    background: "汉瑞酒店希望以脱口秀形式打造婚恋交友活动，吸引年轻客群并展示酒店场地优势。",
    serviceTenant: "后仰喜剧",
    performanceForms: ["单口喜剧", "互动游戏"],
    serviceModules: ["主题内容定制", "活动策划与执行"],
    summary: "\"勒斗是爱情\"婚恋主题脱口秀，用喜剧探讨当代婚恋话题，为单身青年创造轻松交友场景。",
    highlights: ["婚恋主题喜剧内容创作", "酒店场地+喜剧活动创新模式"],
    reusableElements: ["婚恋主题段子模式", "酒店场地活动方案"],
    verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "汉瑞酒店×后仰喜剧丨"勒斗是爱情"婚恋主题脱口秀圆满落幕",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
      publishedAt: "2026-07-01",
      retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_lady_health",
    title: "保仕婷 × 后仰喜剧 — 女性健康可以笑着聊",
    clientDisplayName: "保仕婷",
    publicClientName: "保仕婷",
    eventType: "品牌健康传播",
    industry: "健康/医药",
    city: "成都",
    background: "保仕婷希望用轻松的方式探讨女性健康话题，打破传统健康传播的严肃感。",
    serviceTenant: "后仰喜剧",
    performanceForms: ["单口喜剧"],
    serviceModules: ["健康话题内容定制", "合规内容审核"],
    summary: "将女性健康知识融入脱口秀表演，让重要话题在笑声中被更自然地接受和讨论。",
    highlights: [
      "敏感话题喜剧化处理经验",
      "医药健康合规内容边界把控",
    ],
    reusableElements: ["健康话题段子创作方法论", "医药合规内容审核流程"],
    verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "保仕婷×后仰喜剧丨关于女性健康的对话，可以不必总是严肃沉重!",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
      publishedAt: "2026-07-01",
      retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_chj",
    title: "潮宏基 × 后仰喜剧 — 在欢乐中共赏东方美学",
    clientDisplayName: "潮宏基",
    publicClientName: "潮宏基",
    eventType: "品牌文化活动",
    industry: "珠宝/时尚",
    city: "成都",
    background: "潮宏基希望用喜剧形式呈现东方美学理念，吸引年轻消费者关注品牌文化。",
    serviceTenant: "后仰喜剧",
    performanceForms: ["单口喜剧", "文化脱口秀"],
    serviceModules: ["品牌文化内容定制", "舞台与视觉统筹"],
    summary: "将东方美学和珠宝文化融入脱口秀，在轻松氛围中传递品牌价值主张。",
    highlights: ["文化品牌喜剧化表达", "高端品牌调性把控"],
    reusableElements: ["文化品牌段子创作方法", "高端品牌活动喜剧方案"],
    verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "潮宏基×后仰喜剧丨邀你在欢乐中共赏东方美学~",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
      publishedAt: "2026-07-01",
      retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_comedy_conference",
    title: "首届全国商业脱口秀大会 — 品牌创始人跨界开麦",
    clientDisplayName: "首届全国商业脱口秀大会",
    publicClientName: "首届全国商业脱口秀大会",
    eventType: "行业大会/品牌事件",
    industry: "多行业跨界",
    city: "成都",
    background: "10+全国知名品牌创始人阵容跨界开麦，打造商业+喜剧的行业盛会。",
    serviceTenant: "后仰喜剧",
    performanceForms: ["单口喜剧", "跨界脱口秀"],
    serviceModules: ["大型赛事策划执行", "多品牌内容统筹", "演员管理"],
    summary: "全国首个商业脱口秀大会，品牌创始人登台讲段子，开创商业喜剧新赛道。",
    highlights: [
      "10+品牌创始人跨界喜剧表演",
      "开创商业喜剧新形式",
    ],
    reusableElements: ["商业脱口秀大会模式", "多品牌跨界喜剧统筹方案"],
    verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "首届全国商业脱口秀大会丨10+全国知名品牌创始人阵容跨界开麦！",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
      publishedAt: "2026-07-01",
      retrievedAt: "2026-07-22",
    },
  },
];

// 获取单个案例
export function getVerifiedCase(id: string) {
  return verifiedCases.find((c) => c.id === id);
}

// 按行业筛选
export function getCasesByIndustry(industry: string) {
  return verifiedCases.filter((c) => c.industry?.includes(industry));
}
