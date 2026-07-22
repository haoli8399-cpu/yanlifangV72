// 演立方 · 真实演员事实源
// 事实来自用户上传的《演员介绍》文档（后仰喜剧签约/合作演员）。
// 未在文档中给出的字段一律标为 null 并给出 unknownReason,不得凭空虚构。
// 头像本文档未提供,统一使用 avatarSeed 生成首字母 avatar,标注"演员本人照片待补充"。

export type RealActor = {
  id: string;
  /** 姓名 / 艺名（原文） */
  name: string;
  /** 一行 title(风格 + 定位) */
  title: string;
  /** 常驻城市 —— 大多数后仰喜剧演员在成都工作 */
  city: string;
  tags: string[];
  /** 附件原文精简后的简介（未虚构） */
  bio: string;
  /** 主要荣誉 / 履历(原文) */
  honors: string[];
  /** 代表节目 / 专场(如有) */
  signaturePrograms: string[];
  /** 适合的活动类型(从"演出内容"合理归纳,不含具体客户) */
  fitFor: string[];
  /** 数据事实级别：true = 原文事实,false = 前端占位/推断 */
  isRealFact: true;
  /** 附件未提供、留空的字段 */
  unknown: {
    photo: "附件仅提供文字资料,未提供本人照片";
    schedule: "档期为真实业务信息,附件未涉及";
    quote: "报价为真实业务信息,附件未涉及";
    contact: "联系方式为真实业务信息,附件未涉及";
  };
  avatarSeed: string;
};

const UNKNOWN = {
  photo: "附件仅提供文字资料,未提供本人照片",
  schedule: "档期为真实业务信息,附件未涉及",
  quote: "报价为真实业务信息,附件未涉及",
  contact: "联系方式为真实业务信息,附件未涉及",
} as const;

export const realActors: RealActor[] = [
  {
    id: "real_fengzihao",
    name: "冯子豪",
    title: "00 后单口喜剧演员 · 后仰喜剧总编剧",
    city: "成都",
    tags: ["单口喜剧", "漫才", "校园/职场"],
    bio: "《脱口秀和 ta 的朋友们 3》卡司。漫才组合「逢考必过」吐槽担当,自带笑点的山东人,本职是老师,闯荡成都后的各种趣事是他段子的主线。",
    honors: [
      "《脱口秀和 ta 的朋友们 3》卡司",
      "个人专场《鲜花与面包》",
      "单立人原创喜剧大赛成都赛区冠军",
      "喜番新梗赛全国亚军",
    ],
    signaturePrograms: ["个人专场《鲜花与面包》", "漫才《逢考必过》"],
    fitFor: ["企业年会开场", "员工关怀", "教育/校园活动"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "fengzihao",
  },
  {
    id: "real_aike",
    name: "艾克",
    title: "脱口秀演员 · 蓉漂人才代表",
    city: "成都",
    tags: ["单口喜剧", "个人专场", "文化跨界"],
    bio: "新疆人,从事脱口秀 7 年,全网视频播放量破千万博主。大家对新疆人的好奇,在他专场里能听到多少。",
    honors: [
      "个人专场《太阳照常升起》",
      "笑果 Tight5 成都赛区冠军",
      "青年蓉漂人才代表",
      "全网视频播放量破千万",
    ],
    signaturePrograms: ["个人专场《太阳照常升起》"],
    fitFor: ["品牌活动", "文化主题晚宴", "城市推广活动"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "aike",
  },
  {
    id: "real_tuaner",
    name: "团儿",
    title: "00 后 · 主持 & 段子双修",
    city: "成都",
    tags: ["主持", "互动脱口秀", "现场氛围"],
    bio: "后仰喜剧常驻主持人。段子简单轻松,擅长从生活小事挖掘笑点。互动视频播放量超千万。",
    honors: [
      "上海第二届肆笑新人赛亚军",
      "个人互动专场《团儿秀》",
      "脱口秀互动视频播放量超千万",
    ],
    signaturePrograms: ["互动专场《团儿秀》"],
    fitFor: ["年会主持", "团建互动", "客户答谢串场"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "tuaner",
  },
  {
    id: "real_yangxin",
    name: "杨鑫",
    title: "脱口秀演员 · 生活/家庭视角",
    city: "成都",
    tags: ["单口喜剧", "生活观察", "女性视角"],
    bio: "《脱口秀和 ta 的朋友们 3》卡司。老公是先天脱口秀素材圣体。别具一格的段子,自带笑点一家人;不止笑点,还有生活琐事和烟火气。",
    honors: [
      "《脱口秀和 ta 的朋友们 3》卡司",
      "笑嘛黑马赛冠军",
    ],
    signaturePrograms: ["家庭视角脱口秀"],
    fitFor: ["家庭日", "员工关怀", "女性主题活动"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "yangxin",
  },
  {
    id: "real_7788",
    name: "77·88",
    title: "后仰喜剧签约 · 全能双拼",
    city: "成都",
    tags: ["单口喜剧", "新喜剧", "主持"],
    bio: "后仰喜剧全能演员,脱口秀和新喜剧双开花,两种喜剧风格一人包揽,主持、喜剧、单口样样行。",
    honors: [
      "双拼秀《成都玩家》Player1",
      "单口喜剧专场《垃圾飞行指南》",
      "第四届一支麦全国原创喜剧大赛冠军",
    ],
    signaturePrograms: ["双拼秀《成都玩家》", "单口专场《垃圾飞行指南》"],
    fitFor: ["企业年会主持+表演一人包场", "线下品牌活动"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "7788",
  },
  {
    id: "real_zhenyong",
    name: "真勇",
    title: "单口喜剧 · 云南边疆少年",
    city: "成都",
    tags: ["单口喜剧", "地域文化", "个人专场"],
    bio: "《喜剧之王单口季 2-3》卡司。拿自己开涮第一名的云南边疆少年,不管是口音还是内容都充满笑点。",
    honors: [
      "《喜剧之王单口季 2-3》卡司",
      "个人单口喜剧专场《哈尼路呀》",
      "后仰第四届新人赛冠军",
      "全国单排比赛成都赛区初赛冠军",
    ],
    signaturePrograms: ["个人专场《哈尼路呀》"],
    fitFor: ["文化多元性活动", "青年论坛", "员工文化日"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "zhenyong",
  },
  {
    id: "real_litiechui",
    name: "李铁锤",
    title: "脱口秀讲师 · 职场吐槽",
    city: "成都",
    tags: ["单口喜剧", "职场吐槽", "热点观察"],
    bio: "后仰喜剧单口喜剧教师。打工人没有不吐槽老板的,铁锤的段子非常共情,擅长从日常社会热点入手,实时更新。",
    honors: [
      "2023 脱口秀大会 Tight5 成都赛区入围",
    ],
    signaturePrograms: ["职场主题热点段子"],
    fitFor: ["公司周年庆", "员工吐槽大会", "HR/管理者复盘活动"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "litiechui",
  },
  {
    id: "real_qianlaoye",
    name: "钱大爷",
    title: "脱口秀演员 · 20 年摇滚老炮",
    city: "成都",
    tags: ["单口喜剧", "摇滚", "健康主题"],
    bio: "笑果 Tight5 直通选手。用幽默的方式讲述自己身体的问题,调侃的语气弱化不适,给同样身体抱恙的朋友一些力量。",
    honors: [
      "笑果 Tight5 直通选手",
      "单排喜剧训练营",
      "20 年摇滚老炮 · 乐队吉他手",
    ],
    signaturePrograms: ["健康主题脱口秀"],
    fitFor: ["医药行业年会", "健康公益活动", "音乐+喜剧跨界现场"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "qianlaoye",
  },
  {
    id: "real_xiaoyuan",
    name: "小源",
    title: "后仰新生代 · 主持型",
    city: "成都",
    tags: ["主持", "新生代", "校园"],
    bio: "后仰新生代,种地的男大学生,主持选手,接梗能力迅速。作为农学大学生总有说不完的搞笑事件。",
    honors: ["第四届撕摆秀第二名"],
    signaturePrograms: ["校园主题段子"],
    fitFor: ["高校活动", "青年主题活动", "轻量级串场主持"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "xiaoyuan",
  },
  {
    id: "real_huangzhiheng",
    name: "黄志恒",
    title: "漫才/单口 · 193 大帅哥",
    city: "成都",
    tags: ["漫才", "单口喜剧", "家庭故事"],
    bio: "有趣的家庭+发现有趣事物的人 = 最好笑的组合。线下段子没有冷场的。",
    honors: [
      "单立人原创喜剧大赛 2021 春季赛入围",
      "第六届单立人原创喜剧大赛入围",
      "喜番第二届全国漫才大赛亚军",
      "第四届王炸比赛入围",
    ],
    signaturePrograms: ["漫才组合表演"],
    fitFor: ["双人漫才环节", "婚庆答谢", "轻松家庭主题活动"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "huangzhiheng",
  },
  {
    id: "real_xiongyiding",
    name: "熊乙丁",
    title: "地狱笑话爱好者",
    city: "成都",
    tags: ["单口喜剧", "地狱笑话", "冷幽默"],
    bio: "从小体弱多病,吃过各种中药,现代版\"神农尝百草\",出梗思路新奇,爱好讲地狱笑话。",
    honors: [],
    signaturePrograms: ["冷幽默/地狱笑话专场段子"],
    fitFor: ["深夜脱口秀专场", "小众文化活动"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "xiongyiding",
  },
  {
    id: "real_sangqiu",
    name: "桑丘",
    title: "脱口秀演员 · 自嘲派",
    city: "成都",
    tags: ["单口喜剧", "自嘲", "职场"],
    bio: "沉溺加班,陷入瓶颈,创作困难。段子聚焦日常生活,从平淡当中挖掘笑料,以自嘲的形式面对生活点滴。",
    honors: [],
    signaturePrograms: ["职场自嘲段子"],
    fitFor: ["互联网/科技公司员工活动", "加班文化调侃"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "sangqiu",
  },
  {
    id: "real_daidai",
    name: "袋袋",
    title: "脱口秀演员 · 193 高富帅",
    city: "成都",
    tags: ["单口喜剧", "职场", "感情生活"],
    bio: "央企打工人后仰\"蕉太狼\"。日常生活和感情生活都是袋袋的拿手段子。",
    honors: [],
    signaturePrograms: ["央企职场段子"],
    fitFor: ["国企/央企员工活动", "白领主题活动"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "daidai",
  },
  {
    id: "real_alei",
    name: "阿雷",
    title: "朋克式脱口秀演员 · INFP",
    city: "成都",
    tags: ["单口喜剧", "解构式", "非典型"],
    bio: "二阶段 INFP,自认为是朋克式脱口秀演员,喜欢故意用点没心没肺的方式解构复杂世界。最喜欢的艺术家是罗曼·西格纳。目前在成都的天上从事安保工作。",
    honors: [],
    signaturePrograms: ["解构式脱口秀"],
    fitFor: ["文艺/设计行业活动", "非典型内容专场"],
    isRealFact: true,
    unknown: UNKNOWN,
    avatarSeed: "alei",
  },
];

/** 便捷查询 */
export function realActorById(id: string): RealActor | undefined {
  return realActors.find((a) => a.id === id);
}
