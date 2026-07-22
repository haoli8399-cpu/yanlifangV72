import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Sparkles,
  Compass,
  ClipboardList,
  FileSignature,
  Wallet,
  ShieldCheck,
  Users,
  History,
  ArrowRight,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AgentInlineSuggestion } from "@/components/yanlicube/agent";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "指南库 · 演立方" },
      { name: "description", content: "商演经营全流程的场景化操作指南与决策卡片" },
      { property: "og:title", content: "指南库 · 演立方" },
      { property: "og:description", content: "从探索到复盘,每一步都有可用的指南与模板" },
    ],
  }),
  component: GuidesPage,
});

type GuideCategory =
  | "entry"
  | "plan"
  | "contract"
  | "payment"
  | "execution"
  | "governance";

type Guide = {
  id: string;
  category: GuideCategory;
  title: string;
  scenario: string;
  minutes: number;
  steps: string[];
  tips: string[];
  linked?: { label: string; to: string };
};

const categories: {
  key: GuideCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}[] = [
  { key: "entry", label: "起步与路径", icon: Compass, desc: "四路径选型 · Agent 首问" },
  { key: "plan", label: "方案与理解", icon: ClipboardList, desc: "需求澄清 · 差异矩阵" },
  { key: "contract", label: "合同与凭证", icon: FileSignature, desc: "责任树 · 多合同联动" },
  { key: "payment", label: "报价与收付款", icon: Wallet, desc: "付款方案 · 开票" },
  { key: "execution", label: "履约与现场", icon: Users, desc: "交接包 · 异常处理" },
  { key: "governance", label: "治理与复盘", icon: ShieldCheck, desc: "评价 · 归因 · 复购" },
];

const guides: Guide[] = [
  {
    id: "g-entry-01",
    category: "entry",
    title: "第一次使用:30 秒选一条路径",
    scenario: "你还没有明确目标,只有一个日期和一个大概预算",
    minutes: 2,
    steps: [
      "打开首页,看四条路径卡:A 探索 / B 演员 / C 复用 / D 已有方案",
      "若不确定,直接进 AI 顾问,把行业、日期、预算、场地告诉它",
      "AI 会在 30 秒内给出最短路径,并保留撤回按钮",
    ],
    tips: [
      "所有对话不会立刻生成合同,承诺前一定会二次确认",
      "任一路径都可随时切换,不会丢失已录入的信息",
    ],
    linked: { label: "进入 AI 顾问", to: "/agent" },
  },
  {
    id: "g-plan-01",
    category: "plan",
    title: "用差异矩阵挑选方案",
    scenario: "AI 生成了 3 版方案,你需要在 10 分钟内做出选择",
    minutes: 3,
    steps: [
      "打开活动详情 · 方案 Tab,切换到差异矩阵视图",
      "对比:预算区间、体验强度、执行风险、复购概率",
      "选定后进入故事板视图,确认时间节奏与串场设计",
    ],
    tips: [
      "差异矩阵每一列都可点击展开 AI 依据,不是黑盒",
      "复购洞察会告诉你历史相似项目的教训,别跳过",
    ],
  },
  {
    id: "g-contract-01",
    category: "contract",
    title: "看懂多合同责任树",
    scenario: "一场活动可能涉及 3~5 份合同,你只想知道谁对你负责",
    minutes: 2,
    steps: [
      "进入活动 · 合同凭证 · 责任树",
      "第一层是你与主服务方的合同,颜色为主色",
      "第二层是主服务方对协作方的内部凭证,与你无直接责任关系",
    ],
    tips: [
      "无论内部协作方多少,主服务方对你承担唯一整体责任",
      "每份合同都有 AI 条款摘要,风险条款会自动标红",
    ],
  },
  {
    id: "g-payment-01",
    category: "payment",
    title: "选定付款方案",
    scenario: "定金/阶段/尾款 vs 分期里程碑 vs 月结,你该选哪个?",
    minutes: 3,
    steps: [
      "在收付款页打开付款方式选择器",
      "对比适用场景、节点比例、优势与代价",
      "确认后需要主服务方也确认,双确认才生效",
    ],
    tips: [
      "月结方案需前置年度框架,首次合作不建议",
      "变更单会自动叠加到最近一个未支付节点",
    ],
  },
  {
    id: "g-exec-01",
    category: "execution",
    title: "现场交接包",
    scenario: "开演前 24 小时,你想核对所有环节是否就绪",
    minutes: 4,
    steps: [
      "打开执行 · 现场交接包",
      "按角色查看:灯光音响 / 主演 / 主持 / 直播分发",
      "逐项勾选签收,签收进度条到 100% 才算就绪",
    ],
    tips: [
      "所有签收都会打 可信时间戳,后续争议可回溯",
      "任何一项未签收,主服务方会主动升级到对接人",
    ],
  },
  {
    id: "g-gov-01",
    category: "governance",
    title: "分层评价系统",
    scenario: "活动结束了,评价怎么写才对下次有用?",
    minutes: 3,
    steps: [
      "进入评价页,按层级:整体 / 主服务方 / 演员 / 协作方",
      "填写量化分数 + 具体情境描述",
      "AI 会生成一段可复用的复盘卡,进入案例库",
    ],
    tips: [
      "评价内容默认脱敏,不含金额与合同细节",
      "差评不会立即公开,平台会先向对方核实",
    ],
  },
  {
    id: "g-gov-02",
    category: "governance",
    title: "复购洞察怎么用",
    scenario: "你想再办一次,但担心重蹈上次的坑",
    minutes: 2,
    steps: [
      "在方案页切到复购洞察 Tab",
      "看历史相似项目的:可复用资产、教训、变更点",
      "点击一键起草变更单,只标注差异,不重来一遍",
    ],
    tips: ["相似度算法基于:行业、规模、季节、目标"],
  },
  {
    id: "g-entry-02",
    category: "entry",
    title: "D 路径:已有方案怎么走",
    scenario: "客户或供应商给了一份 PDF/PPT,你不知道能不能直接用",
    minutes: 3,
    steps: [
      "首页选路径 D,上传文件",
      "AI 解析后进入缺口检查表",
      "逐项勾选\"我已有 / 我缺失\",阻塞项会被标红",
    ],
    tips: ["就绪度 < 70% 时,报价按钮会被禁用"],
    linked: { label: "打开缺口检查", to: "/gap-checklist" },
  },
];

function GuidesPage() {
  const [active, setActive] = useState<GuideCategory | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return guides.filter((g) => {
      if (active !== "all" && g.category !== active) return false;
      if (!kw) return true;
      return (
        g.title.toLowerCase().includes(kw) ||
        g.scenario.toLowerCase().includes(kw) ||
        g.steps.join(" ").toLowerCase().includes(kw)
      );
    });
  }, [active, q]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3 text-primary" /> 指南库 · 场景化
          </div>
          <h1 className="text-3xl font-semibold text-foreground">
            不解释产品,只教你完成一件事
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            每一篇都以场景开头,3 分钟内完成一个具体任务。所有指南都可以直接跳转到对应的产品页面继续操作。
          </p>
        </div>
        <Link
          to="/demo"
          className="hidden shrink-0 items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary hover:bg-primary/20 md:inline-flex"
        >
          <Sparkles className="h-3.5 w-3.5" />
          还没上手?看 30 秒演示
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mb-6">
        <AgentInlineSuggestion title="告诉我你现在卡在哪一步">
          我会直接给你一张操作卡:分几步、点哪里、要注意什么。不需要读完整份文档。
        </AgentInlineSuggestion>
      </div>

      {/* Filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActive("all")}
          className={`rounded-md border px-3 py-1.5 text-xs transition ${
            active === "all"
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          全部 · {guides.length}
        </button>
        {categories.map((c) => {
          const count = guides.filter((g) => g.category === c.key).length;
          return (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition ${
                active === c.key
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <c.icon className="h-3.5 w-3.5" />
              {c.label} · {count}
            </button>
          );
        })}
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索场景 / 步骤"
            className="w-full rounded-md border border-border/60 bg-secondary/40 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Guides grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((g) => {
          const cat = categories.find((c) => c.key === g.category)!;
          return (
            <article
              key={g.id}
              className="surface-1 flex flex-col rounded-xl p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                  <cat.icon className="h-3 w-3 text-primary" /> {cat.label}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {g.minutes} min read
                </span>
              </div>
              <h3 className="text-base font-semibold text-foreground">{g.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{g.scenario}</p>

              <ol className="mt-4 space-y-1.5 text-xs text-foreground/85">
                {g.steps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] text-primary">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-4 rounded-md border border-border/50 bg-secondary/30 p-3">
                <div className="mb-1 text-[10px] font-medium tracking-wider text-muted-foreground">
                  注意
                </div>
                <ul className="space-y-1 text-[11px] text-foreground/70">
                  {g.tips.map((t, i) => (
                    <li key={i}>· {t}</li>
                  ))}
                </ul>
              </div>

              {g.linked && (
                <a
                  href={g.linked.to}
                  className="mt-4 inline-flex items-center gap-1 self-start text-xs text-primary hover:underline"
                >
                  {g.linked.label} <ArrowRight className="h-3 w-3" />
                </a>
              )}
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          没找到相关指南 · 试试直接问 AI 顾问
        </div>
      )}

      <div className="mt-16 rounded-2xl border border-border/60 bg-gradient-to-br from-secondary/40 to-background/40 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-1 text-xs font-medium tracking-[0.14em] text-muted-foreground">
              找不到你要的场景?
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              直接把问题贴给 AI 顾问
            </h3>
            <p className="mt-1 max-w-xl text-xs text-muted-foreground">
              AI 会为你现场生成一张操作卡 —— 包含步骤、注意点与产品入口链接。生成的卡片可以一键收藏进指南库。
            </p>
          </div>
          <Link
            to="/agent"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" /> 打开 AI 顾问
          </Link>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <History className="h-3 w-3" /> 最近更新 · 2026-07
        </span>
        <Link to="/" className="hover:text-foreground">
          返回首页 →
        </Link>
      </div>
    </div>
  );
}
