import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Download,
  FileArchive,
  ShieldCheck,
  Trash2,
  Undo2,
  Key,
  Database,
  History,
  Check,
} from "lucide-react";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/account/data")({
  component: DataSovereignty,
  head: () => ({
    meta: [
      { title: "数据主权 · 演立方" },
      {
        name: "description",
        content: "你产生的每一份数据都属于你。随时导出、迁移、撤回授权或销毁账户。",
      },
    ],
  }),
});

type Bundle = {
  id: string;
  label: string;
  size: string;
  format: string;
  desc: string;
};

const BUNDLES: Bundle[] = [
  {
    id: "b1",
    label: "全量档案(推荐)",
    size: "约 128 MB",
    format: "ZIP · JSON + 原始附件",
    desc: "项目、方案、报价、合同、消息、复盘、AI 记忆、发票凭证",
  },
  {
    id: "b2",
    label: "客户可读版",
    size: "约 12 MB",
    format: "PDF 合集",
    desc: "面向财务/领导的可打印版本,自动隐去内部批注",
  },
  {
    id: "b3",
    label: "迁移包(给下一家平台)",
    size: "约 44 MB",
    format: "开放 Schema · JSON",
    desc: "结构化字段清晰对齐,便于导入其他协作/CRM 系统",
  },
];

type Grant = {
  id: string;
  who: string;
  what: string;
  scope: string;
  expiresIn: string;
  lastUsed?: string;
};

const GRANTS: Grant[] = [
  {
    id: "g1",
    who: "客户 · Lily @ Neo 银行",
    what: "分享页 · 方案 A/B/C",
    scope: "只读 · 已隐藏预算细项",
    expiresIn: "还有 12 天",
    lastUsed: "2 天前查看 3 次",
  },
  {
    id: "g2",
    who: "协作方 · 星耀灯光",
    what: "交付包 · 场地/物料/DoDont",
    scope: "只读 + 签收回执",
    expiresIn: "活动结束后 7 天自动失效",
    lastUsed: "昨天下载",
  },
  {
    id: "g3",
    who: "演员 · 阿旬",
    what: "档期日历读取",
    scope: "仅可见与阿旬相关的档期段",
    expiresIn: "长期(可随时撤回)",
  },
];

function DataSovereignty() {
  const [requested, setRequested] = useState<Record<string, boolean>>({});
  const [revoked, setRevoked] = useState<Record<string, boolean>>({});

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10">
      <div className="flex items-center gap-2 text-xs tracking-[0.14em] text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-[color:var(--state-verified)]" />
        账户 · 数据主权
      </div>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">
        你产生的每一份数据都属于你
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        导出、迁移、撤回授权或销毁账户 —— 都无需联系客服。每一次动作都会记录在时间线里。
      </p>

      <div className="mt-6">
        <AgentInlineSuggestion title="要不要现在生成一份「客户可读版」?">
          你上周刚完成 Neo 银行项目,复盘沉淀已就绪。生成的 PDF 会自动隐去内部批注与成本项,
          适合直接发给客户 Lily 归档。
        </AgentInlineSuggestion>
      </div>

      {/* Export */}
      <Section
        title="导出你的数据"
        icon={FileArchive}
        desc="所有导出为一次性凭证链接,24 小时有效。"
      >
        <div className="grid gap-3 md:grid-cols-3">
          {BUNDLES.map((b) => {
            const done = requested[b.id];
            return (
              <div
                key={b.id}
                className="surface-1 flex flex-col rounded-xl border border-border/60 p-4"
              >
                <div className="text-sm font-semibold text-foreground">{b.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{b.desc}</div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5">{b.format}</span>
                  <span>{b.size}</span>
                </div>
                <button
                  disabled={done}
                  onClick={() => setRequested((r) => ({ ...r, [b.id]: true }))}
                  className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${
                    done
                      ? "bg-[color:var(--state-verified)]/15 text-[color:var(--state-verified)]"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {done ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> 已排入队列 · 稍后邮件通知
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" /> 生成导出
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Share grants */}
      <Section
        title="谁正在访问你的数据"
        icon={Key}
        desc="所有对外分享 / 授权都可即刻撤回。撤回后已缓存的副本不受平台控制,但新访问会被拒绝。"
      >
        <div className="space-y-2">
          {GRANTS.map((g) => {
            const isRevoked = revoked[g.id];
            return (
              <div
                key={g.id}
                className={`surface-1 rounded-xl border p-4 transition ${
                  isRevoked ? "border-border/40 opacity-60" : "border-border/60"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{g.who}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{g.what}</div>
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                      <span>· 范围 {g.scope}</span>
                      <span>· {g.expiresIn}</span>
                      {g.lastUsed && <span>· {g.lastUsed}</span>}
                    </div>
                  </div>
                  {isRevoked ? (
                    <button
                      onClick={() => setRevoked((r) => ({ ...r, [g.id]: false }))}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Undo2 className="h-3 w-3" /> 撤销撤回
                    </button>
                  ) : (
                    <button
                      onClick={() => setRevoked((r) => ({ ...r, [g.id]: true }))}
                      className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/[0.06] px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" /> 立即撤回
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-right">
          <Link
            to="/admin/permissions"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            查看完整授权矩阵 →
          </Link>
        </div>
      </Section>

      {/* Audit */}
      <Section
        title="谁在何时用了这些数据"
        icon={History}
        desc="AI 每一次读取、外部每一次访问都留痕。"
      >
        <div className="rounded-xl border border-border/60 bg-card/40 p-4">
          <ul className="space-y-3 text-sm">
            <AuditLine
              time="今天 09:12"
              who="AI 记忆中心"
              action="读取「协作方历史」用于生成本次报价"
              source="项目 P-231 · 报价页"
            />
            <AuditLine
              time="昨天 21:04"
              who="客户 Lily"
              action="打开分享页(方案 A/B/C · 已隐藏预算)"
              source="分享凭证 SP-Neo-2027 · IP 已脱敏"
            />
            <AuditLine
              time="3 天前"
              who="协作方 · 星耀灯光"
              action="下载交付包"
              source="签收回执 #HP-231"
            />
          </ul>
        </div>
      </Section>

      {/* Nuclear */}
      <Section
        title="销毁账户"
        icon={Database}
        desc="不可撤销。执行前会自动强制生成一次全量导出。"
      >
        <div className="rounded-xl border border-destructive/40 bg-destructive/[0.04] p-5">
          <p className="text-sm text-foreground/85">
            30 天冷静期内,账户处于「已冻结、可恢复」状态。30 天后:所有个人可识别信息脱敏,
            AI 记忆全部销毁,与你相关的分享/授权立即失效。已生成给他人的合同/凭证以法律要求的
            最短周期保留。
          </p>
          <button onClick={() => demoToast()} className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/15">
            <Trash2 className="h-3.5 w-3.5" /> 开始销毁流程
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  desc,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline gap-3">
        <Icon className="h-4 w-4 text-foreground/70" />
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      {children}
    </section>
  );
}

function AuditLine({
  time,
  who,
  action,
  source,
}: {
  time: string;
  who: string;
  action: string;
  source: string;
}) {
  return (
    <li className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
      <div className="text-foreground/90">
        <span className="text-muted-foreground">{time} · </span>
        <span className="font-medium">{who}</span>
        <span className="text-foreground/80"> — {action}</span>
      </div>
      <div className="mt-1">
        <EvidenceLine source={source} />
      </div>
    </li>
  );
}
