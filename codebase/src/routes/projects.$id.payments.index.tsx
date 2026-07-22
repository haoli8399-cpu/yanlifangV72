import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { CreditCard, Receipt, FileCheck, CheckCircle2, Info, Settings2 } from "lucide-react";
import { useState } from "react";
import { demoToast } from "@/lib/demo-toast";
import { EmptyState } from "@/components/yanlicube/focus-page";

export const Route = createFileRoute("/projects/$id/payments/")({
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: () => ({ meta: [{ title: "收付款 · 演立方" }] }),
  component: PaymentsPage,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

type Node = {
  id: string;
  label: string;
  amount: string;
  dueBy: string;
  status: "pending" | "declared" | "reconciled";
  invoice?: string;
  note?: string;
};

const initialNodes: Node[] = [
  { id: "n1", label: "定金 30%", amount: "¥ 26.4 万", dueBy: "合同签署后 5 个工作日", status: "declared", invoice: "增值税专票 · 已开", note: "客户已声明付款,主服务方待核销" },
  { id: "n2", label: "阶段款 40%", amount: "¥ 35.2 万", dueBy: "演出前 3 天", status: "pending", invoice: "待开票" },
  { id: "n3", label: "尾款 30%", amount: "¥ 26.4 万", dueBy: "演后 15 天内", status: "pending", invoice: "待开票" },
];

const statusMeta = {
  pending: { label: "待到期", state: "pending" as const },
  declared: { label: "已声明付款", state: "declared" as const },
  reconciled: { label: "已核销到账", state: "verified" as const },
};

function PaymentsPage() {
  const { project } = Route.useLoaderData();
  const [nodes, setNodes] = useState(initialNodes);

  if (!project.quote) {
    return (
      <EmptyState
        icon={CreditCard}
        title="付款节点会在合同签署后展开"
        description="演立方不托管资金 —— 你按合同节点线下转账,声明「已付款」,主服务方核销到账后升级为「已到账」。整个过程有留痕、有证据。"
        primary={{ label: "先看报价", to: `/projects/${project.id}/quote` }}
        secondary={{ label: "了解付款方式的差异", to: `/projects/${project.id}/payments/scheme` }}
        whatShowsUp={[
          "定金 · 阶段款 · 尾款(比例可切换)",
          "每一笔的开票信息、到期日、声明状态",
          "一键声明本方已付款,附上转账凭证",
        ]}
      />
    );
  }

  const declare = (id: string) =>
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, status: "declared", note: "本方已声明付款,等待主服务方核销" } : n)));

  return (
    <>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">收付款 · 开票</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              按合同节点付款。你可以在完成对公转账后「声明已付款」,系统只标记声明状态,由主服务方核销后升级为「已到账」。
            </p>
          </div>
          <div className="rounded border border-border/60 bg-card/60 px-4 py-3 text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">合同总额</div>
            <div className="text-lg font-semibold text-foreground">¥ 88.0 万</div>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-xs">
          <div className="text-foreground/85">
            <span className="font-medium text-primary">当前付款方式:</span> 定金 · 阶段 · 尾款(30% / 40% / 30%) — 双方已确认。
          </div>
          <Link
            to="/projects/$id/payments/scheme"
            params={{ id: project.id }}
            className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-3 py-1.5 text-primary"
          >
            <Settings2 className="h-3 w-3" /> 切换 / 查看付款方式
          </Link>
        </div>

        <div className="rounded-lg border border-border/60 bg-card/60 p-4 text-xs text-muted-foreground">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
            <Info className="h-3.5 w-3.5" /> 关于「本方已付款」声明
          </div>
          <p>
            演立方不托管资金。你「声明已付款」后,主服务方通过银行到账信息核销,页面才会显示「已到账」。此设计保护双方各自作为付款/收款事实的唯一负责主体。
          </p>
        </div>

        <div className="space-y-3">
          {nodes.map((n, i) => {
            const m = statusMeta[n.status];
            return (
              <article key={n.id} className="rounded-lg border border-border/60 bg-card/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background text-xs font-mono text-muted-foreground">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{n.label}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        应付于 {n.dueBy}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-base text-foreground">{n.amount}</div>
                    <div className="mt-1"><StatusBadge state={m.state} label={m.label} /></div>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2 rounded border border-border/50 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                    <Receipt className="h-3.5 w-3.5" />
                    {n.invoice ?? "无开票信息"}
                  </div>
                  <div className="flex items-center gap-2 rounded border border-border/50 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
                    <FileCheck className="h-3.5 w-3.5" />
                    {n.note ?? "无备注"}
                  </div>
                </div>
                {n.status === "pending" && (
                  <div className="mt-4 flex gap-2 text-xs">
                    <button
                      onClick={() => declare(n.id)}
                      className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 font-medium text-primary-foreground"
                    >
                      <CreditCard className="h-3 w-3" /> 声明本方已付款
                    </button>
                    <button onClick={() => demoToast()} className="rounded border border-border/60 bg-background px-3 py-1.5 text-muted-foreground hover:text-foreground">
                      申请调整节点
                    </button>
                  </div>
                )}
                {n.status === "declared" && (
                  <div className="mt-4 inline-flex items-center gap-1 rounded border border-[color:var(--state-declared)]/40 bg-[color:var(--state-declared)]/10 px-3 py-1.5 text-xs text-[color:var(--state-declared)]">
                    <CheckCircle2 className="h-3 w-3" /> 已声明 · 等待主服务方核销
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