import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Gavel,
  ArrowLeft,
  Sparkles,
  FileText,
  CheckCircle2,
  Clock3,
  User,
  MessageSquare,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EvidenceLine, AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";

export const Route = createFileRoute("/admin/arbitration/$id")({
  head: () => ({
    meta: [
      { title: "仲裁工单详情 · 演立方治理台" },
      { name: "description", content: "争议仲裁工单详情:双方陈述、证据链路、AI 起草判决、人类签发。" },
    ],
  }),
  component: ArbitrationDetail,
});

function ArbitrationDetail() {
  const { id } = Route.useParams();
  const [decision, setDecision] = useState("");
  const [issued, setIssued] = useState(false);

  const ticket = {
    id,
    title: "客户与主服务方 · 视频交付延后 3 天",
    parties: "Neo 银行(申诉方) ↔ 后仰喜剧(被诉方)",
    opened: "2026-10-05 14:20",
    due: "2026-10-08 24:00",
    severity: "中",
    stage: "AI 起草完成 · 待人类签发",
  };

  const timeline = [
    { at: "10-05 14:20", who: "Neo 银行", act: "提交仲裁申请", note: "视频交付延后 3 天,影响内部汇报节点。" },
    { at: "10-05 15:02", who: "AI", act: "证据自动归集", note: "抓取变更单#003、履约时间线、双方书面沟通。" },
    { at: "10-06 09:10", who: "后仰喜剧", act: "提交陈述", note: "承认延后,原因为供应商剪辑排期;已主动补拍花絮。" },
    { at: "10-06 11:45", who: "AI", act: "起草仲裁意见", note: "建议扣减尾款 8% 作为补偿,并保留双方合作关系。" },
    { at: "—", who: "人类仲裁员", act: "待签发", note: "由平台合规团队复核后正式发布判决书。" },
  ];

  const evidence = [
    { title: "变更单 #003", src: "客户 · 后仰喜剧共同确认", when: "10-04 21:00", note: "记录延后 3 天的书面同意。" },
    { title: "履约时间线快照", src: "系统自动记录", when: "10-05 12:00", note: "AI 抓取交付节点与实际完成时间差。" },
    { title: "双方书面沟通", src: "项目消息线程", when: "10-04 ~ 10-05", note: "包含 5 条相关沟通,已脱敏。" },
  ];

  const claims = [
    { side: "Neo 银行", tone: "primary" as const, text: "视频延后使内部客户答谢晚宴复盘会议推迟,需要一定经济补偿并要求书面致歉。" },
    { side: "后仰喜剧", tone: "muted" as const, text: "承认延后事实,原因为供应商剪辑排期不足;已主动补拍花絮并加急剪辑,愿意做出适度补偿。" },
  ];

  const aiDraft = `【判决摘要】\n1. 认定被诉方存在轻度履约瑕疵,延后 3 天交付视频。\n2. 扣减合同尾款 8%(约 ¥ 12,400)作为客户补偿,由平台在结算环节直接执行。\n3. 双方合作关系保留,不记入信誉分负面档案。\n4. 后仰喜剧需在 7 日内提交书面致歉与后续保障方案。`;

  function issue() {
    if (!decision.trim()) return;
    setIssued(true);
  }

  return (
    <AgentPanelProvider scopeLabel={`仲裁 · ${id}`} quickPrompts={["总结双方争议焦点", "帮我起草一段中立判决", "找出关键证据的时间线冲突"]}>
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> 返回治理台
      </Link>

      <div className="mb-6 rounded-xl border border-border/60 bg-card/60 p-5">
        <div className="mb-2 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-primary">
          <Gavel className="h-3 w-3" /> 仲裁工单 #{ticket.id}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{ticket.title}</h1>
            <div className="mt-1 text-xs text-muted-foreground">{ticket.parties}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge state={issued ? "verified" : "pending"} label={issued ? "已签发" : ticket.stage} />
            <div className="inline-flex items-center gap-1 text-[11px] text-[color:var(--state-pending)]">
              <Clock3 className="h-3 w-3" /> 截止 {ticket.due}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-border/60 bg-card/60 p-5">
            <div className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <MessageSquare className="h-3 w-3" /> 双方陈述
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {claims.map((c) => (
                <div
                  key={c.side}
                  className={`rounded-lg border p-3 ${
                    c.tone === "primary"
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/60 bg-background/40"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                    <User className="h-3 w-3" /> {c.side}
                  </div>
                  <p className="text-[12px] leading-relaxed text-foreground/85">{c.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card/60 p-5">
            <div className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3 w-3" /> 证据链路 · AI 自动归集
            </div>
            <ul className="space-y-2">
              {evidence.map((e) => (
                <li key={e.title} className="rounded-lg border border-border/50 bg-background/40 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{e.title}</span>
                    <span className="text-[11px] text-muted-foreground">{e.when}</span>
                  </div>
                  <div className="mb-1 text-[11px] text-muted-foreground">来源 · {e.src}</div>
                  <div className="text-[12px] text-foreground/80">{e.note}</div>
                </li>
              ))}
            </ul>
            <EvidenceLine source="证据链路已完整闭合,可支撑仲裁结论" time="10-06 11:45" className="mt-3">
              AI 完整性核验
            </EvidenceLine>
          </section>

          <section className="rounded-xl border border-[color:var(--state-ai)]/30 bg-[color:var(--state-ai)]/5 p-5">
            <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[color:var(--state-ai)]">
              <Sparkles className="h-3 w-3" /> AI 起草判决书 · 待人类签发
            </div>
            <pre className="whitespace-pre-wrap text-[12px] leading-relaxed text-foreground/90">
              {aiDraft}
            </pre>
            <AgentInlineSuggestion title="仲裁员可选择">
              直接采纳 · 微调后签发 · 打回重新起草(需给出理由,AI 会重新组织)
            </AgentInlineSuggestion>
          </section>

          <section className="rounded-xl border border-border/60 bg-card/60 p-5">
            <div className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <ScrollText className="h-3 w-3" /> 处理时间线
            </div>
            <ol className="relative space-y-3 border-l border-border/60 pl-4">
              {timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex items-baseline gap-2 text-[11px] text-muted-foreground">
                    <span className="font-mono">{t.at}</span>
                    <span className="text-foreground/80">{t.who}</span>
                    <span>· {t.act}</span>
                  </div>
                  <div className="text-[12px] text-foreground/80">{t.note}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card/60 p-4">
            <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-3 w-3" /> 签发判决书
            </div>
            {issued ? (
              <div className="rounded-md border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 p-3 text-[12px] text-[color:var(--state-verified)]">
                <CheckCircle2 className="mb-1 h-4 w-4" />
                判决书已签发。系统已通知双方,并在结算环节自动执行扣减 8% 尾款。
              </div>
            ) : (
              <>
                <textarea
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  placeholder="可采纳 AI 起草或输入调整后的判决意见…"
                  className="h-32 w-full resize-none rounded-md border border-border bg-background p-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setDecision(aiDraft)}
                    className="flex-1 rounded-md border border-border bg-secondary px-2 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    采纳 AI 起草
                  </button>
                  <button
                    onClick={issue}
                    disabled={!decision.trim()}
                    className="flex-1 rounded-md bg-primary px-2 py-1.5 text-[11px] font-medium text-primary-foreground disabled:opacity-40"
                  >
                    正式签发
                  </button>
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  签发后不可撤销 · 会同时写入双方审计记录。
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-[11px] text-muted-foreground">
            <div className="mb-1 font-medium text-foreground">仲裁原则</div>
            <ul className="space-y-1 list-disc pl-4">
              <li>平台不介入商业决策,只维护规则边界。</li>
              <li>AI 起草 · 人类签发 · 双方可申诉一次。</li>
              <li>严重违规才写入信誉分,轻度瑕疵仅补偿。</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
    </AgentPanelProvider>
  );
}