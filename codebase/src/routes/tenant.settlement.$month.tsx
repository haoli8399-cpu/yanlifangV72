import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Wallet, Receipt, TrendingUp, ShieldAlert } from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";
import { TenantBottomTabs } from "@/components/yanlicube/tenant-h5-nav";

export const Route = createFileRoute("/tenant/settlement/$month")({
  loader: ({ params }) => ({ month: params.month }),
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.month ?? ""} 结算详情 · 演立方` }],
  }),
  component: SettlementMonth,
});

type Entry = {
  id: string;
  date: string;
  project: string;
  type: "收款" | "开票" | "佣金" | "演员分账" | "退款";
  amount: number;
  note: string;
  state: "verified" | "pending" | "declared";
};

const MOCK: Record<string, Entry[]> = {
  "2027-01": [
    { id: "e1", date: "01-04", project: "Neo 银行答谢晚宴", type: "收款", amount: 115800, note: "阶段款到账", state: "verified" },
    { id: "e2", date: "01-05", project: "Neo 银行答谢晚宴", type: "开票", amount: 115800, note: "增值税专票已开具", state: "verified" },
    { id: "e3", date: "01-05", project: "Neo 银行答谢晚宴", type: "佣金", amount: 11580, note: "平台服务费 10%", state: "verified" },
    { id: "e4", date: "01-06", project: "Neo 银行答谢晚宴", type: "演员分账", amount: 24000, note: "何轩 · 已放款", state: "verified" },
    { id: "e5", date: "01-12", project: "AlphaBio 复盘尾款", type: "收款", amount: 26800, note: "尾款 · 结清", state: "verified" },
    { id: "e6", date: "01-18", project: "私行答谢晚宴 · 3月场", type: "收款", amount: 58200, note: "首款 · 客户审计中,暂缓后续", state: "pending" },
    { id: "e7", date: "01-22", project: "科技公司春晚(变更)", type: "退款", amount: -18000, note: "取消费退回 30%", state: "declared" },
  ],
};

function fmt(n: number) {
  return `${n < 0 ? "-" : ""}¥${Math.abs(n).toLocaleString()}`;
}

function SettlementMonth() {
  const { month } = Route.useLoaderData();
  const entries = MOCK[month] ?? MOCK["2027-01"];
  const sum = entries.reduce(
    (acc, e) => {
      if (e.type === "收款") acc.income += e.amount;
      if (e.type === "佣金") acc.fee += e.amount;
      if (e.type === "演员分账") acc.actor += e.amount;
      if (e.type === "退款") acc.refund += e.amount;
      return acc;
    },
    { income: 0, fee: 0, actor: 0, refund: 0 },
  );
  const net = sum.income - sum.fee - sum.actor + sum.refund;

  return (
    <AgentPanelProvider scopeLabel="结算 · 当月总览" quickPrompts={["把本月现金流总结成一段", "找出金额异常的条目", "给我一份给财务的月度说明"]}>
    <>
    <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-6 sm:px-6 sm:py-10 md:pb-8">
      <Link to="/tenant/settlement" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> 返回结算总览
      </Link>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="mb-1 text-xs font-medium tracking-[0.14em] text-muted-foreground">
            月度结算详情
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{month} · 现金流全景</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            所有收款、开票、佣金与演员分账按事件时序展开;AI 已按项目聚合并识别异常。
          </p>
        </div>
        <StatusBadge state="verified" label={`净流入 ${fmt(net)}`} />
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <Kpi icon={Wallet} label="本月收款" value={fmt(sum.income)} tone="pos" />
        <Kpi icon={TrendingUp} label="平台佣金" value={fmt(sum.fee)} tone="neu" />
        <Kpi icon={Receipt} label="演员分账" value={fmt(sum.actor)} tone="neu" />
        <Kpi icon={ShieldAlert} label="退款/负项" value={fmt(sum.refund)} tone={sum.refund < 0 ? "neg" : "neu"} />
      </div>

      <AgentInlineSuggestion title="AI 结算提醒">
        私行答谢晚宴的首款处于「客户审计中」8 天,已超过平均等待(4 天)。建议主动发一封结算函索取审计进度,我可以直接起草。
      </AgentInlineSuggestion>

      <div className="mt-6 overflow-hidden rounded-lg border border-border/60 bg-card/60">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">日期</th>
              <th className="px-4 py-3 text-left font-medium">项目</th>
              <th className="px-4 py-3 text-left font-medium">类型</th>
              <th className="px-4 py-3 text-right font-medium">金额</th>
              <th className="px-4 py-3 text-left font-medium">备注</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-border/50">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.date}</td>
                <td className="px-4 py-3 text-foreground">{e.project}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{e.type}</td>
                <td className={`px-4 py-3 text-right font-mono ${e.amount < 0 ? "text-[color:var(--state-expired)]" : "text-foreground"}`}>
                  {fmt(e.amount)}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{e.note}</td>
                <td className="px-4 py-3">
                  <StatusBadge state={e.state} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <TenantBottomTabs />
    </>
    </AgentPanelProvider>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "pos" | "neu" | "neg";
}) {
  const cls =
    tone === "pos"
      ? "text-[color:var(--state-verified)]"
      : tone === "neg"
      ? "text-[color:var(--state-expired)]"
      : "text-foreground";
  return (
    <div className="surface-1 rounded-lg p-4">
      <Icon className="mb-2 h-4 w-4 text-primary" />
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-lg ${cls}`}>{value}</div>
    </div>
  );
}