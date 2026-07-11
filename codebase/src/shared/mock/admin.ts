import { artists, customers, solutions } from "./data";
import { getFeedback } from "./feedbackLog";

export interface Agency {
  id: string;
  name: string;
  contact: string;
  phone: string;
  city: string;
  artistCount: number;
  status: "已入驻" | "审核中" | "已停用";
  settleAccount: string;
  gmv: number;
  rating: number;
}

export const agencies: Agency[] = [
  { id: "ag1", name: "笑果文化", contact: "刘一帆", phone: "138****0011", city: "上海", artistCount: 12, status: "已入驻", settleAccount: "招行 6225****8891", gmv: 3820000, rating: 4.9 },
  { id: "ag2", name: "单立人喜剧", contact: "石老板", phone: "139****2233", city: "北京", artistCount: 8, status: "已入驻", settleAccount: "工行 6222****5510", gmv: 1560000, rating: 4.7 },
  { id: "ag3", name: "太合音乐 · 乐队线", contact: "赵总", phone: "136****9988", city: "北京", artistCount: 15, status: "已入驻", settleAccount: "招行 6225****1120", gmv: 2680000, rating: 4.8 },
  { id: "ag4", name: "南方演艺经纪", contact: "陈慧", phone: "133****4402", city: "广州", artistCount: 6, status: "审核中", settleAccount: "—", gmv: 0, rating: 0 },
  { id: "ag5", name: "魔立方魔术工坊", contact: "李云天", phone: "137****6712", city: "杭州", artistCount: 4, status: "已入驻", settleAccount: "建行 6217****3390", gmv: 420000, rating: 4.6 },
];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  team: string;
  role: "超级管理员" | "运营主管" | "销售运营" | "财务" | "只读";
  status: "启用" | "停用";
  lastLogin: string;
}

export const adminUsers: AdminUser[] = [
  { id: "u1", name: "王总", email: "wang@yanlifang.com", team: "总部", role: "超级管理员", status: "启用", lastLogin: "2026-07-08 09:12" },
  { id: "u2", name: "刘华北", email: "liu.hb@yanlifang.com", team: "华北销售组", role: "运营主管", status: "启用", lastLogin: "2026-07-09 08:44" },
  { id: "u3", name: "张运营", email: "zhang@yanlifang.com", team: "华北销售组", role: "销售运营", status: "启用", lastLogin: "2026-07-09 10:02" },
  { id: "u4", name: "李运营", email: "li@yanlifang.com", team: "华东销售组", role: "销售运营", status: "启用", lastLogin: "2026-07-09 09:31" },
  { id: "u5", name: "王运营", email: "wangyy@yanlifang.com", team: "华南销售组", role: "销售运营", status: "启用", lastLogin: "2026-07-08 22:07" },
  { id: "u6", name: "钱财务", email: "qian@yanlifang.com", team: "财务中心", role: "财务", status: "启用", lastLogin: "2026-07-09 10:15" },
  { id: "u7", name: "赵实习", email: "zhao@yanlifang.com", team: "华东销售组", role: "只读", status: "停用", lastLogin: "2026-06-20 16:00" },
];

export const rolePermissions: Record<AdminUser["role"], string[]> = {
  超级管理员: ["*"],
  运营主管: ["商机:全部", "报价:全部", "SKU:读写", "艺人:读写", "反馈:查看", "团队:查看"],
  销售运营: ["商机:本人及团队", "报价:本人", "SKU:只读", "艺人:只读", "反馈:提交"],
  财务: ["订单:查看", "对账:读写", "发票:读写"],
  只读: ["商机:只读", "报价:只读"],
};

// ==================== 平台大盘时序 ====================

export interface TrendPoint {
  date: string;
  gmv: number;
  newOpps: number;
  quotations: number;
  wins: number;
}

export const trend30d: TrendPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  const base = 12 + Math.sin(i / 3) * 4 + i * 0.4;
  return {
    date: d.toISOString().slice(5, 10),
    gmv: Math.round((base * 12 + Math.random() * 20) * 10000),
    newOpps: Math.max(3, Math.round(base + Math.random() * 4)),
    quotations: Math.max(2, Math.round(base * 0.65 + Math.random() * 3)),
    wins: Math.max(1, Math.round(base * 0.28 + Math.random() * 2)),
  };
});

export const funnelData = [
  { stage: "新需求", value: 486 },
  { stage: "有效商机", value: 312 },
  { stage: "已报价", value: 208 },
  { stage: "谈判/确认", value: 126 },
  { stage: "已成交", value: 78 },
];

export const platformKpi = {
  monthGmv: 4860000,
  monthGmvDelta: 22.4,
  monthWins: 78,
  monthWinsDelta: 12,
  avgOrder: 62310,
  avgOrderDelta: 4.6,
  aiAdoptRate: 68.2,
  aiAdoptDelta: 5.1,
  quotationRate: 66.7,
  winRate: 37.5,
  activeCustomers: customers.length + 84,
  activeArtists: artists.length + 26,
};

// ==================== SKU 库（扩展 solutions） ====================

export interface SkuRecord {
  id: string;
  sku: string;
  name: string;
  tier: string;
  scene: string;
  applicableScenes: string[];
  headcountRange: [number, number];
  duration: number;
  price: number;
  cost: number;
  grossMargin: number;
  status: "上架" | "下架" | "草稿";
  usedCount: number;
  winRate: number;
  updatedAt: string;
  owner: string;
}

export const skuLibrary: SkuRecord[] = solutions.map((s, i) => ({
  id: s.id,
  sku: s.sku,
  name: s.name,
  tier: s.tier,
  scene: s.scene,
  applicableScenes: s.applicableScenes,
  headcountRange: s.headcountRange,
  duration: s.durationMinutes,
  price: s.price,
  cost: s.cost,
  grossMargin: Math.round((s.grossProfit / s.price) * 1000) / 10,
  status: i === solutions.length - 1 ? "草稿" : "上架",
  usedCount: 12 + i * 7,
  winRate: [42, 58, 33, 51, 47][i] ?? 40,
  updatedAt: `2026-07-0${(i % 8) + 1}`,
  owner: ["王总", "刘华北", "张运营"][i % 3],
}));

// ==================== AI 反馈聚合 ====================

export function aggregateFeedback() {
  const list = getFeedback();
  const byKind: Record<string, { pos: number; neg: number }> = {};
  const byDim: Record<string, { pos: number; neg: number }> = {};
  for (const f of list) {
    byKind[f.kind] = byKind[f.kind] ?? { pos: 0, neg: 0 };
    byDim[f.dimension] = byDim[f.dimension] ?? { pos: 0, neg: 0 };
    if (f.positive) {
      byKind[f.kind].pos++;
      byDim[f.dimension].pos++;
    } else {
      byKind[f.kind].neg++;
      byDim[f.dimension].neg++;
    }
  }
  return { total: list.length, byKind, byDim, recent: list.slice(0, 8) };
}

export const skuHitMatrix = skuLibrary.map((s) => ({
  sku: s.sku,
  name: s.name,
  scene: s.scene,
  recommend: s.usedCount,
  adopt: Math.round(s.usedCount * (s.winRate / 100 + 0.2)),
  win: Math.round(s.usedCount * (s.winRate / 100)),
  aiConfidence: solutions.find((x) => x.id === s.id)?.aiConfidence ?? "中",
}));

// ==================== 艺人扩展档案 ====================

export interface ArtistProfile {
  id: string;
  name: string;
  category: string;
  agencyName: string;
  basePrice: number;
  rating: number;
  status: "在售" | "档期紧张" | "已下架";
  bookings30d: number;
  bookings90d: number;
  nextAvailable: string;
  tags: string[];
}

export const artistProfiles: ArtistProfile[] = artists.map((a, i) => ({
  id: a.id,
  name: a.name,
  category: a.category,
  agencyName: ["笑果文化", "笑果文化", "单立人喜剧", "单立人喜剧", "太合音乐 · 乐队线", "太合音乐 · 乐队线", "魔立方魔术工坊", "笑果文化"][i] ?? "—",
  basePrice: a.basePrice,
  rating: a.rating,
  status: i === 4 ? "档期紧张" : i === 7 ? "档期紧张" : "在售",
  bookings30d: [3, 5, 2, 4, 6, 3, 2, 8][i] ?? 1,
  bookings90d: [11, 18, 8, 14, 22, 12, 6, 26][i] ?? 4,
  nextAvailable: ["2026-07-18", "2026-07-15", "2026-07-12", "2026-07-14", "2026-08-02", "2026-07-25", "2026-07-13", "2026-08-10"][i] ?? "—",
  tags: a.tags,
}));

// ==================== 订单与合同 ====================

export interface OrderRecord {
  id: string;
  code: string;
  customerName: string;
  eventType: string;
  eventDate: string;
  amount: number;
  cost: number;
  status: "待签约" | "已签约" | "履约中" | "已完成" | "已退款";
  paymentStatus: "未收款" | "部分收款" | "已收款";
  paidAmount: number;
  supplierPayable: number;
  supplierPaid: number;
  owner: string;
  contractNo?: string;
  invoiceStatus: "未开票" | "已开票" | "开票中";
  createdAt: string;
}

export const orders: OrderRecord[] = [
  { id: "or1", code: "ORD-2026-0102", customerName: "网易云音乐", eventType: "年会 · 音乐主题", eventDate: "2026-01-22", amount: 880000, cost: 560000, status: "履约中", paymentStatus: "部分收款", paidAmount: 440000, supplierPayable: 560000, supplierPaid: 200000, owner: "张运营", contractNo: "HT-2026-018", invoiceStatus: "开票中", createdAt: "2026-06-20" },
  { id: "or2", code: "ORD-2026-0101", customerName: "美团", eventType: "客户答谢 · VIP晚宴", eventDate: "2025-12-20", amount: 180000, cost: 125000, status: "已完成", paymentStatus: "已收款", paidAmount: 180000, supplierPayable: 125000, supplierPaid: 125000, owner: "李运营", contractNo: "HT-2025-201", invoiceStatus: "已开票", createdAt: "2025-11-30" },
  { id: "or3", code: "ORD-2026-0100", customerName: "招商银行", eventType: "客户答谢 · 私行", eventDate: "2026-01-05", amount: 250000, cost: 158000, status: "已签约", paymentStatus: "部分收款", paidAmount: 100000, supplierPayable: 158000, supplierPaid: 0, owner: "李运营", contractNo: "HT-2026-011", invoiceStatus: "未开票", createdAt: "2026-06-28" },
  { id: "or4", code: "ORD-2026-0099", customerName: "字节跳动", eventType: "年会", eventDate: "2026-01-16", amount: 258000, cost: 158000, status: "待签约", paymentStatus: "未收款", paidAmount: 0, supplierPayable: 158000, supplierPaid: 0, owner: "张运营", invoiceStatus: "未开票", createdAt: "2026-07-07" },
  { id: "or5", code: "ORD-2026-0098", customerName: "华润万象城", eventType: "商场 · 周年庆", eventDate: "2026-01-30", amount: 108000, cost: 62000, status: "已签约", paymentStatus: "未收款", paidAmount: 0, supplierPayable: 62000, supplierPaid: 0, owner: "王运营", contractNo: "HT-2026-014", invoiceStatus: "未开票", createdAt: "2026-07-02" },
  { id: "or6", code: "ORD-2025-0912", customerName: "蔚来汽车", eventType: "发布会", eventDate: "2025-11-08", amount: 320000, cost: 210000, status: "已退款", paymentStatus: "已收款", paidAmount: 320000, supplierPayable: 210000, supplierPaid: 210000, owner: "张运营", contractNo: "HT-2025-188", invoiceStatus: "已开票", createdAt: "2025-10-01" },
];

// ==================== 企业客户 / KA ====================

export type KaLevel = "S · 战略" | "A · 重点" | "B · 常规" | "C · 长尾";

export interface CustomerAccount {
  id: string;
  companyName: string;
  industry: string;
  city: string;
  kaLevel: KaLevel;
  contactName: string;
  contactTitle: string;
  phone: string;
  creditLimit: number;
  creditUsed: number;
  invoiceTitle: string;
  taxId: string;
  lifetimeGmv: number;
  activeOpps: number;
  lastOrderAt: string;
  owner: string;
  status: "活跃" | "沉睡" | "黑名单";
}

export const customerAccounts: CustomerAccount[] = [
  { id: "ka1", companyName: "字节跳动", industry: "互联网", city: "北京", kaLevel: "S · 战略", contactName: "王雅琳", contactTitle: "行政总监", phone: "138****2091", creditLimit: 2000000, creditUsed: 620000, invoiceTitle: "北京字节跳动科技有限公司", taxId: "91110108551385**", lifetimeGmv: 3480000, activeOpps: 3, lastOrderAt: "2026-06-18", owner: "张运营", status: "活跃" },
  { id: "ka2", companyName: "美团", industry: "本地生活", city: "北京", kaLevel: "S · 战略", contactName: "李子豪", contactTitle: "品牌市场经理", phone: "139****5580", creditLimit: 1500000, creditUsed: 180000, invoiceTitle: "北京三快在线科技有限公司", taxId: "91110108551201**", lifetimeGmv: 2210000, activeOpps: 2, lastOrderAt: "2025-12-05", owner: "李运营", status: "活跃" },
  { id: "ka3", companyName: "蔚来汽车", industry: "新能源汽车", city: "上海", kaLevel: "A · 重点", contactName: "陈知微", contactTitle: "用户体验总监", phone: "135****7712", creditLimit: 1000000, creditUsed: 320000, invoiceTitle: "上海蔚来汽车有限公司", taxId: "91310115MA1K3**", lifetimeGmv: 1560000, activeOpps: 1, lastOrderAt: "2025-11-08", owner: "张运营", status: "活跃" },
  { id: "ka4", companyName: "小红书", industry: "内容社区", city: "上海", kaLevel: "A · 重点", contactName: "赵一鸣", contactTitle: "行政经理", phone: "136****3348", creditLimit: 800000, creditUsed: 0, invoiceTitle: "行吟信息科技（上海）有限公司", taxId: "91310114MA1H4**", lifetimeGmv: 620000, activeOpps: 1, lastOrderAt: "2025-08-22", owner: "王运营", status: "活跃" },
  { id: "ka5", companyName: "招商银行", industry: "金融", city: "深圳", kaLevel: "A · 重点", contactName: "周舒然", contactTitle: "客户答谢负责人", phone: "137****9021", creditLimit: 1200000, creditUsed: 250000, invoiceTitle: "招商银行股份有限公司", taxId: "914403001922**", lifetimeGmv: 980000, activeOpps: 1, lastOrderAt: "2026-01-05", owner: "李运营", status: "活跃" },
  { id: "ka6", companyName: "网易云音乐", industry: "音乐娱乐", city: "杭州", kaLevel: "S · 战略", contactName: "孙嘉懿", contactTitle: "市场合作总监", phone: "133****1188", creditLimit: 2000000, creditUsed: 880000, invoiceTitle: "杭州网易云音乐科技有限公司", taxId: "91330100MA2G**", lifetimeGmv: 2860000, activeOpps: 2, lastOrderAt: "2026-01-22", owner: "张运营", status: "活跃" },
  { id: "ka7", companyName: "华润万象城", industry: "商业地产", city: "深圳", kaLevel: "B · 常规", contactName: "吴晓峰", contactTitle: "商场活动策划", phone: "132****6673", creditLimit: 500000, creditUsed: 108000, invoiceTitle: "华润(深圳)有限公司", taxId: "914403001889**", lifetimeGmv: 340000, activeOpps: 1, lastOrderAt: "2026-01-30", owner: "王运营", status: "活跃" },
  { id: "ka8", companyName: "元气森林", industry: "快消品", city: "北京", kaLevel: "C · 长尾", contactName: "郑思思", contactTitle: "品牌活动经理", phone: "138****4402", creditLimit: 300000, creditUsed: 0, invoiceTitle: "北京元气森林食品科技有限公司", taxId: "91110105MA00**", lifetimeGmv: 200000, activeOpps: 0, lastOrderAt: "2025-11-20", owner: "李运营", status: "沉睡" },
];

// ==================== 平台字典 ====================

export interface DictItem {
  key: string;
  label: string;
  desc?: string;
  count: number;
  status: "启用" | "停用";
}

export const sceneDict: DictItem[] = [
  { key: "年会", label: "年会 / 尾牙", desc: "500-3000 人，年终大型庆典", count: 128, status: "启用" },
  { key: "团建", label: "团建", desc: "小规模趣味活动，50-200 人", count: 76, status: "启用" },
  { key: "发布会", label: "发布会", desc: "新品、新车、品牌发布", count: 92, status: "启用" },
  { key: "商场活动", label: "商场活动", desc: "周年庆、引流、店庆", count: 54, status: "启用" },
  { key: "客户答谢", label: "客户答谢", desc: "VIP 高净值答谢晚宴", count: 68, status: "启用" },
  { key: "路演", label: "路演", desc: "巡回演出、快闪", count: 12, status: "停用" },
];

export const cityDict: DictItem[] = [
  { key: "北京", label: "北京", count: 156, status: "启用" },
  { key: "上海", label: "上海", count: 132, status: "启用" },
  { key: "深圳", label: "深圳", count: 98, status: "启用" },
  { key: "杭州", label: "杭州", count: 74, status: "启用" },
  { key: "广州", label: "广州", count: 62, status: "启用" },
  { key: "成都", label: "成都", count: 41, status: "启用" },
  { key: "南京", label: "南京", count: 28, status: "启用" },
  { key: "武汉", label: "武汉", count: 22, status: "启用" },
];

export const industryDict: DictItem[] = [
  { key: "互联网", label: "互联网 / 科技", count: 84, status: "启用" },
  { key: "金融", label: "金融 / 银行 / 保险", count: 42, status: "启用" },
  { key: "汽车", label: "汽车 / 新能源", count: 38, status: "启用" },
  { key: "快消", label: "快消 / 食品饮料", count: 56, status: "启用" },
  { key: "地产", label: "商业地产 / 商场", count: 31, status: "启用" },
  { key: "内容", label: "内容 / 娱乐 / 传媒", count: 47, status: "启用" },
];

export const categoryDict: DictItem[] = [
  { key: "脱口秀", label: "脱口秀", desc: "开放麦、专场、拼盘", count: 42, status: "启用" },
  { key: "乐队", label: "乐队", desc: "摇滚、流行、爵士", count: 26, status: "启用" },
  { key: "魔术", label: "魔术", desc: "近景 / 舞台", count: 8, status: "启用" },
  { key: "主持", label: "主持 / 串场", count: 18, status: "启用" },
  { key: "歌手", label: "歌手 / 唱作人", count: 14, status: "启用" },
  { key: "舞蹈", label: "舞蹈 / 表演团", count: 9, status: "启用" },
];

// ==================== Prompt / 话术库 ====================

export interface PromptVersion {
  version: string;
  updatedAt: string;
  editor: string;
  content: string;
  changeNote: string;
  metrics: { adopt: number; goodRate: number; sample: number };
  active: boolean;
}

export interface PromptTemplate {
  id: string;
  scene: string;
  name: string;
  purpose: "需求抽取" | "方案生成" | "话术推荐" | "邮件生成";
  owner: string;
  versions: PromptVersion[];
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: "pt1",
    scene: "全场景",
    name: "需求抽取 · 主 Prompt",
    purpose: "需求抽取",
    owner: "王总",
    versions: [
      { version: "v3.2", updatedAt: "2026-07-05", editor: "王总", active: true, changeNote: "补充「预算区间」的模糊匹配示例，减少 15% 误判", content: "你是演立方 AI 活动顾问。请从客户原文中抽取：活动类型、人数、时长、预算、场地城市、日期、演出偏好。输出 JSON。\n若字段缺失，标记 missing 并给出 1 条追问。", metrics: { adopt: 82, goodRate: 78, sample: 412 } },
      { version: "v3.1", updatedAt: "2026-06-18", editor: "刘华北", active: false, changeNote: "首版增加英文串场识别", content: "从客户描述中抽取活动信息……", metrics: { adopt: 74, goodRate: 71, sample: 306 } },
      { version: "v3.0", updatedAt: "2026-05-10", editor: "王总", active: false, changeNote: "从 v2 升级为结构化 JSON", content: "……", metrics: { adopt: 68, goodRate: 63, sample: 240 } },
    ],
  },
  {
    id: "pt2",
    scene: "年会",
    name: "三档方案生成 · 年会",
    purpose: "方案生成",
    owner: "刘华北",
    versions: [
      { version: "v2.1", updatedAt: "2026-07-02", editor: "刘华北", active: true, changeNote: "推荐档强制包含 1 位头部艺人 + 1 位主持", content: "根据活动人数与预算，生成经济/推荐/升级三档方案。推荐档毛利率必须 ≥ 30%。", metrics: { adopt: 88, goodRate: 85, sample: 168 } },
      { version: "v2.0", updatedAt: "2026-06-08", editor: "刘华北", active: false, changeNote: "重写档位规则", content: "……", metrics: { adopt: 76, goodRate: 72, sample: 121 } },
    ],
  },
  {
    id: "pt3",
    scene: "全场景",
    name: "跟进话术 · 已报价未回复",
    purpose: "话术推荐",
    owner: "张运营",
    versions: [
      { version: "v1.3", updatedAt: "2026-07-08", editor: "张运营", active: true, changeNote: "增加价格锁定 48h 表述", content: "客户已阅未回复 X 小时。推荐话术：先关心档期，再强调本周报价有效期。", metrics: { adopt: 91, goodRate: 89, sample: 96 } },
      { version: "v1.2", updatedAt: "2026-06-22", editor: "张运营", active: false, changeNote: "初版", content: "……", metrics: { adopt: 82, goodRate: 78, sample: 62 } },
    ],
  },
  {
    id: "pt4",
    scene: "客户答谢",
    name: "报价邮件生成 · VIP晚宴",
    purpose: "邮件生成",
    owner: "李运营",
    versions: [
      { version: "v1.0", updatedAt: "2026-06-30", editor: "李运营", active: true, changeNote: "首版发布", content: "生成 VIP 客户报价邮件，语气正式、突出稀缺档期与专属服务。", metrics: { adopt: 71, goodRate: 74, sample: 44 } },
    ],
  },
];

// ==================== AI 需求抽取标注台 ====================

export interface LabelTask {
  id: string;
  createdAt: string;
  source: "客户端 AI 助手" | "作战台" | "小程序";
  customerName: string;
  rawText: string;
  aiExtract: { key: string; value: string; confidence: "高" | "中" | "低" }[];
  aiMissing: string[];
  status: "待标注" | "已确认" | "已修正" | "已废弃";
  labeler?: string;
}

export const labelTasks: LabelTask[] = [
  {
    id: "lt1",
    createdAt: "2026-07-09 09:12",
    source: "客户端 AI 助手",
    customerName: "字节跳动 · 王雅琳",
    rawText: "我们1月中旬要办年会，300人左右，想要一场脱口秀，具体预算还在走审批。",
    aiExtract: [
      { key: "活动类型", value: "年会", confidence: "高" },
      { key: "人数", value: "300", confidence: "高" },
      { key: "时长", value: "60 分钟", confidence: "中" },
      { key: "偏好", value: "脱口秀", confidence: "高" },
    ],
    aiMissing: ["场地城市", "预算上限", "具体日期"],
    status: "待标注",
  },
  {
    id: "lt2",
    createdAt: "2026-07-09 10:24",
    source: "作战台",
    customerName: "美团 · 李子豪",
    rawText: "年底客户答谢晚宴，120位VIP，希望脱口秀不要太吵，风格松弛。",
    aiExtract: [
      { key: "活动类型", value: "客户答谢", confidence: "高" },
      { key: "人数", value: "120", confidence: "高" },
      { key: "调性", value: "松弛 / 非高能", confidence: "中" },
      { key: "预算", value: "15-20 万", confidence: "低" },
    ],
    aiMissing: ["场地城市", "日期"],
    status: "已确认",
    labeler: "李运营",
  },
  {
    id: "lt3",
    createdAt: "2026-07-09 11:02",
    source: "小程序",
    customerName: "元气森林 · 郑思思",
    rawText: "3月做个团建，员工80人，最好有互动魔术。",
    aiExtract: [
      { key: "活动类型", value: "团建", confidence: "高" },
      { key: "人数", value: "80", confidence: "高" },
      { key: "偏好", value: "魔术 / 互动", confidence: "高" },
      { key: "日期", value: "3 月", confidence: "中" },
    ],
    aiMissing: ["预算", "场地城市", "具体日期"],
    status: "已修正",
    labeler: "王运营",
  },
  {
    id: "lt4",
    createdAt: "2026-07-08 22:41",
    source: "客户端 AI 助手",
    customerName: "网易云音乐 · 孙嘉懿",
    rawText: "帮我看下能不能整个乐队 + 脱口秀混搭的年会。",
    aiExtract: [
      { key: "活动类型", value: "年会", confidence: "高" },
      { key: "偏好", value: "乐队 + 脱口秀", confidence: "高" },
    ],
    aiMissing: ["人数", "预算", "日期", "场地"],
    status: "待标注",
  },
];

// ==================== 审计日志 ====================

export type AuditAction = "登录" | "创建" | "修改" | "删除" | "上架" | "下架" | "发送报价" | "权限变更" | "导出";

export interface AuditEntry {
  id: string;
  time: string;
  operator: string;
  role: string;
  action: AuditAction;
  target: string;
  targetType: "SKU" | "艺人" | "客户" | "订单" | "报价" | "账号" | "Prompt" | "字典";
  ip: string;
  detail: string;
}

export const auditLog: AuditEntry[] = [
  { id: "al1", time: "2026-07-09 10:12", operator: "王总", role: "超级管理员", action: "上架", target: "REC-COMEDY-60", targetType: "SKU", ip: "10.20.3.15", detail: "上架 SKU：笑果 · 年会双喜专场" },
  { id: "al2", time: "2026-07-09 09:58", operator: "李运营", role: "销售运营", action: "发送报价", target: "QUO-2026-0031", targetType: "报价", ip: "10.20.5.22", detail: "向美团发送报价 v2，金额 ¥180,000" },
  { id: "al3", time: "2026-07-09 09:44", operator: "刘华北", role: "运营主管", action: "修改", target: "pt2 · v2.1", targetType: "Prompt", ip: "10.20.3.11", detail: "更新「三档方案生成 · 年会」到 v2.1" },
  { id: "al4", time: "2026-07-09 09:12", operator: "张运营", role: "销售运营", action: "创建", target: "OPP-2026-0731", targetType: "客户", ip: "10.20.5.18", detail: "新建商机：字节跳动年会" },
  { id: "al5", time: "2026-07-08 22:07", operator: "王运营", role: "销售运营", action: "登录", target: "workspace", targetType: "账号", ip: "58.213.10.42", detail: "登录作战台" },
  { id: "al6", time: "2026-07-08 18:33", operator: "王总", role: "超级管理员", action: "权限变更", target: "u7 赵实习", targetType: "账号", ip: "10.20.3.15", detail: "将「赵实习」由「销售运营」调整为「只读」并停用" },
  { id: "al7", time: "2026-07-08 16:20", operator: "钱财务", role: "财务", action: "导出", target: "ORD-2026-*", targetType: "订单", ip: "10.20.7.09", detail: "导出 6 月对账明细 (CSV)" },
  { id: "al8", time: "2026-07-08 14:02", operator: "刘华北", role: "运营主管", action: "下架", target: "a8 · 李诞", targetType: "艺人", ip: "10.20.3.11", detail: "临时下架李诞（档期冲突）" },
  { id: "al9", time: "2026-07-08 11:41", operator: "王总", role: "超级管理员", action: "修改", target: "路演", targetType: "字典", ip: "10.20.3.15", detail: "停用场景字典项「路演」" },
];