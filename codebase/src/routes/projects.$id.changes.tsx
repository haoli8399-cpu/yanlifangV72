import { createFileRoute, notFound } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EvidenceLine } from "@/components/yanlicube/agent";
import { GitBranch, PlusCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { demoToast } from "@/lib/demo-toast";
import { EmptyState } from "@/components/yanlicube/focus-page";

export const Route = createFileRoute("/projects/$id/changes")({
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: () => ({ meta: [{ title: "变更单 · 演立方" }] }),
  component: ChangesPage,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

type Change = {
  id: string;
  title: string;
  raisedBy: string;
  raisedAt: string;
  reason: string;
  impact: { label: string; delta: string }[];
  amountDelta: string;
  status: "draft" | "pending_client" | "confirmed" | "verified_incident";
  evidenceOf?: string;
};

const initial: Change[] = [
  {
    id: "c1",
    title: "宾客人数从 480 上调至 520",
    raisedBy: "客户 · Neo 银行",
    raisedAt: "2 天前",
    reason: "私行分部临时新增 40 位 VIP 客户",
    impact: [
      { label: "近景魔术巡桌", delta: "增加 4 桌 · 需再增 1 名助演" },
      { label: "签到伴奏时长", delta: "延长 10 分钟" },
    ],
    amountDelta: "+ ¥ 4.2 万",
    status: "pending_client",
  },
  {
    id: "c2",
    title: "取消英文翻译屏幕方案",
    raisedBy: "AI 顾问建议 · 客户确认",
    raisedAt: "5 天前",
    reason: "改由双语主持全程口译,视觉更干净",
    impact: [{ label: "视觉设备租赁", delta: "移除 LED 副屏" }],
    amountDelta: "− ¥ 1.8 万",
    status: "confirmed",
  },
  {
    id: "c3",
    title: "已核实异常:签到区伴奏钢琴迟到 20 分钟",
    raisedBy: "系统 · 已核实",
    raisedAt: "演后 · 已归档",
    reason: "运输公司延误,主服务方启用备选方案(现场留声机),客户认可",
    impact: [{ label: "客户满意度", delta: "无实质影响 · 有短暂静默" }],
    amountDelta: "无金额调整 · 主服务方赔付司机差旅",
    status: "verified_incident",
    evidenceOf: "现场执行日志 · 时间戳 18:12",
  },
];

const statusMap = {
  draft: { label: "草稿", state: "ai" as const },
  pending_client: { label: "待客户确认", state: "pending" as const },
  confirmed: { label: "已确认", state: "verified" as const },
  verified_incident: { label: "已核实异常", state: "declared" as const },
};

function ChangesPage() {
  const { project } = Route.useLoaderData();
  const [items, setItems] = useState(initial);

  if (!project.quote) {
    return (
      <EmptyState
        icon={GitBranch}
        title="现在还没有变更单"
        description="签约后到执行结束之间的任何调整,都会以「变更单」沉淀:金额、影响、责任方、证据一目了然。你可以随时对已定内容发起变更申请。"
        primary={{ label: "查看当前进度", to: `/projects/${project.id}` }}
        secondary={{ label: "让 AI 顾问解释变更流程", to: "/agent" }}
        whatShowsUp={[
          "谁提的、为什么、影响哪些环节",
          "金额增减 · 状态(待确认 / 已确认 / 已核实异常)",
          "现场执行中的时间戳证据留档",
        ]}
      />
    );
  }

  const confirm = (id: string) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "confirmed" } : x)));

  return (
    <>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">变更单 · 已核实异常</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              项目从签约到执行结束的任何调整都会以变更单沉淀:金额、影响、责任方、证据一目了然。
            </p>
          </div>
          <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <PlusCircle className="h-3.5 w-3.5" /> 发起变更
          </button>
        </header>

        <div className="space-y-4">
          {items.map((c) => {
            const m = statusMap[c.status];
            const isIncident = c.status === "verified_incident";
            return (
              <article
                key={c.id}
                className={`rounded-lg border p-5 ${
                  isIncident
                    ? "border-[color:var(--state-pending)]/30 bg-[color:var(--state-pending)]/5"
                    : "border-border/60 bg-card/60"
                }`}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {isIncident ? <AlertTriangle className="h-3 w-3" /> : <GitBranch className="h-3 w-3" />}
                      {isIncident ? "已核实异常" : "变更单"} · {c.id.toUpperCase()}
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{c.title}</h3>
                    <div className="mt-1 text-xs text-muted-foreground">
                      由 {c.raisedBy} 发起 · {c.raisedAt}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-foreground">{c.amountDelta}</div>
                    <div className="mt-1"><StatusBadge state={m.state} label={m.label} /></div>
                  </div>
                </div>

                <div className="rounded border border-border/50 bg-background/30 p-3 text-xs text-foreground/85">
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    变更原因
                  </div>
                  {c.reason}
                </div>

                <div className="mt-3">
                  <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    对方案的影响
                  </div>
                  <ul className="space-y-1 text-xs text-foreground/85">
                    {c.impact.map((i) => (
                      <li key={i.label} className="flex gap-3">
                        <span className="w-32 shrink-0 text-muted-foreground">{i.label}</span>
                        <span>{i.delta}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {c.evidenceOf && (
                  <div className="mt-3">
                    <EvidenceLine source={c.evidenceOf}>已由主服务方核实并留档</EvidenceLine>
                  </div>
                )}

                {c.status === "pending_client" && (
                  <div className="mt-4 flex gap-2 text-xs">
                    <button
                      onClick={() => confirm(c.id)}
                      className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 font-medium text-primary-foreground"
                    >
                      <CheckCircle2 className="h-3 w-3" /> 确认变更
                    </button>
                    <button onClick={() => demoToast()} className="rounded border border-border/60 bg-background px-3 py-1.5 text-muted-foreground hover:text-foreground">
                      提出异议
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}