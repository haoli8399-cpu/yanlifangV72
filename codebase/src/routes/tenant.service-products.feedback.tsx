import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Package,
  Star,
  ShieldCheck,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { serviceProducts, type PerformanceServiceProduct } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tenant/service-products/feedback")({
  head: () => ({
    meta: [
      { title: "评价回流 · 演出服务产品 · 演立方" },
      { name: "description", content: "把项目结束后的分层评价自动写回对应服务产品与 SKU 的复用记录与 NPS,形成可持续沉淀。" },
    ],
  }),
  component: FeedbackHub,
});

type ReviewInflow = {
  id: string;
  projectId: string;
  projectTitle: string;
  finishedAt: string;
  productId: string;
  productTitle: string;
  scoreNps: number;
  highlights: string[];
  gaps: string[];
  ratedBy: string;
  status: "pending" | "applied" | "dismissed";
  aiSuggestion?: string;
};

const inflowSeed: ReviewInflow[] = [
  {
    id: "rv1",
    projectId: "p-neo-annual",
    projectTitle: "Neo 银行 2026 战略客户答谢",
    finishedAt: "2026-11-08 客户方 · 品牌市场部",
    productId: "sp-comedy-gala-standard",
    productTitle: "喜剧年会 · 标准版 (完整型)",
    scoreNps: 74,
    highlights: [
      "开场 20 min 节奏克制,受众反馈'不冒犯又好笑'",
      "主持串联把 3 段独立节目串成一个故事线",
    ],
    gaps: ["候场衔接曾出现 2 分钟空场,需在 Handoff 中标准化"],
    ratedBy: "客户 · 沈玥 / 主服务方 · 沈斌",
    status: "pending",
    aiSuggestion: "建议:将 NPS 74 计入产品 npsAvg(权重 0.15),并在 Handoff v3 补充「候场空场兜底」模块。",
  },
  {
    id: "rv2",
    projectId: "proj_reuse",
    projectTitle: "AlphaBio 发布会中场",
    finishedAt: "2026-10-22 客户方 · 市场总监",
    productId: "sp-launch-midshow",
    productTitle: "发布会中场 · 严肃场适配 (局部型)",
    scoreNps: 71,
    highlights: ["行业黑话准确,现场笑点密度达标"],
    gaps: ["观众画像描述偏保守,实际互动欲望更高"],
    ratedBy: "客户 · 匿名 / 演员 · 程小夕",
    status: "applied",
    aiSuggestion: "已于 2 小时前应用:更新观众画像标签 +「愿主动互动」,并将 NPS 71 计入产品记录。",
  },
  {
    id: "rv3",
    projectId: "p-fintech-summit",
    projectTitle: "Fintech 峰会晚宴专场",
    finishedAt: "2026-09-30 客户方 · 会务组",
    productId: "sp-comedy-gala-standard",
    productTitle: "喜剧年会 · 标准版 (完整型)",
    scoreNps: 58,
    highlights: [],
    gaps: [
      "客户方期望「更强互动」,现有 SKU 未含互动环节",
      "现场 IT 走线延迟 15 分钟,影响开场",
    ],
    ratedBy: "客户 · 会务负责人",
    status: "pending",
    aiSuggestion: "建议:不直接下调 NPS,先在产品说明中增补「互动加购模块」的可选项,并向该客户返场补偿。",
  },
];

const productMap = new Map(serviceProducts.map((p) => [p.id, p]));

function FeedbackHub() {
  const [items, setItems] = useState(inflowSeed);
  const [tab, setTab] = useState<"pending" | "applied" | "dismissed">("pending");

  const buckets = useMemo(
    () => ({
      pending: items.filter((i) => i.status === "pending"),
      applied: items.filter((i) => i.status === "applied"),
      dismissed: items.filter((i) => i.status === "dismissed"),
    }),
    [items],
  );

  const apply = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "applied" } : i)));
  const dismiss = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "dismissed" } : i)));

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/tenant/service-products" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          返回服务产品库
        </Link>
      </div>
      <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-primary">
        <TrendingUp className="h-3.5 w-3.5" />
        评价回流中心
      </div>
      <h1 className="text-2xl font-semibold text-foreground">项目分层评价 → 服务产品沉淀</h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        项目结束后的客户/演员/内部评价会按 SKU 归集,由你确认后写回对应服务产品的 NPS、复用记录与产品说明。忽略的条目会保留在审计流,不进入公开档案。
      </p>

      {/* KPI */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Kpi label="待处理回流" value={String(buckets.pending.length)} sub="AI 已归集 SKU + 建议动作" tone="pending" />
        <Kpi label="本季度已应用" value={String(buckets.applied.length + 12)} sub="覆盖 6 个服务产品" tone="verified" />
        <Kpi label="产品平均 NPS" value="71.2" sub="较上季 +2.1" tone="ai" />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 rounded-lg border border-border/60 bg-card/40 p-2">
        {(["pending", "applied", "dismissed"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-medium transition-colors",
              tab === k ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {k === "pending"
              ? `待处理 · ${buckets.pending.length}`
              : k === "applied"
                ? `已应用 · ${buckets.applied.length}`
                : `已忽略 · ${buckets.dismissed.length}`}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {buckets[tab].map((i) => (
          <InflowCard
            key={i.id}
            i={i}
            product={productMap.get(i.productId)}
            onApply={() => apply(i.id)}
            onDismiss={() => dismiss(i.id)}
          />
        ))}
        {buckets[tab].length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-6 text-center text-xs text-muted-foreground">
            当前分组暂无条目
          </div>
        )}
      </div>

      <div className="mt-8">
        <AgentInlineSuggestion
          title="AI 观察:一条差评不代表下调 NPS,可能是 SKU 说明遗漏"
          actions={
            <Link
              to="/tenant/service-products"
              className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20"
            >
              打开服务产品库
            </Link>
          }
        >
          本季度 3 条 NPS &lt; 65 的评价中,2 条根因是「产品说明未涵盖互动环节」——AI 建议先补充可选模块,再由下一场次决定是否影响 NPS 均值。
        </AgentInlineSuggestion>
      </div>
    </div>
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

function InflowCard({
  i,
  product,
  onApply,
  onDismiss,
}: {
  i: ReviewInflow;
  product?: PerformanceServiceProduct;
  onApply: () => void;
  onDismiss: () => void;
}) {
  const trend = i.scoreNps >= 70 ? "up" : "down";
  const currentAvg = product?.npsAvg ?? 0;
  const currentReuse = product?.reuseCount ?? 0;
  const projectedAvg = product ? Math.round((currentAvg * currentReuse + i.scoreNps) / (currentReuse + 1)) : i.scoreNps;

  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <StatusBadge
              state={i.status === "applied" ? "verified" : i.status === "dismissed" ? "expired" : "pending"}
              label={i.status === "applied" ? "已应用" : i.status === "dismissed" ? "已忽略" : "待处理"}
            />
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
              <Package className="h-3 w-3" />
              {i.productTitle}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono",
                trend === "up"
                  ? "border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 text-[color:var(--state-verified)]"
                  : "border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 text-[color:var(--state-pending)]",
              )}
            >
              {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              NPS {i.scoreNps}
            </span>
          </div>
          <div className="text-sm font-semibold text-foreground">{i.projectTitle}</div>
          <EvidenceLine source={`${i.finishedAt} · 评价方:${i.ratedBy}`} className="mt-1">
            分层评价来源
          </EvidenceLine>

          {i.highlights.length > 0 && (
            <div className="mt-2 rounded-md border border-[color:var(--state-verified)]/30 bg-[color:var(--state-verified)]/5 p-2 text-[12px] text-foreground/85">
              <div className="mb-1 flex items-center gap-1 text-[10.5px] tracking-wide text-[color:var(--state-verified)]">
                <Star className="h-3 w-3" /> 亮点
              </div>
              <ul className="space-y-0.5">
                {i.highlights.map((h) => (
                  <li key={h}>· {h}</li>
                ))}
              </ul>
            </div>
          )}
          {i.gaps.length > 0 && (
            <div className="mt-2 rounded-md border border-[color:var(--state-pending)]/30 bg-[color:var(--state-pending)]/5 p-2 text-[12px] text-foreground/85">
              <div className="mb-1 flex items-center gap-1 text-[10.5px] tracking-wide text-[color:var(--state-pending)]">
                <ShieldCheck className="h-3 w-3" /> 差距 / 需回写
              </div>
              <ul className="space-y-0.5">
                {i.gaps.map((g) => (
                  <li key={g}>· {g}</li>
                ))}
              </ul>
            </div>
          )}

          {i.aiSuggestion && (
            <div className="mt-2 rounded-md border border-[color:var(--state-ai)]/30 bg-[color:var(--state-ai)]/5 px-2.5 py-1.5 text-[11px] text-foreground/85">
              <Sparkles className="mr-1 inline h-3 w-3 text-[color:var(--state-ai)]" />
              {i.aiSuggestion}
            </div>
          )}

          {/* Projected impact */}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <ImpactRow label="产品 NPS 均值" from={currentAvg || "—"} to={projectedAvg} unit="" />
            <ImpactRow label="复用次数" from={currentReuse} to={currentReuse + 1} unit=" 次" />
          </div>
        </div>

        {i.status === "pending" && (
          <div className="flex flex-col gap-2">
            <button
              onClick={onApply}
              className="inline-flex items-center gap-1 rounded-md border border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/10 px-3 py-1.5 text-xs text-[color:var(--state-verified)] hover:bg-[color:var(--state-verified)]/20"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              应用回流
            </button>
            <button
              onClick={onDismiss}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Circle className="h-3.5 w-3.5" />
              暂不写回
            </button>
            <Link
              to="/tenant/service-products/$id"
              params={{ id: i.productId }}
              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              查看服务产品 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ImpactRow({ label, from, to, unit }: { label: string; from: string | number; to: number; unit: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-2 text-[11.5px]">
      <div className="text-[10px] tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-center gap-2 font-mono">
        <span className="text-muted-foreground">{from}{unit}</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-foreground">{to}{unit}</span>
      </div>
    </div>
  );
}
