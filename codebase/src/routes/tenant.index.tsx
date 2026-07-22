import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Inbox,
  Clock3,
  Receipt,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  CircleDollarSign,
  FileCheck2,
  Users,
  Activity,
  Wallet,
  Package,

} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EvidenceLine, AgentInlineSuggestion, AgentMessage } from "@/components/yanlicube/agent";
import { demoToast } from "@/lib/demo-toast";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";
import { TenantBottomTabs } from "@/components/yanlicube/tenant-h5-nav";

export const Route = createFileRoute("/tenant/")({
  head: () => ({
    meta: [
      { title: "主服务方经营工作台 · 演立方" },
      { name: "description", content: "作为主服务方,一屏处理所有活动机会、等待确认、报价与收款,并复核 AI 已完成的内容。" },
    ],
  }),
  component: TenantWorkbench,
});

// ---- Demo fixtures (Tenant 视角) ----
type Opportunity = {
  id: string;
  title: string;
  client: string;
  date: string;
  city: string;
  scale: string;
  budget: string;
  fitScore: number;
  matchReasons: string[];
  aiPrepared: string;
  respondBy: string;
  competing?: number;
};

const opportunities: Opportunity[] = [
  {
    id: "opp_neobank2",
    title: "Neo 银行 · 私行专场答谢晚宴",
    client: "Neo 银行 · 战略客户部",
    date: "2027-03-06",
    city: "北京",
    scale: "260 人",
    budget: "60–85 万",
    fitScore: 92,
    matchReasons: [
      "你上一次为 Neo 银行的答谢晚宴 NPS 68",
      "客户点名希望沿用同一主服务方",
      "档期无冲突 · 你在北京有可调用协作方",
    ],
    aiPrepared: "已生成 3 段方向草稿(克制/内容+视觉/极简)与初步报价区间,只等你复核后一键发送。",
    respondBy: "48 小时内响应",
  },
  {
    id: "opp_alpha",
    title: "AlphaBio · 产品发布会",
    client: "AlphaBio · 品牌部",
    date: "2026-10-22",
    city: "北京",
    scale: "180 人",
    budget: "60–100 万",
    fitScore: 74,
    matchReasons: [
      "客户上传了原方案 · AI 已完成缺口检查",
      "5 项待补充信息已整理成清单",
    ],
    aiPrepared: "AI 已解析 12 页 PDF,发现 5 项影响推进的关键缺口,并起草了向客户回填的问题清单。",
    respondBy: "本周内",
    competing: 2,
  },
  {
    id: "opp_greentea",
    title: "青野茶饮 · 品牌年度沟通会",
    client: "青野茶饮 · 市场部",
    date: "2026-12-11",
    city: "上海",
    scale: "120 人",
    budget: "20–35 万",
    fitScore: 51,
    matchReasons: ["预算与调性匹配一般", "客户目标尚不清晰"],
    aiPrepared: "AI 顾问建议先与客户澄清目标再决定是否接单,已准备好 3 个澄清问题。",
    respondBy: "无强制期限",
  },
];

type WaitingItem = {
  id: string;
  projectTitle: string;
  waitingFor: string;
  role: "actor" | "client" | "collaborator";
  since: string;
  avgWait: string;
  aiAction: string;
  canDoNow: string;
};

const waiting: WaitingItem[] = [
  {
    id: "w1",
    projectTitle: "Miracle 汽车 · 新车区域上市",
    waitingFor: "演员周晔的经纪确认 9/14 档期",
    role: "actor",
    since: "1 天前发出",
    avgWait: "平均 2 天",
    aiAction: "已代你跟进 1 次,并同步给客户'预计后天前有明确答复'",
    canDoNow: "准备 B 方案(备选演员林舒)以防档期冲突",
  },
  {
    id: "w2",
    projectTitle: "Neo 银行 · 2027 年度客户答谢晚宴",
    waitingFor: "客户比较 A/B/C 三个方案后确认方向",
    role: "client",
    since: "2 小时前",
    avgWait: "客户内部审批约 3-5 天",
    aiAction: "已把决策摘要发送到客户负责人邮箱,并抄送 CFO",
    canDoNow: "对 A 方案的近景魔术演员预锁档",
  },
  {
    id: "w3",
    projectTitle: "AlphaBio · 产品发布会",
    waitingFor: "客户回填 5 项待补充信息",
    role: "client",
    since: "刚刚",
    avgWait: "—",
    aiAction: "问题清单已生成,等你审阅后一键发送",
    canDoNow: "复核 AI 生成的问题清单",
  },
];

type QuoteRow = {
  id: string;
  project: string;
  client: string;
  amount: string;
  status: "draft" | "sent" | "confirmed" | "paid_deposit" | "paid_full";
  updatedAt: string;
  note: string;
};

const quotes: QuoteRow[] = [
  {
    id: "q1",
    project: "Neo 银行 · 2027 年度客户答谢晚宴",
    client: "Neo 银行",
    amount: "¥ 92 万",
    status: "draft",
    updatedAt: "AI 起草 · 待你复核",
    note: "客户仍在方案比较中,建议方向确认后再发",
  },
  {
    id: "q2",
    project: "Miracle 汽车 · 新车区域上市",
    client: "Miracle 汽车",
    amount: "¥ 58.8 万",
    status: "sent",
    updatedAt: "3 小时前发送",
    note: "已发送 · 等待客户确认(有效期至 2026-08-01)",
  },
  {
    id: "q3",
    project: "青丘美妆 · Q3 媒体见面会",
    client: "青丘美妆",
    amount: "¥ 24 万",
    status: "confirmed",
    updatedAt: "昨天已确认",
    note: "合同已寄出 · 定金账单可开具",
  },
  {
    id: "q4",
    project: "SciTech · 2026 Kickoff(已归档)",
    client: "SciTech",
    amount: "¥ 36 万",
    status: "paid_full",
    updatedAt: "2026-02-10 全款到账",
    note: "客户已启动 2027 年复购流程",
  },
  {
    id: "q5",
    project: "远山资本 · 年会主持",
    client: "远山资本",
    amount: "¥ 12 万",
    status: "paid_deposit",
    updatedAt: "定金 40% 已到账",
    note: "尾款到账日:2026-11-25",
  },
];

const quoteStatusMap: Record<QuoteRow["status"], { label: string; state: React.ComponentProps<typeof StatusBadge>["state"] }> = {
  draft: { label: "草稿 · AI 已备", state: "ai" },
  sent: { label: "已发送 · 等待确认", state: "pending" },
  confirmed: { label: "已确认", state: "verified" },
  paid_deposit: { label: "定金已到账", state: "declared" },
  paid_full: { label: "全款已结清", state: "verified" },
};

type AiDraft = {
  id: string;
  project: string;
  kind: string;
  finishedAt: string;
  summary: string;
  needReview: string[];
};

const aiDrafts: AiDraft[] = [
  {
    id: "d1",
    project: "Neo 银行 · 2027 年度客户答谢晚宴",
    kind: "3 个方案方向草稿",
    finishedAt: "2 小时前",
    summary:
      "AI 已根据活动画像 生成 A(克制/国际化)、B(内容+视觉)、C(极简/内容纯粹)三条方向,包含故事板、模块清单、预算区间与待确认项。",
    needReview: ["A 方案主持人档期需 3 天内确认", "B 方案古筝电声演员未定"],
  },
  {
    id: "d2",
    project: "Neo 银行 · 2027 年度客户答谢晚宴",
    kind: "报价单初稿 · ¥ 92 万",
    finishedAt: "1 小时前",
    summary:
      "基于方案 A 的模块清单自动生成报价拆分:内容 45% · 主持/演员 30% · 统筹与执行 25%,含 6 项明细。",
    needReview: ["近景魔术单价需你确认", "旅费按上海本地估算,是否含备选跨城预算"],
  },
  {
    id: "d3",
    project: "AlphaBio · 产品发布会",
    kind: "缺口检查清单",
    finishedAt: "刚刚",
    summary:
      "AI 解析了客户上传的 12 页原方案,识别 5 项待补充信息,并起草了发给客户的中文询问邮件。",
    needReview: ["修正一次识别错误:'临床线专家致辞'被误读为'嘉宾脱口秀'"],
  },
  {
    id: "d4",
    project: "Miracle 汽车 · 新车区域上市",
    kind: "客户等待陪伴邮件",
    finishedAt: "刚刚",
    summary: "已代你回复客户'档期预计后天前有明确答复',并附赠 B 方案的备选演员简介。",
    needReview: [],
  },
];

// ---- Component ----
type TabKey = "opportunities" | "waiting" | "quotes" | "ai";

const tabs: { key: TabKey; label: string; icon: typeof Inbox; count: number; hint: string }[] = [
  { key: "opportunities", label: "主服务机会", icon: Inbox, count: opportunities.length, hint: "客户正在等你响应" },
  { key: "waiting", label: "等待确认", icon: Clock3, count: waiting.length, hint: "AI 在替你跟进" },
  { key: "quotes", label: "报价与收款", icon: Receipt, count: quotes.filter((q) => q.status !== "paid_full").length, hint: "本周有 2 笔可开票" },
  { key: "ai", label: "AI 已完成", icon: Sparkles, count: aiDrafts.length, hint: "等你复核后即可发出" },
];

function TenantWorkbench() {
  const [tab, setTab] = useState<TabKey>("opportunities");

  const kpis = [
    { label: "本月新机会", value: opportunities.length, sub: "1 项高匹配" },
    { label: "等待中", value: waiting.length, sub: "平均等待 2.1 天" },
    { label: "在途金额", value: "¥ 174.8 万", sub: "含 1 笔已发送报价" },
    { label: "AI 待复核", value: aiDrafts.length, sub: "无需从零开始" },
  ];

  return (
    <AgentPanelProvider scopeLabel="主服务方 · 经营工作台" quickPrompts={["今天最该处理哪一单", "帮我起草一份报价", "本周有哪些待催回款"]}>
    <>
    <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-5 sm:px-6 sm:py-8 md:pb-8">
      <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:mb-6 sm:flex sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="mb-1.5 text-[10.5px] tracking-[0.14em] text-muted-foreground sm:mb-2 sm:text-xs">TENANT · 经营工作台</div>
          <h1 className="truncate text-lg font-semibold text-foreground sm:text-2xl">后仰喜剧 · 主服务方经营空间</h1>
          <div className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
            AI 顾问替你完成初稿与跟进,你只做需要"人"来做的决定。
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[10.5px] sm:gap-2 sm:px-4 sm:py-2 sm:text-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
          <span className="text-primary"><span className="hidden sm:inline">今天 </span>AI 已完成 <b>4</b> 项<span className="hidden sm:inline">工作</span></span>
        </div>
      </div>

      {/* 经营资产入口 · 默认折叠,避免首屏拥挤 */}
      <details className="group mb-6 rounded-lg border border-border/60 bg-card/40">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-xs">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-3.5 w-3.5 text-primary" />
            经营资产 · 节目 / 服务产品 / 协作方 / 订单 / 履约 / 结算
          </span>
          <span className="text-[11px] text-muted-foreground group-open:hidden">展开 ▾</span>
          <span className="hidden text-[11px] text-muted-foreground group-open:inline">收起 ▴</span>
        </summary>
        <div className="flex flex-wrap gap-2 border-t border-border/60 p-3">
          <Link to="/tenant/programs" className="inline-flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2 text-xs hover:bg-secondary">
            <FileCheck2 className="h-3.5 w-3.5 text-primary" />节目产品库
            <span className="ml-1 rounded-full bg-secondary px-1.5 py-px font-mono text-[10px] text-muted-foreground">4</span>
          </Link>
          <Link to="/tenant/service-products" className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-xs hover:bg-primary/10">
            <Package className="h-3.5 w-3.5 text-primary" />演出服务产品库
            <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-px font-mono text-[10px] text-primary">7</span>
          </Link>
          <Link to="/tenant/partners" className="inline-flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2 text-xs hover:bg-secondary">
            <Users className="h-3.5 w-3.5 text-primary" />协作方管理
            <span className="text-[10px] text-muted-foreground">· 含我的演员</span>
            <span className="ml-1 rounded-full bg-secondary px-1.5 py-px font-mono text-[10px] text-muted-foreground">4</span>
          </Link>
          <Link to="/tenant/orders" className="inline-flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2 text-xs hover:bg-secondary">
            <Receipt className="h-3.5 w-3.5 text-primary" />订单管理
            <span className="ml-1 rounded-full bg-secondary px-1.5 py-px font-mono text-[10px] text-muted-foreground">3</span>
          </Link>
          <Link to="/tenant/execution" className="inline-flex items-center gap-2 rounded-md border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/5 px-3 py-2 text-xs hover:bg-[color:var(--state-verified)]/10">
            <Activity className="h-3.5 w-3.5 text-[color:var(--state-verified)]" />履约看板
          </Link>
          <Link to="/tenant/settlement" className="inline-flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2 text-xs hover:bg-secondary">
            <Wallet className="h-3.5 w-3.5 text-primary" />结算与信誉分
            <span className="ml-1 rounded-full bg-secondary px-1.5 py-px font-mono text-[10px] text-muted-foreground">A 级</span>
          </Link>
        </div>
      </details>


      {/* KPI row */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="surface-1 rounded-xl p-4">
            <div className="text-[11px] tracking-wide text-muted-foreground">{k.label}</div>
            <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{k.value}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-lg border border-border/60 bg-card/40 p-2">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "group flex flex-1 min-w-[180px] items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <t.icon className={cn("h-4 w-4", active && "text-primary")} />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {t.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-px font-mono text-[10px]",
                      active ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {t.count}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">{t.hint}</div>
              </div>
            </button>
          );
        })}
      </div>

      {tab === "opportunities" && <OpportunitiesTab />}
      {tab === "waiting" && <WaitingTab />}
      {tab === "quotes" && <QuotesTab />}
      {tab === "ai" && <AiTab />}
    </div>
    <TenantBottomTabs />
    </>
    </AgentPanelProvider>
  );
}

function OpportunitiesTab() {
  return (
    <div className="space-y-4">
      <AgentMessage>
        今天有 <b>{opportunities.length}</b> 个新机会需要你决定是否接单。我已经按匹配度排序,并为高匹配项准备好了方向草稿——你不用从空白开始。
      </AgentMessage>
      <div className="grid gap-4">
        {opportunities.map((o) => (
          <div key={o.id} className="surface-2 rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    state={o.fitScore >= 85 ? "verified" : o.fitScore >= 65 ? "declared" : "pending"}
                    label={`匹配 ${o.fitScore}`}
                  />
                  {o.competing !== undefined && (
                    <span className="text-[11px] text-muted-foreground">竞争中 · {o.competing} 家</span>
                  )}
                  <span className="text-[11px] text-muted-foreground">{o.respondBy}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{o.title}</h3>
                <div className="mt-1 text-xs text-muted-foreground">
                  {o.client} · {o.date} · {o.city} · {o.scale} · 预算 {o.budget}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  接单 · 成为主服务方
                </button>
                <Link
                  to="/tenant/opportunities/$id"
                  params={{ id: o.id }}
                  className="text-xs text-primary hover:underline"
                >
                  查看详情 →
                </Link>
                <button onClick={() => demoToast()} className="text-xs text-muted-foreground hover:text-foreground">拒绝 · 附礼貌理由</button>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border/40 bg-background/30 p-3">
                <div className="mb-2 text-[11px] tracking-wide text-muted-foreground">为什么推荐给你</div>
                <ul className="space-y-1 text-xs text-foreground/85">
                  {o.matchReasons.map((r) => (
                    <li key={r}>· {r}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="mb-2 flex items-center gap-1 text-[11px] tracking-wide text-primary">
                  <Sparkles className="h-3 w-3" /> AI 已完成
                </div>
                <div className="text-xs text-foreground/90">{o.aiPrepared}</div>
                <button onClick={() => demoToast()} className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                  查看草稿 <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaitingTab() {
  return (
    <div className="space-y-4">
      <AgentMessage>
        等待也是工作的一部分。我在替你跟进每一件事,并把"你现在能推进的下一步"整理出来。
      </AgentMessage>
      <div className="grid gap-3">
        {waiting.map((w) => (
          <div key={w.id} className="surface-1 rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge state="pending" label={roleLabel(w.role)} />
                  <span className="text-[11px] text-muted-foreground">{w.since}</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-foreground">{w.projectTitle}</h3>
                <div className="mt-1 text-sm text-foreground/85">正在等:{w.waitingFor}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{w.avgWait}</div>
              </div>
              <Link
                to="/projects"
                className="text-xs text-primary hover:underline"
              >
                进入项目空间 →
              </Link>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
                <div className="mb-1 flex items-center gap-1 text-primary">
                  <Sparkles className="h-3 w-3" /> AI 已经在做
                </div>
                <div className="text-foreground/90">{w.aiAction}</div>
              </div>
              <div className="rounded-lg border border-border/40 bg-background/30 p-3 text-xs">
                <div className="mb-1 text-muted-foreground">你现在能做</div>
                <div className="text-foreground/90">{w.canDoNow}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function roleLabel(r: WaitingItem["role"]) {
  return r === "actor" ? "等演员" : r === "client" ? "等客户" : "等协作方";
}

function QuotesTab() {
  const pipeline = [
    { key: "draft", label: "草稿", icon: FileCheck2 },
    { key: "sent", label: "已发送", icon: ArrowUpRight },
    { key: "confirmed", label: "已确认", icon: CheckCircle2 },
    { key: "paid_deposit", label: "定金到账", icon: CircleDollarSign },
    { key: "paid_full", label: "全款结清", icon: CircleDollarSign },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Pipeline overview */}
      <div className="surface-1 rounded-xl p-4">
        <div className="mb-3 text-xs tracking-wide text-muted-foreground">经营漏斗</div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {pipeline.map((p, i) => {
            const n = quotes.filter((q) => q.status === p.key).length;
            return (
              <div key={p.key} className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-2">
                  <p.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">{p.label}</span>
                  <span className="font-mono text-primary">{n}</span>
                </div>
                {i < pipeline.length - 1 && <span className="text-border">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="surface-2 overflow-hidden rounded-xl">
        <div className="grid grid-cols-[1.6fr_1fr_140px_180px_120px] gap-3 border-b border-border/60 bg-background/30 px-5 py-3 text-[11px] tracking-wide text-muted-foreground">
          <div>项目 / 客户</div>
          <div>状态</div>
          <div className="text-right">金额</div>
          <div>更新</div>
          <div className="text-right">操作</div>
        </div>
        {quotes.map((q) => {
          const s = quoteStatusMap[q.status];
          return (
            <div
              key={q.id}
              className="grid grid-cols-[1.6fr_1fr_140px_180px_120px] items-center gap-3 border-b border-border/40 px-5 py-4 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{q.project}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{q.client} · {q.note}</div>
              </div>
              <div><StatusBadge state={s.state} label={s.label} /></div>
              <div className="text-right font-mono text-sm text-foreground">{q.amount}</div>
              <div className="text-xs text-muted-foreground">{q.updatedAt}</div>
              <div className="text-right">
                <button onClick={() => demoToast()} className="text-xs text-primary hover:underline">
                  {q.status === "draft" ? "复核发送" :
                   q.status === "sent" ? "催办跟进" :
                   q.status === "confirmed" ? "开具账单" :
                   q.status === "paid_deposit" ? "跟进尾款" : "查看回单"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AgentInlineSuggestion title="需要我把本周可开票的两笔账单邮件草拟好吗?">
        我可以基于合同信息与收款账户生成开票申请邮件,并把附件命名规范化——你确认后一键发出。
      </AgentInlineSuggestion>
    </div>
  );
}

function AiTab() {
  return (
    <div className="space-y-4">
      <AgentMessage>
        这是我今天替你完成的工作。每一项都保留了"是 AI 生成"的标记,你复核后才会发给客户或演员。
      </AgentMessage>
      <div className="grid gap-4">
        {aiDrafts.map((d) => (
          <div key={d.id} className="surface-2 rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge state="ai" label="AI 生成 · 待你复核" />
                  <span className="text-[11px] text-muted-foreground">完成于 {d.finishedAt}</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-foreground">{d.kind}</h3>
                <div className="mt-0.5 text-xs text-muted-foreground">{d.project}</div>
                <p className="mt-2 text-sm text-foreground/85">{d.summary}</p>
                {d.needReview.length > 0 && (
                  <div className="mt-3 rounded-lg border border-[color:var(--state-pending)]/30 bg-[color:var(--state-pending)]/5 p-3">
                    <div className="mb-1 flex items-center gap-1 text-[11px] text-[color:var(--state-pending)]">
                      <AlertCircle className="h-3 w-3" /> 需要你判断
                    </div>
                    <ul className="space-y-0.5 text-xs text-foreground/90">
                      {d.needReview.map((x) => (
                        <li key={x}>· {x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <EvidenceLine source="AI 顾问 · 基于 活动画像与历史项目" time={d.finishedAt} className="mt-3" />
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  确认并发出
                </button>
                <button onClick={() => demoToast()} className="rounded-md border border-border px-4 py-2 text-xs text-foreground/80 hover:bg-secondary/40">
                  我要改一下
                </button>
                <button onClick={() => demoToast()} className="text-[11px] text-muted-foreground hover:text-foreground">
                  <Users className="mr-1 inline h-3 w-3" /> 转给同事复核
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
