import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Clock3, FileSignature, CircleDollarSign, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EvidenceLine } from "@/components/yanlicube/agent";

export const Route = createFileRoute("/tenant/orders/")({
  head: () => ({
    meta: [
      { title: "订单管理 · 服务方 · 演立方" },
      { name: "description", content: "已签约主服务方订单的一屏视图：合同状态、付款节点、履约倒计时与 AI 已完成事项。" },
    ],
  }),
  component: OrdersList,
});

type OrderRow = {
  id: string;
  title: string;
  client: string;
  date: string;
  amount: string;
  contractState: "signed" | "pending" | "framework";
  paidRatio: number; // 0-100
  nextMilestone: string;
  nextMilestoneAt: string;
  daysToEvent: number;
  riskNote?: string;
  aiPrepared: string;
};

const orders: OrderRow[] = [
  {
    id: "ord_neobank2",
    title: "Neo 银行 · 私行专场答谢晚宴",
    client: "Neo 银行 · 战略客户部",
    date: "2027-03-06",
    amount: "¥ 72.4 万",
    contractState: "signed",
    paidRatio: 30,
    nextMilestone: "阶段款 · 演员定档后",
    nextMilestoneAt: "预计 12-05 触发",
    daysToEvent: 138,
    aiPrepared: "AI 已根据合同拟好阶段款提醒邮件,等你复核。",
  },
  {
    id: "ord_alpha",
    title: "AlphaBio · 产品发布会",
    client: "AlphaBio · 品牌部",
    date: "2026-10-22",
    amount: "¥ 58.0 万",
    contractState: "pending",
    paidRatio: 0,
    nextMilestone: "客户方合同签署",
    nextMilestoneAt: "已发送 3 天,未回执",
    daysToEvent: 92,
    riskNote: "对方法务未回复,建议今日跟进",
    aiPrepared: "AI 已起草一封礼貌催办邮件,含合同摘要与关键条款说明。",
  },
  {
    id: "ord_neobank1",
    title: "Neo 银行 · 2025 战略客户答谢",
    client: "Neo 银行 · 战略客户部",
    date: "2025-11-08",
    amount: "¥ 68.9 万",
    contractState: "framework",
    paidRatio: 100,
    nextMilestone: "已完成 · 沉淀为案例证据",
    nextMilestoneAt: "NPS 68 · 客户已同意脱敏",
    daysToEvent: -364,
    aiPrepared: "AI 已把这场活动脱敏后加入你的案例集,可直接复用。",
  },
];

const stateLabel: Record<OrderRow["contractState"], string> = {
  signed: "已签约",
  pending: "待客户签署",
  framework: "框架订单",
};

function OrdersList() {
  const active = orders.filter((o) => o.daysToEvent >= 0);
  const done = orders.filter((o) => o.daysToEvent < 0);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <Link to="/tenant" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> 服务方工作台
      </Link>
      <h1 className="text-2xl font-semibold text-foreground">订单管理</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        接住主服务机会后,落地为已签订单。这里聚合合同状态、付款节点、履约倒计时和 AI 已完成事项,一屏可视化你所有承接中的活动。
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Kpi label="进行中订单" value={String(active.length)} sub="含待签署 1 单" />
        <Kpi label="管线总额" value="¥ 130.4 万" sub="已收 ¥ 21.7 万" />
        <Kpi label="最紧迫" value="92 天" sub="AlphaBio · 待签合同" />
      </div>

      <section className="mt-6">
        <div className="mb-2 text-[11px] font-medium tracking-[0.16em] text-muted-foreground">进行中</div>
        <div className="space-y-3">
          {active.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-2 text-[11px] font-medium tracking-[0.16em] text-muted-foreground">已完成 · 可复用</div>
        <div className="space-y-3">
          {done.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="surface-1 rounded-xl p-4">
      <div className="text-[11px] tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function OrderCard({ order }: { order: OrderRow }) {
  return (
    <Link
      to="/tenant/orders/$id"
      params={{ id: order.id }}
      className="block rounded-xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-primary/40 hover:bg-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <StatusBadge
              state={order.contractState === "signed" ? "verified" : order.contractState === "pending" ? "pending" : "declared"}
              label={stateLabel[order.contractState]}
            />
            {order.riskNote && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--state-risk)]/40 bg-[color:var(--state-risk)]/10 px-2 py-0.5 text-[10px] text-[color:var(--state-risk)]">
                <AlertCircle className="h-3 w-3" />
                需关注
              </span>
            )}
          </div>
          <div className="text-sm font-semibold text-foreground">{order.title}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {order.client} · {order.date} · {order.amount}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] tracking-wide text-muted-foreground">距活动</div>
          <div className="font-mono text-lg font-semibold text-foreground">
            {order.daysToEvent >= 0 ? `${order.daysToEvent} 天` : "已过期"}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><CircleDollarSign className="h-3 w-3" /> 付款进度</span>
            <span className="font-mono">{order.paidRatio}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary/70" style={{ width: `${order.paidRatio}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock3 className="h-3 w-3" /> 下一节点
          </div>
          <div className="text-xs text-foreground">{order.nextMilestone}</div>
          <div className="text-[11px] text-muted-foreground">{order.nextMilestoneAt}</div>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-[color:var(--state-ai)]/30 bg-[color:var(--state-ai)]/5 px-3 py-2 text-[11px] text-foreground/80">
        <span className="mr-1 font-medium text-[color:var(--state-ai)]">AI 已完成:</span>
        {order.aiPrepared}
      </div>
    </Link>
  );
}

export { FileSignature, CheckCircle2 };
