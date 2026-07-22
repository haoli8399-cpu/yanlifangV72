import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Sparkles,
  Plus,
  ShieldCheck,
  Clock3,
  Tag,
  ChevronRight,
  Package,
  Pencil,
  Eye,
  EyeOff,
  UserCircle2,
} from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";
import { demoToast } from "@/lib/demo-toast";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";
import { ActorBottomTabs } from "@/components/yanlicube/actor-h5-nav";

export const Route = createFileRoute("/actor/services")({
  head: () => ({
    meta: [
      { title: "演员端 · 我的服务片段 · 演立方" },
      { name: "description", content: "演员上架可复用的局部型服务 SKU:开场/中场/主题演出等,包含时长、题材、禁忌与价格锚点,由主服务方组装进整场演出。" },
    ],
  }),
  component: ActorServices,
});

type ActorSKU = {
  id: string;
  title: string;
  format: "开场" | "中场" | "主题专场" | "定制脱口秀";
  duration: string;
  audience: string;
  themes: string[];
  taboos: string[];
  priceAnchor: string;
  reuseCount: number;
  nps: number;
  updatedAt: string;
  status: "published" | "draft" | "offline";
  visibleTo: "tenants" | "verified" | "private";
  aiHint?: string;
};

const seed: ActorSKU[] = [
  {
    id: "sk1",
    title: "金融行业开场 · 克制轻量",
    format: "开场",
    duration: "15-20 min",
    audience: "金融从业者 / 私人银行客户",
    themes: ["行业自嘲", "职场观察", "轻量时事"],
    taboos: ["宏观经济预测", "个股/机构点名", "政治议题"],
    priceAnchor: "¥ 面议 · 由主服务方向客户报价",
    reuseCount: 6,
    nps: 4.8,
    updatedAt: "2026-09-20 由 你 更新",
    status: "published",
    visibleTo: "verified",
    aiHint: "近 6 个月被 2 家主服务方复用 4 次,建议保持发布状态。",
  },
  {
    id: "sk2",
    title: "科技发布会中场 · 严肃场适配",
    format: "中场",
    duration: "10-15 min",
    audience: "科技行业 / 媒体 / 投资人",
    themes: ["产品文化", "技术黑话", "职业焦虑"],
    taboos: ["竞品对比", "员工八卦", "股价"],
    priceAnchor: "¥ 面议",
    reuseCount: 3,
    nps: 4.6,
    updatedAt: "2026-08-11 由 你 更新",
    status: "published",
    visibleTo: "tenants",
  },
  {
    id: "sk3",
    title: "私享年会主题专场 · 高情商定制",
    format: "主题专场",
    duration: "45-60 min",
    audience: "家族企业 / 私人聚会",
    themes: ["定制段子 · 需提前 3 周", "家族叙事(需授权)"],
    taboos: ["现场即兴涉政", "非授权人物指涉"],
    priceAnchor: "¥ 面议 · 含 2 次内容会",
    reuseCount: 1,
    nps: 5.0,
    updatedAt: "2026-07-02 由 你 更新",
    status: "draft",
    visibleTo: "private",
    aiHint: "内容完备度 60%,建议补充 3 条历史案例后再发布。",
  },
];

const statusLabel: Record<ActorSKU["status"], string> = {
  published: "已发布",
  draft: "草稿",
  offline: "已下架",
};

const visibilityLabel: Record<ActorSKU["visibleTo"], string> = {
  tenants: "所有主服务方可见",
  verified: "仅合作过的主服务方可见",
  private: "仅自己可见",
};

function ActorServices() {
  const [items, setItems] = useState(seed);
  const [tab, setTab] = useState<"all" | "published" | "draft">("all");

  const buckets = useMemo(
    () => ({
      all: items,
      published: items.filter((i) => i.status === "published"),
      draft: items.filter((i) => i.status !== "published"),
    }),
    [items],
  );

  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: i.status === "published" ? "offline" : "published" } : i,
      ),
    );

  return (
    <AgentPanelProvider scopeLabel="演员端 · 我的服务片段" quickPrompts={["把我这条 SKU 改得更吸引人", "给草稿补几段脱敏案例", "哪些主服务方最常复用我的 SKU"]}>
    <>
    <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-6 sm:px-6 sm:py-8 md:pb-8">
      <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-primary">
        <UserCircle2 className="h-3.5 w-3.5" />
        演员端 · 我的服务片段
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">程小夕的可复用 SKU</h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            上架你的开场/中场/主题专场等"局部型服务片段",主服务方可将其组装进整场演出。你控制题材、禁忌与可见性,商务谈判仍由主服务方承担。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/actor/preferences"
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            偏好中心
          </Link>
          <button onClick={() => demoToast()} className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20">
            <Plus className="h-3.5 w-3.5" />
            新增服务片段
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Kpi label="已发布 SKU" value={String(buckets.published.length)} sub="近 90 天被复用 9 次" tone="verified" />
        <Kpi label="平均 NPS" value="4.7" sub="来自 10 场沉淀评价" tone="ai" />
        <Kpi label="待完善草稿" value={String(buckets.draft.length)} sub="AI 建议补充内容后发布" tone="pending" />
      </div>

      {/* Privacy note */}
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-border/60 bg-card/60 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-[color:var(--state-verified)]" />
        <div className="flex-1 text-[12px] leading-relaxed text-foreground/85">
          <div className="mb-0.5 text-xs font-medium text-foreground">上架不等于承接</div>
          发布 SKU 只代表"这类内容可被组装"。是否接下具体档期,仍在每次邀请到来时由你逐场决定。
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 rounded-lg border border-border/60 bg-card/40 p-2">
        {(["all", "published", "draft"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-medium transition-colors",
              tab === k ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {k === "all" ? `全部 · ${buckets.all.length}` : k === "published" ? `已发布 · ${buckets.published.length}` : `草稿/下架 · ${buckets.draft.length}`}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {buckets[tab].map((s) => (
          <SkuCard key={s.id} s={s} onToggle={() => toggle(s.id)} />
        ))}
      </div>

      <div className="mt-8">
        <AgentInlineSuggestion
          title="AI 建议:把「金融行业开场」升级为主打 SKU"
          actions={
            <button onClick={() => demoToast()} className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20">
              查看升级建议
            </button>
          }
        >
          该 SKU 近 6 个月被 2 家主服务方复用 4 次、平均 NPS 4.8,已具备"代表作"特征。建议补充 2 段脱敏视频与观众画像细节,提升发现效率。
        </AgentInlineSuggestion>
      </div>
    </div>
    <ActorBottomTabs />
    </>
    </AgentPanelProvider>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "pending" | "verified" | "ai" }) {
  const color =
    tone === "pending"
      ? "text-[color:var(--state-pending)]"
      : tone === "verified"
        ? "text-[color:var(--state-verified)]"
        : "text-[color:var(--state-ai)]";
  return (
    <div className="surface-1 rounded-xl p-4">
      <div className="text-[11px] tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-2xl font-semibold", color)}>{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function SkuCard({ s, onToggle }: { s: ActorSKU; onToggle: () => void }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <StatusBadge
              state={s.status === "published" ? "verified" : s.status === "draft" ? "pending" : "expired"}
              label={statusLabel[s.status]}
            />
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
              <Package className="h-3 w-3" />
              {s.format}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
              {s.visibleTo === "private" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {visibilityLabel[s.visibleTo]}
            </span>
          </div>
          <div className="text-sm font-semibold text-foreground">{s.title}</div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{s.duration}</span>
            <span className="inline-flex items-center gap-1"><UserCircle2 className="h-3 w-3" />{s.audience}</span>
            <span className="inline-flex items-center gap-1"><Tag className="h-3 w-3" />{s.priceAnchor}</span>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-md border border-border/60 bg-background/40 p-2">
              <div className="mb-1 text-[10px] tracking-wide text-muted-foreground">可用题材</div>
              <div className="flex flex-wrap gap-1">
                {s.themes.map((t) => (
                  <span key={t} className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10.5px] text-foreground/85">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-[color:var(--state-pending)]/30 bg-[color:var(--state-pending)]/5 p-2">
              <div className="mb-1 text-[10px] tracking-wide text-[color:var(--state-pending)]">禁忌 / 硬边界</div>
              <div className="flex flex-wrap gap-1">
                {s.taboos.map((t) => (
                  <span key={t} className="rounded border border-[color:var(--state-pending)]/40 bg-background/40 px-1.5 py-0.5 text-[10.5px] text-foreground/85">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span>被复用 <span className="font-mono text-foreground">{s.reuseCount}</span> 次</span>
            <span>平均 NPS <span className="font-mono text-foreground">{s.nps.toFixed(1)}</span></span>
          </div>
          <EvidenceLine source={s.updatedAt} className="mt-2">最近更新</EvidenceLine>
          {s.aiHint && (
            <div className="mt-2 rounded-md border border-[color:var(--state-ai)]/30 bg-[color:var(--state-ai)]/5 px-2.5 py-1.5 text-[11px] text-foreground/85">
              <Sparkles className="mr-1 inline h-3 w-3 text-[color:var(--state-ai)]" />
              {s.aiHint}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onToggle}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs",
              s.status === "published"
                ? "border border-border bg-secondary text-muted-foreground hover:text-foreground"
                : "border border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/10 text-[color:var(--state-verified)] hover:bg-[color:var(--state-verified)]/20",
            )}
          >
            {s.status === "published" ? "下架" : "发布"}
          </button>
          <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
            编辑
          </button>
          <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">
            查看复用记录 <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
