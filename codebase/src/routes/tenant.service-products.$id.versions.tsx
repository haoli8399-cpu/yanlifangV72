import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  GitBranch,
  History,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Package,
  Users,
  ArrowLeftRight,
} from "lucide-react";
import { getServiceProduct, type ServiceProductVersion } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/tenant/service-products/$id/versions")({
  loader: ({ params }) => {
    const product = getServiceProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: () => ({
    meta: [
      { title: "版本对比与迁移 · 演出服务产品 · 演立方" },
      { name: "description", content: "对比服务产品的历史版本差异,并把在途项目/引用方案迁移至新版,保留旧版审计快照。" },
    ],
  }),
  component: VersionCompare,
});

type DiffEntry = {
  field: string;
  before: string;
  after: string;
  impact: "低" | "中" | "高";
  note: string;
};

type ConsumerProject = {
  id: string;
  title: string;
  stage: string;
  currentVersion: string;
  targetVersion: string;
  canAutoMigrate: boolean;
  blocker?: string;
};

function VersionCompare() {
  const { product } = Route.useLoaderData();
  const history: ServiceProductVersion[] = product.versionHistory;

  const [leftV, setLeftV] = useState(history[1]?.version ?? history[0].version);
  const [rightV, setRightV] = useState(history[0].version);


  const diffs = useMemo<DiffEntry[]>(() => {
    // Deterministic mock diffs derived from changelogs
    const rightEntry = history.find((h) => h.version === rightV);
    if (!rightEntry) return [];
    const base: DiffEntry[] = [
      {
        field: "价格锚点",
        before: "¥ 面议 · 参考 45-60w",
        after: "¥ 面议 · 参考 55-75w",
        impact: "中",
        note: "反映本季度舞美与人员成本上涨,不影响历史签约合同。",
      },
      {
        field: "包含模块",
        before: "主持 / 内容 / 现场统筹",
        after: "主持 / 内容 / 现场统筹 / 舞美联动",
        impact: "中",
        note: "新版将舞美联动从「依赖」升为「包含」,减少客户方独立采购负担。",
      },
      {
        field: "依赖清单",
        before: "3 项:场地 · 音响 · 视觉包装",
        after: "4 项:场地 · 音响 · 视觉包装 · 内容评审 3 轮",
        impact: "高",
        note: "PRD §6:硬依赖变更需要客户重新确认,以避免签约后争议。",
      },
      {
        field: "典型场景",
        before: "年会 · 战略客户答谢",
        after: "年会 · 战略客户答谢 · 品牌周年 · 新品发布",
        impact: "低",
        note: "扩容适配范围,不改变交付形态。",
      },
    ];
    return base;
  }, [rightV, history]);

  const consumers: ConsumerProject[] = [
    {
      id: "p-neo-annual",
      title: "Neo 银行 2026 战略客户答谢",
      stage: "履约中",
      currentVersion: leftV,
      targetVersion: rightV,
      canAutoMigrate: false,
      blocker: "已签合作凭证 · 迁移需走变更单流程",
    },
    {
      id: "p-alpha-launch",
      title: "AlphaBio 品牌周年方案(草稿)",
      stage: "方案打磨",
      currentVersion: leftV,
      targetVersion: rightV,
      canAutoMigrate: true,
    },
    {
      id: "p-fintech-2027",
      title: "Fintech 峰会 2027 意向",
      stage: "理解中",
      currentVersion: leftV,
      targetVersion: rightV,
      canAutoMigrate: true,
    },
  ];

  const [migrated, setMigrated] = useState<Record<string, boolean>>({});

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          to="/tenant/service-products/$id"
          params={{ id: product.id }}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回服务产品
        </Link>
      </div>

      <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-primary">
        <GitBranch className="h-3.5 w-3.5" />
        版本对比与迁移
      </div>
      <h1 className="text-2xl font-semibold text-foreground">{product.title}</h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        当前发布版本 <span className="font-mono text-foreground">{product.version}</span> · 历史 {history.length} 个版本。旧版本会以审计快照保留,已签合同不受迁移影响。
      </p>

      {/* Version pickers */}
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <VersionPicker label="旧版本 (Before)" value={leftV} onChange={setLeftV} options={history.map((h) => h.version)} />
        <div className="hidden sm:flex items-center justify-center pb-2">
          <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
        </div>
        <VersionPicker label="新版本 (After)" value={rightV} onChange={setRightV} options={history.map((h) => h.version)} />
      </div>

      {/* Changelog */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[leftV, rightV].map((v) => {
          const entry = history.find((h) => h.version === v);
          if (!entry) return null;
          const isRight = v === rightV;
          return (
            <div
              key={v}
              className={cn(
                "rounded-xl border p-4",
                isRight ? "border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/5" : "border-border/60 bg-card/60",
              )}
            >
              <div className="mb-1 flex items-center gap-2">
                <History className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-sm text-foreground">{entry.version}</span>
                {isRight && <StatusBadge state="verified" label="新" />}
              </div>
              <div className="text-xs text-muted-foreground">发布于 {entry.publishedAt}</div>
              <div className="mt-2 text-[12px] text-foreground/85">{entry.changelog}</div>
            </div>
          );
        })}
      </div>

      {/* Field diffs */}
      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--state-ai)]" />
          字段级差异 · AI 已按影响面排序
        </div>
        <div className="space-y-2">
          {diffs.map((d) => (
            <DiffRow key={d.field} d={d} />
          ))}
        </div>
      </div>

      {/* Consumers / migration */}
      <div className="mt-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          引用该产品的在途项目 · {consumers.length}
        </div>
        <div className="space-y-2">
          {consumers.map((c) => (
            <ConsumerRow
              key={c.id}
              c={c}
              migrated={!!migrated[c.id]}
              onMigrate={() => setMigrated((prev) => ({ ...prev, [c.id]: true }))}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <AgentInlineSuggestion
          title="AI 建议:先批量迁移草稿/理解阶段项目,履约中项目走变更单"
          actions={
            <button onClick={() => demoToast()} className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20">
              批量迁移可自动项 (2)
            </button>
          }
        >
          可自动迁移项目 2 个;履约中项目 1 个存在硬依赖新增(内容评审 3 轮),需生成变更单并由客户复核确认,预计新增 3-5 个工作日。
        </AgentInlineSuggestion>
      </div>
    </div>
  );
}

function VersionPicker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <div className="mb-1 text-[10.5px] tracking-wide text-muted-foreground">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function DiffRow({ d }: { d: DiffEntry }) {
  const impactColor =
    d.impact === "高"
      ? "text-[color:var(--state-pending)] border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10"
      : d.impact === "中"
        ? "text-[color:var(--state-ai)] border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10"
        : "text-muted-foreground border-border bg-secondary";
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
          {d.field}
        </div>
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", impactColor)}>
          影响 · {d.impact}
        </span>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-md border border-border/60 bg-background/40 p-2 text-[12px] text-muted-foreground line-through decoration-muted-foreground/50">
          {d.before}
        </div>
        <ArrowRight className="hidden h-4 w-4 justify-self-center text-muted-foreground sm:block" />
        <div className="rounded-md border border-[color:var(--state-verified)]/30 bg-[color:var(--state-verified)]/5 p-2 text-[12px] text-foreground">
          {d.after}
        </div>
      </div>
      <EvidenceLine source="AI 结合 changelog + 依赖清单生成" className="mt-2">
        {d.note}
      </EvidenceLine>
    </div>
  );
}

function ConsumerRow({
  c,
  migrated,
  onMigrate,
}: {
  c: ConsumerProject;
  migrated: boolean;
  onMigrate: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">{c.title}</span>
          <StatusBadge state="declared" label={c.stage} />
          {migrated && <StatusBadge state="verified" label="已迁移" />}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-mono">{c.currentVersion}</span>
          <ArrowRight className="h-3 w-3" />
          <span className="font-mono text-foreground">{c.targetVersion}</span>
          {c.blocker && (
            <span className="inline-flex items-center gap-1 text-[color:var(--state-pending)]">
              <AlertCircle className="h-3 w-3" />
              {c.blocker}
            </span>
          )}
        </div>
      </div>
      {!migrated ? (
        c.canAutoMigrate ? (
          <button
            onClick={onMigrate}
            className="inline-flex items-center gap-1 rounded-md border border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/10 px-3 py-1.5 text-xs text-[color:var(--state-verified)] hover:bg-[color:var(--state-verified)]/20"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            一键迁移
          </button>
        ) : (
          <Link
            to="/projects/$id/changes"
            params={{ id: c.id }}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            生成变更单 <ArrowRight className="h-3 w-3" />
          </Link>
        )
      ) : (
        <span className="text-[11px] text-[color:var(--state-verified)]">已切换到 {c.targetVersion}</span>
      )}
    </div>
  );
}
