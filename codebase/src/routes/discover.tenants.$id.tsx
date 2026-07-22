import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Layers,
  Star,
  TrendingUp,
  MapPin,
  Users2,
  Package,
  Award,
} from "lucide-react";
import {
  serviceProducts,
  cases,
  serviceProductCompletenessLabel,
  type PerformanceServiceProduct,
  type CaseStudy,
} from "@/lib/fixtures";
import { AgentInlineSuggestion } from "@/components/yanlicube/agent";

// 主服务方主页(PRD V7.2 §6.1 §10 §18.4):聚合该 Tenant 的服务产品、案例、NPS、承接边界。
// 仅一个演示 Tenant(ten_houyang / 后仰喜剧)。

type TenantProfile = {
  id: string;
  name: string;
  tagline: string;
  city: string;
  founded: string;
  teamSize: string;
  strengths: string[];
  boundaries: string[];
  cover: string;
  contact: { name: string; role: string };
};

const tenants: TenantProfile[] = [
  {
    id: "ten_houyang",
    name: "后仰喜剧",
    tagline: "以内容驱动的成都单口喜剧主服务方 · 专注年会/答谢/员工关怀的定制脱口秀",
    city: "成都 · 覆盖西南与全国主要城市",
    founded: "2019",
    teamSize: "签约/合作演员 14 人 · 内容与统筹团队若干",
    strengths: [
      "定制脱口秀内容(2 轮内评审,规避行业敏感话题)",
      "主持 + 表演一人包场,适合小场景 VIP 与内部活动",
      "《脱口秀和 ta 的朋友们 3》《喜剧之王单口季》卡司参与创作",
    ],
    boundaries: [
      "不承接纯舞美 / 纯设备类项目",
      "不接受未签订保密协议的公开分享或竞标",
      "不与其他主服务方并列(除非明确联合所有)",
    ],
    cover: "https://picsum.photos/seed/tenant-houyang-cover/1600/600",
    contact: { name: "后仰喜剧 · 商务", role: "对客户唯一负责人" },
  },
];


function getTenant(id: string) {
  return tenants.find((t) => t.id === id);
}

export const Route = createFileRoute("/discover/tenants/$id")({
  loader: ({ params }) => {
    const tenant = getTenant(params.id);
    if (!tenant) throw notFound();
    const products = serviceProducts.filter(
      (p) => p.tenantId === tenant.id && p.status === "listed"
    );
    const caseIds = Array.from(new Set(products.flatMap((p) => p.relatedCaseIds)));
    const relatedCases = caseIds
      .map((id) => cases.find((c) => c.id === id))
      .filter((c): c is CaseStudy => Boolean(c));
    return { tenant, products, relatedCases };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.tenant.name ?? "主服务方"} · 发现 · 演立方` },
      { name: "description", content: loaderData?.tenant.tagline ?? "" },
      { property: "og:title", content: `${loaderData?.tenant.name ?? ""} · 演立方` },
      { property: "og:description", content: loaderData?.tenant.tagline ?? "" },
      ...(loaderData?.tenant.cover
        ? [{ property: "og:image", content: loaderData.tenant.cover }]
        : []),
    ],
  }),
  component: TenantHome,
});

function TenantHome() {
  const { tenant, products, relatedCases } = Route.useLoaderData() as {
    tenant: TenantProfile;
    products: PerformanceServiceProduct[];
    relatedCases: CaseStudy[];
  };

  const totalReuse = products.reduce((s, p) => s + p.reuseCount, 0);
  const avgNps =
    products.length === 0
      ? 0
      : Math.round(
          products.reduce((s, p) => s + p.npsAvg, 0) / products.length
        );
  const completeCount = products.filter((p) => p.completeness === "complete").length;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-10">
      <Link
        to="/discover/service-products"
        className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        返回服务产品列表
      </Link>

      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-border sm:rounded-3xl">
        <div
          className="h-28 w-full bg-cover bg-center sm:h-40"
          style={{ backgroundImage: `url(${tenant.cover})` }}
        />
        <div className="grid gap-5 border-t border-border bg-card p-4 sm:gap-6 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                主服务方 · 唯一整体责任方
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3" />
                身份 & 履约资质已核验
              </span>
            </div>
            <h1 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">{tenant.name}</h1>
            <p className="mt-2 text-[13px] text-muted-foreground sm:text-sm">{tenant.tagline}</p>
            <dl className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
              <MetaItem icon={<MapPin className="h-3 w-3" />} label="所在地" value={tenant.city} />
              <MetaItem icon={<Users2 className="h-3 w-3" />} label="团队规模" value={tenant.teamSize} />
              <MetaItem icon={<Award className="h-3 w-3" />} label="成立" value={`${tenant.founded} 年`} />
            </dl>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-background p-3 sm:gap-3 sm:p-4">
            <StatBlock icon={<Package className="h-4 w-4" />} label="服务产品" value={String(products.length)} sub={`完整型 ${completeCount}`} />
            <StatBlock icon={<TrendingUp className="h-4 w-4" />} label="累计复用" value={String(totalReuse)} sub="次交付" />
            <StatBlock icon={<Star className="h-4 w-4" />} label="平均 NPS" value={String(avgNps)} sub="客户复评" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          {/* 服务产品聚合 */}
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">在售服务产品</h2>
              <span className="text-xs text-muted-foreground">
                共 {products.length} 个,按 NPS 排序
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[...products]
                .sort((a, b) => b.npsAvg - a.npsAvg)
                .map((p) => (
                  <Link
                    key={p.id}
                    to="/discover/service-products/$id"
                    params={{ id: p.id }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40"
                  >
                    <div
                      className="h-32 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${p.coverImage})` }}
                    />
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Layers className="h-3 w-3" />
                        {serviceProductCompletenessLabel[p.completeness]}
                      </div>
                      <div className="text-sm font-medium leading-snug group-hover:text-primary">
                        {p.title}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {p.oneLiner}
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
                        <span>{p.priceBand}</span>
                        <span className="inline-flex items-center gap-1 text-primary">
                          NPS {p.npsAvg} · 复用 {p.reuseCount}
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>

          {/* 精选案例 */}
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">精选案例</h2>
              <Link
                to="/discover/cases"
                className="text-xs text-primary hover:underline"
              >
                查看全部案例 →
              </Link>
            </div>
            {relatedCases.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                尚未发布公开案例
              </div>
            ) : (
              <div className="space-y-3">
                {relatedCases.map((c) => (
                  <Link
                    key={c.id}
                    to="/discover/cases/$id"
                    params={{ id: c.id }}
                    className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
                  >
                    <div
                      className="hidden h-20 w-28 shrink-0 rounded-lg bg-cover bg-center sm:block"
                      style={{ backgroundImage: `url(${c.gallery?.[0] ?? ""})` }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium group-hover:text-primary">
                        {c.title}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {c.industry} · {c.scale} · {c.city}
                      </div>
                      <div className="mt-2 text-xs text-foreground/80">{c.outcome}</div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* 承接边界 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">承接优势与边界</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-primary">
                  <Sparkles className="h-3 w-3" />
                  擅长
                </div>
                <ul className="space-y-2 text-sm text-foreground/85">
                  {tenant.strengths.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-amber-600">
                  <ShieldCheck className="h-3 w-3" />
                  不承接 / 边界
                </div>
                <ul className="space-y-2 text-sm text-foreground/85">
                  {tenant.boundaries.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-medium text-muted-foreground">对客户唯一负责人</div>
            <div className="mt-2 text-sm font-semibold">{tenant.contact.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{tenant.contact.role}</div>
            <Link
              to="/projects"
              className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              以此主服务方发起项目
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              to="/discover/service-products"
              search={{ ids: undefined } as never}
              className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"
            >
              浏览其服务产品
            </Link>
          </div>

          <AgentInlineSuggestion title="AI 观察">
            基于近 90 天数据,{tenant.name} 的完整型产品复用集中于「年度答谢 / 品牌发布」场景。若你的活动预算 ≥ 50 万且希望唯一整体责任方,匹配度较高;预算 &lt; 30 万建议查看其局部型模块。
          </AgentInlineSuggestion>

          <div className="rounded-2xl border border-dashed border-border p-4 text-[11px] leading-relaxed text-muted-foreground">
            页面所有数据来自该主服务方在演立方登记与已完成项目的回流评价,不代表未来承诺。签约前请以合同预览页条款为准。
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}

function StatBlock({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}
