import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ArrowRight, Layers, ExternalLink, GitCompare, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  serviceProducts,
  serviceProductCompletenessLabel,
  type PerformanceServiceProduct,
} from "@/lib/fixtures";

export const Route = createFileRoute("/discover/service-products/")({
  head: () => ({
    meta: [
      { title: "演出服务产品 · 发现 · 演立方" },
      {
        name: "description",
        content: "浏览可整体采购的演出服务产品:年会全案、发布会视觉、VIP 私宴、论坛主持模块等。",
      },
      { property: "og:title", content: "演出服务产品 · 发现 · 演立方" },
      { property: "og:description", content: "客户直接看得懂、可整体采购的演出服务产品。" },
    ],
  }),
  component: ServiceProductsDiscover,
});

const completenessFilters = [
  { key: "all", label: "全部" },
  { key: "complete", label: "完整型 · 可整体承接" },
  { key: "partial", label: "局部型 · 仅作模块" },
] as const;

// —— 智能筛选:预算 / 规模 —— //
const budgetBuckets = [
  { key: "any", label: "不限预算", min: 0, max: Infinity },
  { key: "b1", label: "10 万以下", min: 0, max: 10 },
  { key: "b2", label: "10-30 万", min: 10, max: 30 },
  { key: "b3", label: "30-60 万", min: 30, max: 60 },
  { key: "b4", label: "60 万以上", min: 60, max: Infinity },
] as const;

const scaleBuckets = [
  { key: "any", label: "不限规模", min: 0, max: Infinity },
  { key: "s1", label: "小型 <100 人", min: 0, max: 100 },
  { key: "s2", label: "中型 100-500 人", min: 100, max: 500 },
  { key: "s3", label: "大型 500-1500 人", min: 500, max: 1500 },
  { key: "s4", label: "特大型 1500+ 人", min: 1500, max: Infinity },
] as const;

// 从 "¥18-35万" / "¥100 万+" 抽出数值(万元)
function parseBudgetRange(band: string): [number, number] {
  const nums = band.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (nums.length === 0) return [0, Infinity];
  if (band.includes("+") || band.includes("以上")) return [nums[0], Infinity];
  if (nums.length === 1) return [nums[0], nums[0]];
  return [Math.min(...nums), Math.max(...nums)];
}

// 从 "300-800 人" / "1500+ 人" 抽出人数
function parseScaleRange(band: string): [number, number] {
  const nums = band.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length === 0) return [0, Infinity];
  if (band.includes("+") || band.includes("以上")) return [nums[0], Infinity];
  if (nums.length === 1) return [nums[0], nums[0]];
  return [Math.min(...nums), Math.max(...nums)];
}

function rangesOverlap(a: [number, number], b: [number, number]): boolean {
  return a[0] <= b[1] && b[0] <= a[1];
}

function ServiceProductsDiscover() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof completenessFilters)[number]["key"]>("all");
  const [budget, setBudget] = useState<(typeof budgetBuckets)[number]["key"]>("any");
  const [scale, setScale] = useState<(typeof scaleBuckets)[number]["key"]>("any");
  const [scenes, setScenes] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  // 全部可选场景标签(来自当前上架产品)
  const allScenes = useMemo(() => {
    const s = new Set<string>();
    serviceProducts.forEach((p) => {
      if (p.status !== "listed") return;
      p.typicalScenes.forEach((x) => s.add(x));
    });
    return Array.from(s);
  }, []);

  const budgetBucket = budgetBuckets.find((b) => b.key === budget)!;
  const scaleBucket = scaleBuckets.find((b) => b.key === scale)!;

  const list = useMemo(() => {
    return serviceProducts.filter((p) => {
      if (p.status !== "listed") return false;
      if (filter !== "all" && p.completeness !== filter) return false;
      if (budget !== "any") {
        const pr = parseBudgetRange(p.priceBand);
        if (!rangesOverlap(pr, [budgetBucket.min, budgetBucket.max])) return false;
      }
      if (scale !== "any") {
        const sr = parseScaleRange(p.audienceScale);
        if (!rangesOverlap(sr, [scaleBucket.min, scaleBucket.max])) return false;
      }
      if (scenes.length > 0) {
        const hit = scenes.some((s) => p.typicalScenes.includes(s));
        if (!hit) return false;
      }
      if (!q) return true;
      return (
        p.title.includes(q) ||
        p.oneLiner.includes(q) ||
        p.typicalScenes.some((s) => s.includes(q))
      );
    });
  }, [q, filter, budget, scale, scenes, budgetBucket, scaleBucket]);

  const activeCount =
    (filter !== "all" ? 1 : 0) +
    (budget !== "any" ? 1 : 0) +
    (scale !== "any" ? 1 : 0) +
    scenes.length +
    (q ? 1 : 0);

  const resetAll = () => {
    setQ("");
    setFilter("all");
    setBudget("any");
    setScale("any");
    setScenes([]);
  };

  const toggleScene = (s: string) => {
    setScenes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };


  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // 最多 3 个
      return [...prev, id];
    });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 pb-40 sm:px-6 sm:py-10 sm:pb-32">
      <div className="mb-6 sm:mb-8">
        <div className="mb-1 text-[11px] tracking-[0.14em] text-muted-foreground sm:text-xs">
          发现 · 演出服务产品
        </div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">看得懂、可整体采购的活动交付物</h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
          演出服务产品把「节目 + 演出服务」打包为客户可以直接对话与采购的整体交付物。
          <span className="text-foreground">完整型</span> 可以由主服务方独立承接整场活动;
          <span className="text-foreground">局部型</span> 只作为模块被其他主服务方组合使用。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <Link to="/discover/programs" className="inline-flex items-center gap-0.5 rounded border border-border/60 bg-secondary/40 px-2 py-1 hover:text-foreground">
            要看内容单元? 去节目列表 <ExternalLink className="h-3 w-3" />
          </Link>
          <Link to="/discover/cases" className="inline-flex items-center gap-0.5 rounded border border-border/60 bg-secondary/40 px-2 py-1 hover:text-foreground">
            看真实案例 <ExternalLink className="h-3 w-3" />
          </Link>
          <span className="rounded border border-border/60 bg-secondary/40 px-2 py-1">
            勾选卡片右上角可加入对比(最多 3 个)
          </span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2 sm:mb-6">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索产品 / 场景"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="mb-6 -mx-4 flex snap-x snap-mandatory items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {completenessFilters.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "shrink-0 snap-start rounded-md border px-3 py-1.5 text-xs transition-colors",
                active
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 智能筛选 */}
      <div className="mb-6 space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          智能筛选
          {activeCount > 0 && (
            <>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                已启用 {activeCount} 项
              </span>
              <button
                onClick={resetAll}
                className="ml-auto text-[11px] text-muted-foreground hover:text-foreground"
              >
                重置全部
              </button>
            </>
          )}
        </div>

        <FilterRow label="预算">
          {budgetBuckets.map((b) => (
            <Chip key={b.key} active={budget === b.key} onClick={() => setBudget(b.key)}>
              {b.label}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="观众规模">
          {scaleBuckets.map((b) => (
            <Chip key={b.key} active={scale === b.key} onClick={() => setScale(b.key)}>
              {b.label}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="典型场景">
          {allScenes.map((s) => (
            <Chip key={s} active={scenes.includes(s)} onClick={() => toggleScene(s)}>
              {s}
            </Chip>
          ))}
        </FilterRow>
      </div>

      <div className="mb-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>共 {list.length} 款产品匹配当前筛选</span>
        {activeCount > 0 && list.length === 0 && (
          <span>试着放宽预算或规模,或让 AI 顾问帮你推荐</span>
        )}
      </div>



      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <PublicCard
            key={p.id}
            p={p}
            checked={selected.includes(p.id)}
            disabled={!selected.includes(p.id) && selected.length >= 3}
            onToggle={() => toggle(p.id)}
          />
        ))}
        {list.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-border/60 bg-secondary/20 px-6 py-12 text-center text-sm text-muted-foreground">
            没有匹配的服务产品。让 AI 顾问基于你的活动为你推荐 →{" "}
            <Link to="/agent" className="text-primary hover:underline">打开 AI 顾问</Link>
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="fixed inset-x-2 bottom-2 z-40 mx-auto flex max-w-[900px] flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/95 px-3 py-2.5 shadow-lg backdrop-blur sm:inset-x-0 sm:bottom-4 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <GitCompare className="h-4 w-4 text-primary" />
            <span className="font-medium">对比</span>
            <span className="text-xs text-muted-foreground">{selected.length} / 3</span>
          </div>
          <div className="order-3 flex w-full flex-wrap items-center gap-1.5 sm:order-none sm:w-auto">
            {selected.map((id) => {
              const p = serviceProducts.find((x) => x.id === id);
              if (!p) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-secondary/40 px-2 py-0.5 text-[11px] text-foreground"
                >
                  {p.title}
                  <button
                    onClick={() => toggle(id)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="移除"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected([])}
              className="rounded-md border border-border bg-card/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              清空
            </button>
            {selected.length >= 2 ? (
              <Link
                to="/discover/service-products/compare"
                search={{ ids: selected.join(",") }}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
              >
                打开对比 <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">再选 1 个</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PublicCard({
  p,
  checked,
  disabled,
  onToggle,
}: {
  p: PerformanceServiceProduct;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "surface-1 group relative flex flex-col overflow-hidden rounded-xl transition-all",
        checked ? "border-primary/60 ring-1 ring-primary/40" : "hover:border-primary/50",
      )}
    >
      <label
        className={cn(
          "absolute right-2 top-2 z-10 flex cursor-pointer items-center gap-1 rounded-md border bg-background/80 px-2 py-1 text-[11px] backdrop-blur",
          checked
            ? "border-primary/60 text-primary"
            : disabled
              ? "border-border/60 text-muted-foreground/60"
              : "border-border/60 text-muted-foreground hover:text-foreground",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
          className="h-3.5 w-3.5 accent-primary"
        />
        对比
      </label>
      <Link
        to="/discover/service-products/$id"
        params={{ id: p.id }}
        className="flex flex-1 flex-col"
      >
        <div className="relative h-40 w-full overflow-hidden bg-secondary">
          {p.coverImage && (
            <img
              src={p.coverImage}
              alt={p.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          )}
          <div className="absolute left-2 top-2 flex gap-1">
            <span
              className={cn(
                "rounded-md border px-1.5 py-0.5 text-[10px] backdrop-blur",
                p.completeness === "complete"
                  ? "border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/20 text-[color:var(--state-verified)]"
                  : "border-[color:var(--state-pending)]/50 bg-[color:var(--state-pending)]/20 text-[color:var(--state-pending)]",
              )}
            >
              {serviceProductCompletenessLabel[p.completeness].split(" · ")[0]}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/discover/tenants/${p.tenantId}`;
            }}
            className="cursor-pointer text-[11px] text-muted-foreground hover:text-primary hover:underline"
          >
            主服务方 · {p.tenantName} →
          </span>

          <div className="mt-1 text-base font-semibold text-foreground group-hover:text-primary">
            {p.title}
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.oneLiner}</p>

          <div className="mt-3 flex flex-wrap gap-1">
            {p.typicalScenes.slice(0, 3).map((s) => (
              <span key={s} className="rounded bg-secondary/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {s}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3 w-3" /> {p.includedPrograms.length} 节目 · {p.includedModules.length} 服务
            </span>
            <span className="font-mono text-foreground">{p.priceBand}</span>
          </div>

          <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-primary group-hover:underline">
            查看详情并让 AI 生成方案 <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </Link>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-16 shrink-0 text-[11px] text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-[11px] transition-colors",
        active
          ? "border-primary/60 bg-primary/10 text-primary"
          : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
