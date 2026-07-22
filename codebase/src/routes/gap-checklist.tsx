import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileUp,
  FileText,
  CheckCircle2,
  CircleDashed,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  X,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentMessage, EvidenceLine } from "@/components/yanlicube/agent";
import type { EvidenceState } from "@/lib/fixtures";

export const Route = createFileRoute("/gap-checklist")({
  component: GapChecklistPage,
});

/**
 * D 路径 · 缺口检查
 * 上传已有方案 → 映射到「一份可执行方案所需的完整要素」→ 勾选已有 / 缺失。
 * 勾选状态影响下方"当前推进就绪度"与右侧下一步。
 */

type CheckState = "have" | "missing" | "unsure";

interface GapItem {
  id: string;
  label: string;
  why: string; // 为什么这一项是必须的
  detected?: string; // AI 从上传方案中识别到的原文/信息
  evidence: EvidenceState; // ai / verified / pending
  aiSuggestion?: string; // 缺失时,AI 建议下一步
  default: CheckState;
  blocking?: boolean; // 缺失则阻塞报价/推进
}

interface GapGroup {
  key: string;
  title: string;
  hint: string;
  items: GapItem[];
}

const groups: GapGroup[] = [
  {
    key: "goal",
    title: "目标与受众",
    hint: "决定方案立意与内容强度",
    items: [
      {
        id: "goal.purpose",
        label: "活动目标(一句话)",
        why: "任何后续内容与预算判断都从这里出发",
        detected: "识别到:全球产品发布,面向媒体与 KOL",
        evidence: "ai",
        default: "have",
      },
      {
        id: "goal.audience",
        label: "受众画像与规模",
        why: "影响主持语言、内容深度与场地容量",
        detected: "识别到:医药媒体 + 行业 KOL · 约 180 人",
        evidence: "ai",
        default: "have",
      },
      {
        id: "goal.kpi",
        label: "衡量成功的指标",
        why: "AI 会以此为依据在履约后生成《成果》页",
        evidence: "pending",
        aiSuggestion: "常见口径:媒体到场率、报道条数、KOL 满意度、CEO 主观评分",
        default: "missing",
        blocking: true,
      },
    ],
  },
  {
    key: "content",
    title: "内容与节目",
    hint: "决定谁上台、演什么、演多久",
    items: [
      {
        id: "content.flow",
        label: "议程与总时长",
        why: "报价与演员档期都依赖节奏表",
        detected: "识别到:开场 → 致辞 → 产品发布 → 专家致辞 → 收场,共 90 分钟",
        evidence: "ai",
        default: "have",
      },
      {
        id: "content.opening",
        label: "科技感开场的形式",
        why: "音乐 / 装置 / 视觉主导,决定制作难度与预算档位",
        evidence: "pending",
        aiSuggestion: "建议 3 选 1;如果拿不准,让 AI 顾问基于案例反向推荐",
        default: "missing",
        blocking: true,
      },
      {
        id: "content.host",
        label: "主持人语言与等级",
        why: "中英双语等级差异可导致预算 ±30%",
        detected: "已声明:中英双语,未指定等级",
        evidence: "declared",
        aiSuggestion: "参考案例 evt_scitech 中的 A 级主持,平均预算 8–12 万",
        default: "missing",
      },
      {
        id: "content.talents",
        label: "既定演员意向",
        why: "有意向时可直接核档期;没有则由 AI 匹配",
        evidence: "pending",
        aiSuggestion: "无意向的话,AI 会基于目标 + 预算带匹配 3 位候选",
        default: "unsure",
      },
    ],
  },
  {
    key: "budget",
    title: "预算与商务",
    hint: "决定报价颗粒度",
    items: [
      {
        id: "budget.band",
        label: "预算区间",
        why: "缺失时无法给出可执行报价",
        detected: "识别到:60–100 万",
        evidence: "ai",
        default: "have",
      },
      {
        id: "budget.props",
        label: "预算是否包含道具制作",
        why: "科技感开场的装置常占 15–25 万",
        evidence: "pending",
        aiSuggestion: "如包含,请在方案第 3 页补一行「道具制作:含」",
        default: "missing",
        blocking: true,
      },
      {
        id: "budget.payment",
        label: "付款节点与发票主体",
        why: "影响合同起草与首款释放",
        evidence: "pending",
        default: "unsure",
      },
    ],
  },
  {
    key: "ops",
    title: "场地与执行",
    hint: "决定履约时的技术边界",
    items: [
      {
        id: "ops.venue",
        label: "场地是否已定",
        why: "未定则由主服务方推荐,时间会顺延 3–5 天",
        detected: "识别到:场地未包含在方案范围内",
        evidence: "ai",
        default: "missing",
      },
      {
        id: "ops.date",
        label: "活动日期",
        why: "档期核对的第一变量",
        detected: "识别到:2026-10-22",
        evidence: "ai",
        default: "have",
      },
      {
        id: "ops.owner",
        label: "唯一主服务方",
        why: "V7.2 要求整场活动必须有单一负责机构",
        evidence: "pending",
        aiSuggestion: "原方案未指定,AI 会推荐 2 家历史 NPS ≥ 4.6 的服务方",
        default: "missing",
        blocking: true,
      },
    ],
  },
];

const stateStyle: Record<CheckState, string> = {
  have: "border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/10 text-[color:var(--state-verified)]",
  missing: "border-[color:var(--state-risk)]/50 bg-[color:var(--state-risk)]/10 text-[color:var(--state-risk)]",
  unsure: "border-border bg-secondary/40 text-muted-foreground",
};

const stateLabel: Record<CheckState, string> = {
  have: "我已有",
  missing: "我缺失",
  unsure: "待定",
};

function GapChecklistPage() {
  const initial = useMemo(() => {
    const map: Record<string, CheckState> = {};
    groups.forEach((g) => g.items.forEach((it) => (map[it.id] = it.default)));
    return map;
  }, []);
  const [state, setState] = useState<Record<string, CheckState>>(initial);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    goal: true,
    content: true,
    budget: true,
    ops: true,
  });

  // 上传流程状态
  type Phase = "idle" | "parsing" | "parsed";
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<{ name: string; size: number; pages: number } | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [rfp, setRfp] = useState({
    eventName: "",
    date: "",
    city: "",
    budgetBand: "",
    contact: "",
    note: "",
  });
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (f: File) => {
    const estimatedPages = Math.max(4, Math.min(30, Math.round(f.size / 60000)));
    setFile({ name: f.name, size: f.size, pages: estimatedPages });
    setPhase("parsing");
    setParseProgress(0);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  };

  useEffect(() => {
    if (phase !== "parsing") return;
    const t = setInterval(() => {
      setParseProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setPhase("parsed");
          return 100;
        }
        return Math.min(100, p + 8 + Math.random() * 10);
      });
    }, 180);
    return () => clearInterval(t);
  }, [phase]);

  const resetUpload = () => {
    setPhase("idle");
    setFile(null);
    setParseProgress(0);
    setState(initial);
  };

  const allItems = groups.flatMap((g) => g.items);
  const have = allItems.filter((i) => state[i.id] === "have").length;
  const missing = allItems.filter((i) => state[i.id] === "missing").length;
  const unsure = allItems.filter((i) => state[i.id] === "unsure").length;
  const blockingMissing = allItems.filter(
    (i) => i.blocking && state[i.id] !== "have",
  );
  const readiness = Math.round((have / allItems.length) * 100);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      {/* 面包屑 */}
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          发现
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">D 路径 · 缺口检查</span>
      </div>

      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            上传方案 · 缺口检查
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            AI 已把你上传的方案映射到「一份可执行方案所需的完整要素」。
            勾选每一项 <span className="text-foreground">我已有 / 我缺失 / 待定</span>,
            AI 顾问会据此判断能否进入报价,或者先补什么最省时。
          </p>
        </div>
        {phase === "parsed" && (
          <button
            onClick={() => setState(initial)}
            className="surface-1 flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            重置勾选
          </button>
        )}
      </div>

      {/* Phase: idle · 上传表单 */}
      {phase === "idle" && (
        <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
                dragging
                  ? "border-primary/70 bg-primary/5"
                  : "border-border/60 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.md,.txt"
                onChange={handleFilePick}
                className="hidden"
              />
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background/60">
                <UploadCloud className="h-5 w-5 text-primary" />
              </div>
              <div className="mb-1 text-sm font-medium text-foreground">
                把已有方案 / RFP 拖到这里,或点击选择文件
              </div>
              <div className="text-xs text-muted-foreground">
                支持 PDF · Word · PPT · Markdown · 单个文件 ≤ 20 MB
              </div>
              <div className="mt-4 text-[11px] text-muted-foreground">
                文件仅用于结构化解析 · 不会用于训练模型
              </div>
            </label>
            <div className="mt-3 text-xs text-muted-foreground">
              还没有文件?{" "}
              <Link to="/agent" className="text-primary hover:underline">
                和 AI 顾问从零聊出来
              </Link>
              ,或{" "}
              <Link to="/snapshot" className="text-primary hover:underline">
                先看匿名可行性快照
              </Link>
              。
            </div>
          </div>

          <aside className="surface-1 h-max rounded-xl p-5">
            <div className="mb-1 text-sm font-semibold text-foreground">
              可选 · 告诉 AI 关键背景
            </div>
            <div className="mb-4 text-xs text-muted-foreground">
              这些信息会让缺口检查更准确,也可以稍后在项目里补
            </div>
            <div className="space-y-3">
              {[
                { key: "eventName", label: "活动名称", ph: "如:AlphaBio 产品发布会" },
                { key: "date", label: "计划日期", ph: "如:2026-10-22" },
                { key: "city", label: "城市", ph: "如:北京" },
                { key: "budgetBand", label: "预算区间", ph: "如:60–100 万" },
                { key: "contact", label: "对接人", ph: "姓名 · 手机 · 邮箱" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-[11px] text-muted-foreground">
                    {f.label}
                  </label>
                  <input
                    value={rfp[f.key as keyof typeof rfp]}
                    onChange={(e) =>
                      setRfp((r) => ({ ...r, [f.key]: e.target.value }))
                    }
                    placeholder={f.ph}
                    className="w-full rounded-md border border-border/60 bg-background/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-[11px] text-muted-foreground">
                  补充说明
                </label>
                <textarea
                  value={rfp.note}
                  onChange={(e) => setRfp((r) => ({ ...r, note: e.target.value }))}
                  placeholder="如既有演员意向、必须避免的元素等"
                  rows={3}
                  className="w-full resize-none rounded-md border border-border/60 bg-background/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
                />
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Phase: parsing · 解析进度 */}
      {phase === "parsing" && file && (
        <div className="surface-1 mb-6 rounded-xl p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10">
              <Loader2 className="h-4 w-4 animate-spin text-[color:var(--state-ai)]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">
                {file.name}
              </div>
              <div className="text-xs text-muted-foreground">
                AI 顾问正在结构化解析 · {(file.size / 1024).toFixed(0)} KB · 预估 {file.pages} 页
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="rounded-md p-2 text-muted-foreground hover:text-foreground"
              aria-label="取消"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--state-ai)] transition-all"
              style={{ width: `${parseProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>
              {parseProgress < 30
                ? "读取文本层与目录结构…"
                : parseProgress < 60
                  ? "识别议程、演员意向、预算段落…"
                  : parseProgress < 90
                    ? "映射到 13 项方案要素…"
                    : "生成缺口清单与建议…"}
            </span>
            <span>{Math.round(parseProgress)}%</span>
          </div>
        </div>
      )}

      {/* Phase: parsed · 解析摘要 */}
      {phase === "parsed" && file && (
        <div className="surface-1 mb-6 rounded-xl p-5">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background/40">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
                <span className="font-medium">{file.name}</span>
                <StatusBadge state="verified" label={`已解析 · ${file.pages} 页`} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB · AI 用时 {(1.2 + file.pages * 0.05).toFixed(1)} 秒 · 识别 13 项要素,其中{" "}
                <span className="text-[color:var(--state-risk)]">
                  {allItems.filter((i) => i.default !== "have").length} 项需你补充
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "识别到的目标", value: "产品发布 · 面向媒体与 KOL" },
                  { label: "议程", value: "5 幕 · 约 90 分钟" },
                  { label: "预算带", value: "60–100 万" },
                  { label: "主服务方", value: "未指定 · 需分配" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-md border border-border/50 bg-background/30 px-3 py-2"
                  >
                    <div className="text-[11px] text-muted-foreground">
                      {s.label}
                    </div>
                    <div className="mt-0.5 text-xs text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
              {(rfp.eventName || rfp.date || rfp.city || rfp.budgetBand) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span>你补充的背景:</span>
                  {[rfp.eventName, rfp.date, rfp.city, rfp.budgetBand]
                    .filter(Boolean)
                    .map((v, i) => (
                      <span
                        key={i}
                        className="rounded-sm border border-border/50 px-1.5 py-0.5 text-foreground/80"
                      >
                        {v}
                      </span>
                    ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-md border border-dashed border-border/70 bg-secondary/30 px-3 py-2 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground"
              >
                <FileUp className="h-3 w-3" />
                替换文件
              </button>
              <button
                onClick={resetUpload}
                className="rounded-md p-2 text-muted-foreground hover:text-foreground"
                aria-label="清除"
              >
                <X className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.md,.txt"
                onChange={handleFilePick}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {phase === "parsed" && (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* 左:清单 */}
        <div className="space-y-4">
          {groups.map((g) => {
            const gHave = g.items.filter((i) => state[i.id] === "have").length;
            const gMissing = g.items.filter((i) => state[i.id] === "missing").length;
            const isOpen = openGroups[g.key] ?? true;
            return (
              <section key={g.key} className="surface-1 rounded-xl">
                <button
                  onClick={() =>
                    setOpenGroups((s) => ({ ...s, [g.key]: !isOpen }))
                  }
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {g.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {g.hint}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="text-[color:var(--state-verified)]">
                        已有 {gHave}
                      </span>
                      <span className="text-[color:var(--state-risk)]">
                        缺失 {gMissing}
                      </span>
                      <span>共 {g.items.length}</span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="space-y-2 border-t border-border/60 px-5 py-4">
                    {g.items.map((item) => {
                      const cur = state[item.id];
                      return (
                        <div
                          key={item.id}
                          className={`rounded-lg border p-4 transition-colors ${
                            cur === "have"
                              ? "border-border/60"
                              : cur === "missing"
                                ? "border-[color:var(--state-risk)]/40 bg-[color:var(--state-risk)]/5"
                                : "border-border/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {item.label}
                                </span>
                                {item.blocking && (
                                  <span className="inline-flex items-center gap-1 rounded-sm border border-[color:var(--state-risk)]/40 bg-[color:var(--state-risk)]/10 px-1.5 py-0.5 text-[10px] text-[color:var(--state-risk)]">
                                    <AlertTriangle className="h-3 w-3" />
                                    阻塞报价
                                  </span>
                                )}
                                <StatusBadge state={item.evidence} />
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                {item.why}
                              </div>
                              {item.detected && (
                                <div className="mt-2 space-y-1">
                                  <div className="text-xs text-foreground/80">
                                    {item.detected}
                                  </div>
                                  <EvidenceLine source="上传方案 · AI 解析" />
                                </div>
                              )}
                              {item.aiSuggestion && cur !== "have" && (
                                <div className="mt-2 flex items-start gap-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2 text-xs text-foreground/85">
                                  <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                                  <span>{item.aiSuggestion}</span>
                                </div>
                              )}
                            </div>

                            {/* 三态切换 */}
                            <div className="flex shrink-0 flex-col gap-1.5">
                              {(["have", "missing", "unsure"] as const).map(
                                (opt) => {
                                  const active = cur === opt;
                                  return (
                                    <button
                                      key={opt}
                                      onClick={() =>
                                        setState((s) => ({
                                          ...s,
                                          [item.id]: opt,
                                        }))
                                      }
                                      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] transition-colors ${
                                        active
                                          ? stateStyle[opt]
                                          : "border-border/50 text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      {opt === "have" ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                      ) : opt === "missing" ? (
                                        <AlertTriangle className="h-3 w-3" />
                                      ) : (
                                        <CircleDashed className="h-3 w-3" />
                                      )}
                                      {stateLabel[opt]}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* 右:就绪度侧栏 */}
        <aside className="space-y-4">
          <div className="surface-2 sticky top-6 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              当前推进就绪度
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-semibold text-foreground">
                {readiness}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--state-verified)] transition-all"
                style={{ width: `${readiness}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md border border-border/50 px-2 py-2">
                <div className="text-base font-semibold text-[color:var(--state-verified)]">
                  {have}
                </div>
                <div className="mt-0.5 text-muted-foreground">已有</div>
              </div>
              <div className="rounded-md border border-border/50 px-2 py-2">
                <div className="text-base font-semibold text-[color:var(--state-risk)]">
                  {missing}
                </div>
                <div className="mt-0.5 text-muted-foreground">缺失</div>
              </div>
              <div className="rounded-md border border-border/50 px-2 py-2">
                <div className="text-base font-semibold text-foreground">
                  {unsure}
                </div>
                <div className="mt-0.5 text-muted-foreground">待定</div>
              </div>
            </div>

            {blockingMissing.length > 0 ? (
              <div className="mt-4 rounded-md border border-[color:var(--state-risk)]/40 bg-[color:var(--state-risk)]/10 px-3 py-2 text-xs text-[color:var(--state-risk)]">
                还有 {blockingMissing.length} 项阻塞报价的信息未补齐,先解决这些最省时
              </div>
            ) : (
              <div className="mt-4 rounded-md border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/10 px-3 py-2 text-xs text-[color:var(--state-verified)]">
                阻塞项已全部处理,可进入报价
              </div>
            )}
          </div>

          <AgentMessage time="刚刚">
            {blockingMissing.length > 0
              ? `建议先补齐:${blockingMissing
                  .slice(0, 3)
                  .map((i) => i.label)
                  .join(" · ")}。这些是决定能否给出可执行报价的关键信息。`
              : "关键信息已就绪。我建议基于这份方案生成 3 版差异化推进路线,让你和 CEO 一起选。"}
          </AgentMessage>

          <div className="surface-1 rounded-xl p-4">
            <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
              下一步
            </div>
            <div className="space-y-2">
              <Link
                to="/projects/$id"
                params={{ id: "proj_rfp" }}
                className="group flex items-center justify-between rounded-md border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-primary/15"
              >
                <span>在项目空间继续 · 已上传方案</span>
                <ArrowRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/agent"
                className="group flex items-center justify-between rounded-md border border-border/60 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>让 AI 顾问帮我补齐缺口</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/snapshot"
                className="group flex items-center justify-between rounded-md border border-border/60 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>先看匿名可行性快照</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
      )}
    </div>
  );
}