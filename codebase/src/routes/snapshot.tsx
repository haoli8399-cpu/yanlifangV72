import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowRight, CheckCircle2, XCircle, TrendingUp, AlertTriangle, HelpCircle } from "lucide-react";
import { getActor, projects } from "@/lib/fixtures";
import { AgentMessage, EvidenceLine } from "@/components/yanlicube/agent";

const snapshotSearch = z.object({ actor: z.string().optional() });

export const Route = createFileRoute("/snapshot")({
  validateSearch: snapshotSearch,
  head: () => ({
    meta: [
      { title: "可行性快照 · 演立方" },
      { name: "description", content: "无需登录,即可获得完整的初步价值:包含、不包含、价格驱动、风险、待确认。" },
    ],
  }),
  component: Snapshot,
});

function Snapshot() {
  const { actor: actorId } = Route.useSearch();
  const actor = actorId ? getActor(actorId) : undefined;
  const demo = projects[0];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="mb-8">
        <div className="mb-1 text-xs tracking-[0.14em] text-muted-foreground">
          可行性快照 · 无需登录
        </div>
        <h1 className="text-3xl font-semibold text-foreground">
          {actor ? `基于「${actor.name}」的初步理解` : "你的活动初步理解"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          这不是完整方案,也不是价格承诺。这是一次真实的初步判断 ——
          让你在留资和登录之前,已经获得可以带走的价值。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <SnapshotCard icon={CheckCircle2} iconClass="text-[color:var(--state-verified)]" title="初步包含" items={demo.snapshot.includes} />
          <SnapshotCard icon={XCircle} iconClass="text-muted-foreground" title="明确不包含" items={demo.snapshot.excludes} muted />
          <SnapshotCard icon={TrendingUp} iconClass="text-[color:var(--state-declared)]" title="价格驱动因素" items={demo.snapshot.priceDrivers} />
          <SnapshotCard icon={AlertTriangle} iconClass="text-[color:var(--state-warn)]" title="主要风险" items={demo.snapshot.risks} />
          <SnapshotCard icon={HelpCircle} iconClass="text-[color:var(--state-pending)]" title="待确认事项" items={demo.snapshot.pending} />
        </div>

        <aside className="space-y-4">
          <div className="surface-1 sticky top-20 rounded-xl p-5">
            <div className="mb-3 text-xs font-medium tracking-wide text-muted-foreground">
              AI 顾问的话
            </div>
            <AgentMessage time="基于目前信息">
              这份判断是初步的。如果你确认方向,我会为你生成 2-3 个具体方案,
              并把主服务方分配给最适合承担整体责任的服务方。你随时可以停下来。
            </AgentMessage>

            <div className="mt-6 border-t border-border/60 pt-4">
              <Link
                to="/projects/$id"
                params={{ id: demo.id }}
                className="flex items-center justify-between rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                查看基于此快照的完整活动
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                演示项目「Neo 银行 · 2027 年度客户答谢晚宴」已经从这里生成了完整方案。
              </p>
            </div>

            <EvidenceLine source="AI 生成 · 基于你在发现页的浏览" time="刚刚" className="mt-4" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function SnapshotCard({
  icon: Icon,
  iconClass,
  title,
  items,
  muted,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  title: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <div className="surface-1 rounded-xl p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">· {items.length} 项</span>
      </div>
      <ul className="space-y-2">
        {items.map((i) => (
          <li
            key={i}
            className={`flex gap-2 text-sm leading-relaxed ${muted ? "text-muted-foreground" : "text-foreground/85"}`}
          >
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-border" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}