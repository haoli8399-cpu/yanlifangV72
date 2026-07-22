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

// 仅包含可通过公众号公开专辑验证的字段
// 详细内容（节目形式、活动效果等）需打开原文后才能补充
// 来源文章详情因微信反爬限制暂不可访问 — 2026-07-22

export interface VerifiedCase {
  id: string;
  title: string;
  clientDisplayName: string;
  publicClientName?: string;
  industry?: string;         // 客户所在行业（从公开品牌认知推断）
  serviceTenant: "后仰喜剧";
  verificationStatus: "public_source" | "desensitized";
  rightsStatus: "publicly_published" | "unknown";
  source: CaseSource;
  // 以下字段待原文验证后补充
  summary?: string;
  eventType?: string;
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
      industry: "保险/金融",
        serviceTenant: "后仰喜剧",
              verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "友邦人寿 ×后仰喜剧丨笑声是最好的心理保险！",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
          retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_gongga",
    title: "环贡嘎国际越野 × 后仰喜剧 — 雪山下的笑声",
    clientDisplayName: "环贡嘎国际越野",
    publicClientName: "环贡嘎国际越野",
      industry: "体育/户外",
        serviceTenant: "后仰喜剧",
              verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "环贡嘎国际越野×后仰喜剧丨雪山下不止奔跑，舞台上笑声长存~",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
          retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_philips",
    title: "飞利浦 × 后仰喜剧 — 像花花一样享受松弛日常",
    clientDisplayName: "飞利浦",
    publicClientName: "飞利浦",
      industry: "消费品/家电",
        serviceTenant: "后仰喜剧",
              verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "飞利浦×后仰喜剧丨像花花一样，享受净护美的松弛日常！",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
          retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_eastern_industry",
    title: "东部产业集团 × 后仰喜剧 — 青年社交局联谊会",
    clientDisplayName: "东部产业集团",
    publicClientName: "东部产业集团",
      industry: "产业园区/地产",
        serviceTenant: "后仰喜剧",
              verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "东部产业集团×后仰喜剧丨「青年社交局」联谊会圆满落幕！",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
          retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_insurance_desensitized",
    title: "某保险公司 × 后仰喜剧 — 能一起大笑的人最靠谱",
    clientDisplayName: "某保险公司（脱敏）",
      industry: "保险",
        serviceTenant: "后仰喜剧",
              verificationStatus: "desensitized",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "某保险公司×后仰喜剧丨能一起大笑的人，也是彼此最靠谱的战友！",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
          retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_chengdu_impression",
    title: "成都印象周 × 后仰喜剧 — 人们需要笑声",
    clientDisplayName: "成都印象周",
    publicClientName: "成都印象周",
      industry: "文化/旅游",
        serviceTenant: "后仰喜剧",
              verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "成都印象周×后仰喜剧丨节奏飞快的当下，人们需要笑声~",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
          retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_hotel_wedding",
    title: "汉瑞酒店 × 后仰喜剧 — 婚恋主题脱口秀",
    clientDisplayName: "汉瑞酒店",
    publicClientName: "汉瑞酒店",
      industry: "酒店/婚庆",
        serviceTenant: "后仰喜剧",
        summary: "\"勒斗是爱情\"婚恋主题脱口秀，用喜剧探讨当代婚恋话题，为单身青年创造轻松交友场景。",
        verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "汉瑞酒店×后仰喜剧丨「勒斗是爱情」婚恋主题脱口秀圆满落幕",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
          retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_lady_health",
    title: "保仕婷 × 后仰喜剧 — 女性健康可以笑着聊",
    clientDisplayName: "保仕婷",
    publicClientName: "保仕婷",
      industry: "健康/医药",
        serviceTenant: "后仰喜剧",
              verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "保仕婷×后仰喜剧丨关于女性健康的对话，可以不必总是严肃沉重!",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
          retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_chj",
    title: "潮宏基 × 后仰喜剧 — 在欢乐中共赏东方美学",
    clientDisplayName: "潮宏基",
    publicClientName: "潮宏基",
      industry: "珠宝/时尚",
        serviceTenant: "后仰喜剧",
              verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "潮宏基×后仰喜剧丨邀你在欢乐中共赏东方美学~",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
          retrievedAt: "2026-07-22",
    },
  },
  {
    id: "vc_comedy_conference",
    title: "首届全国商业脱口秀大会 — 品牌创始人跨界开麦",
    clientDisplayName: "首届全国商业脱口秀大会",
    publicClientName: "首届全国商业脱口秀大会",
      industry: "多行业跨界",
        serviceTenant: "后仰喜剧",
              verificationStatus: "public_source",
    rightsStatus: "publicly_published",
    source: {
      platform: "WeChat Official Account",
      publisher: "后仰喜剧",
      articleTitle: "首届全国商业脱口秀大会丨10+全国知名品牌创始人阵容跨界开麦！",
      albumUrl: "https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg2NTU1MjQ1Ng==&action=getalbum&album_id=3916958759251148807",
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
