import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Minus, Sparkles, X } from "lucide-react";
import { z } from "zod";
import {
  serviceProducts,
  serviceProductCompletenessLabel,
  serviceProductCombinationLabel,
  type PerformanceServiceProduct,
} from "@/lib/fixtures";
import { AgentInlineSuggestion } from "@/components/yanlicube/agent";

const searchSchema = z.object({
  ids: z.string().optional(),
});

export const Route = createFileRoute("/discover/service-products/compare")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "服务产品对比 · 演立方" },
      { name: "description", content: "在 2-3 款演出服务产品之间进行结构化对比。" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { ids } = Route.useSearch();
  const rawIds: string[] = (ids ?? "").split(",");
  const list: PerformanceServiceProduct[] = rawIds
    .map((id: string) => id.trim())
    .filter((id: string) => Boolean(id))
    .slice(0, 3)
    .map((id: string) => serviceProducts.find((p) => p.id === id))
    .filter((p): p is PerformanceServiceProduct => Boolean(p));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
      <Link
        to="/discover/service-products"
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回服务产品列表
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">服务产品对比</h1>
        <p className="mt-2 text-[13px] text-muted-foreground sm:text-sm">
          最多 3 款并排比较。价格与档期不构成承诺,以主服务方正式报价为准。
        </p>
      </div>

      {list.length < 2 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-secondary/20 px-6 py-14 text-center text-sm text-muted-foreground">
          至少选择 2 款服务产品。回到{" "}
          <Link to="/discover/service-products" className="text-primary hover:underline">
            服务产品列表
          </Link>{" "}
          勾选后点击「对比」。
        </div>
      ) : (
        <>
          <div className="mb-4">
            <AgentInlineSuggestion title="AI 对比洞察">
              {agentInsight(list)}
            </AgentInlineSuggestion>
          </div>

          {/* Mobile: 每个产品一张卡 */}
          <div className="mb-6 grid gap-3 md:hidden">
            {list.map((p) => (
              <div key={p.id} className="rounded-lg border border-border/60 bg-card/60 p-3">
                <div className="mb-2">
                  <div className="text-[10px] text-muted-foreground">{p.tenantName}</div>
                  <Link
                    to="/discover/service-products/$id"
                    params={{ id: p.id }}
                    className="text-sm font-semibold text-foreground"
                  >
                    {p.title}
                  </Link>
                  <div className="mt-1">
                    <span
                      className={
                        p.completeness === "complete"
                          ? "rounded-md border border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/15 px-1.5 py-0.5 text-[10px] text-[color:var(--state-verified)]"
                          : "rounded-md border border-[color:var(--state-pending)]/50 bg-[color:var(--state-pending)]/15 px-1.5 py-0.5 text-[10px] text-[color:var(--state-pending)]"
                      }
                    >
                      {serviceProductCompletenessLabel[p.completeness]}
                    </span>
                  </div>
                </div>
                <dl className="space-y-2 text-[13px]">
                  <MRow k="一句话" v={p.oneLiner} />
                  <MRow k="时长" v={p.durationBand} />
                  <MRow k="观众规模" v={p.audienceScale} />
                  <MRow k="价位带" v={<span className="font-mono text-primary">{p.priceBand}</span>} />
                  <MRow k="典型场景" v={p.typicalScenes.join(" / ")} />
                  <MRow k="组合意愿" v={serviceProductCombinationLabel[p.combinationWillingness]} />
                  <MRow k="节目 / 模块 / 依赖 / 案例" v={`${p.includedPrograms.length} · ${p.includedModules.length} · ${p.dependencies.length} · ${p.relatedCaseIds.length}`} />
                  <MRow
                    k="独立承接整场"
                    v={
                      p.completeness === "complete" ? (
                        <span className="inline-flex items-center gap-1 text-[color:var(--state-verified)]">
                          <Check className="h-3.5 w-3.5" /> 可以
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Minus className="h-3.5 w-3.5" /> 需要与其他产品组合
                        </span>
                      )
                    }
                  />
                </dl>
                <div className="mt-3 flex flex-col gap-1.5">
                  <Link
                    to="/discover/service-products/$id/start"
                    params={{ id: p.id }}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    以此产品发起活动
                  </Link>
                  <div className="flex gap-1.5">
                    <Link
                      to="/discover/service-products/$id"
                      params={{ id: p.id }}
                      className="flex-1 rounded-md border border-border bg-card/40 px-3 py-1.5 text-center text-xs text-foreground"
                    >
                      查看详情
                    </Link>
                    <RemoveLink id={p.id} ids={ids ?? ""} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 w-40 border-b border-border/60 bg-background px-3 py-3 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    维度
                  </th>
                  {list.map((p) => (
                    <th key={p.id} className="border-b border-border/60 px-3 py-3 text-left align-top">
                      <div className="text-[10px] text-muted-foreground">{p.tenantName}</div>
                      <Link
                        to="/discover/service-products/$id"
                        params={{ id: p.id }}
                        className="text-sm font-semibold text-foreground hover:text-primary"
                      >
                        {p.title}
                      </Link>
                      <div className="mt-1">
                        <span
                          className={
                            p.completeness === "complete"
                              ? "rounded-md border border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/15 px-1.5 py-0.5 text-[10px] text-[color:var(--state-verified)]"
                              : "rounded-md border border-[color:var(--state-pending)]/50 bg-[color:var(--state-pending)]/15 px-1.5 py-0.5 text-[10px] text-[color:var(--state-pending)]"
                          }
                        >
                          {serviceProductCompletenessLabel[p.completeness]}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label="一句话" values={list.map((p) => p.oneLiner)} />
                <Row label="时长" values={list.map((p) => p.durationBand)} />
                <Row label="观众规模" values={list.map((p) => p.audienceScale)} />
                <Row
                  label="价位带"
                  values={list.map((p) => p.priceBand)}
                  tone="price"
                />
                <Row
                  label="典型场景"
                  values={list.map((p) => p.typicalScenes.join(" / "))}
                />
                <Row
                  label="组合意愿"
                  values={list.map((p) => serviceProductCombinationLabel[p.combinationWillingness])}
                />
                <Row
                  label="包含节目数"
                  values={list.map((p) => `${p.includedPrograms.length} 个`)}
                />
                <Row
                  label="服务模块数"
                  values={list.map((p) => `${p.includedModules.length} 项`)}
                />
                <Row
                  label="客户依赖清单"
                  values={list.map((p: PerformanceServiceProduct) => `${p.dependencies.length} 项`)}
                />
                <Row
                  label="相关案例"
                  values={list.map((p) => `${p.relatedCaseIds.length} 个`)}
                />
                <tr>
                  <td className="sticky left-0 z-10 border-t border-border/60 bg-background px-3 py-3 align-top text-[11px] uppercase tracking-wide text-muted-foreground">
                    独立承接整场
                  </td>
                  {list.map((p) => (
                    <td key={p.id} className="border-t border-border/60 px-3 py-3 align-top">
                      {p.completeness === "complete" ? (
                        <span className="inline-flex items-center gap-1 text-[color:var(--state-verified)]">
                          <Check className="h-3.5 w-3.5" /> 可以
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Minus className="h-3.5 w-3.5" /> 需要与其他产品组合
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="sticky left-0 z-10 border-t border-border/60 bg-background px-3 py-3 align-top text-[11px] uppercase tracking-wide text-muted-foreground">
                    下一步
                  </td>
                  {list.map((p) => (
                    <td key={p.id} className="border-t border-border/60 px-3 py-3 align-top">
                      <div className="flex flex-col gap-1.5">
                        <Link
                          to="/discover/service-products/$id/start"
                          params={{ id: p.id }}
                          className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
                        >
                          以此产品发起活动
                        </Link>
                        <Link
                          to="/discover/service-products/$id"
                          params={{ id: p.id }}
                          className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-card/40 px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
                        >
                          查看详情
                        </Link>
                        <RemoveLink id={p.id} ids={ids ?? ""} />
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            对比页由平台生成,不代表主服务方之间的官方立场。
          </div>
        </>
      )}
    </div>
  );
}

function Row({
  label,
  values,
  tone,
}: {
  label: string;
  values: string[];
  tone?: "price";
}) {
  return (
    <tr>
      <td className="sticky left-0 z-10 border-t border-border/60 bg-background px-3 py-3 align-top text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </td>
      {values.map((v, i) => (
        <td
          key={i}
          className={
            "border-t border-border/60 px-3 py-3 align-top text-sm " +
            (tone === "price" ? "font-mono text-primary" : "text-foreground")
          }
        >
          {v}
        </td>
      ))}
    </tr>
  );
}

function RemoveLink({ id, ids }: { id: string; ids: string }) {
  const remaining = ids.split(",").filter((x) => x && x !== id).join(",");
  return (
    <Link
      to="/discover/service-products/compare"
      search={{ ids: remaining || undefined }}
      className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-card/20 px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground"
    >
      <X className="h-3 w-3" /> 从对比中移除
    </Link>
  );
}

function agentInsight(list: PerformanceServiceProduct[]): string {
  const complete = list.filter((p) => p.completeness === "complete");
  const partial = list.filter((p) => p.completeness === "partial");
  if (complete.length && partial.length) {
    return `所选产品中有 ${complete.length} 款可独立承接整场,${partial.length} 款仅作为模块。若你希望「只面对一个负责人」,建议优先在完整型中选择;若你已有主服务方,可把局部型作为环节加入方案。`;
  }
  if (complete.length === list.length) {
    return `所选均为完整型。核心差异集中在时长与价位带,建议以「观众规模」与「典型场景匹配度」作为首要筛选依据。`;
  }
  return `所选均为局部型模块。它们不能独立承接整场活动,需要由主服务方组合到方案中。建议先明确主服务方,再决定引入哪几个模块。`;
}

function MRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="border-t border-border/40 pt-2">
      <div className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="text-foreground/90">{v}</div>
    </div>
  );
}
