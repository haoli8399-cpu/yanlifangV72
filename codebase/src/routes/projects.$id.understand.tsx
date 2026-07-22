import { createFileRoute } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject, type Project } from "@/lib/fixtures";
import { EvidenceLine, AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { CheckCircle2, XCircle, TrendingUp, AlertTriangle, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/projects/$id/understand")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw new Error("not found");
    return { project };
  },
  component: Understand,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

function Understand() {
  const { project } = Route.useLoaderData() as { project: Project };
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 text-xs tracking-[0.14em] text-muted-foreground">理解 · 活动画像</div>
        <h2 className="text-xl font-semibold text-foreground">这场活动我理解成了这样</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          所有理解都可以修改。修改后我会重新生成受影响的方案与快照。
        </p>
      </div>

      <div className="surface-1 rounded-xl p-6">
        <BriefField label="目标" value={project.brief.goal} />
        <BriefField label="受众" value={project.brief.audience} />
        <BriefField label="调性" value={project.brief.style} />
        <BriefField label="预算区间" value={project.brief.budgetBand} />
        <BriefField label="必须有" list={project.brief.mustHave} />
        <BriefField label="必须避免" list={project.brief.mustAvoid} muted />
        <EvidenceLine source="活动画像 · 客户确认" time={`更新于 ${project.brief.updatedAt}`} className="mt-4" />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">可行性快照</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <SnapCard icon={CheckCircle2} color="text-[color:var(--state-verified)]" title="包含" items={project.snapshot.includes} />
          <SnapCard icon={XCircle} color="text-muted-foreground" title="不包含" items={project.snapshot.excludes} muted />
          <SnapCard icon={TrendingUp} color="text-[color:var(--state-declared)]" title="价格驱动" items={project.snapshot.priceDrivers} />
          <SnapCard icon={AlertTriangle} color="text-[color:var(--state-warn)]" title="风险" items={project.snapshot.risks} />
          <div className="md:col-span-2">
            <SnapCard icon={HelpCircle} color="text-[color:var(--state-pending)]" title="待确认" items={project.snapshot.pending} />
          </div>
        </div>
      </div>

      <AgentInlineSuggestion title="我想帮你补全 5 项待确认信息中的其中 2 项">
        我从你之前的活动经验里已经能推测其中 2 项的默认答案:同城差旅、无英文翻译屏幕。是否让我先按默认值往下推进?你可以随时改回来。
      </AgentInlineSuggestion>
    </div>
  );
}

function BriefField({ label, value, list, muted }: { label: string; value?: string; list?: string[]; muted?: boolean }) {
  return (
    <div className="mb-4 grid grid-cols-[100px_1fr] gap-4 border-b border-border/40 pb-4 last:mb-0 last:border-b-0 last:pb-0">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className={`text-sm ${muted ? "text-muted-foreground" : "text-foreground/90"}`}>
        {value}
        {list && (
          <ul className="space-y-1">
            {list.map((x) => <li key={x}>· {x}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

function SnapCard({ icon: Icon, color, title, items, muted }: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <div className="surface-1 rounded-xl p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">· {items.length}</span>
      </div>
      <ul className="space-y-1.5 text-xs leading-relaxed">
        {items.map((i) => (
          <li key={i} className={muted ? "text-muted-foreground" : "text-foreground/85"}>· {i}</li>
        ))}
        {items.length === 0 && <li className="text-muted-foreground">无</li>}
      </ul>
    </div>
  );
}