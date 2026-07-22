import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Send,
  ArrowUpRight,
  AlertCircle,
  UserCircle2,
  Clock3,
  FileText,
  Route as RouteIcon,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import {
  AgentMessage,
  AgentInlineSuggestion,
  EvidenceLine,
} from "@/components/yanlicube/agent";
import { demoToast } from "@/lib/demo-toast";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";
import { TenantBottomTabs } from "@/components/yanlicube/tenant-h5-nav";

// ---- Demo detail fixtures ----
type OppDetail = {
  id: string;
  title: string;
  client: string;
  contact: { name: string; role: string; note: string };
  date: string;
  city: string;
  scale: string;
  budget: string;
  fitScore: number;
  respondBy: string;
  competing?: number;
  brief: string;
  matchReasons: { text: string; source: string; time?: string }[];
  owner: { name: string; role: string; avatar: string };
  supporters: { name: string; role: string }[];
  evidence: {
    label: string;
    detail: string;
    source: string;
    time?: string;
    state: React.ComponentProps<typeof StatusBadge>["state"];
  }[];
  aiDone: { kind: string; summary: string; needReview: string[] }[];
  nextSteps: {
    order: number;
    who: "you" | "ai" | "client";
    title: string;
    detail: string;
    eta: string;
  }[];
  timeline: {
    key: string;
    label: string;
    status: "done" | "current" | "upcoming";
    owner: "you" | "ai" | "client" | "system";
    summary: string;
    eta?: string;
    detail?: string;
    focusEvidence?: string[];
    focusSteps?: number[];
  }[];
};

const details: Record<string, OppDetail> = {
  opp_neobank2: {
    id: "opp_neobank2",
    title: "Neo 银行 · 私行专场答谢晚宴",
    client: "Neo 银行 · 战略客户部",
    contact: {
      name: "陈嘉宁",
      role: "战略客户部 · 高级经理",
      note: "偏好邮件沟通,周五下午空档最多",
    },
    date: "2027-03-06",
    city: "北京",
    scale: "260 人",
    budget: "60–85 万",
    fitScore: 92,
    respondBy: "48 小时内响应",
    brief:
      "延续 2026 年的答谢主题'把时间还给客户',为 260 位私行客户与家属打造一场克制、有分寸感的答谢晚宴。避免路演感,内容占比不低于 60%。",
    matchReasons: [
      { text: "你上一次为 Neo 银行的答谢晚宴 NPS 68", source: "项目档案 · proj_neoyear", time: "2026-01-18" },
      { text: "客户点名希望沿用同一主服务方", source: "客户邮件 · 陈嘉宁", time: "昨天 17:42" },
      { text: "档期无冲突 · 你在北京有 3 位可调用协作方", source: "团队日历 + 协作方库" },
    ],
    owner: { name: "林知远", role: "主服务方 · 后仰喜剧 CEO", avatar: "L" },
    supporters: [
      { name: "苏晚", role: "内容总监 · 负责节目结构" },
      { name: "AI 顾问", role: "起草方向 / 报价 / 客户沟通" },
    ],
    evidence: [
      {
        label: "客户历史 NPS",
        detail: "上届晚宴 NPS 68,'内容克制、主持人得体'被客户高层书面表扬",
        source: "项目档案 · proj_neoyear · 成果",
        time: "2026-01-18",
        state: "verified",
      },
      {
        label: "客户复购意向",
        detail: "邮件明确:'希望沿用后仰喜剧作为主服务方,不再走比稿'",
        source: "客户邮件 · 陈嘉宁",
        time: "昨天 17:42",
        state: "verified",
      },
      {
        label: "档期可用性",
        detail: "3/6 团队核心档期空闲;备选主持人贾莘档期 AI 已代询",
        source: "团队日历 · Google Calendar 同步",
        time: "刚刚",
        state: "declared",
      },
      {
        label: "预算区间",
        detail: "60–85 万,较上届 +12%,与内容加码方向一致",
        source: "客户活动画像 · 第 2 页",
        state: "declared",
      },
    ],
    aiDone: [
      {
        kind: "3 段方向草稿",
        summary: "A 克制 / B 内容+视觉 / C 极简,含故事板、模块清单与预算区间",
        needReview: ["A 方案主持人档期需 3 天内确认"],
      },
      {
        kind: "报价单初稿 · ¥ 92 万",
        summary: "基于方案 A 的模块清单自动生成 6 项明细拆分",
        needReview: ["近景魔术单价需你确认"],
      },
    ],
    nextSteps: [
      {
        order: 1,
        who: "you",
        title: "复核 3 段方向草稿",
        detail: "10 分钟内可完成,决定发给客户哪一版或全部并列",
        eta: "今天下班前",
      },
      {
        order: 2,
        who: "ai",
        title: "AI 自动锁档备选主持人",
        detail: "你按下'接单'后,AI 会向贾莘经纪发出档期预锁请求",
        eta: "接单后 30 分钟内",
      },
      {
        order: 3,
        who: "client",
        title: "客户内部走审批",
        detail: "预计客户内部审批 3–5 天,AI 会代你保持轻度陪伴沟通",
        eta: "本周内",
      },
    ],
    timeline: [
      {
        key: "evidence",
        label: "Evidence 就绪",
        status: "done",
        owner: "ai",
        summary: "4 项判据齐备:客户历史 NPS、复购意向、档期、预算区间",
        eta: "刚刚",
        detail: "AI 顾问已完成来源标注,可追溯到项目档案与客户邮件",
        focusEvidence: ["客户历史 NPS", "客户复购意向", "档期可用性", "预算区间"],
      },
      {
        key: "accept",
        label: "接单确认",
        status: "current",
        owner: "you",
        summary: "复核 3 段方向草稿并按下'接单 · 成为主服务方'",
        eta: "今天下班前",
        detail: "按下后 AI 会立即向贾莘经纪预锁档期",
        focusEvidence: ["客户历史 NPS", "客户复购意向"],
        focusSteps: [1],
      },
      {
        key: "align",
        label: "方向对齐",
        status: "upcoming",
        owner: "client",
        summary: "客户从 A/B/C 三段方向中选定基础版本",
        eta: "接单 +2 天",
        focusEvidence: ["档期可用性"],
        focusSteps: [2, 3],
      },
      {
        key: "quote",
        label: "报价确认",
        status: "upcoming",
        owner: "you",
        summary: "基于选定方向确认 ¥ 92 万报价单细项后发出",
        eta: "方向确认 +1 天",
        focusEvidence: ["预算区间"],
      },
      {
        key: "sign",
        label: "签约与首款",
        status: "upcoming",
        owner: "client",
        summary: "合同回签 + 首款到账,AI 陪伴跟进",
        eta: "报价确认 +5 天",
      },
      {
        key: "exec",
        label: "履约执行",
        status: "upcoming",
        owner: "system",
        summary: "内容创作、彩排、现场执行,进入活动项目空间",
        eta: "2027-03-06 前",
      },
      {
        key: "outcome",
        label: "成果与回款",
        status: "upcoming",
        owner: "system",
        summary: "尾款结算、NPS 复盘、案例沉淀",
        eta: "活动 +14 天",
      },
    ],
  },
  opp_alpha: {
    id: "opp_alpha",
    title: "AlphaBio · 产品发布会",
    client: "AlphaBio · 品牌部",
    contact: {
      name: "顾一帆",
      role: "品牌部 · 高级市场经理",
      note: "客户方案信息缺口较多,期待你先帮她补齐",
    },
    date: "2026-10-22",
    city: "北京",
    scale: "180 人",
    budget: "60–100 万",
    fitScore: 74,
    respondBy: "本周内",
    competing: 2,
    brief:
      "为二代产品线的公开发布会做主承办,含临床线专家致辞、媒体环节与晚间品牌 party。客户上传了一版原方案 PDF(12 页)。",
    matchReasons: [
      { text: "客户上传了原方案 · AI 已完成缺口检查", source: "客户上传 · brief.pdf", time: "今天 09:12" },
      { text: "5 项待补充信息已整理成清单", source: "AI 缺口检查报告" },
    ],
    owner: { name: "林知远", role: "主服务方 · 后仰喜剧 CEO", avatar: "L" },
    supporters: [
      { name: "苏晚", role: "内容总监" },
      { name: "AI 顾问", role: "缺口检查 / 客户回填邮件" },
    ],
    evidence: [
      {
        label: "AI 缺口检查",
        detail: "5 项影响推进的关键缺口:嘉宾名单、临床数据边界、媒体名单、场地锁定、预算上限",
        source: "AI 顾问 · 基于原方案 PDF",
        time: "刚刚",
        state: "ai",
      },
      {
        label: "识别错误已修正",
        detail: "'临床线专家致辞'曾被误读为'嘉宾脱口秀',已由苏晚更正",
        source: "AI 事件记录 · #inc_042",
        time: "10 分钟前",
        state: "pending",
      },
      {
        label: "竞争情况",
        detail: "客户明确另有 2 家在比稿,但你是内容能力最匹配的一家",
        source: "客户口述 · 顾一帆",
        time: "今天 09:20",
        state: "declared",
      },
    ],
    aiDone: [
      {
        kind: "缺口检查清单",
        summary: "5 项待补充信息 + 中文询问邮件草稿",
        needReview: ["修正一次识别错误(已完成)"],
      },
    ],
    nextSteps: [
      {
        order: 1,
        who: "you",
        title: "复核问题清单并一键发送",
        detail: "5 项问题 + 邮件草稿都已备好,你决定要不要加一句人情话",
        eta: "今天",
      },
      {
        order: 2,
        who: "client",
        title: "等客户回填 5 项信息",
        detail: "AI 会自动催办,并在客户回填后立即启动方向草拟",
        eta: "预计 2–3 天",
      },
      {
        order: 3,
        who: "ai",
        title: "回填齐备后自动起草方向",
        detail: "信息齐备触发方案生成,首版方向 4 小时内交给你复核",
        eta: "客户回填 +4 小时",
      },
    ],
    timeline: [
      {
        key: "evidence",
        label: "Evidence 就绪",
        status: "current",
        owner: "ai",
        summary: "5 项关键缺口待客户回填,已备好中文询问邮件草稿",
        eta: "今天",
        detail: "含一次识别错误的透明记录(#inc_042 已修正)",
        focusEvidence: ["AI 缺口检查", "识别错误已修正"],
        focusSteps: [1],
      },
      {
        key: "clarify",
        label: "澄清回填",
        status: "upcoming",
        owner: "client",
        summary: "客户回填 5 项信息:嘉宾、临床边界、媒体、场地、预算",
        eta: "2–3 天",
        focusEvidence: ["AI 缺口检查"],
        focusSteps: [2],
      },
      {
        key: "draft",
        label: "方向草拟",
        status: "upcoming",
        owner: "ai",
        summary: "AI 基于回填内容生成首版方向,4 小时交你复核",
        eta: "回填 +4 小时",
        focusSteps: [3],
      },
      {
        key: "pitch",
        label: "比稿呈现",
        status: "upcoming",
        owner: "you",
        summary: "与另外 2 家同台比稿,呈现内容能力差异点",
        eta: "下下周",
        focusEvidence: ["竞争情况"],
      },
      {
        key: "quote",
        label: "报价与签约",
        status: "upcoming",
        owner: "you",
        summary: "中标后进入报价确认与签约首款",
        eta: "比稿 +7 天",
      },
      {
        key: "exec",
        label: "履约执行",
        status: "upcoming",
        owner: "system",
        summary: "进入活动项目空间,统一执行到成果",
        eta: "2026-10-22 前",
      },
    ],
  },
  opp_greentea: {
    id: "opp_greentea",
    title: "青野茶饮 · 品牌年度沟通会",
    client: "青野茶饮 · 市场部",
    contact: { name: "何予嘉", role: "市场部 · 品牌经理", note: "首次合作,目标尚不清晰" },
    date: "2026-12-11",
    city: "上海",
    scale: "120 人",
    budget: "20–35 万",
    fitScore: 51,
    respondBy: "无强制期限",
    brief: "客户希望做一场'品牌年度沟通会',但目标(招商 / 品牌向 / 员工向)三选一尚未明确。",
    matchReasons: [
      { text: "预算与调性匹配一般", source: "AI 匹配评估" },
      { text: "客户目标尚不清晰", source: "客户初次沟通记录" },
    ],
    owner: { name: "林知远", role: "主服务方 · 后仰喜剧 CEO", avatar: "L" },
    supporters: [{ name: "AI 顾问", role: "澄清问题起草" }],
    evidence: [
      {
        label: "目标不清",
        detail: "客户口述含'招商 / 品牌 / 员工'三种方向,无优先级",
        source: "客户初次沟通记录",
        time: "2 天前",
        state: "pending",
      },
      {
        label: "预算下探",
        detail: "预算 20–35 万,低于同类项目平均线约 30%",
        source: "AI 匹配评估",
        state: "pending",
      },
    ],
    aiDone: [
      {
        kind: "3 个澄清问题",
        summary: "帮助你在 15 分钟通话内决定是否接单",
        needReview: [],
      },
    ],
    nextSteps: [
      {
        order: 1,
        who: "you",
        title: "先与客户做 15 分钟澄清通话",
        detail: "AI 已备好 3 个必问问题,通话后你再决定接不接",
        eta: "本周内",
      },
      {
        order: 2,
        who: "you",
        title: "决定:接单 / 礼貌婉拒",
        detail: "婉拒时 AI 会代写一封'我们能推荐更合适的团队'的回复",
        eta: "澄清后当天",
      },
    ],
    timeline: [
      {
        key: "evidence",
        label: "Evidence 就绪",
        status: "current",
        owner: "ai",
        summary: "识别到目标不清与预算下探两项风险,备好 3 个澄清问题",
        eta: "刚刚",
        focusEvidence: ["目标不清", "预算下探"],
        focusSteps: [1],
      },
      {
        key: "call",
        label: "澄清通话",
        status: "upcoming",
        owner: "you",
        summary: "与何予嘉进行 15 分钟通话,确认真正目标",
        eta: "本周内",
        focusEvidence: ["目标不清"],
        focusSteps: [1],
      },
      {
        key: "decide",
        label: "接单决策",
        status: "upcoming",
        owner: "you",
        summary: "决定接单或礼貌婉拒(AI 代写推荐信)",
        eta: "通话当天",
        focusEvidence: ["预算下探"],
        focusSteps: [2],
      },
      {
        key: "align",
        label: "方向与报价",
        status: "upcoming",
        owner: "ai",
        summary: "接单后进入方向草拟与报价流程",
        eta: "决策 +3 天",
      },
      {
        key: "exec",
        label: "履约执行",
        status: "upcoming",
        owner: "system",
        summary: "进入活动项目空间统一执行",
        eta: "2026-12-11 前",
      },
    ],
  },
};

export const Route = createFileRoute("/tenant/opportunities/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${details[params.id]?.title ?? "机会详情"} · 服务方工作台` },
      { name: "description", content: "主服务机会详情:责任人、Evidence 与下一步行动。" },
    ],
  }),
  loader: ({ params }): { detail: OppDetail } => {
    const d = details[params.id];
    if (!d) throw notFound();
    return { detail: d };
  },
  component: OpportunityDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl p-10 text-center text-muted-foreground">
      未找到该机会 ·{" "}
      <Link to="/tenant" className="text-primary hover:underline">
        返回 服务方工作台
      </Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-2xl p-10 text-center text-muted-foreground">
      读取失败 ·{" "}
      <button onClick={reset} className="text-primary hover:underline">
        重试
      </button>
    </div>
  ),
});

function OpportunityDetail() {
  const { detail: d } = Route.useLoaderData() as { detail: OppDetail };

  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [openEvidence, setOpenEvidence] = useState<Set<string>>(new Set());
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set());
  const evidenceRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stepRefs = useRef<Record<number, HTMLLIElement | null>>({});

  const activeEntry = d.timeline.find((t) => t.key === activeStage);
  const focusedEvidence = new Set(activeEntry?.focusEvidence ?? []);
  const focusedSteps = new Set(activeEntry?.focusSteps ?? []);

  useEffect(() => {
    if (!activeEntry) return;
    // auto-expand focused items
    setOpenEvidence((prev) => {
      const next = new Set(prev);
      (activeEntry.focusEvidence ?? []).forEach((k) => next.add(k));
      return next;
    });
    setOpenSteps((prev) => {
      const next = new Set(prev);
      (activeEntry.focusSteps ?? []).forEach((k) => next.add(k));
      return next;
    });
    // scroll to first focused evidence, fallback to first step
    const firstE = activeEntry.focusEvidence?.[0];
    const firstS = activeEntry.focusSteps?.[0];
    const target =
      (firstE && evidenceRefs.current[firstE]) ||
      (firstS !== undefined && stepRefs.current[firstS]) ||
      null;
    if (target) {
      requestAnimationFrame(() =>
        target.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
    }
  }, [activeEntry]);

  const toggleEvidence = (k: string) =>
    setOpenEvidence((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });
  const toggleStep = (k: number) =>
    setOpenSteps((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const whoLabel = (w: "you" | "ai" | "client") =>
    w === "you" ? "你" : w === "ai" ? "AI 顾问" : "客户";
  const whoTone = (w: "you" | "ai" | "client") =>
    w === "you"
      ? "border-primary/40 bg-primary/10 text-primary"
      : w === "ai"
        ? "border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10 text-[color:var(--state-ai)]"
        : "border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 text-[color:var(--state-pending)]";

  const timelineOwnerLabel = (w: "you" | "ai" | "client" | "system") =>
    w === "you" ? "你" : w === "ai" ? "AI 顾问" : w === "client" ? "客户" : "系统";
  const timelineOwnerTone = (w: "you" | "ai" | "client" | "system") =>
    w === "you"
      ? "border-primary/40 bg-primary/10 text-primary"
      : w === "ai"
        ? "border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10 text-[color:var(--state-ai)]"
        : w === "client"
          ? "border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 text-[color:var(--state-pending)]"
          : "border-border/60 bg-secondary/40 text-muted-foreground";
  const statusMeta: Record<
    "done" | "current" | "upcoming",
    { label: string; dot: string; ring: string; text: string }
  > = {
    done: {
      label: "已完成",
      dot: "bg-[color:var(--state-verified)]",
      ring: "border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/10",
      text: "text-[color:var(--state-verified)]",
    },
    current: {
      label: "进行中",
      dot: "bg-primary animate-pulse",
      ring: "border-primary/50 bg-primary/10",
      text: "text-primary",
    },
    upcoming: {
      label: "待启动",
      dot: "bg-muted-foreground/50",
      ring: "border-border bg-background/40",
      text: "text-muted-foreground",
    },
  };

  return (
    <AgentPanelProvider scopeLabel="机会详情" quickPrompts={["帮我判断这个机会值不值得投", "起草一份初步回应给客户", "对比同类历史机会的成单率"]}>
    <>
    <div className="mx-auto max-w-[1180px] px-4 pb-24 pt-6 sm:px-6 sm:py-8 md:pb-8">
      <Link
        to="/tenant"
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回 服务方工作台
      </Link>

      {/* Header */}
      <div className="surface-2 mb-6 rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                state={d.fitScore >= 85 ? "verified" : d.fitScore >= 65 ? "declared" : "pending"}
                label={`匹配 ${d.fitScore}`}
              />
              <span className="text-[11px] text-muted-foreground">{d.respondBy}</span>
              {d.competing !== undefined && (
                <span className="text-[11px] text-muted-foreground">竞争中 · {d.competing} 家</span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">{d.title}</h1>
            <div className="mt-1 text-xs text-muted-foreground">
              {d.client} · {d.date} · {d.city} · {d.scale} · 预算 {d.budget}
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/85">{d.brief}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" /> 接单 · 成为主服务方
            </button>
            <button onClick={() => demoToast()} className="text-xs text-muted-foreground hover:text-foreground">
              拒绝 · 附礼貌理由
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Evidence */}
          <section className="surface-1 rounded-xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Evidence · 判断依据</h2>
              <span className="text-[11px] text-muted-foreground">
                每一条都可追溯来源,AI 生成的会明确标出
              </span>
            </div>
            <div className="space-y-3">
              {d.evidence.map((e) => {
                const isOpen = openEvidence.has(e.label);
                const isFocused = focusedEvidence.has(e.label);
                return (
                  <div
                    key={e.label}
                    ref={(el) => {
                      evidenceRefs.current[e.label] = el;
                    }}
                    className={`rounded-lg border bg-background/30 transition-all ${
                      isFocused
                        ? "border-primary/60 bg-primary/5 ring-1 ring-primary/40"
                        : "border-border/40"
                    }`}
                  >
                    <button
                      onClick={() => toggleEvidence(e.label)}
                      className="flex w-full items-center justify-between gap-2 p-3 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge state={e.state} label={e.label} />
                        {isFocused && activeEntry && (
                          <span className="text-[10px] text-primary">
                            ← {activeEntry.label}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-border/30 px-3 pb-3 pt-2">
                        <p className="text-sm text-foreground/90">{e.detail}</p>
                        <EvidenceLine source={e.source} time={e.time} className="mt-2" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Match reasons — collapsible */}
          <details className="surface-1 group rounded-xl">
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-sm font-semibold text-foreground">
              <span>为什么推荐给你 · {d.matchReasons.length} 条</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <ul className="space-y-2 px-5 pb-5">
              {d.matchReasons.map((r) => (
                <li key={r.text} className="rounded-lg border border-border/40 bg-background/30 p-3">
                  <div className="text-sm text-foreground/90">· {r.text}</div>
                  <EvidenceLine source={r.source} time={r.time} className="mt-1.5" />
                </li>
              ))}
            </ul>
          </details>


          {/* AI done */}
          <section className="space-y-3">
            <AgentMessage>
              我已经替你先做了这些,你只需要复核后按下"发出"。
            </AgentMessage>
            {d.aiDone.map((a) => (
              <AgentInlineSuggestion key={a.kind} title={a.kind}>
                <div className="space-y-2">
                  <div>{a.summary}</div>
                  {a.needReview.length > 0 && (
                    <div className="rounded-md border border-[color:var(--state-pending)]/30 bg-[color:var(--state-pending)]/5 p-2 text-xs">
                      <div className="mb-1 flex items-center gap-1 text-[color:var(--state-pending)]">
                        <AlertCircle className="h-3 w-3" /> 需要你判断
                      </div>
                      <ul className="space-y-0.5 text-foreground/90">
                        {a.needReview.map((x) => (
                          <li key={x}>· {x}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button onClick={() => demoToast()} className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--state-ai)] hover:underline">
                    打开草稿 <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </AgentInlineSuggestion>
            ))}
          </section>

          {/* Next steps */}
          <section className="surface-2 rounded-xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">下一步行动</h2>
              <span className="text-[11px] text-muted-foreground">按责任人清晰分工</span>
            </div>
            <ol className="space-y-3">
              {d.nextSteps.map((s) => {
                const isOpen = openSteps.has(s.order);
                const isFocused = focusedSteps.has(s.order);
                return (
                  <li
                    key={s.order}
                    ref={(el) => {
                      stepRefs.current[s.order] = el;
                    }}
                    className={`rounded-lg border bg-background/30 transition-all ${
                      isFocused
                        ? "border-primary/60 bg-primary/5 ring-1 ring-primary/40"
                        : "border-border/40"
                    }`}
                  >
                    <button
                      onClick={() => toggleStep(s.order)}
                      className="flex w-full items-start gap-3 p-3 text-left"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-secondary font-mono text-xs text-foreground">
                        {s.order}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${whoTone(s.who)}`}
                          >
                            {whoLabel(s.who)}
                          </span>
                          <span className="text-sm font-medium text-foreground">{s.title}</span>
                          {isFocused && activeEntry && (
                            <span className="text-[10px] text-primary">
                              ← {activeEntry.label}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock3 className="h-3 w-3" /> {s.eta}
                        </div>
                      </div>
                      <ChevronDown
                        className={`mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-border/30 px-3 pb-3 pt-2 pl-[52px]">
                        <p className="text-xs text-foreground/85">{s.detail}</p>
                        {s.who === "you" && (
                          <button onClick={() => demoToast()} className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                            开始
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Timeline — collapsed by default to reduce first-fold density */}
          <details className="surface-1 group rounded-xl p-5">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-foreground">
              <RouteIcon className="h-4 w-4 text-primary" />
              任务进度 · 从 Evidence 到履约
              <span className="text-[11px] font-normal text-muted-foreground">({d.timeline.length} 阶段)</span>
              <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 mb-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              责任人区分,可点击定位到 Evidence 与下一步
            </div>

            {/* Stage legend */}
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-border/40 bg-background/30 px-3 py-2 text-[11px] text-muted-foreground">

              {(["done", "current", "upcoming"] as const).map((s) => (
                <div key={s} className="inline-flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${statusMeta[s].dot}`} />
                  <span className={statusMeta[s].text}>{statusMeta[s].label}</span>
                </div>
              ))}
              <span className="mx-1 h-3 w-px bg-border/60" />
              <span>责任人区分:</span>
              {(["you", "ai", "client", "system"] as const).map((w) => (
                <span
                  key={w}
                  className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${timelineOwnerTone(w)}`}
                >
                  {timelineOwnerLabel(w)}
                </span>
              ))}
            </div>

            <ol className="relative space-y-4 border-l border-border/50 pl-6">
              {d.timeline.map((t, i) => {
                const meta = statusMeta[t.status];
                const isActive = activeStage === t.key;
                const hasLinks =
                  (t.focusEvidence?.length ?? 0) + (t.focusSteps?.length ?? 0) > 0;
                return (
                  <li key={t.key} className="relative">
                    <span
                      className={`absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full border ${meta.ring}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveStage((prev) => (prev === t.key ? null : t.key))
                      }
                      disabled={!hasLinks}
                      className={`block w-full rounded-lg border p-3 text-left transition-all ${
                        isActive
                          ? "border-primary bg-primary/10 ring-1 ring-primary/50"
                          : t.status === "current"
                            ? "border-primary/40 bg-primary/5 hover:border-primary/60"
                            : "border-border/40 bg-background/30 hover:border-border"
                      } ${hasLinks ? "cursor-pointer" : "cursor-default opacity-90"}`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {t.label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.ring} ${meta.text}`}
                        >
                          {meta.label}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${timelineOwnerTone(t.owner)}`}
                        >
                          {timelineOwnerLabel(t.owner)}
                        </span>
                        {t.eta && (
                          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock3 className="h-3 w-3" /> {t.eta}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-foreground/85">{t.summary}</p>
                      {t.detail && (
                        <p className="mt-1 text-[11px] text-muted-foreground">{t.detail}</p>
                      )}
                      {hasLinks && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span>{isActive ? "已定位:" : "点击定位:"}</span>
                          {t.focusEvidence?.map((k) => (
                            <span
                              key={`e-${k}`}
                              className="rounded-full border border-border/50 bg-background/50 px-1.5 py-0.5"
                            >
                              Evidence · {k}
                            </span>
                          ))}
                          {t.focusSteps?.map((k) => (
                            <span
                              key={`s-${k}`}
                              className="rounded-full border border-border/50 bg-background/50 px-1.5 py-0.5"
                            >
                              下一步 #{k}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
            {activeStage && (
              <div className="mt-3 flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-[11px] text-primary">
                <span>已定位到「{activeEntry?.label}」相关的 Evidence 与下一步</span>
                <button
                  onClick={() => setActiveStage(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  清除定位
                </button>
              </div>
            )}
          </details>

        </div>

        {/* Right column */}
        <aside className="space-y-4">
          <div className="surface-1 rounded-xl p-5">
            <div className="mb-3 text-[11px] tracking-wide text-muted-foreground">责任人 · 单一负责</div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
                {d.owner.avatar}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{d.owner.name}</div>
                <div className="text-[11px] text-muted-foreground">{d.owner.role}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="text-[11px] tracking-wide text-muted-foreground">协作</div>
              {d.supporters.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{s.name}</span>
                  <span className="text-muted-foreground">· {s.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-1 rounded-xl p-5">
            <div className="mb-2 text-[11px] tracking-wide text-muted-foreground">客户对接人</div>
            <div className="text-sm font-semibold text-foreground">{d.contact.name}</div>
            <div className="text-[11px] text-muted-foreground">{d.contact.role}</div>
            <p className="mt-2 text-xs text-foreground/80">{d.contact.note}</p>
            <button onClick={() => demoToast()} className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md border border-border px-3 py-2 text-xs text-foreground/85 hover:bg-secondary/40">
              <Send className="h-3.5 w-3.5" /> 让 AI 起草沟通邮件
            </button>
          </div>
        </aside>
      </div>
    </div>
    <TenantBottomTabs />
    </>
    </AgentPanelProvider>
  );
}