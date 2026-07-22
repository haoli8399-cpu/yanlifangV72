import { createFileRoute, notFound } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { WaitingCompanion } from "@/components/yanlicube/waiting";
import { Clock, User, Bot, ArrowRight, MessageCircle } from "lucide-react";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/projects/$id/waiting")({
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: () => ({ meta: [{ title: "等待中心 · 演立方" }] }),
  component: WaitingPage,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

type Waiter = {
  id: string;
  what: string;
  who: string;
  role: "actor" | "client" | "tenant" | "platform";
  since: string;
  avgWait: string;
  aiAction: string;
  nextUpdate: string;
  userMayDo: string[];
  handoff?: { to: string; ackAt?: string; status: "sent" | "acked" | "in_progress" };
};

const waiters: Waiter[] = [
  {
    id: "w1",
    what: "演员周晔的经纪确认 9/14 档期",
    who: "周晔经纪 · 陈女士",
    role: "actor",
    since: "1 天前",
    avgWait: "2 天(基于同类锁档 12 次样本)",
    aiAction: "已发送 2 次友好提醒,并附上活动概览 · 无需你介入",
    nextUpdate: "预计今日 18:00 前",
    userMayDo: ["直接拨打经纪电话(仅限紧急)", "改用备选演员方案"],
    handoff: { to: "张策(后仰喜剧)", ackAt: "已接收 · 处理中", status: "in_progress" },
  },
  {
    id: "w2",
    what: "客户内部预算审批",
    who: "Miracle 汽车 · 财务总监",
    role: "client",
    since: "2 天前",
    avgWait: "5 天",
    aiAction: "已生成一份「面向财务」的报价说明,可由客户方直接转发",
    nextUpdate: "预计 3 天内",
    userMayDo: ["把 AI 生成的财务说明发送给客户", "把等待时长同步给项目负责人"],
    handoff: { to: "客户对接人 · 王先生", ackAt: "已确认收到", status: "acked" },
  },
];

const roleLabel: Record<Waiter["role"], string> = {
  actor: "演员/经纪",
  client: "客户方",
  tenant: "主服务方",
  platform: "平台",
};

function WaitingPage() {
  const { project } = Route.useLoaderData();
  return (
    <>
      <div className="space-y-6">
        <header>
          <h2 className="text-lg font-semibold text-foreground">等待中心</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            商演行业的等待是常态。这里把"在等谁、等什么、AI 已做什么、你可以做什么"结构化,不让你陷入焦虑刷新。
          </p>
        </header>

        <WaitingCompanion
          waitingFor={project.waitingFor ?? "推进中,暂无阻塞等待"}
          who="主服务方 张策"
          since="1 天"
          done={[
            "AI 已发送首次锁档请求并附上活动概览",
            "已在系统中登记档期请求,进入 SLA 追踪",
          ]}
          youCanDo={[
            "把等待概况同步给客户对接人",
            "改用备选演员,AI 已准备 2 位候选",
          ]}
          agentText="平均等待 2 天。若今晚 22:00 前仍无回复,我会自动切换到备选演员并通知你,不会让项目卡住。"
        />

        <div className="space-y-4">
          {waiters.map((w) => (
            <article
              key={w.id}
              className="rounded-lg border border-border/60 bg-card/60 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    等待 · {roleLabel[w.role]}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{w.what}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {w.who} · 已等 {w.since} · 平均 {w.avgWait}
                  </div>
                </div>
                <StatusBadge state="pending" label="等待中" />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded border border-[color:var(--state-ai)]/30 bg-[color:var(--state-ai)]/5 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[color:var(--state-ai)]">
                    <Bot className="h-3 w-3" /> AI 已完成
                  </div>
                  <p className="text-xs leading-relaxed text-foreground">{w.aiAction}</p>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    下次更新: {w.nextUpdate}
                  </div>
                </div>
                {w.handoff && (
                  <div className="rounded border border-border/60 bg-secondary/30 p-3">
                    <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      交接给人工跟进
                    </div>
                    <div className="text-xs text-foreground">→ {w.handoff.to}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {w.handoff.ackAt}
                    </div>
                    <StatusBadge
                      state={w.handoff.status === "acked" ? "verified" : "declared"}
                      label={
                        w.handoff.status === "acked"
                          ? "人工已接手"
                          : w.handoff.status === "in_progress"
                          ? "处理中"
                          : "已发出"
                      }
                    />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  你可以选择的动作(非必需)
                </div>
                <div className="flex flex-wrap gap-2">
                  {w.userMayDo.map((a) => (
                    <button onClick={() => demoToast()}
                      key={a}
                      className="inline-flex items-center gap-1 rounded border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground hover:border-primary/60 hover:bg-primary/5"
                    >
                      <ArrowRight className="h-3 w-3" /> {a}
                    </button>
                  ))}
                  <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/15">
                    <MessageCircle className="h-3 w-3" /> 问 AI: 我该催吗?
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}