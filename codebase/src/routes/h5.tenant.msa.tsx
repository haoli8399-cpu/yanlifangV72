import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Phone, MapPin, Calendar, DollarSign, ChevronRight,
  CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import { useMSAList, useAcceptMSA, useDeclineMSA } from "../lib/hooks";
import { msaFixtures, type MainServiceAssignment } from "../lib/fixtures";

export const Route = createFileRoute("/h5/tenant/msa")({ component: TenantMSA });

// ── 状态标签 ──

function StatusBadge({ status }: { status: MainServiceAssignment["lifecycle_status"] }) {
  const map: Record<string, { label: string; color: string }> = {
    proposed: { label: "新机会", color: "border-[var(--state-ai)]/40 bg-[var(--state-ai)]/10 text-[var(--state-ai)]" },
    pending_dual_confirmation: { label: "待确认", color: "border-[var(--state-pending)]/40 bg-[var(--state-pending)]/10 text-[var(--state-pending)]" },
    active: { label: "已激活", color: "border-[var(--state-verified)]/40 bg-[var(--state-verified)]/10 text-[var(--state-verified)]" },
    completed: { label: "已完成", color: "border-[var(--state-verified)]/40 bg-[var(--state-verified)]/10 text-[var(--state-verified)]" },
    expired: { label: "已过期", color: "border-muted-foreground/30 bg-muted/20 text-muted-foreground" },
  };
  const s = map[status] || map.expired;
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${s.color}`}>{s.label}</span>;
}

function DecisionBadge({ label, value }: { label: string; value: string }) {
  const color = value === "accepted" || value === "selected"
    ? "text-green-600"
    : value === "declined" || value === "rejected"
    ? "text-red-500"
    : "text-muted-foreground";
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span className={`font-medium ${color}`}>
        {value === "pending" && "未操作"}
        {value === "accepted" && "已接受"}
        {value === "declined" && "已拒绝"}
        {value === "selected" && "已选择"}
        {value === "rejected" && "已拒绝"}
        {value === "withdrawn" && "已撤回"}
        {value === "expired" && "已过期"}
      </span>
    </div>
  );
}

// ── MSA 卡片 ──

function MSACard({
  msa,
  onAccept,
  onDecline,
}: {
  msa: MainServiceAssignment;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const isPending = msa.tenant_decision === "pending" && msa.lifecycle_status === "proposed";
  const isActive = msa.lifecycle_status === "active";

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      {/* 顶部：类型 + 状态 */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary">
          {msa.engagement_type === "main_service" ? "主服务机会" : "模块协作"}
        </span>
        <StatusBadge status={msa.lifecycle_status} />
      </div>

      {/* 需求摘要 */}
      <div>
        <h3 className="text-base font-semibold text-foreground">{msa.brief_summary}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{msa.city}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{msa.event_date}</span>
          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{msa.budget_level}</span>
        </div>
      </div>

      {/* 适格 + 容量状态 */}
      <div className="flex gap-3 text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          适格：{msa.eligibility_status === "eligible" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
          {msa.eligibility_status === "eligible" ? "通过" : "待评估"}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          容量：
          {msa.capacity_status === "available" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
          {msa.capacity_status === "available" ? "可承接" : "有限"}
        </span>
      </div>

      {/* 双方决定状态 */}
      <div className="space-y-1 rounded-lg bg-secondary/30 px-3 py-2">
        <DecisionBadge label="客户" value={msa.customer_decision} />
        <DecisionBadge label="我方" value={msa.tenant_decision} />
      </div>

      {/* 操作按钮 */}
      {isPending && (
        <div className="flex gap-3 pt-1">
          <button
            onClick={onDecline}
            className="flex-1 rounded-lg border border-border/60 px-4 py-2.5 text-sm font-medium text-muted-foreground active:bg-secondary/40"
          >
            暂不承接
          </button>
          <button
            onClick={onAccept}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground active:opacity-80"
          >
            接受主服务责任
          </button>
        </div>
      )}

      {isActive && (
        <Link
          to="/h5/projects/$id"
          params={{ id: msa.demand_id.replace("dmd_", "proj_") }}
          className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5 text-sm text-primary active:bg-secondary/60"
        >
          <span>进入项目空间</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

// ── 主页 ──

function TenantMSA() {
  const { data: apiData, isLoading, isError } = useMSAList();
  const acceptMSA = useAcceptMSA();
  const declineMSA = useDeclineMSA();

  // 优先使用 API 数据，API 不可用时降级到 Fixtures
  const list = (apiData || msaFixtures) as MainServiceAssignment[];

  const handleAccept = async (id: string) => {
    acceptMSA.mutate(id);
  };

  const handleDecline = async (id: string) => {
    declineMSA.mutate(id);
  };

  const pendingCount = list.filter((m) => m.tenant_decision === "pending" && m.lifecycle_status !== "active").length;

  if (isLoading) {
    return <div className="mx-auto max-w-[480px] p-8 text-center text-sm text-muted-foreground">加载中...</div>;
  }

  if (isError) {
    return <div className="mx-auto max-w-[480px] p-8 text-center text-sm text-red-500">加载失败，使用本地演示数据</div>;
  }

  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      {/* 顶栏 */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
          <Phone className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">服务机会</h1>
          <p className="text-[11px] text-muted-foreground">
            {pendingCount > 0 ? `${pendingCount} 个待处理机会` : "暂无待处理"}
          </p>
        </div>
      </div>

      {/* 提示 */}
      {pendingCount > 0 && (
        <div className="mb-4 rounded-lg border border-[var(--state-ai)]/40 bg-[var(--state-ai)]/10 px-3 py-2 text-[11px] text-foreground/80">
          接受主服务责任表示你承担方案整合、统一对客报价和整体履约责任。需逐单确认。
        </div>
      )}

      {/* 列表 */}
      <div className="space-y-4">
        {list.map((msa) => (
          <MSACard
            key={msa.id}
            msa={msa}
            onAccept={() => handleAccept(msa.id)}
            onDecline={() => handleDecline(msa.id)}
          />
        ))}
      </div>

      {/* 脚注 */}
      <div className="mt-8 border-t border-border/60 pt-4 text-center text-[10px] text-muted-foreground">
        V7.2 开发中 · API 可用时自动切换为真实数据
      </div>
    </div>
  );
}
