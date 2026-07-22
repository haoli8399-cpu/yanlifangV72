import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ChevronLeft, GitCompare, Plus, X } from "lucide-react";
import { cases } from "@/lib/fixtures";
import { EvidenceLine, AgentInlineSuggestion } from "@/components/yanlicube/agent";

export const Route = createFileRoute("/discover/cases/compare")({
  head: () => ({
    meta: [
      { title: "案例对比 · 发现 · 演立方" },
      { name: "description", content: "把 2–3 个真实案例并排看:预算、规模、成果、亮点差异一目了然。" },
    ],
  }),
  component: CasesCompare,
});

function CasesCompare() {
  const [picked, setPicked] = useState<string[]>([cases[0].id, cases[1].id]);
  const items = picked.map((id) => cases.find((c) => c.id === id)!).filter(Boolean);
  const remaining = cases.filter((c) => !picked.includes(c.id));

  const add = (id: string) => picked.length < 3 && setPicked((p) => [...p, id]);
  const remove = (id: string) => picked.length > 1 && setPicked((p) => p.filter((x) => x !== id));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
      <Link
        to="/discover/cases"
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" /> 返回案例列表
      </Link>

      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <GitCompare className="h-3 w-3" /> 案例对比
        </div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">看 2–3 个真实案例的差异</h1>
        <p className="mt-2 max-w-2xl text-[13px] text-muted-foreground sm:text-sm">
          用来向领导解释"为什么这个预算能做到这个规模"。所有数据来自过往真实案例(已脱敏)。
        </p>
      </header>

      <AgentInlineSuggestion title="AI 观察:预算差 60% 时,呈现调性变化明显">
        选中案例中,预算带跨度从「30–50 万」到「80–120 万」。低预算档以内容驱动,高预算档在氛围与仪式感上明显增强。若你的活动更看重传播,建议参照高预算档;若看重内部共识,低预算档亦足够。
      </AgentInlineSuggestion>

      {/* Mobile: 每个案例一张卡 */}
      <div className="mt-6 grid gap-3 md:hidden">
        {items.map((c) => (
          <div key={c.id} className="rounded-lg border border-border/60 bg-card/60 p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {c.industry} · {c.city}
                </div>
                <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{c.title}</div>
              </div>
              {items.length > 1 && (
                <button
                  onClick={() => remove(c.id)}
                  className="shrink-0 rounded p-0.5 text-muted-foreground"
                  aria-label="移除"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <dl className="space-y-2 text-[13px]">
              <MRow k="预算带" v={c.budgetBand} />
              <MRow k="规模" v={c.scale} />
              <MRow k="核心成果" v={<span className="text-[color:var(--state-verified)]">{c.outcome}</span>} />
              <MRow
                k="亮点做法"
                v={
                  <ul className="space-y-0.5 text-xs text-foreground/85">
                    {c.highlights.map((h) => (
                      <li key={h}>· {h}</li>
                    ))}
                  </ul>
                }
              />
              <MRow k="来源" v={<EvidenceLine source="服务方提交 · 平台已核验">项目结案报告</EvidenceLine>} />
            </dl>
            <Link
              to="/snapshot"
              className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
            >
              参照 TA 生成方案 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
        {items.length < 3 && remaining.length > 0 && (
          <div className="rounded-lg border border-dashed border-border/60 bg-secondary/30 p-3">
            <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">加入对比</div>
            <div className="flex flex-wrap gap-1.5">
              {remaining.map((c) => (
                <button
                  key={c.id}
                  onClick={() => add(c.id)}
                  className="inline-flex items-center gap-1 rounded border border-border/60 bg-background px-2 py-1 text-[11px] text-muted-foreground"
                >
                  <Plus className="h-3 w-3" /> {c.title.slice(0, 12)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="w-[140px] border-b border-border/60 bg-background/40 p-3 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                维度
              </th>
              {items.map((c) => (
                <th
                  key={c.id}
                  className="min-w-[220px] border-b border-l border-border/60 bg-card/50 p-3 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {c.industry} · {c.city}
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-foreground">{c.title}</div>
                    </div>
                    {items.length > 1 && (
                      <button
                        onClick={() => remove(c.id)}
                        className="rounded p-0.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        aria-label="移除"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {items.length < 3 && remaining.length > 0 && (
                <th className="min-w-[220px] border-b border-l border-border/60 bg-background/30 p-3 text-left align-top">
                  <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    加入对比
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {remaining.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => add(c.id)}
                        className="inline-flex items-center gap-1 rounded border border-border/60 bg-background px-2 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      >
                        <Plus className="h-3 w-3" /> {c.title.slice(0, 12)}
                      </button>
                    ))}
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="[&_td]:border-b [&_td]:border-border/40 [&_td]:p-3 [&_td]:align-top [&_td:not(:first-child)]:border-l">
            <Row label="预算带" cells={items.map((c) => c.budgetBand)} />
            <Row label="规模" cells={items.map((c) => c.scale)} />
            <Row
              label="核心成果"
              cells={items.map((c) => (
                <span className="text-[color:var(--state-verified)]">{c.outcome}</span>
              ))}
            />
            <Row
              label="亮点做法"
              cells={items.map((c) => (
                <ul className="space-y-1 text-xs text-foreground/85">
                  {c.highlights.map((h) => (
                    <li key={h}>· {h}</li>
                  ))}
                </ul>
              ))}
            />
            <Row
              label="来源"
              cells={items.map((c) => (
                <EvidenceLine source="服务方提交 · 平台已核验">
                  项目结案报告 · {c.industry} · {c.city}
                </EvidenceLine>
              ))}
            />
            <tr>
              <td className="text-[11px] uppercase tracking-wider text-muted-foreground">推进</td>
              {items.map((c) => (
                <td key={c.id}>
                  <Link
                    to="/snapshot"
                    className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                  >
                    参照 TA 生成方案 <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, cells }: { label: string; cells: (string | React.ReactNode)[] }) {
  return (
    <tr>
      <td className="bg-background/30 text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </td>
      {cells.map((v, i) => (
        <td key={i} className="bg-card/40 text-sm text-foreground/90">
          {v}
        </td>
      ))}
    </tr>
  );
}

function MRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="border-t border-border/40 pt-2">
      <div className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="text-foreground/90">{v}</div>
    </div>
  );
}