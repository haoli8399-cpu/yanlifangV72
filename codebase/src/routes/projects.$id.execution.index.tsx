import { createFileRoute, Link } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject, type Project } from "@/lib/fixtures";
import { cn } from "@/lib/utils";
import { Package, Radio } from "lucide-react";

export const Route = createFileRoute("/projects/$id/execution/")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw new Error("not found");
    return { project };
  },
  component: Execution,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

function Execution() {
  const { project } = Route.useLoaderData() as { project: Project };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 text-xs tracking-[0.14em] text-muted-foreground">履约</div>
        <h2 className="text-xl font-semibold text-foreground">完整时间线 · 每一步都留有依据</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          AI、主服务方、你 —— 三方的每一次推动都记录在这里,便于事后回溯。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/projects/$id/execution/handoff"
          params={{ id: project.id }}
          className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 text-xs transition hover:bg-primary/10"
        >
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <div>
              <div className="font-medium text-foreground">现场交接包</div>
              <div className="mt-0.5 text-muted-foreground">
                查看对每位协作方/演员的可核验交付凭证
              </div>
            </div>
          </div>
          <span className="text-primary">→</span>
        </Link>
        <Link
          to="/projects/$id/execution/audience"
          params={{ id: project.id }}
          className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 text-xs transition hover:bg-primary/10"
        >
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <div>
              <div className="font-medium text-foreground">观众预登记与到场感知</div>
              <div className="mt-0.5 text-muted-foreground">
                报名表 / 二维码 / 到场曲线 / 现场情绪脱敏指标
              </div>
            </div>
          </div>
          <span className="text-primary">→</span>
        </Link>
      </div>

      <div className="surface-1 rounded-xl p-4 sm:p-5">
        <ol className="space-y-4">
          {project.timeline.map((t, i) => (
            <li key={i} className="grid grid-cols-[68px_12px_minmax(0,1fr)] gap-2 sm:grid-cols-[100px_16px_minmax(0,1fr)] sm:gap-3">
              <div className="text-[11px] text-muted-foreground sm:text-xs">{t.at}</div>
              <div className="flex justify-center">
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    t.kind === "agent" && "bg-[color:var(--state-ai)]",
                    t.kind === "human" && "bg-[color:var(--state-declared)]",
                    t.kind === "system" && "bg-border"
                  )}
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs">
                  <span className={cn(
                    "font-medium",
                    t.kind === "agent" ? "text-[color:var(--state-ai)]" : "text-foreground",
                  )}>{t.who}</span>
                  <span className="text-muted-foreground">
                    {t.kind === "agent" ? "AI 主动" : t.kind === "human" ? "人工推动" : "系统事件"}
                  </span>
                </div>
                <div className="mt-0.5 break-words text-[13px] text-foreground/90 sm:text-sm">{t.text}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}