import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import {
  ArrowLeft,
  Building2,
  FileSignature,
  Users,
  ShieldAlert,
  Handshake,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/projects/$id/contract/tree")({
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: () => ({ meta: [{ title: "多合同责任树 · 演立方" }] }),
  component: TreePage,
  ...stageBoundaries({ backTo: "/projects/$id/contract", backLabel: "返回上一环节", homeTo: "/projects/$id" }),
});

type NodeState = "signed" | "waiting_client" | "waiting_tenant" | "draft";

const stateMeta: Record<
  NodeState,
  { label: string; state: "verified" | "pending" | "ai" | "declared" }
> = {
  signed: { label: "已签署", state: "verified" },
  waiting_client: { label: "待客户签署", state: "pending" },
  waiting_tenant: { label: "待服务方签署", state: "pending" },
  draft: { label: "草稿", state: "ai" },
};

type ContractNode = {
  id: string;
  kind: "main" | "framework" | "simple" | "external";
  title: string;
  parties: [string, string];
  amount: string;
  scope: string;
  status: NodeState;
  responsibility: string;
  note?: string;
};

const mainVoucher: ContractNode = {
  id: "v1",
  kind: "main",
  title: "全案统筹电子合同",
  parties: ["Neo 银行(客户)", "后仰喜剧(主服务方)"],
  amount: "¥ 88.0 万",
  scope: "唯一整体责任 · 全案统筹",
  status: "waiting_client",
  responsibility:
    "主服务方对客户承担唯一整体责任。所有协作方/演员的表现均由主服务方对客户负责。",
};

const innerVouchers: ContractNode[] = [
  {
    id: "v2",
    kind: "framework",
    title: "光弦舞美 · 灯光音响补充订单",
    parties: ["后仰喜剧", "光弦舞美"],
    amount: "¥ 12.5 万",
    scope: "灯光 · 音响 · 舞台装置",
    status: "signed",
    responsibility: "内部履约凭证,不改变对客户的唯一整体责任",
    note: "基于 2026 年度框架协议 §3.2",
  },
  {
    id: "v3",
    kind: "simple",
    title: "演员周晔 · 简化合作确认",
    parties: ["后仰喜剧", "周晔工作室"],
    amount: "¥ 8.0 万",
    scope: "现场脱口秀 20 min",
    status: "draft",
    responsibility: "内部履约凭证,不改变对客户的唯一整体责任",
  },
  {
    id: "v4",
    kind: "simple",
    title: "演员林知遥 · 简化合作确认",
    parties: ["后仰喜剧", "林知遥"],
    amount: "¥ 6.5 万",
    scope: "开场互动 15 min · 主持串场",
    status: "waiting_tenant",
    responsibility: "内部履约凭证,不改变对客户的唯一整体责任",
  },
  {
    id: "v5",
    kind: "external",
    title: "云台影像 · 直播分发外部合同",
    parties: ["后仰喜剧", "云台影像"],
    amount: "¥ 4.2 万",
    scope: "多机位直播 · 短视频剪辑",
    status: "signed",
    responsibility: "外部合同 · 已同步扫描件至凭证中心",
    note: "线下签署,盖章版已存证",
  },
];

const kindLabel = {
  main: "客户 ↔ 主服务方",
  framework: "框架订单",
  simple: "简化确认",
  external: "外部合同",
};

const kindColor: Record<ContractNode["kind"], string> = {
  main: "text-primary",
  framework: "text-[color:var(--state-verified)]",
  simple: "text-[color:var(--state-declared)]",
  external: "text-[color:var(--state-ai)]",
};

function NodeCard({
  node,
  projectId,
  primary,
}: {
  node: ContractNode;
  projectId: string;
  primary?: boolean;
}) {
  const meta = stateMeta[node.status];
  return (
    <div
      className={`rounded-lg border p-4 ${
        primary
          ? "border-primary/50 bg-primary/[0.06]"
          : "border-border/60 bg-card/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <FileSignature className={`h-3.5 w-3.5 ${kindColor[node.kind]}`} />
            <span className="text-sm font-medium text-foreground">{node.title}</span>
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {kindLabel[node.kind]}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{node.parties[0]}</span>
            <Handshake className="h-3 w-3" />
            <span>{node.parties[1]}</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {node.amount} · {node.scope}
          </div>
          {node.note && (
            <div className="mt-1 text-[10px] text-muted-foreground/80">{node.note}</div>
          )}
        </div>
        <StatusBadge state={meta.state} label={meta.label} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2.5">
        <div className="flex items-start gap-1.5 text-[11px] text-foreground/80">
          <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
          {node.responsibility}
        </div>
        <Link
          to="/projects/$id/contract/$voucherId"
          params={{ id: projectId, voucherId: node.id }}
          className="inline-flex shrink-0 items-center gap-1 text-[11px] text-primary hover:underline"
        >
          预览 <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function TreePage() {
  const { project } = Route.useLoaderData();
  const [showInternal, setShowInternal] = useState(true);

  const innerTotal = innerVouchers.reduce((sum, v) => {
    const n = parseFloat(v.amount.replace(/[^\d.]/g, ""));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <>
      <div className="space-y-6">
        <Link
          to="/projects/$id/contract"
          params={{ id: project.id }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> 返回合作凭证中心
        </Link>

        <header>
          <h2 className="text-lg font-semibold text-foreground">多合同责任树</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            一个项目通常涉及多份合同:客户与主服务方之间的对外合同,以及主服务方与协作方/演员之间的内部履约凭证。
            <span className="text-foreground/90">对客户而言,唯一整体责任始终归属于主服务方。</span>
          </p>
        </header>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-xs text-foreground/85">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI 责任说明
          </div>
          <p>
            你(Neo 银行)只需与主服务方后仰喜剧签署一份合同。内部履约凭证({innerVouchers.length} 份 · 合计 ¥{" "}
            {innerTotal.toFixed(1)} 万)由主服务方对协作方负责,不影响你的追责路径。若出现问题,一律向主服务方主张。
          </p>
        </div>

        {/* Layer 1: Client ↔ Main */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-3 w-3" />
            第一层 · 对外合同(客户 ↔ 主服务方)
          </div>
          <NodeCard node={mainVoucher} projectId={project.id} primary />
        </section>

        {/* Connector */}
        <div className="flex flex-col items-center gap-1 py-1">
          <div className="h-6 w-px bg-border/70" />
          <button
            onClick={() => setShowInternal(!showInternal)}
            className="rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {showInternal ? "▾ 折叠" : "▸ 展开"} 内部履约凭证 · {innerVouchers.length} 份
          </button>
          {showInternal && <div className="h-6 w-px bg-border/70" />}
        </div>

        {/* Layer 2: Main ↔ Collaborators */}
        {showInternal && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Users className="h-3 w-3" />
                第二层 · 内部履约凭证(主服务方 ↔ 协作方 / 演员)
              </div>
              <span className="text-[11px] text-muted-foreground">
                合计 ¥ {innerTotal.toFixed(1)} 万
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {innerVouchers.map((v) => (
                <NodeCard key={v.id} node={v} projectId={project.id} />
              ))}
            </div>
          </section>
        )}

        <div className="rounded-lg border border-border/60 bg-card/40 p-4 text-xs text-muted-foreground">
          <div className="mb-1.5 flex items-center gap-1.5 font-medium text-foreground">
            <Info className="h-3.5 w-3.5" /> 为什么把内部凭证也展示给客户?
          </div>
          <p>
            出于透明度考虑,演立方允许客户查阅内部凭证的存在与状态(不含金额细则),便于评估主服务方的资源组织能力。
            具体金额、条款仅对主服务方与对应协作方可见 —— 这里展示的金额基于当前项目的授权级别。
          </p>
        </div>
      </div>
    </>
  );
}