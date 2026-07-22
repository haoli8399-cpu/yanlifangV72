import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  KeyRound,
  ArrowLeft,
  Eye,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Filter,
  User,
  Building2,
  UserSquare2,
} from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/permissions")({
  head: () => ({
    meta: [
      { title: "授权与分享矩阵 · 演立方治理台" },
      { name: "description", content: "全平台 ShareGrant 授权矩阵:谁把哪些信息,授权给了谁,以何种范围。" },
    ],
  }),
  component: PermissionsMatrix,
});

type Role = "customer" | "tenant" | "actor";

const rows: {
  id: string;
  fromRole: Role;
  from: string;
  toRole: Role | "external";
  to: string;
  scope: string[];
  expires: string;
  password: boolean;
  watermark: boolean;
  lastView: string | null;
  state: "active" | "revoked" | "expired";
}[] = [
  {
    id: "sg-201",
    fromRole: "customer",
    from: "Neo 银行 · 王先生",
    toRole: "external",
    to: "财务总监(外部邮箱)",
    scope: ["决策摘要", "正式报价"],
    expires: "7 天 · 至 2027-01-08",
    password: true,
    watermark: true,
    lastView: "3 小时前",
    state: "active",
  },
  {
    id: "sg-198",
    fromRole: "tenant",
    from: "后仰喜剧",
    toRole: "customer",
    to: "Neo 银行 · 项目组",
    scope: ["方案对比", "履约时间线"],
    expires: "长期(项目周期内)",
    password: false,
    watermark: true,
    lastView: "昨天",
    state: "active",
  },
  {
    id: "sg-193",
    fromRole: "actor",
    from: "演员 · Q",
    toRole: "tenant",
    to: "光刻场景 · 商务",
    scope: ["未来 30 天档期", "报价区间"],
    expires: "30 天",
    password: false,
    watermark: false,
    lastView: null,
    state: "active",
  },
  {
    id: "sg-187",
    fromRole: "customer",
    from: "上季度品牌活动",
    toRole: "external",
    to: "供应商比对(临时)",
    scope: ["预算大纲"],
    expires: "已到期 · 2026-09-30",
    password: true,
    watermark: true,
    lastView: "9-25",
    state: "expired",
  },
  {
    id: "sg-182",
    fromRole: "tenant",
    from: "无声剧场",
    toRole: "external",
    to: "备选客户 · 汽车品牌",
    scope: ["脱敏案例"],
    expires: "已撤回",
    password: true,
    watermark: true,
    lastView: "9-20",
    state: "revoked",
  },
];

const roleLabel: Record<Role | "external", string> = {
  customer: "客户",
  tenant: "主服务方",
  actor: "演员",
  external: "外部",
};

const RoleIcon = ({ role }: { role: Role | "external" }) =>
  role === "customer" ? (
    <User className="h-3 w-3" />
  ) : role === "tenant" ? (
    <Building2 className="h-3 w-3" />
  ) : role === "actor" ? (
    <UserSquare2 className="h-3 w-3" />
  ) : (
    <KeyRound className="h-3 w-3" />
  );

function PermissionsMatrix() {
  const [filter, setFilter] = useState<"all" | Role>("all");
  const [items, setItems] = useState(rows);
  const shown = items.filter((r) => filter === "all" || r.fromRole === filter);
  const active = items.filter((r) => r.state === "active").length;

  const revoke = (id: string) =>
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, state: "revoked", expires: "已撤回" } : r)),
    );

  return (
    <div className="mx-auto max-w-[1300px] px-6 py-8">
      <Link
        to="/admin"
        className="mb-4 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> 返回治理台
      </Link>

      <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-primary">
        <KeyRound className="h-3.5 w-3.5" /> 平台端 · 授权矩阵
      </div>
      <h1 className="text-2xl font-semibold text-foreground">ShareGrant 授权矩阵</h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        平台不主动读取任何信息 · 只记录"谁把哪些信息,授权给了谁,以何种范围"。每一次授权都可撤回,每一次访问都留痕。
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Kpi label="有效授权" value={String(active)} tone="verified" />
        <Kpi label="含密码保护" value={String(items.filter((r) => r.password && r.state === "active").length)} tone="ai" />
        <Kpi label="30 天新增" value="14" tone="ai" />
        <Kpi label="平台读取次数" value="0" tone="verified" hint="平台不读取任何授权内容" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card/40 p-2">
        <span className="inline-flex items-center gap-1 px-2 text-[11px] text-muted-foreground">
          <Filter className="h-3 w-3" /> 授权发起方
        </span>
        {(
          [
            { k: "all", label: "全部" },
            { k: "customer", label: "客户" },
            { k: "tenant", label: "主服务方" },
            { k: "actor", label: "演员" },
          ] as { k: "all" | Role; label: string }[]
        ).map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={cn(
              "rounded px-3 py-1 text-[11px] font-medium transition-colors",
              filter === f.k
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border/60 bg-card/60">
        <table className="min-w-[900px] w-full text-[12px]">
          <thead className="bg-background/40 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">授权 #</th>
              <th className="px-4 py-3 text-left">来自</th>
              <th className="px-4 py-3 text-left">授予</th>
              <th className="px-4 py-3 text-left">可见范围</th>
              <th className="px-4 py-3 text-left">保护</th>
              <th className="px-4 py-3 text-left">有效期</th>
              <th className="px-4 py-3 text-left">最近访问</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {shown.map((r) => (
              <tr key={r.id} className={cn(r.state !== "active" && "opacity-60")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      state={
                        r.state === "active"
                          ? "verified"
                          : r.state === "revoked"
                            ? "pending"
                            : "expired"
                      }
                      label={r.state === "active" ? "有效" : r.state === "revoked" ? "已撤回" : "已到期"}
                    />
                    <span className="font-mono text-[10px] text-muted-foreground">{r.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1 text-foreground/85">
                    <RoleIcon role={r.fromRole} />
                    {r.from}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{roleLabel[r.fromRole]}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1 text-foreground/85">
                    <RoleIcon role={r.toRole} />
                    {r.to}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{roleLabel[r.toRole]}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.scope.map((s) => (
                      <span
                        key={s}
                        className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5 text-[11px]">
                    <span className="inline-flex items-center gap-1">
                      {r.password ? (
                        <ShieldCheck className="h-3 w-3 text-[color:var(--state-verified)]" />
                      ) : (
                        <ShieldOff className="h-3 w-3 text-muted-foreground" />
                      )}
                      {r.password ? "密码" : "无密码"}
                    </span>
                    <span className="text-muted-foreground">
                      {r.watermark ? "含水印" : "无水印"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.expires}</td>
                <td className="px-4 py-3">
                  {r.lastView ? (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-3 w-3" /> {r.lastView}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/60">暂无</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {r.state === "active" ? (
                    <button
                      onClick={() => revoke(r.id)}
                      className="inline-flex items-center gap-1 rounded border border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 px-2 py-1 text-[11px] text-[color:var(--state-pending)] hover:bg-[color:var(--state-pending)]/15"
                    >
                      <Trash2 className="h-3 w-3" /> 撤回
                    </button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/60">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <AgentInlineSuggestion title="AI 治理观察">
          有 1 条外部授权(#sg-201)在最近 3 小时内被访问 2 次,均来自同一 IP · 属于正常审阅行为。演员 Q 的档期授权已经 12 天未被使用,可在下次续期时提示演员是否收回。
        </AgentInlineSuggestion>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: "verified" | "ai" | "pending";
  hint?: string;
}) {
  const color =
    tone === "pending"
      ? "text-[color:var(--state-pending)]"
      : tone === "ai"
        ? "text-[color:var(--state-ai)]"
        : "text-[color:var(--state-verified)]";
  return (
    <div className="surface-1 rounded-xl p-4">
      <div className="text-[11px] tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-2xl font-semibold", color)}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}