import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { FileSignature, FileCheck2, FileText, Handshake, Download, Pen, Eye, GitBranch } from "lucide-react";
import { useState } from "react";
import { demoToast } from "@/lib/demo-toast";
import { EmptyState } from "@/components/yanlicube/focus-page";

export const Route = createFileRoute("/projects/$id/contract/")({
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: () => ({ meta: [{ title: "合作凭证中心 · 演立方" }] }),
  component: ContractPage,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

type Voucher = {
  id: string;
  kind: "econtract" | "external" | "framework" | "simple";
  title: string;
  parties: string;
  amount: string;
  status: "draft" | "waiting_client" | "waiting_tenant" | "signed";
  updatedAt: string;
  summary: string[];
};

const kindLabel: Record<Voucher["kind"], string> = {
  econtract: "电子合同",
  external: "外部合同(线下签署)",
  framework: "框架订单(基于已有主协议)",
  simple: "简化合作确认",
};
const kindIcon = {
  econtract: FileSignature,
  external: FileText,
  framework: FileCheck2,
  simple: Handshake,
};

const vouchers: Voucher[] = [
  {
    id: "v1",
    kind: "econtract",
    title: "主服务方 · 全案统筹电子合同",
    parties: "Neo 银行 ↔ 后仰喜剧(主服务方)",
    amount: "¥ 88 万",
    status: "waiting_client",
    updatedAt: "2 小时前",
    summary: [
      "服务范围: 全案统筹 · 唯一整体责任方",
      "付款节点: 30% 定金 · 40% 演出前 3 天 · 30% 演后 15 天内",
      "取消退款规则: 演出前 21 天全额退定金,15-21 天退 70%,15 天内不退",
      "含 2 轮内容评审 · 现场执行含 3 名执行统筹",
    ],
  },
  {
    id: "v2",
    kind: "framework",
    title: "光弦舞美 · 灯光音响协作(基于 2026 框架)",
    parties: "后仰喜剧 ↔ 光弦舞美",
    amount: "¥ 12.5 万",
    status: "signed",
    updatedAt: "1 天前",
    summary: [
      "基于双方 2026 框架协议 §3.2 补充订单",
      "由主服务方承担对客户的唯一整体责任,内部结算由 服务方内部完成",
    ],
  },
  {
    id: "v3",
    kind: "simple",
    title: "演员周晔 · 简化合作确认",
    parties: "后仰喜剧 ↔ 周晔工作室",
    amount: "¥ 8 万",
    status: "draft",
    updatedAt: "刚刚",
    summary: [
      "适用于金额 <10 万、无自定义条款的合作场景",
      "已声明:双方对档期、金额、退款规则达成一致",
    ],
  },
];

const statusMap: Record<
  Voucher["status"],
  { label: string; state: "verified" | "pending" | "declared" | "ai" | "expired" }
> = {
  draft: { label: "草稿 · 待生成", state: "ai" },
  waiting_client: { label: "待客户签署", state: "pending" },
  waiting_tenant: { label: "待服务方签署", state: "pending" },
  signed: { label: "已签署", state: "verified" },
};

function ContractPage() {
  const { project } = Route.useLoaderData();
  const [expanded, setExpanded] = useState<string | null>("v1");

  // 报价未生成前,合同流程尚未开始
  if (!project.quote) {
    return (
      <EmptyState
        icon={FileSignature}
        title="合作凭证会在报价确认后生成"
        description="演立方支持 4 类凭证:电子合同 / 外部合同 / 框架订单 / 简化合作确认。主服务方会在你确认报价后起草,你只需要核对付款节点与取消退款规则再签署。"
        primary={{ label: "去看报价", to: `/projects/${project.id}/quote` }}
        secondary={{ label: "了解 4 类凭证的差异", to: "/guides" }}
        whatShowsUp={[
          "客户 ↔ 主服务方的《全案统筹电子合同》",
          "主服务方 ↔ 协作方 / 演员的内部凭证",
          "多合同责任树 · 一眼看清谁对谁负责",
        ]}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <header>
          <h2 className="text-lg font-semibold text-foreground">合作凭证中心</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            演立方支持四类合作凭证。同一项目可能出现多份 —— 客户与主服务方之间一份,主服务方与协作方/演员之间各一份。你只需关注需要你确认的凭证。
          </p>
        </header>

        <Link
          to="/projects/$id/contract/tree"
          params={{ id: project.id }}
          className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 text-xs transition hover:bg-primary/10"
        >
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <div>
              <div className="font-medium text-foreground">多合同责任树</div>
              <div className="mt-0.5 text-muted-foreground">
                查看客户 ↔ 主服务方与内部履约凭证的完整责任结构
              </div>
            </div>
          </div>
          <span className="text-primary">→</span>
        </Link>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-xs text-foreground/85">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-primary">
            <FileSignature className="h-3.5 w-3.5" /> 需要你确认
          </div>
          <p>
            主服务方已提交《全案统筹电子合同》。请核对付款节点与取消退款规则,再进行签署。
          </p>
        </div>

        <div className="space-y-3">
          {vouchers.map((v) => {
            const Icon = kindIcon[v.kind];
            const meta = statusMap[v.status];
            const open = expanded === v.id;
            return (
              <article
                key={v.id}
                className="rounded-lg border border-border/60 bg-card/60"
              >
                <button
                  onClick={() => setExpanded(open ? null : v.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{v.title}</span>
                      <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        {kindLabel[v.kind]}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {v.parties} · {v.amount} · 更新于 {v.updatedAt}
                    </div>
                  </div>
                  <StatusBadge state={meta.state} label={meta.label} />
                </button>
                {open && (
                  <div className="border-t border-border/50 px-5 py-4">
                    <ul className="space-y-1.5 text-xs text-foreground/85">
                      {v.summary.map((s) => (
                        <li key={s} className="flex gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          {s}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex gap-2 text-xs">
                      <Link
                        to="/projects/$id/contract/$voucherId"
                        params={{ id: project.id, voucherId: v.id }}
                        className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-3 py-1.5 text-primary"
                      >
                        <Eye className="h-3 w-3" /> 预览全文 & 关键条款
                      </Link>
                      {v.status === "waiting_client" && (
                        <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 font-medium text-primary-foreground">
                          <Pen className="h-3 w-3" /> 电子签署
                        </button>
                      )}
                      {v.status === "draft" && (
                        <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-3 py-1.5 text-primary">
                          <Pen className="h-3 w-3" /> 生成正式版
                        </button>
                      )}
                      <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded border border-border/60 bg-background px-3 py-1.5 text-muted-foreground hover:text-foreground">
                        <Download className="h-3 w-3" /> 下载 PDF
                      </button>
                    </div>
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