// DEMO 存储 —— 仅本地 localStorage，未来替换为 server function。
// 严格遵循 PRD V7.2 §1.3：不做文件仓、不做黑名单、只做最小业务记录。

export type TenantActorRelation = "trusted" | "onboarding" | "watch";
export type TenantActorContactKind = "wechat" | "phone" | "email";

export type TenantActorQuote = {
  amount: number;
  currency: "CNY";
  note?: string;
  updatedAt: string; // ISO
};

export type TenantActorRecord = {
  id: string; // 本地记录 id
  linkedActorId?: string; // 若关联 discover/actors 的平台 profile
  displayName: string;
  headline?: string; // 一句话身份，例如「脱口秀 · 主持型」
  city?: string;
  relation: TenantActorRelation;
  quote?: TenantActorQuote;
  note?: string; // 内部备注（AI 可读，不外泄）
  contactName?: string;
  contactKind?: TenantActorContactKind;
  contactValue?: string;
  credential?: string; // 凭证引用文字（不上传文件）
  lastCollaboration?: string; // 自由文本，如「2026-05 · Neo Bank 答谢晚宴」
  createdAt: string;
  updatedAt: string;
};

const KEY = "ylc.tenant.actors";

const SEED: TenantActorRecord[] = [
  {
    id: "tact_hexuan",
    linkedActorId: "act_hexuan",
    displayName: "何轩",
    headline: "脱口秀 · 主持型",
    city: "上海",
    relation: "trusted",
    quote: { amount: 38000, currency: "CNY", note: "标准 30 分钟 + 15 分钟串场", updatedAt: "2026-05-18T00:00:00Z" },
    note: "对金融行业合规话术熟悉；不接单纯 roast 场。首次合作即达成 NPS 72。",
    contactName: "何轩本人",
    contactKind: "wechat",
    contactValue: "hexuan_wx（示例）",
    credential: "身份证已线下核验 · 2026-03-12；商演合规声明存档编号 A-221。",
    lastCollaboration: "2026-05 · Neo Bank 答谢晚宴",
    createdAt: "2025-11-02T00:00:00Z",
    updatedAt: "2026-05-18T00:00:00Z",
  },
  {
    id: "tact_linshu",
    linkedActorId: "act_linshu",
    displayName: "林舒",
    headline: "即兴喜剧 · 编导",
    city: "北京",
    relation: "trusted",
    quote: { amount: 52000, currency: "CNY", note: "4 人团 · 90 分钟共创", updatedAt: "2026-04-02T00:00:00Z" },
    note: "共创模块可提前 1 周对齐；不建议放在酒会式散场环节。",
    contactName: "林舒经纪 · Wendy",
    contactKind: "phone",
    contactValue: "示例 138****2210",
    lastCollaboration: "2026-04 · SaaS Kickoff",
    createdAt: "2025-08-10T00:00:00Z",
    updatedAt: "2026-04-02T00:00:00Z",
  },
  {
    id: "tact_zhouye",
    linkedActorId: "act_zhouye",
    displayName: "周晔",
    headline: "魔术 · 近景与舞台",
    city: "深圳",
    relation: "onboarding",
    quote: { amount: 26000, currency: "CNY", note: "近景 60 分钟", updatedAt: "2026-06-01T00:00:00Z" },
    note: "AI：仅协作 2 次，建议再合作 1-2 次后再纳入首选池。",
    contactName: "周晔本人",
    contactKind: "wechat",
    contactValue: "zhouye_close",
    lastCollaboration: "2026-06 · 某汽车品牌 VIP 私宴",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "tact_muyao",
    linkedActorId: "act_muyao",
    displayName: "沐遥",
    headline: "民乐跨界 · 古筝电声",
    city: "杭州",
    relation: "watch",
    note: "上次现场 sound check 与承诺不符，暂时观察；仅小型文化场景可再试。",
    lastCollaboration: "2026-02 · 文化主题晚宴",
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2026-02-20T00:00:00Z",
  },
  {
    id: "tact_private_1",
    displayName: "陆远（未注册）",
    headline: "钢琴现场 · 私人推荐",
    city: "上海",
    relation: "onboarding",
    quote: { amount: 12000, currency: "CNY", note: "45 分钟 · 含调律", updatedAt: "2026-05-04T00:00:00Z" },
    note: "私人渠道，仅本商户备案。尚未加入平台，联系需走本人微信。",
    contactName: "陆远本人",
    contactKind: "wechat",
    contactValue: "luyuan_piano（示例）",
    credential: "本人手写演出承诺函存档，编号 P-018。",
    lastCollaboration: "2026-05 · 高净值客户私宴",
    createdAt: "2026-05-02T00:00:00Z",
    updatedAt: "2026-05-04T00:00:00Z",
  },
];

function read(): TenantActorRecord[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw) as TenantActorRecord[];
  } catch {
    return SEED;
  }
}

function write(records: TenantActorRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(records));
}

export const tenantActorsStore = {
  list(): TenantActorRecord[] {
    return read();
  },
  upsert(rec: TenantActorRecord) {
    const all = read();
    const idx = all.findIndex((r) => r.id === rec.id);
    const now = new Date().toISOString();
    const next = { ...rec, updatedAt: now };
    if (idx >= 0) all[idx] = next;
    else all.unshift({ ...next, createdAt: now });
    write(all);
    return next;
  },
  remove(id: string) {
    write(read().filter((r) => r.id !== id));
  },
  addFromPlatform(input: {
    linkedActorId: string;
    displayName: string;
    headline?: string;
    city?: string;
  }): { record: TenantActorRecord; created: boolean } {
    const all = read();
    const existing = all.find((r) => r.linkedActorId === input.linkedActorId);
    if (existing) return { record: existing, created: false };
    const now = new Date().toISOString();
    const rec: TenantActorRecord = {
      id: `tact_${input.linkedActorId}_${Date.now()}`,
      linkedActorId: input.linkedActorId,
      displayName: input.displayName,
      headline: input.headline,
      city: input.city,
      relation: "onboarding",
      note: "刚从平台加入 · 建议在首次合作前补充内部报价与联系人。",
      createdAt: now,
      updatedAt: now,
    };
    all.unshift(rec);
    write(all);
    return { record: rec, created: true };
  },
};

export const relationMeta: Record<TenantActorRelation, { label: string; tone: "verified" | "pending" | "expired" }> = {
  trusted: { label: "长期信任", tone: "verified" },
  onboarding: { label: "考察中", tone: "pending" },
  watch: { label: "需观察", tone: "expired" },
};

export const contactKindLabel: Record<TenantActorContactKind, string> = {
  wechat: "微信",
  phone: "手机",
  email: "邮箱",
};
