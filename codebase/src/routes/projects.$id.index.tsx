import { createFileRoute, Link } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { ExternalLink, Sparkles } from "lucide-react";
import { getProject, type Project } from "@/lib/fixtures";
import { EvidenceLine } from "@/components/yanlicube/agent";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { WaitingCompanion } from "@/components/yanlicube/waiting";
import { NextActionHero, DetailBlock, DetailStack, OnboardingSteps } from "@/components/yanlicube/focus-page";

export const Route = createFileRoute("/projects/$id/")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw new Error("not found");
    return { project };
  },
  component: Overview,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

function Overview() {
  const { project } = Route.useLoaderData() as { project: Project };
  const waiting = project.stage === "waiting" && project.waitingFor;

  // 根据阶段推断此刻该做的 CTA
  const nextRoute =
    project.plans.length > 0 && project.stage === "planning"
      ? { label: "打开方案比较", to: `/projects/${project.id}/plans` }
      : project.stage === "quoting"
        ? { label: "查看报价确认", to: `/projects/${project.id}/quote` }
        : project.stage === "executing"
          ? { label: "打开履约看板", to: `/projects/${project.id}/execution` }
          : project.stage === "completed"
            ? { label: "查看成果与评价", to: `/projects/${project.id}/outcome` }
            : { label: "补全活动画像", to: `/projects/${project.id}/understand` };

  return (
    <div className="space-y-5">
      <NextActionHero
        eyebrow={waiting ? "等待中 · 无需你操作" : "此刻该做"}
        title={project.headline}
        context={project.nextAction}
        primary={waiting ? undefined : nextRoute}
        secondary={{
          label: "让 AI 起草领导汇报",
        }}
        tone={
          project.aiIncident
            ? "warn"
            : waiting
              ? "waiting"
              : project.stage === "completed"
                ? "done"
                : "default"
        }
        meta={
          <div>
            <div className="font-medium text-foreground/80">{project.client}</div>
            <div className="mt-0.5">{project.date} · {project.city}</div>
            <div className="mt-0.5">{project.scale}</div>
          </div>
        }
      />

      {/* AI 错误恢复:优先级最高,不折叠 */}
      {project.aiIncident && (
        <div className="rounded-xl border border-[color:var(--state-warn)]/50 bg-[color:var(--state-warn)]/[0.06] p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StatusBadge state="pending" label="AI 修正" />
              <span className="text-sm font-semibold text-foreground">AI 发现了自己的一个错误</span>
            </div>
            <Link
              to="/projects/$id/incidents"
              params={{ id: project.id }}
              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/50 px-2.5 py-1 text-[11px] text-foreground/80 hover:border-primary/40 hover:text-foreground"
            >
              查看修正详情 <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="text-sm text-foreground/90">{project.aiIncident.what}</div>
        </div>
      )}

      {waiting && (
        <WaitingCompanion
          waitingFor={project.waitingFor!}
          who={project.team.main?.name ?? "主服务方"}
          since="2 天"
          done={[
            "主服务方已接受整体责任",
            "报价已发送并等待客户确认",
            "已向演员经纪发出锁档申请",
          ]}
          youCanDo={[
            "查看报价明细",
            "让 AI 顾问准备一份向领导汇报的摘要",
            "预览履约时间线",
          ]}
          agentText="档期确认平均耗时 2 天,我会持续跟进,一有变化立刻通知你。"
        />
      )}

      {/* 新项目 · 4 步走完这场活动 */}
      {(project.stage === "exploring" || project.stage === "planning") && (
        <OnboardingSteps
          title="从这里开始 · 走完这场活动的 5 步"
          steps={[
            {
              label: "补全活动画像的待确认信息",
              hint: project.snapshot.pending.length > 0
                ? `AI 顾问发现 ${project.snapshot.pending.length} 项影响推进的关键缺口`
                : "目标 / 受众 / 调性 / 预算 / 必须有与必须避免",
              to: `/projects/${project.id}/understand`,
              done: project.snapshot.pending.length === 0,
              current: project.snapshot.pending.length > 0,
            },
            {
              label: "对比方案并选定一个方向",
              hint: project.plans.length === 0
                ? "AI 顾问会起草 2-3 个方向,主服务方补充细节"
                : `已就绪 ${project.plans.length} 个方向 · 打开对比`,
              to: `/projects/${project.id}/plans`,
              done: false,
              current: project.snapshot.pending.length === 0 && project.plans.length > 0,
            },
            {
              label: "选定主服务方",
              hint: "唯一整体责任方 · 协作方与演员由他们统筹",
              to: `/projects/${project.id}/candidates`,
              done: Boolean(project.team.main),
            },
            {
              label: "确认报价并签署合同",
              hint: "报价 → 电子合同 → 付款节点,全流程留痕",
              to: `/projects/${project.id}/quote`,
              done: Boolean(project.quote && project.quote.status === "confirmed"),
            },
            {
              label: "现场履约与成果沉淀",
              hint: "执行过程可回溯,成果可复用到明年",
              to: `/projects/${project.id}/execution`,
              done: false,
            },
          ]}
        />
      )}

      {/* 参考信息全部折叠 */}
      <DetailStack label="项目背景与上下文">
        <DetailBlock
          title="这场活动的目标"
          summary={project.brief.goal}
        >
          <div className="space-y-2 text-xs text-foreground/80">
            <div>受众 · {project.brief.audience}</div>
            <div>调性 · {project.brief.style}</div>
            <div>预算 · {project.brief.budgetBand}</div>
          </div>
          <EvidenceLine
            source="活动画像 · 客户确认"
            time={`更新于 ${project.brief.updatedAt}`}
            className="mt-3"
          />
        </DetailBlock>

        <DetailBlock
          title="服务团队"
          summary={
            project.team.main
              ? `${project.team.main.name} · 协作方 ${project.team.collaborators.length} · 演员 ${project.team.actors.length}`
              : "尚未分配主服务方"
          }
          right={
            <Link
              to="/projects/$id/team"
              params={{ id: project.id }}
              className="text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              完整团队 →
            </Link>
          }
        >
          {project.team.main ? (
            <>
              <div className="text-sm font-semibold text-foreground">
                {project.team.main.name}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {project.team.main.scope}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">尚未分配主服务方</div>
          )}
        </DetailBlock>

        <DetailBlock
          title="最近动态"
          summary={project.timeline[0] ? `${project.timeline[0].who} · ${project.timeline[0].text}` : undefined}
          right={
            <Link
              to="/projects/$id/execution"
              params={{ id: project.id }}
              className="text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              完整时间线 →
            </Link>
          }
        >
          <div className="space-y-3">
            {project.timeline.slice(0, 4).map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={
                        t.kind === "agent"
                          ? "text-[color:var(--state-ai)]"
                          : t.kind === "human"
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }
                    >
                      {t.who}
                    </span>
                    <span className="text-muted-foreground">· {t.at}</span>
                  </div>
                  <div className="mt-0.5 text-sm text-foreground/85">{t.text}</div>
                </div>
              </div>
            ))}
          </div>
        </DetailBlock>
      </DetailStack>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        所有数据为演示 · 非真实业务事实
      </div>
    </div>
  );
}
