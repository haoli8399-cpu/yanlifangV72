import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Building2, MapPin, Sparkles } from "lucide-react";
import { cases } from "@/lib/fixtures";
import { MediaCarousel } from "@/components/yanlicube/media-carousel";
import { resolveGallery } from "@/lib/gallery-store";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/discover/cases/$id")({
  loader: ({ params }) => {
    const c = cases.find((x) => x.id === params.id);
    if (!c) throw notFound();
    return { caseStudy: c };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.caseStudy.title} · 案例` : "案例详情" },
      { name: "description", content: loaderData?.caseStudy.outcome ?? "案例详情" },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-muted-foreground">案例不存在</div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-muted-foreground">加载出错</div>
  ),
  component: CaseDetail,
});

function CaseDetail() {
  const { caseStudy: c } = Route.useLoaderData();
  const [gallery, setGallery] = useState<string[]>(c.gallery ?? []);
  useEffect(() => {
    setGallery(resolveGallery("case", c.id, c.gallery));
  }, [c.id, c.gallery]);
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-4 pb-24 md:px-6 md:py-8 md:pb-8">
      <Link
        to="/discover/cases"
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:mb-6"
      >
        <ArrowLeft className="h-3 w-3" /> 返回案例集
      </Link>

      <div className="mb-2 flex flex-wrap items-center gap-2 text-[10.5px] tracking-[0.12em] text-muted-foreground md:text-[11px]">
        <span className="inline-flex items-center gap-1 rounded border border-border/60 bg-secondary/40 px-1.5 py-0.5">
          <Building2 className="h-3 w-3" /> {c.industry}
        </span>
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.city}</span>
        <span className="rounded bg-secondary/40 px-1.5 py-0.5">{c.budgetBand}</span>
        <span>{c.scale}</span>
      </div>
      <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{c.title}</h1>

      <div className="mt-5 md:mt-6">
        <div className="mb-2 flex items-baseline justify-between">
          <div className="text-xs font-medium tracking-[0.12em] text-muted-foreground">现场图集</div>
          <span className="text-[10.5px] text-muted-foreground md:text-[11px]">左右滑动 · {gallery.length} 张</span>
        </div>
        <MediaCarousel images={gallery} aspect="aspect-[16/9]" emptyLabel="暂未上传现场图集" />
      </div>

      <div className="mt-6 grid gap-5 md:mt-8 md:gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="surface-1 rounded-xl p-5">
            <div className="mb-3 text-xs font-medium tracking-[0.12em] text-muted-foreground">成果</div>
            <div className="rounded-md border border-[color:var(--state-verified)]/25 bg-[color:var(--state-verified)]/[0.06] p-4 text-sm text-foreground/90">
              {c.outcome}
            </div>
          </section>

          <section className="surface-1 rounded-xl p-5">
            <div className="mb-3 text-xs font-medium tracking-[0.12em] text-muted-foreground">关键亮点</div>
            <ol className="space-y-3">
              {c.highlights.map((h: string, idx: number) => (
                <li key={h} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary/60 font-mono text-[11px] text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="text-sm text-foreground/85">{h}</div>
                </li>
              ))}
            </ol>
          </section>

          <section className="surface-1 rounded-xl p-5">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--state-ai)]" />
              <div className="text-xs font-medium tracking-[0.12em] text-[color:var(--state-ai)]">AI 顾问观察</div>
            </div>
            <div className="text-sm leading-relaxed text-foreground/85">
              类似规模({c.scale.split("·")[0]?.trim()})与预算带({c.budgetBand})的活动,通常在
              <span className="text-foreground"> 12-16 周 </span>前启动筹备最稳,主服务方需在
              <span className="text-foreground"> 8 周 </span>前锁定核心演员档期。若你的活动接近这个画像,
              可以直接以此案例为起点生成方案。
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="surface-2 rounded-xl p-5">
            <div className="mb-2 text-[11px] tracking-[0.12em] text-muted-foreground">下一步</div>
            <div className="mb-3 text-sm text-foreground">参照此案例生成你的方案</div>
            <Link
              to="/snapshot"
              className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              参照 TA 生成方案 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="surface-1 rounded-xl p-5 text-xs text-muted-foreground">
            <div className="mb-1 font-medium text-foreground">画像</div>
            <ul className="space-y-1">
              <li>行业:{c.industry}</li>
              <li>规模:{c.scale}</li>
              <li>预算带:{c.budgetBand}</li>
              <li>城市:{c.city}</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <Link
          to="/snapshot"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground"
        >
          我要类似的活动 <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}