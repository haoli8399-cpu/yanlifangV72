import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  Users2,
  MapPin,
  Cpu,
  FileText,
  Wrench,
  ExternalLink,
  TrendingUp,
  Eye,
} from "lucide-react";
import {
  getServiceProduct,
  serviceProductCompletenessLabel,
  serviceProductCombinationLabel,
  programs,
  cases,
  type PerformanceServiceProduct,
  type ServiceProductDependency,
} from "@/lib/fixtures";
import { MediaCarousel } from "@/components/yanlicube/media-carousel";
import { AgentInlineSuggestion } from "@/components/yanlicube/agent";

export const Route = createFileRoute("/discover/service-products/$id/")({
  loader: ({ params }) => {
    const product = getServiceProduct(params.id);
    if (!product || product.status !== "listed") throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.title ?? "服务产品"} · 发现 · 演立方` },
      { name: "description", content: loaderData?.product.oneLiner ?? "演立方演出服务产品" },
      { property: "og:title", content: `${loaderData?.product.title ?? ""} · 演立方` },
      { property: "og:description", content: loaderData?.product.oneLiner ?? "" },
      ...(loaderData?.product.coverImage
        ? [{ property: "og:image", content: loaderData.product.coverImage }]
        : []),
    ],
  }),
  component: PublicDetail,
});

function PublicDetail() {
  const { product } = Route.useLoaderData() as { product: PerformanceServiceProduct };
  const relatedPrograms = product.includedPrograms
    .map((id) => programs.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const relatedCases = product.relatedCaseIds
    .map((id) => cases.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-4 pb-28 sm:px-6 sm:py-10 lg:pb-10">
      <Link
        to="/discover/service-products"
        className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回服务产品列表
      </Link>

      <div className="mb-5 md:mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={
              product.completeness === "complete"
                ? "rounded-md border border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/15 px-2 py-0.5 text-[11px] text-[color:var(--state-verified)]"
                : "rounded-md border border-[color:var(--state-pending)]/50 bg-[color:var(--state-pending)]/15 px-2 py-0.5 text-[11px] text-[color:var(--state-pending)]"
            }
          >
            {serviceProductCompletenessLabel[product.completeness]}
          </span>
          <Link
            to="/discover/tenants/$id"
            params={{ id: product.tenantId }}
            className="text-[11px] text-muted-foreground hover:text-primary hover:underline"
          >
            主服务方 · {product.tenantName} →
          </Link>
        </div>
        <h1 className="text-[22px] font-semibold leading-tight text-foreground sm:text-3xl">{product.title}</h1>
        <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-foreground/80 sm:text-sm">
          {product.oneLiner}
        </p>
        {/* 移动端关键三点摘要 */}
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-border/60 bg-secondary/20 p-2 sm:hidden">
          <MobileMiniStat label="时长" value={product.durationBand} />
          <MobileMiniStat label="观众" value={product.audienceScale} />
          <MobileMiniStat label="价位" value={product.priceBand} tone="price" />
        </div>
      </div>

      {product.gallery.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl">
          <MediaCarousel images={product.gallery} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {/* 包含什么 */}
          <Section title="这个产品包含什么" icon={Layers}>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBox label="时长" value={product.durationBand} />
              <InfoBox label="适合观众规模" value={product.audienceScale} />
              <InfoBox label="典型场景" value={product.typicalScenes.join(" / ")} />
              <InfoBox label="价位带" value={product.priceBand} tone="price" />
            </div>

            {relatedPrograms.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  包含节目
                </div>
                <div className="space-y-2">
                  {relatedPrograms.map((prog) => (
                    <Link
                      key={prog.id}
                      to="/discover/programs/$id"
                      params={{ id: prog.id }}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-card/40 px-3 py-2 hover:border-primary/40"
                    >
                      <div>
                        <div className="text-sm text-foreground">{prog.title}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {prog.type} · {prog.duration}
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                服务模块
              </div>
              <div className="space-y-2">
                {product.includedModules.map((m) => (
                  <div key={m.label} className="rounded-md border border-border/60 bg-card/40 px-3 py-2">
                    <div className="text-sm text-foreground">{m.label}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{m.scope}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* 需要你准备什么 */}
          <Section title="需要你(客户)准备什么" icon={ShieldCheck}>
            <div className="space-y-2">
              {product.dependencies.map((d) => (
                <DependencyRow key={d.label} d={d} />
              ))}
            </div>
          </Section>

          {/* 组合意愿 */}
          <Section title="怎么被采购" icon={Users2}>
            <div className="rounded-md border border-border/60 bg-card/40 px-3 py-3 text-sm text-foreground">
              {serviceProductCombinationLabel[product.combinationWillingness]}
            </div>
            <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {product.completeness === "complete"
                ? "该产品由主服务方 " + product.tenantName + " 作为唯一整体责任方,对整场活动负责。你只面对一个负责人。"
                : "该产品为局部型模块,不能独立承接整场活动。适合被主服务方邀请到方案中作为环节使用。"}
            </div>
          </Section>

          {/* 相关案例 */}
          {relatedCases.length > 0 && (
            <Section title="相关活动案例" icon={Sparkles}>
              <div className="space-y-2">
                {relatedCases.map((c) => (
                  <Link
                    key={c.id}
                    to="/discover/cases/$id"
                    params={{ id: c.id }}
                    className="block rounded-md border border-border/60 bg-card/40 px-3 py-2 hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{c.title}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{c.budgetBand}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{c.outcome}</div>
                  </Link>
                ))}
              </div>
            </Section>
          )}

          {/* 相似客户在用 - 社会证明 */}
          <Section title="相似客户在用" icon={TrendingUp}>
            <div className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
              过去 12 个月内,与你规模/行业相似的客户对该产品的选择与反馈(已匿名化,不含客户身份与预算金额)。
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <SocialStat label="相似客户采纳" value={`${8 + (product.title.length % 6)}`} sub="家" />
              <SocialStat label="满意度 NPS" value="9.1" sub="/ 10" />
              <SocialStat label="平均复用" value="2.4" sub="次 / 家" />
            </div>
            <div className="mt-3 space-y-2">
              {similarClientSnippets(product).map((s, i) => (
                <div key={i} className="rounded-md border border-border/60 bg-card/40 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{s.persona}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{s.scale}</span>
                  </div>
                  <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    “{s.quote}”
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Eye className="h-3 w-3" /> {s.outcome}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-md border border-border/60 bg-secondary/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              仅展示脱敏后的行业/规模标签与结果指标,来源于项目结束后经双方确认的分层评价。平台不显示可识别客户身份。
            </div>
          </Section>
        </div>


        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="surface-1 rounded-xl p-5">
            <div className="mb-2 text-xs tracking-wide text-muted-foreground">下一步</div>
            <Link
              to="/discover/service-products/$id/start"
              params={{ id: product.id }}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              以此产品发起活动 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/agent"
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card/60 px-4 py-2 text-xs text-foreground hover:bg-secondary"
            >
              让 AI 先解释并对比方案
            </Link>
            <Link
              to="/snapshot"
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card/60 px-4 py-2 text-xs text-foreground hover:bg-secondary"
            >
              先生成匿名可行性快照
            </Link>
            <Link
              to="/discover/service-products/$id/share"
              params={{ id: product.id }}
              className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card/60 px-4 py-2 text-xs text-foreground hover:bg-secondary"
            >
              生成公开分享链接 / 嵌入卡
            </Link>

            <div className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              查看与生成方案均不产生费用或承诺,你可以随时撤回。价格与合同以主服务方正式报价为准。
            </div>
          </div>

          <div className="surface-1 rounded-xl p-5">
            <AgentInlineSuggestion title="AI 观察">
              {product.completeness === "complete"
                ? "该产品有主服务方全案统筹,适合你直接采购。"
                : "该产品不能独立承接整场活动,建议与其他主服务方产品组合使用。"}
            </AgentInlineSuggestion>
          </div>
        </aside>
      </div>

      {/* 移动端粘性主 CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link
          to="/discover/service-products/$id/start"
          params={{ id: product.id }}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          以此产品发起活动 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Layers;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-1 rounded-xl p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MobileMiniStat({ label, value, tone }: { label: string; value: string; tone?: "price" }) {
  return (
    <div className="min-w-0 text-center">
      <div className="text-[9.5px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={
          "mt-0.5 truncate text-[11.5px] " +
          (tone === "price" ? "font-mono text-primary" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}

function InfoBox({ label, value, tone }: { label: string; value: string; tone?: "price" }) {
  return (
    <div
      className={
        tone === "price"
          ? "rounded-md border border-primary/30 bg-primary/5 px-3 py-2"
          : "rounded-md border border-border/60 bg-card/40 px-3 py-2"
      }
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={"mt-1 text-sm " + (tone === "price" ? "font-mono text-primary" : "text-foreground")}>
        {value}
      </div>
    </div>
  );
}

function DependencyRow({ d }: { d: ServiceProductDependency }) {
  const Icon = (
    { venue: MapPin, tech: Cpu, people: Users2, content: FileText, external: Wrench } as Record<
      ServiceProductDependency["kind"],
      typeof Layers
    >
  )[d.kind];
  return (
    <div className="flex items-start gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-foreground">{d.label}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{d.note}</div>
      </div>
    </div>
  );
}

function SocialStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-card/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-mono text-lg text-foreground">{value}</span>
        <span className="text-[10px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

type SimilarSnippet = { persona: string; scale: string; quote: string; outcome: string };
function similarClientSnippets(product: PerformanceServiceProduct): SimilarSnippet[] {
  const scene = product.typicalScenes[0] ?? "年会";
  return [
    {
      persona: "科技行业 · HRBP",
      scale: `${product.audienceScale}`,
      quote: `${scene}用了这个产品,客户与员工反馈都好于去年。`,
      outcome: `NPS 9.2 · 已复用 3 次`,
    },
    {
      persona: "消费品行业 · 品牌市场",
      scale: `${product.audienceScale}`,
      quote: `依赖清单清晰,内部对齐效率明显提升。`,
      outcome: `准时率 100% · 未触发变更单`,
    },
    {
      persona: "金融行业 · 行政中心",
      scale: `${product.audienceScale}`,
      quote: `主服务方全案统筹,风险处置比自己找团队顺畅。`,
      outcome: `NPS 8.9 · 推荐给同集团 2 家`,
    },
  ];
}

