import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Sparkles,
  Package,
  Layers,
  GitBranch,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion } from "@/components/yanlicube/agent";
import {
  serviceProducts,
  serviceProductCompletenessLabel,
  serviceProductCombinationLabel,
  serviceProductStatusLabel,
  type PerformanceServiceProduct,
} from "@/lib/fixtures";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/tenant/service-products/")({
  head: () => ({
    meta: [
      { title: "演出服务产品库 · 服务方 · 演立方" },
      {
        name: "description",
        content:
          "把节目 + 演出服务打包为客户可采购的服务产品 SKU:完整/局部、版本、组合意愿、依赖清单齐备。",
      },
    ],
  }),
  component: ServiceProductLibrary,
});

type TabKey = "all" | "complete" | "partial" | "draft" | "paused";
const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "complete", label: "完整型" },
  { key: "partial", label: "局部型" },
  { key: "draft", label: "草稿" },
  { key: "paused", label: "已下架" },
];

function ServiceProductLibrary() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<TabKey>("all");

  const filtered = useMemo(() => {
    return serviceProducts.filter((p) => {
      const okQ =
        !q ||
        p.title.includes(q) ||
        p.typicalScenes.some((s) => s.includes(q)) ||
        p.oneLiner.includes(q);
      const okTab =
        tab === "all" ||
        (tab === "complete" && p.completeness === "complete" && p.status !== "draft" && p.status !== "paused") ||
        (tab === "partial" && p.completeness === "partial" && p.status !== "draft" && p.status !== "paused") ||
        (tab === "draft" && p.status === "draft") ||
        (tab === "paused" && p.status === "paused");
      return okQ && okTab;
    });
  }, [q, tab]);

  const totalReuse = serviceProducts.reduce((s, p) => s + p.reuseCount, 0);
  const listedCount = serviceProducts.filter((p) => p.status === "listed").length;
  const partialCount = serviceProducts.filter((p) => p.completeness === "partial").length;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <Link to="/tenant" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回经营工作台
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-xs tracking-[0.14em] text-muted-foreground">
            TENANT · 演出服务产品库
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            把节目 + 服务打包为可采购的产品 SKU
          </h1>
          <div className="mt-1 max-w-2xl text-xs text-muted-foreground">
            演出服务产品 = 节目 × 演出服务(主持 / 导演 / 统筹 / 舞美 / 落地)。带版本、完整/局部标识、组合意愿与依赖清单,是客户方案与内部报价的最小单元。
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/tenant/service-products/feedback"
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary hover:bg-primary/20"
          >
            评价回流中心
          </Link>
          <button onClick={() => demoToast()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> 新建服务产品
          </button>
        </div>

      </div>

      <div className="mb-4 rounded-md border border-dashed border-border/60 bg-secondary/30 px-3 py-2 text-[11px] text-muted-foreground">
        与「节目产品库」区分:节目是内容单元;服务产品是客户能"整体采购"的交付物。同一个节目可被多个服务产品复用。
        <Link to="/tenant/programs" className="ml-2 inline-flex items-center gap-0.5 text-primary hover:underline">
          去节目产品库 <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="产品总数" value={serviceProducts.length} sub={`${listedCount} 项已发布`} icon={Package} />
        <StatCard label="累计复用" value={totalReuse} sub="次成交" icon={Sparkles} />
        <StatCard label="局部型模块" value={partialCount} sub="可被邀请到他方方案" icon={Layers} />
        <StatCard label="平均版本" value="v1.5" sub="全部含变更历史" icon={GitBranch} />
      </div>

      <AgentInlineSuggestion
        title="AI 观察"
        actions={
          <Link
            to="/discover/service-products"
            className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20"
          >
            查看公共展示
          </Link>
        }
      >
        近 30 天有 2 个「完整型」服务产品被外部客户查看后转化为主服务机会;1 个「局部型」被其他主服务方 邀请到组合方案。你的产品库结构完整,建议继续用相同颗粒度沉淀。
      </AgentInlineSuggestion>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs transition-colors",
                active
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
        <div className="ml-auto flex min-w-[240px] items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索产品 / 场景 / 描述"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border/60 bg-secondary/20 px-6 py-12 text-center text-sm text-muted-foreground">
            没有匹配的服务产品。调整搜索或新建一个。
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ p }: { p: PerformanceServiceProduct }) {
  const status = serviceProductStatusLabel[p.status];
  return (
    <Link
      to="/tenant/service-products/$id"
      params={{ id: p.id }}
      className="surface-1 group flex flex-col overflow-hidden rounded-xl transition-all hover:border-primary/50"
    >
      <div className="relative h-32 w-full overflow-hidden bg-secondary">
        {p.coverImage && (
          <img
            src={p.coverImage}
            alt={p.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-[10px] backdrop-blur",
              p.completeness === "complete"
                ? "border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/20 text-[color:var(--state-verified)]"
                : "border-[color:var(--state-pending)]/50 bg-[color:var(--state-pending)]/20 text-[color:var(--state-pending)]",
            )}
          >
            {p.completeness === "complete" ? "完整型" : "局部型"}
          </span>
          <span className="rounded-md border border-border/60 bg-background/70 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80 backdrop-blur">
            {p.version}
          </span>
        </div>
        <div className="absolute right-2 top-2">
          <StatusBadge state={status.state} label={status.label} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-sm font-semibold text-foreground group-hover:text-primary">
          {p.title}
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.oneLiner}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <MiniField label="价位带" value={p.priceBand} />
          <MiniField label="观众规模" value={p.audienceScale} />
          <MiniField label="时长" value={p.durationBand} />
          <MiniField label="组合意愿" value={serviceProductCombinationLabel[p.combinationWillingness].split(" · ")[0]} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {p.typicalScenes.slice(0, 3).map((s) => (
            <span key={s} className="rounded border border-border/60 bg-secondary/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
          <span>包含节目 {p.includedPrograms.length} · 服务 {p.includedModules.length}</span>
          <span>复用 {p.reuseCount} 次 · NPS {p.npsAvg}</span>
        </div>
        {p.agentAdvice && (
          <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[10.5px] text-primary/90">
            <Sparkles className="mr-1 inline h-3 w-3" /> {p.agentAdvice}
          </div>
        )}
      </div>
    </Link>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary/30 px-2 py-1.5">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate font-mono text-[11px] text-foreground">{value}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: typeof Package;
}) {
  return (
    <div className="surface-1 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] tracking-wide text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

// Re-export used to silence unused warnings for label maps referenced only in details.
export { serviceProductCompletenessLabel };
