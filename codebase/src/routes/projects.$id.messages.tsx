import { createFileRoute, notFound } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { useMemo, useState } from "react";
import {
  MessageSquare,
  Sparkles,
  Filter,
  Paperclip,
  Send,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getProject } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";

export const Route = createFileRoute("/projects/$id/messages")({
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: () => ({ meta: [{ title: "沟通中心 · 演立方" }] }),
  component: MessagesPage,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

type MsgKind = "note" | "decision" | "change" | "evidence" | "risk";

type Msg = {
  id: string;
  who: string;
  role: "you" | "tenant" | "ai" | "actor" | "platform";
  at: string;
  kind: MsgKind;
  text: string;
  ref?: { label: string; to?: string };
  requiresAck?: boolean;
  ackedBy?: string[];
};

const seed: Msg[] = [
  {
    id: "m1",
    who: "AI 顾问",
    role: "ai",
    at: "今日 09:12",
    kind: "note",
    text: "早上好。方案 B 已收到主服务方回复,只对一处灯光配置提出了微调建议(不影响预算)。是否要我起草一段回复给主服务方,同意变更并锁定?",
  },
  {
    id: "m2",
    who: "浮光文化 · 主服务方",
    role: "tenant",
    at: "今日 08:55",
    kind: "change",
    text: "建议把入场环节的舞美灯从 12 台调整为 10 台 + 2 台侧光。整体氛围一致,现场调试更稳。",
    ref: { label: "变更单草稿 CH-004 · 未提交" },
  },
  {
    id: "m3",
    who: "AI 尽调",
    role: "ai",
    at: "今日 08:56",
    kind: "evidence",
    text: "对比过往 3 个同场地案例,10+2 灯光配置在场地 A2 更常用,现场稳定性高。历史 NPS 平均 4.6。",
    ref: { label: "证据 · 3 项历史" },
  },
  {
    id: "m4",
    who: "你",
    role: "you",
    at: "昨日 21:30",
    kind: "decision",
    text: "确认选定方案 B,预算 88 万,主服务方由浮光文化承担。",
    requiresAck: true,
    ackedBy: ["浮光文化 · 陈伊", "AI 系统"],
  },
  {
    id: "m5",
    who: "平台系统",
    role: "platform",
    at: "昨日 19:04",
    kind: "risk",
    text: "演员「程小夕」档期距活动仅 21 天,建议 24 小时内确认。已自动提醒。",
  },
];

const kindMeta: Record<MsgKind, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  note: { label: "沟通", icon: MessageSquare, color: "text-muted-foreground" },
  decision: { label: "决策", icon: CheckCircle2, color: "text-[color:var(--state-verified)]" },
  change: { label: "变更", icon: GitBranch, color: "text-[color:var(--state-pending)]" },
  evidence: { label: "证据", icon: ShieldCheck, color: "text-[color:var(--state-ai)]" },
  risk: { label: "风险", icon: AlertCircle, color: "text-[color:var(--state-risk)]" },
};

function MessagesPage() {
  const { project } = Route.useLoaderData();
  const [filter, setFilter] = useState<MsgKind | "all">("all");
  const [text, setText] = useState("");
  const [kind, setKind] = useState<MsgKind>("note");
  const [items, setItems] = useState<Msg[]>(seed);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((m) => m.kind === filter)),
    [items, filter],
  );

  const send = () => {
    if (!text.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: `m${prev.length + 1}`, who: "你", role: "you", at: "刚刚", kind, text },
    ]);
    setText("");
  };

  return (
    <>
      <div className="space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">沟通中心</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              项目内所有沟通都在这里。AI 会自动把决策、变更、证据、风险从聊天里"分类归档",让你随时能向领导说清楚"这个决定是怎么来的"。
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/60 p-1 text-[11px]">
            <Filter className="ml-1.5 h-3 w-3 text-muted-foreground" />
            {(["all", "decision", "change", "evidence", "risk", "note"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`rounded px-2 py-1 ${
                  filter === k
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {k === "all" ? "全部" : kindMeta[k].label}
              </button>
            ))}
          </div>
        </header>

        <ol className="space-y-3">
          {filtered.map((m) => {
            const Meta = kindMeta[m.kind];
            const Icon = Meta.icon;
            const mine = m.role === "you";
            return (
              <li
                key={m.id}
                className={`rounded-lg border p-4 ${
                  mine
                    ? "border-primary/30 bg-primary/[0.04]"
                    : m.role === "ai"
                      ? "border-[color:var(--state-ai)]/25 bg-[color:var(--state-ai)]/[0.04]"
                      : "border-border/60 bg-card/50"
                }`}
              >
                <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className={`inline-flex items-center gap-1 ${Meta.color}`}>
                    <Icon className="h-3 w-3" /> {Meta.label}
                  </span>
                  <span>·</span>
                  <span className="font-medium text-foreground">{m.who}</span>
                  <span>·</span>
                  <span>{m.at}</span>
                  {m.requiresAck && (
                    <span className="ml-auto">
                      <StatusBadge
                        state={m.ackedBy && m.ackedBy.length ? "verified" : "pending"}
                        label={
                          m.ackedBy && m.ackedBy.length
                            ? `已确认 · ${m.ackedBy.length}/2`
                            : "待确认"
                        }
                      />
                    </span>
                  )}
                </div>
                <div className="text-sm text-foreground/90">{m.text}</div>
                {m.ref && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded border border-border/50 bg-background/40 px-2 py-1 text-[11px] text-muted-foreground">
                    <Paperclip className="h-3 w-3" /> {m.ref.label}
                  </div>
                )}
                {m.ackedBy && m.ackedBy.length > 0 && (
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    确认方:{m.ackedBy.join(" · ")}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="rounded-lg border border-border/60 bg-card/60 p-3">
          <div className="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-[color:var(--state-ai)]" />
            AI 会自动为你的这条消息打上分类。你也可以手动改。
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as MsgKind)}
              className="rounded border border-border/60 bg-background/60 px-2 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none"
            >
              <option value="note">沟通</option>
              <option value="decision">决策</option>
              <option value="change">变更</option>
              <option value="evidence">证据</option>
              <option value="risk">风险</option>
            </select>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="写点什么…"
              className="flex-1 rounded border border-border/60 bg-background/60 px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
            <button
              onClick={send}
              disabled={!text.trim()}
              className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40"
            >
              <Send className="h-3 w-3" /> 发送
            </button>
          </div>
        </div>
      </div>
    </>
  );
}