import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Building2, GitCompare, MapPin } from "lucide-react";
import { cases } from "@/lib/fixtures";

export const Route = createFileRoute("/discover/cases/")({
  head: () => ({
    meta: [
      { title: "案例 · 发现 · 演立方" },
      { name: "description", content: "查看真实商演案例,理解不同预算带对应的成果与调性。" },
      { property: "og:title", content: "案例 · 发现 · 演立方" },
      { property: "og:description", content: "预算 · 规模 · 成果一目了然。" },
    ],
  }),
  component: CasesList,
});

function CasesList() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:mb-8 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 text-[11px] tracking-[0.14em] text-muted-foreground sm:text-xs">发现 · 案例</div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">别人是怎么办的?</h1>
          <p className="mt-2 max-w-2xl text-[13px] text-muted-foreground sm:text-sm">
            按行业 / 规模 / 预算浏览已完成活动。以下为后仰喜剧真实活动类型的示例画像,具体客户名与成交金额已隐藏。每个案例都能一键"参照 TA 生成方案"。
          </p>
        </div>
        <Link
          to="/discover/cases/compare"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/20 sm:px-3 sm:py-2 sm:text-xs"
        >
          <GitCompare className="h-3.5 w-3.5" /> 案例对比
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cases.map((c) => (
          <div key={c.id} className="surface-1 flex flex-col rounded-xl p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] tracking-[0.12em] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded border border-border/60 bg-secondary/40 px-1.5 py-0.5">
                <Building2 className="h-3 w-3" /> {c.industry}
              </span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.city}</span>
              <span className="rounded bg-secondary/40 px-1.5 py-0.5">{c.budgetBand}</span>
            </div>
            <div className="mb-1 text-base font-semibold text-foreground">{c.title}</div>
            <div className="mb-3 text-xs text-muted-foreground">{c.scale}</div>
            <div className="mb-4 rounded-md border border-[color:var(--state-verified)]/25 bg-[color:var(--state-verified)]/[0.06] p-3 text-xs text-foreground/85">
              <span className="mr-1 font-medium text-[color:var(--state-verified)]">成果</span>
              {c.outcome}
            </div>
            <ul className="mb-4 space-y-1 text-xs text-muted-foreground">
              {c.highlights.slice(0, 2).map((h) => (
                <li key={h}>· {h}</li>
              ))}
            </ul>
            <div className="mt-auto flex items-center gap-2">
              <Link
                to="/discover/cases/$id"
                params={{ id: c.id }}
                className="flex-1 rounded-md border border-border/70 bg-background/40 px-3 py-2 text-center text-xs font-medium text-foreground/80 hover:border-primary/50 hover:text-foreground"
              >
                查看详情
              </Link>
              <Link
                to="/snapshot"
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                参照 TA 生成方案
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}