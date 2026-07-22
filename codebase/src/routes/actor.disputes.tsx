import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Scale,
  MessageSquareWarning,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Clock3,
  ArrowRight,
} from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { demoToast } from "@/lib/demo-toast";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";
import { ActorBottomTabs } from "@/components/yanlicube/actor-h5-nav";

type Dispute = {
  id: string;
  title: string;
  against: string; // 主服务方
  filed: string;
  updated: string;
  status: "draft" | "review" | "mediating" | "resolved";
  ask: string;
  aiSummary: string;
  evidence: { source: string; text: string }[];
  timeline: { at: string; who: string; text: string }[];
};

const disputes: Dispute[] = [
  {
    id: "d-201",
    title: "现场追加节目未额外结算",
    against: "浮光文化",
    filed: "3 天前",
    updated: "昨天 21:04",
    status: "mediating",
    ask: "补付追加节目费用 ¥ 4,500,并在变更单中补签。",
    aiSummary:
      "现场录像与执行记录显示,当晚 22:05 你被要求追加一段 8 分钟即兴,主服务方现场负责人口头承诺后续结算,但至今未生成变更单。",
    evidence: [
      { source: "现场执行日志", text: "22:05 追加节目,来自客户现场变更请求,已由主服务方现场负责人口头同意" },
      { source: "微信记录截图", text: "「明天走变更单,费用照结」— 主服务方现场负责人,当晚 23:12" },
      { source: "合同附件", text: "原合同仅包含 45 分钟标准表演,追加内容不在其中" },
    ],
    timeline: [
      { at: "3 天前 · 10:22", who: "你", text: "提交异议,附现场录像截图与聊天记录" },
      { at: "3 天前 · 12:40", who: "AI 尽调", text: "已归集 3 项证据,已交叉核验合同附件版本" },
      { at: "2 天前 · 15:10", who: "平台调解员", text: "已联系主服务方,给出 2 个工作日回应期" },
      { at: "昨天 · 21:04", who: "浮光文化", text: "承认追加事实,建议按 ¥ 3,600 结算,你方是否接受?" },
    ],
  },
  {
    id: "d-198",
    title: "客户身份未按协议屏蔽",
    against: "回声演艺",
    filed: "9 天前",
    updated: "5 天前",
    status: "resolved",
    ask: "确认屏蔽机制,并出具平台层面的处理意见。",
    aiSummary:
      "客户身份泄露发生在合作确认前的沟通阶段。经调查确为主服务方操作失误,已由平台记入信誉分并向你出具书面说明。",
    evidence: [
      { source: "沟通截图", text: "客户品牌名出现在演出前 9 天的沟通记录中" },
      { source: "平台屏蔽规则", text: "在演出前 3 天内方可披露最小必要客户信息" },
    ],
    timeline: [
      { at: "9 天前", who: "你", text: "提交申诉" },
      { at: "8 天前", who: "AI 尽调", text: "确认违规,归集证据 2 项" },
      { at: "5 天前", who: "平台仲裁", text: "已裁决:主服务方信誉分 -3,书面致歉一份,案例结案" },
    ],
  },
];

export const Route = createFileRoute("/actor/disputes")({
  head: () => ({
    meta: [
      { title: "演员端 · 异议与申诉 · 演立方" },
      { name: "description", content: "演员可就结算、隐私、追加内容等提交异议,平台居中调解,不与商务议价混同。" },
    ],
  }),
  component: DisputeCenter,
});

const statusMeta: Record<Dispute["status"], { label: string; state: Parameters<typeof StatusBadge>[0]["state"] }> = {
  draft: { label: "起草中", state: "pending" },
  review: { label: "AI 尽调中", state: "ai" },
  mediating: { label: "平台调解中", state: "pending" },
  resolved: { label: "已结案", state: "verified" },
};

function DisputeCenter() {
  const [openId, setOpenId] = useState<string | null>(disputes[0].id);

  return (
    <AgentPanelProvider scopeLabel="演员端 · 异议与申诉" quickPrompts={["帮我起草一段回复", "接受对方报价的利弊", "把证据链整理成一段话"]}>
    <>
    <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-6 sm:px-6 sm:py-8 md:pb-8">
      <Link
        to="/actor"
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" /> 返回演员工作台
      </Link>

      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <Scale className="h-3 w-3" /> 异议与申诉
        </div>
        <h1 className="text-2xl font-semibold text-foreground">你的异议由平台居中调解</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          你无需与主服务方直接议价。平台 AI 会先归集证据、给出事实性结论,由人工调解员出面沟通,并把每一步过程写入审计日志。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-2">
          {disputes.map((d) => {
            const active = d.id === openId;
            const meta = statusMeta[d.status];
            return (
              <button
                key={d.id}
                onClick={() => setOpenId(d.id)}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  active
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/60 bg-card/40 hover:border-border"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{d.id.toUpperCase()}</span>
                  <StatusBadge state={meta.state} label={meta.label} />
                </div>
                <div className="text-sm font-medium text-foreground">{d.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  对方 · {d.against} · 更新于 {d.updated}
                </div>
              </button>
            );
          })}

          <button onClick={() => demoToast()} className="mt-2 w-full rounded-lg border border-dashed border-border/60 bg-background/30 p-4 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground">
            + 提交新异议
          </button>
        </aside>

        {(() => {
          const d = disputes.find((x) => x.id === openId);
          if (!d) return null;
          const meta = statusMeta[d.status];
          return (
            <section className="rounded-lg border border-border/60 bg-card/60 p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    异议 {d.id.toUpperCase()} · 提交于 {d.filed}
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">{d.title}</h2>
                  <div className="mt-1 text-xs text-muted-foreground">
                    对方:{d.against}
                  </div>
                </div>
                <StatusBadge state={meta.state} label={meta.label} />
              </div>

              <div className="mb-5 rounded border border-border/50 bg-background/40 p-4">
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  你的诉求
                </div>
                <p className="text-sm text-foreground">{d.ask}</p>
              </div>

              <div className="mb-5">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-[color:var(--state-ai)]" /> AI 尽调总结
                </h3>
                <p className="mb-3 text-sm text-foreground/85">{d.aiSummary}</p>
                <div className="space-y-2">
                  {d.evidence.map((e, i) => (
                    <EvidenceLine key={i} source={e.source}>{e.text}</EvidenceLine>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock3 className="h-4 w-4" /> 处理时间线
                </h3>
                <ol className="space-y-2 border-l border-border/60 pl-4">
                  {d.timeline.map((t, i) => (
                    <li key={i} className="relative text-xs">
                      <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary/60" />
                      <div className="text-muted-foreground">{t.at} · {t.who}</div>
                      <div className="text-foreground/85">{t.text}</div>
                    </li>
                  ))}
                </ol>
              </div>

              {d.status === "mediating" && (
                <AgentInlineSuggestion
                  title="AI 建议:先看事实,再回复对方"
                  actions={
                    <div className="flex gap-2">
                      <button onClick={() => demoToast()} className="rounded bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
                        接受 ¥ 3,600
                      </button>
                      <button onClick={() => demoToast()} className="rounded border border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 px-2.5 py-1 text-[11px] font-medium text-[color:var(--state-pending)]">
                        坚持 ¥ 4,500
                      </button>
                    </div>
                  }
                >
                  对方承认事实、只在金额上有分歧(¥ 3,600 vs ¥ 4,500)。你的历史同类追加平均结算 ¥ 4,200,对方本次差价属可协商区间。如坚持原价,平台将转入人工仲裁,预计 3 个工作日。
                </AgentInlineSuggestion>
              )}

              {d.status === "resolved" && (
                <div className="flex items-center gap-2 rounded border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 p-3 text-xs text-[color:var(--state-verified)]">
                  <ShieldCheck className="h-4 w-4" />
                  已结案 · 平台裁决书已发送至你的邮箱 · 编号 {d.id.toUpperCase()}-R
                  <ArrowRight className="ml-auto h-3 w-3" />
                </div>
              )}
            </section>
          );
        })()}
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-border/50 bg-card/40 p-4 text-xs text-muted-foreground">
        <MessageSquareWarning className="h-4 w-4 text-[color:var(--state-pending)]" />
        平台承诺:异议处理过程不影响你后续接单;所有裁决同步进入主服务方信誉分,不会写入你的档案。
      </div>
    </div>
    <ActorBottomTabs />
    </>
    </AgentPanelProvider>
  );
}