import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock3 } from "lucide-react";
import { programs, actors } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";

export const Route = createFileRoute("/discover/programs/")({
  head: () => ({
    meta: [
      { title: "节目 · 发现 · 演立方" },
      { name: "description", content: "浏览可定制的商演节目模块,一键生成方案草稿。" },
      { property: "og:title", content: "节目 · 发现 · 演立方" },
      { property: "og:description", content: "从节目出发,快速拼出你的活动结构。" },
    ],
  }),
  component: ProgramsList,
});

function ProgramsList() {
  const actorMap = Object.fromEntries(actors.map((a) => [a.id, a]));
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <div className="mb-1 text-[11px] tracking-[0.14em] text-muted-foreground sm:text-xs">发现 · 节目</div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">从一段节目开始拼你的活动</h1>
        <p className="mt-2 max-w-2xl text-[13px] text-muted-foreground sm:text-sm">
          节目是"演员 × 场景 × 时长"的可复用模块。挑一个作为开场、高潮或收尾,再由 AI 顾问补齐其他环节。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {programs.map((p) => {
          const acts = p.actors.map((id) => actorMap[id]).filter(Boolean);
          return (
            <div key={p.id} className="surface-1 flex flex-col rounded-xl p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 inline-flex items-center gap-2 text-[11px] tracking-[0.12em] text-muted-foreground">
                    <span className="rounded border border-border/60 bg-secondary/40 px-1.5 py-0.5">{p.type}</span>
                    <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> {p.duration}</span>
                  </div>
                  <div className="text-base font-semibold text-foreground">{p.title}</div>
                </div>
                <StatusBadge state={p.status} label={p.status === "verified" ? "已核验" : "待确认"} />
              </div>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{p.summary}</p>
              <div className="mb-3 flex flex-wrap gap-1">
                {p.audienceFit.map((t) => (
                  <span key={t} className="rounded bg-secondary/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    适合 · {t}
                  </span>
                ))}
              </div>
              {acts.length > 0 && (
                <div className="mb-4 text-[11px] text-muted-foreground">
                  主要演员:{acts.map((a) => a.name).join(" / ")}
                </div>
              )}
              <div className="mt-auto flex items-center gap-2">
                <Link
                  to="/discover/programs/$id"
                  params={{ id: p.id }}
                  className="flex-1 rounded-md border border-border/70 bg-background/40 px-3 py-2 text-center text-xs font-medium text-foreground/80 hover:border-primary/50 hover:text-foreground"
                >
                  查看详情
                </Link>
                <Link
                  to="/snapshot"
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  基于此节目生成方案
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}