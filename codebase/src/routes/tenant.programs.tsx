import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Search, Sparkles, TrendingUp, Users2, Package, Edit3, Copy, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { demoToast } from "@/lib/demo-toast";
import { SideDrawer } from "@/components/yanlicube/side-drawer";

export const Route = createFileRoute("/tenant/programs")({
  head: () => ({
    meta: [
      { title: "节目产品库 · 服务方 · 演立方" },
      { name: "description", content: "把每一次演出沉淀为可复用的节目产品:结构化描述、成本模型、复用记录与 AI 补全建议。" },
    ],
  }),
  component: ProgramLibrary,
});

type TenantProgram = {
  id: string;
  title: string;
  type: string;
  duration: string;
  audienceFit: string[];
  actors: string[];
  cost: { deposit: string; onsite: string; rehearsal: string };
  priceBand: string;
  reuseCount: number;
  lastUsed: string;
  npsAvg: number;
  status: "published" | "draft" | "needs_update";
  completeness: number;
  aiHint?: string;
};

const library: TenantProgram[] = [
  {
    id: "tp_openyear",
    title: "《开年·笑》定制脱口秀开场",
    type: "脱口秀 · 定制",
    duration: "18-25 分钟",
    audienceFit: ["企业年会", "客户答谢", "Kickoff"],
    actors: ["何轩", "林书"],
    cost: { deposit: "¥ 3.2 万", onsite: "¥ 4.5 万", rehearsal: "2 轮 · 含 1 次现场彩排" },
    priceBand: "¥ 6.8 – 9.5 万",
    reuseCount: 14,
    lastUsed: "2026-06 · 某券商年会",
    npsAvg: 66,
    status: "published",
    completeness: 100,
  },
  {
    id: "tp_impro",
    title: "即兴共创 · 品牌关键词",
    type: "即兴喜剧",
    duration: "30-40 分钟",
    audienceFit: ["团建", "创新论坛"],
    actors: ["林书", "赵萌"],
    cost: { deposit: "¥ 2.6 万", onsite: "¥ 3.8 万", rehearsal: "1 轮 · 关键词沟通即可" },
    priceBand: "¥ 5.4 – 7.2 万",
    reuseCount: 9,
    lastUsed: "2026-04 · SaaS 公司 Kickoff",
    npsAvg: 71,
    status: "published",
    completeness: 100,
  },
  {
    id: "tp_magicset",
    title: "近景魔术组套 · VIP 巡桌",
    type: "魔术",
    duration: "45 分钟巡桌 + 8 分钟舞台",
    audienceFit: ["答谢晚宴", "VIP 私宴"],
    actors: ["周烨"],
    cost: { deposit: "¥ 4.2 万", onsite: "¥ 5.6 万", rehearsal: "含 Logo 定制悬浮效果制作" },
    priceBand: "¥ 8.5 – 12 万",
    reuseCount: 6,
    lastUsed: "2026-05 · 某金融机构私宴",
    npsAvg: 74,
    status: "needs_update",
    completeness: 78,
    aiHint: "近 2 次成本上浮 8% · AI 建议更新价格区间到 ¥ 9.2 – 12.8 万",
  },
  {
    id: "tp_guqin",
    title: "《弦外》古筝电声跨界",
    type: "音乐 · 跨界",
    duration: "8-12 分钟",
    audienceFit: ["开场", "颁奖启幕"],
    actors: ["穆瑶"],
    cost: { deposit: "¥ 2.8 万", onsite: "¥ 4.1 万", rehearsal: "需专业 LED 与灯光配合" },
    priceBand: "¥ 5.6 – 8.2 万",
    reuseCount: 3,
    lastUsed: "2026-03 · 汽车品牌发布会",
    npsAvg: 62,
    status: "draft",
    completeness: 55,
    aiHint: "缺少「舞台技术需求单」与「典型场地清单」· 补齐后可发布至发现频道",
  },
];

const statusMap: Record<TenantProgram["status"], { label: string; tone: "verified" | "declared" | "ai" | "pending" | "expired" }> = {
  published: { label: "已发布", tone: "verified" },
  draft: { label: "草稿", tone: "pending" },
  needs_update: { label: "待更新", tone: "expired" },
};

function ProgramLibrary() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<TenantProgram | null>(null);

  const filtered = useMemo(
    () => library.filter((p) => p.title.includes(q) || p.type.includes(q) || p.audienceFit.some((a) => a.includes(q))),
    [q],
  );

  const npsAvg = Math.round(library.reduce((s, p) => s + p.npsAvg, 0) / library.length);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <Link to="/tenant" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回经营工作台
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 text-xs tracking-[0.14em] text-muted-foreground">TENANT · 节目产品库</div>
          <h1 className="text-2xl font-semibold text-foreground">把每一场演出,沉淀为可复用的节目产品</h1>
          <div className="mt-1 text-xs text-muted-foreground">结构化描述 · 成本模型 · 复用记录 —— 让下一次报价从 0 到 60 分只要 5 分钟</div>
        </div>
        <button onClick={() => demoToast()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> 新增节目
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="节目总数" value={library.length} sub={`${library.filter((p) => p.status === "published").length} 已发布`} icon={Package} />
        <StatCard label="总复用次数" value={library.reduce((s, p) => s + p.reuseCount, 0)} sub="过去 12 个月" icon={TrendingUp} />
        <StatCard label="平均 NPS" value={npsAvg} sub="过去 12 个月" icon={Sparkles} />
        <StatCard label="签约演员" value={5} sub="覆盖 4 个类型" icon={Users2} />
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索节目名称、类型或适用场合"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((p) => {
          const meta = statusMap[p.status];
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="surface-1 group w-full rounded-xl p-4 text-left transition-all hover:border-primary/40 hover:ring-1 hover:ring-primary/30"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-base font-medium text-foreground">{p.title}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{p.type} · {p.duration}</div>
                </div>
                <StatusBadge state={meta.tone} label={meta.label} />
              </div>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {p.audienceFit.map((a) => (
                  <span key={a} className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">{a}</span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 text-[11px] text-muted-foreground">
                <div><span className="text-foreground/80">价格区间</span><div className="font-mono text-foreground">{p.priceBand}</div></div>
                <div><span className="text-foreground/80">复用</span><div className="font-mono text-foreground">{p.reuseCount} 次 · NPS {p.npsAvg}</div></div>
                <div><span className="text-foreground/80">完整度</span>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-secondary">
                    <div className={cn("h-full rounded-full", p.completeness === 100 ? "bg-primary" : "bg-amber-500/70")} style={{ width: `${p.completeness}%` }} />
                  </div>
                </div>
              </div>
              {p.aiHint && (
                <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] text-primary/90">
                  <Sparkles className="mr-1 inline h-3 w-3" /> {p.aiHint}
                </div>
              )}
              <div className="mt-3 flex items-center justify-end text-[11px] text-muted-foreground group-hover:text-primary">
                查看详情 <ChevronRight className="h-3 w-3" />
              </div>
            </button>
          );
        })}
      </div>

      {selected && <ProgramDrawer program={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ProgramDrawer({ program, onClose }: { program: TenantProgram; onClose: () => void }) {
  const meta = statusMap[program.status];
  return (
    <SideDrawer
      open
      onClose={onClose}
      eyebrow="节目 · 详情"
      title={program.title}
      subtitle={`${program.type} · ${program.duration}`}
      badge={<StatusBadge state={meta.tone} label={meta.label} />}
      footer={
        <>
          <button onClick={() => demoToast()} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-2 text-xs text-foreground hover:bg-secondary">
            <Copy className="h-3.5 w-3.5" /> 复制为新节目
          </button>
          <button onClick={() => demoToast()} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Edit3 className="h-3.5 w-3.5" /> 编辑节目
          </button>
        </>
      }
    >
      <section className="surface-1 rounded-lg p-4">
        <div className="mb-2 text-xs font-medium text-foreground">节目基础</div>
        <div className="space-y-2 text-sm">
          <Row label="签约演员" value={program.actors.join(" / ")} />
          <Row label="定金" value={program.cost.deposit} />
          <Row label="现场执行" value={program.cost.onsite} />
          <Row label="彩排/前置" value={program.cost.rehearsal} />
          <Row label="价格区间" value={program.priceBand} />
          <Row label="上一次使用" value={program.lastUsed} />
        </div>
      </section>

      <section className="surface-1 rounded-lg p-4">
        <div className="mb-2 text-xs font-medium text-foreground">AI 建议</div>
        <AgentInlineSuggestion
          title={program.status === "published" ? "下一步:在发现频道展示" : "补齐后可发布"}
          actions={
            <button onClick={() => demoToast()} className="rounded-md bg-primary/90 px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary">
              {program.status === "published" ? "加入主推" : "让 AI 起草补全项"}
            </button>
          }
        >
          {program.aiHint ?? "该节目已进入稳定复用阶段,可以考虑加入 2027 春季主推位。"}
        </AgentInlineSuggestion>
        <div className="mt-3 space-y-2">
          <EvidenceLine source="复用记录">{program.reuseCount} 场活动使用,平均 NPS {program.npsAvg}</EvidenceLine>
          <EvidenceLine source="主服务方声明">价格区间 {program.priceBand}</EvidenceLine>
        </div>
      </section>
    </SideDrawer>
  );
}



function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub: string; icon: typeof Package }) {
  return (
    <div className="surface-1 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-[11px] tracking-wide text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-2 last:border-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-right text-xs text-foreground">{value}</div>
    </div>
  );
}
