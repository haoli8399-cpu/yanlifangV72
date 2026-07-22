import { createFileRoute, Link } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { Trophy, Image as ImageIcon, Sparkles, RotateCw } from "lucide-react";
import { getProject, type Project } from "@/lib/fixtures";
import { EmptyState } from "@/components/yanlicube/focus-page";

export const Route = createFileRoute("/projects/$id/outcome")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw new Error("not found");
    return { project };
  },
  component: Outcome,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

function Outcome() {
  const { project } = Route.useLoaderData() as { project: Project };
  const o = project.outcome;

  if (!o) {
    return (
      <EmptyState
        icon={Trophy}
        title="活动还没结束 · 成果会在这里沉淀"
        description="活动执行完成后,AI 顾问会把当晚发生的事、现场照片、高光时刻整理成一段可复用的成果,便于向领导汇报或明年再办一次。"
        primary={{ label: "查看当前进度", to: `/projects/${project.id}` }}
        secondary={{ label: "打开履约看板", to: `/projects/${project.id}/execution` }}
        whatShowsUp={[
          "一段可粘贴的「当晚发生了什么」故事",
          "满意度分档 · 现场照片数 · 团队",
          "AI 归纳的 3-5 条高光时刻",
          "一键「再办一次」—— 基于本次内容起草明年版本",
        ]}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs tracking-[0.14em] text-muted-foreground">
        <Trophy className="h-4 w-4 text-[color:var(--state-verified)]" />
        成果沉淀
      </div>

      <div className="surface-2 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground">当晚发生了什么</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/85">{o.story}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="满意度" value={o.npsBand} />
        <StatCard label="现场照片" value={`${o.photos} 张`} icon={ImageIcon} />
        <StatCard label="团队" value={project.team.main?.name ?? "—"} />
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[color:var(--state-ai)]" />
          <div className="text-sm font-semibold text-foreground">高光</div>
        </div>
        <div className="grid gap-2">
          {o.highlights.map((h) => (
            <div key={h} className="rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-sm text-foreground/85">
              · {h}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-primary/40 bg-primary/[0.06] p-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <RotateCw className="h-4 w-4 text-primary" />
          再办一次 · 从这里开始
        </div>
        <p className="text-xs text-muted-foreground">
          明年的活动可以直接基于这次的活动画像、方案与团队重启,AI 顾问会帮你标出需要更新的地方(档期、预算、演员意向)。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/projects/$id/reuse"
            params={{ id: project.id }}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            <RotateCw className="h-3 w-3" />
            起草 2027 版本 · 逐项对比
          </Link>
          <Link
            to="/projects/$id/retrospective"
            params={{ id: project.id }}
            className="inline-flex items-center gap-1 rounded-md border border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10 px-3 py-1.5 text-xs font-semibold text-[color:var(--state-ai)] hover:bg-[color:var(--state-ai)]/15"
          >
            <Sparkles className="h-3 w-3" />
            复盘沉淀 · 让经验流回资产库
          </Link>
          <Link
            to="/agent"
            className="inline-flex rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15"
          >
            与 AI 顾问对话
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="surface-1 rounded-xl p-4">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}