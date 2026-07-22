import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { programs, actors, cases, type Actor } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EvidenceLine } from "@/components/yanlicube/agent";

export const Route = createFileRoute("/discover/programs/$id")({
  loader: ({ params }) => {
    const program = programs.find((p) => p.id === params.id);
    if (!program) throw notFound();
    return { program };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.program.title} · 节目` : "节目详情" },
      { name: "description", content: loaderData?.program.summary ?? "节目详情" },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-muted-foreground">节目不存在</div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-muted-foreground">加载出错</div>
  ),
  component: ProgramDetail,
});

function ProgramDetail() {
  const { program } = Route.useLoaderData();
  const acts: Actor[] = program.actors
    .map((id: string) => actors.find((a) => a.id === id))
    .filter((x: Actor | undefined): x is Actor => Boolean(x));
  const relatedCases = cases.filter((c) =>
    acts.some((a: Actor) => a.representativeCases.includes(c.id)),
  );

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <Link
        to="/discover/programs"
        className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> 返回节目库
      </Link>

      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] tracking-[0.12em] text-muted-foreground">
            <span className="rounded border border-border/60 bg-secondary/40 px-1.5 py-0.5">{program.type}</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3" /> {program.duration}
            </span>
            <StatusBadge state={program.status} label={program.status === "verified" ? "已核验" : "待确认"} />
          </div>
          <h1 className="text-3xl font-semibold text-foreground">{program.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{program.summary}</p>
        </div>
        <Link
          to="/snapshot"
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          基于此节目生成方案 <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="surface-1 rounded-xl p-5">
            <div className="mb-3 text-xs font-medium tracking-[0.12em] text-muted-foreground">适合场景</div>
            <div className="flex flex-wrap gap-2">
              {program.audienceFit.map((t: string) => (
                <span key={t} className="rounded-md bg-secondary/50 px-2 py-1 text-xs text-foreground/80">
                  {t}
                </span>
              ))}
            </div>
          </section>

          <section className="surface-1 rounded-xl p-5">
            <div className="mb-3 text-xs font-medium tracking-[0.12em] text-muted-foreground">依据 · 演员核验</div>
            <div className="space-y-2">
              {acts.map((a: Actor) => (
                <div key={a.id} className="rounded-md border border-border/50 bg-background/30 p-3">
                  <EvidenceLine
                    source={`${a.name} · ${a.title}`}
                    time={a.verified ? "档案已核验" : "待核验档案"}
                  />
                  <div className="mt-1 text-xs text-foreground/80">{a.bio}</div>
                </div>
              ))}
            </div>
          </section>

          {relatedCases.length > 0 && (
            <section className="surface-1 rounded-xl p-5">
              <div className="mb-3 text-xs font-medium tracking-[0.12em] text-muted-foreground">相关案例</div>
              <div className="space-y-2">
                {relatedCases.map((c) => (
                  <Link
                    key={c.id}
                    to="/discover/cases/$id"
                    params={{ id: c.id }}
                    className="block rounded-lg border border-border/60 bg-background/40 p-3 hover:border-primary/50"
                  >
                    <div className="text-sm font-medium text-foreground">{c.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {c.industry} · {c.scale} · {c.city}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="surface-2 rounded-xl p-5">
            <div className="mb-2 text-[11px] tracking-[0.12em] text-muted-foreground">下一步</div>
            <div className="mb-3 text-sm text-foreground">
              把这段节目放进你的活动结构,AI 顾问会补齐主持、开场、收尾等环节。
            </div>
            <Link
              to="/agent"
              className="block rounded-md border border-border/70 bg-background/40 px-3 py-2 text-center text-xs text-foreground/80 hover:border-primary/50"
            >
              让 AI 顾问帮我拼完整
            </Link>
          </div>
          <div className="surface-1 rounded-xl p-5 text-xs text-muted-foreground">
            <div className="mb-1 font-medium text-foreground">价格因素</div>
            <ul className="list-disc space-y-1 pl-4">
              <li>演员档期紧张度</li>
              <li>是否跨城差旅</li>
              <li>定制内容评审轮次</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}