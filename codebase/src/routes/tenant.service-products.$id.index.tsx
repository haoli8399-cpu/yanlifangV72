import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Sparkles,
  GitBranch,
  Layers,
  ShieldCheck,
  Users2,
  Package,
  Edit3,
  Plus,
  PauseCircle,
  Copy,
  Wrench,
  MapPin,
  Cpu,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  getServiceProduct,
  serviceProductCompletenessLabel,
  serviceProductCombinationLabel,
  serviceProductOwnershipLabel,
  serviceProductStatusLabel,
  programs,
  cases,
  type PerformanceServiceProduct,
  type ServiceProductDependency,
} from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { MediaCarousel } from "@/components/yanlicube/media-carousel";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";

export const Route = createFileRoute("/tenant/service-products/$id/")({
  loader: ({ params }) => {
    const product = getServiceProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.title ?? "服务产品"} · 服务方 · 演立方` },
    ],
  }),
  component: ServiceProductDetail,
});

function ServiceProductDetail() {
  const { product } = Route.useLoaderData() as { product: PerformanceServiceProduct };
  const status = serviceProductStatusLabel[product.status];
  const relatedPrograms = product.includedPrograms
    .map((id) => programs.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const relatedCases = product.relatedCaseIds
    .map((id) => cases.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <AgentPanelProvider scopeLabel={`服务产品 · ${product.title}`} quickPrompts={["帮我解释这个产品的组合结构", "对比 v2 与 v3 的差异", "把复用洞察写成一段客户话术"]}>
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <Link
        to="/tenant/service-products"
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回服务产品库
      </Link>

      {/* 顶部标题 */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
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
            <span className="rounded-md border border-border/60 bg-secondary/40 px-2 py-0.5 font-mono text-[11px] text-foreground/80">
              {product.version}
            </span>
            <StatusBadge state={status.state} label={status.label} />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{product.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {product.oneLiner}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionBtn icon={Edit3}>编辑</ActionBtn>
          <ActionBtn icon={Plus}>发布新版本</ActionBtn>
          <ActionBtn icon={Copy}>复用到方案</ActionBtn>
          <ActionBtn icon={PauseCircle}>下架</ActionBtn>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* 主体 */}
        <div className="space-y-6">
          {/* 概述 & 封面 */}
          {product.gallery.length > 0 ? (
            <section className="surface-1 overflow-hidden rounded-xl">
              <MediaCarousel images={product.gallery} />
            </section>
          ) : product.coverImage ? (
            <section className="surface-1 overflow-hidden rounded-xl">
              <img src={product.coverImage} alt={product.title} className="h-64 w-full object-cover" />
            </section>
          ) : null}

          {/* 组合内容 */}
          <Section title="组合内容" icon={Layers} subtitle="包含的节目与服务模块 · 与 PRD §6.2 对齐">
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  包含节目 ({relatedPrograms.length})
                </div>
                {relatedPrograms.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border/60 bg-secondary/20 px-3 py-3 text-xs text-muted-foreground">
                    该产品不直接包含节目(纯服务型 · 例如「主持模块」),需与主服务方的节目组合使用。
                  </div>
                ) : (
                  <div className="space-y-2">
                    {relatedPrograms.map((prog) => (
                      <div key={prog.id} className="flex items-center justify-between rounded-md border border-border/60 bg-card/40 px-3 py-2">
                        <div className="min-w-0">
                          <div className="text-sm text-foreground">{prog.title}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {prog.type} · {prog.duration}
                          </div>
                        </div>
                        <Link
                          to="/discover/programs/$id"
                          params={{ id: prog.id }}
                          className="inline-flex items-center gap-0.5 text-[11px] text-primary hover:underline"
                        >
                          查看 <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  服务模块 ({product.includedModules.length})
                </div>
                <div className="space-y-2">
                  {product.includedModules.map((m) => (
                    <div key={m.label} className="rounded-md border border-border/60 bg-card/40 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-foreground">{m.label}</div>
                        <span className="rounded border border-border/60 bg-secondary/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {moduleKindLabel(m.kind)}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {m.responsible} · {m.scope}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  依赖清单 ({product.dependencies.length})
                </div>
                <div className="space-y-1.5">
                  {product.dependencies.map((d) => (
                    <DependencyRow key={d.label} d={d} />
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* 版本历史 */}
          <Section title="版本与变更历史" icon={GitBranch}>
            <div className="space-y-2">
              {product.versionHistory.map((v, i) => (
                <div
                  key={v.version}
                  className={
                    i === 0
                      ? "rounded-md border border-primary/40 bg-primary/5 px-3 py-2"
                      : "rounded-md border border-border/60 bg-card/40 px-3 py-2"
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-foreground">
                      {v.version} {i === 0 && <span className="ml-1 text-[10px] text-primary">当前</span>}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{v.publishedAt}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{v.changelog}</div>
                </div>
              ))}
            </div>
            <Link
              to="/tenant/service-products/$id/versions"
              params={{ id: product.id }}
              className="mt-3 inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20"
            >
              <GitBranch className="h-3.5 w-3.5" />
              打开版本对比与迁移
            </Link>
          </Section>


          {/* 权利与授权 */}
          <Section title="权利与授权" icon={ShieldCheck}>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBox label="所有权归属" value={serviceProductOwnershipLabel[product.ownership]} />
              <InfoBox
                label="授权到期"
                value={product.authorizationExpiresAt ?? "长期有效"}
                tone={product.authorizationExpiresAt ? "warn" : "ok"}
              />
            </div>
            {product.ownership === "actor-authorized" && (
              <div className="mt-3 rounded-md border border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 px-3 py-2 text-[11px] text-[color:var(--state-pending)]">
                提示:该产品依赖演员授权,授权到期前需与演员续签,否则该产品会自动下架。
              </div>
            )}
          </Section>

          {/* 组合意愿 */}
          <Section title="组合意愿" icon={Users2}>
            <div className="rounded-md border border-border/60 bg-card/40 px-3 py-3 text-sm text-foreground">
              {serviceProductCombinationLabel[product.combinationWillingness]}
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              {product.combinationWillingness === "open" && "其他主服务方 可在获得你的同意后将本产品作为模块嵌入他们的主服务方案。"}
              {product.combinationWillingness === "invite-only" && "只有你主动邀请或点名的伙伴才可组合本产品。"}
              {product.combinationWillingness === "solo" && "本产品仅作为主服务方独立承接,不作为模块被拆分。"}
            </div>
          </Section>

          {/* 商务信息 */}
          <Section title="商务信息" icon={Package}>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBox label="价位带" value={product.priceBand} />
              <InfoBox label="时长" value={product.durationBand} />
              <InfoBox label="观众规模" value={product.audienceScale} />
              <InfoBox label="典型场景" value={product.typicalScenes.join(" / ")} />
            </div>
          </Section>

          {/* 治理与复用 */}
          <Section title="治理与复用" icon={Sparkles}>
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoBox label="累计复用" value={`${product.reuseCount} 次`} />
              <InfoBox label="平均 NPS" value={String(product.npsAvg)} />
              <InfoBox label="发布状态" value={status.label} />
            </div>
            {relatedCases.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  关联案例
                </div>
                <div className="space-y-2">
                  {relatedCases.map((c) => (
                    <Link
                      key={c.id}
                      to="/discover/cases/$id"
                      params={{ id: c.id }}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-card/40 px-3 py-2 text-xs text-foreground hover:border-primary/40"
                    >
                      <span>{c.title}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Agent 侧栏 */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="surface-1 rounded-xl p-5">
            <div className="mb-3 text-xs tracking-wide text-muted-foreground">AI 主服务承接判断</div>
            <AgentInlineSuggestion title={product.completeness === "complete" ? "可作为主服务方独立承接" : "仅适合作为模块嵌入"}>
              {product.completeness === "complete"
                ? "本产品包含全案统筹模块,且完整度充分,AI 判断你可以以主服务方身份对整场活动负责。"
                : "本产品缺少全案统筹能力,不适合直接作为主服务方,应作为组合模块被主服务方邀请。"}
            </AgentInlineSuggestion>
            <div className="mt-4 space-y-2">
              <EvidenceLine source="产品结构">
                {product.includedModules.length} 个服务模块 · {product.dependencies.length} 项依赖
              </EvidenceLine>
              <EvidenceLine source="历史复用">
                复用 {product.reuseCount} 次 · 平均 NPS {product.npsAvg}
              </EvidenceLine>
              <EvidenceLine source="权利来源">
                {serviceProductOwnershipLabel[product.ownership]}
                {product.authorizationExpiresAt ? ` · 到期 ${product.authorizationExpiresAt}` : ""}
              </EvidenceLine>
            </div>
          </div>

          {product.agentAdvice && (
            <div className="surface-1 rounded-xl p-5">
              <div className="mb-2 text-xs tracking-wide text-muted-foreground">AI 建议</div>
              <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary/90">
                <Sparkles className="mr-1 inline h-3 w-3" /> {product.agentAdvice}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
    </AgentPanelProvider>
  );
}

function Section({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: typeof Package;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-1 rounded-xl p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {subtitle && <div className="mb-3 text-[11px] text-muted-foreground">{subtitle}</div>}
      {children}
    </section>
  );
}

function InfoBox({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div
      className={
        tone === "warn"
          ? "rounded-md border border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 px-3 py-2"
          : "rounded-md border border-border/60 bg-card/40 px-3 py-2"
      }
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}

function DependencyRow({ d }: { d: ServiceProductDependency }) {
  const Icon = depIcon(d.kind);
  return (
    <div className="flex items-start gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-foreground">{d.label}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{d.note}</div>
      </div>
      <span className="rounded border border-border/60 bg-secondary/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
        {depLabel(d.kind)}
      </span>
    </div>
  );
}

function ActionBtn({ icon: Icon, children }: { icon: typeof Edit3; children: React.ReactNode }) {
  return (
    <button
      onClick={() => alert("Demo 环境,未实际保存")}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

function moduleKindLabel(k: string) {
  return (
    {
      host: "主持",
      director: "导演",
      producer: "统筹",
      stage: "舞美",
      content: "内容",
      logistics: "落地",
    } as Record<string, string>
  )[k] ?? k;
}

function depLabel(k: ServiceProductDependency["kind"]) {
  return (
    { venue: "场地", tech: "技术", people: "人员", content: "内容", external: "外部" } as Record<
      ServiceProductDependency["kind"],
      string
    >
  )[k];
}

function depIcon(k: ServiceProductDependency["kind"]) {
  return (
    { venue: MapPin, tech: Cpu, people: Users2, content: FileText, external: Wrench } as Record<
      ServiceProductDependency["kind"],
      typeof Package
    >
  )[k];
}
