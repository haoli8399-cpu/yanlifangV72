import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  History,
  RotateCcw,
  UserCheck,
  FileWarning,
  Sparkle,
  Copy,
  Check,
  CircleAlert,
  Save,
  Trash2,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProject, type Project } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentMessage, EvidenceLine } from "@/components/yanlicube/agent";

export const Route = createFileRoute("/projects/$id/incidents")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `AI 修正记录 · ${loaderData?.project.title ?? "活动"}` },
      {
        name: "description",
        content: "AI 顾问识别到自己的一次错误,并披露影响范围、修正版本与需要重新确认的人。",
      },
    ],
  }),
  component: Incident,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

function Incident() {
  const { project } = Route.useLoaderData() as { project: Project };
  const inc = project.aiIncident;

  if (!inc) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-[color:var(--state-verified)]" />
        <div className="text-sm text-foreground/80">这个项目目前没有已披露的 AI 修正记录。</div>
        <div className="mt-1 text-xs text-muted-foreground">
          一旦 AI 顾问识别到自己的错误,它会主动出现在这里,并通知所有受影响的人。
        </div>
        <Link
          to="/projects/$id"
          params={{ id: project.id }}
          className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          返回活动空间 →
        </Link>
      </div>
    );
  }

  type ReviewState = "pending" | "confirmed" | "issue";
  const [reviews, setReviews] = useState<Record<string, { state: ReviewState; note: string }>>(
    () => Object.fromEntries(inc.needReconfirm.map((w) => [w, { state: "pending", note: "" }]))
  );
  const [copied, setCopied] = useState(false);

  type HistoryEntry = {
    id: string;
    savedAt: string; // ISO
    author: string;
    counts: { confirmed: number; issue: number; pending: number; total: number };
    reviews: Record<string, { state: ReviewState; note: string }>;
    conclusion: string;
  };
  const storageKey = `yanlicube:incident-reviews:${project.id}`;
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [compareEntry, setCompareEntry] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setHistory(JSON.parse(raw) as HistoryEntry[]);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const persist = (next: HistoryEntry[]) => {
    setHistory(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const total = inc.needReconfirm.length;
  const confirmedCount = Object.values(reviews).filter((r) => r.state === "confirmed").length;
  const issueCount = Object.values(reviews).filter((r) => r.state === "issue").length;
  const pendingCount = total - confirmedCount - issueCount;
  const progress = total === 0 ? 0 : Math.round(((confirmedCount + issueCount) / total) * 100);
  const allActed = pendingCount === 0;
  const hasIssues = issueCount > 0;

  const setState = (who: string, state: ReviewState) =>
    setReviews((r) => ({ ...r, [who]: { ...r[who], state: r[who].state === state ? "pending" : state } }));
  const setNote = (who: string, note: string) =>
    setReviews((r) => ({ ...r, [who]: { ...r[who], note } }));

  const conclusion = useMemo(() => {
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const lines: string[] = [];
    lines.push(`【AI 修正复核结论 · ${project.title}】`);
    lines.push(`生成时间:${stamp}`);
    lines.push("");
    lines.push(`原始问题:${inc.what}`);
    lines.push(`修正版本:${inc.corrected}`);
    lines.push("");
    lines.push(`复核进度:${confirmedCount}/${total} 已确认${hasIssues ? ` · ${issueCount} 项有异议` : ""}${pendingCount ? ` · ${pendingCount} 项待复核` : ""}`);
    lines.push("");
    lines.push("逐项确认:");
    inc.needReconfirm.forEach((who) => {
      const r = reviews[who];
      const tag = r.state === "confirmed" ? "✓ 已确认" : r.state === "issue" ? "⚠ 有异议" : "· 待复核";
      lines.push(`  ${tag} · ${who}${r.note ? ` — ${r.note}` : ""}`);
    });
    lines.push("");
    if (allActed && !hasIssues) {
      lines.push("整体结论:全部相关方已确认 AI 修正版本,受影响字段可撤除「待复核」角标。");
    } else if (allActed && hasIssues) {
      lines.push("整体结论:仍有相关方对修正版本存在异议,需在解决后再次发起复核。");
    } else {
      lines.push("整体结论:复核尚未完成,请提醒剩余相关方尽快回应。");
    }
    return lines.join("\n");
  }, [reviews, inc, project.title, confirmedCount, issueCount, pendingCount, total, allActed, hasIssues]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(conclusion);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const handleSave = () => {
    const entry: HistoryEntry = {
      id: `rev-${Date.now()}`,
      savedAt: new Date().toISOString(),
      author: "当前活动负责人",
      counts: {
        confirmed: confirmedCount,
        issue: issueCount,
        pending: pendingCount,
        total,
      },
      reviews: JSON.parse(JSON.stringify(reviews)),
      conclusion,
    };
    persist([entry, ...history]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  const handleDelete = (id: string) => {
    persist(history.filter((h) => h.id !== id));
    if (expandedEntry === id) setExpandedEntry(null);
    if (compareEntry === id) setCompareEntry(null);
  };

  const formatSavedAt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const diffAgainstCurrent = (snapshot: HistoryEntry) => {
    const changes: { who: string; from: string; to: string }[] = [];
    const label = (s: ReviewState, note: string) =>
      s === "confirmed" ? "已确认" : s === "issue" ? `有异议${note ? `(${note})` : ""}` : "待复核";
    inc.needReconfirm.forEach((who) => {
      const past = snapshot.reviews[who] ?? { state: "pending" as ReviewState, note: "" };
      const now = reviews[who];
      if (past.state !== now.state || past.note !== now.note) {
        changes.push({ who, from: label(past.state, past.note), to: label(now.state, now.note) });
      }
    });
    return changes;
  };

  const timeline = [
    {
      at: "T-15 分钟",
      icon: FileWarning,
      tone: "warn",
      title: "AI 顾问自我识别错误",
      detail: inc.what,
    },
    {
      at: "T-8 分钟",
      icon: RotateCcw,
      tone: "ai",
      title: "自动生成修正版本",
      detail: inc.corrected,
    },
    {
      at: "T-2 分钟",
      icon: UserCheck,
      tone: "pending",
      title: "标记需要重新确认的人",
      detail: `已通知 ${inc.needReconfirm.length} 位相关方,附上前后差异对比`,
    },
    {
      at: "现在",
      icon: ShieldCheck,
      tone: "verified",
      title: "等待人工复核",
      detail: "在所有相关方确认前,该字段在其他页面显示为「AI 修正 · 待复核」",
    },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Back */}
      <Link
        to="/projects/$id"
        params={{ id: project.id }}
        className="mb-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> 回到活动空间
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-2xl border border-[color:var(--state-warn)]/40 bg-[color:var(--state-warn)]/[0.06] p-6">
        <div className="mb-2 flex items-center gap-2">
          <StatusBadge state="pending" label="AI 修正 · 已披露" />
          <span className="text-[11px] text-muted-foreground">
            由 AI 顾问自我识别 · 而非用户报告
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          AI 发现了自己的一个错误,并主动披露
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground/85">{inc.what}</p>
      </div>

      {/* Grid: what happened / corrected */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="surface-1 rounded-xl p-5">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-[color:var(--state-warn)]" />
            影响范围
          </div>
          <ul className="space-y-2 text-sm text-foreground/85">
            {inc.impact.map((x) => (
              <li key={x} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--state-warn)]" />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="surface-1 rounded-xl p-5">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5 text-[color:var(--state-ai)]" />
            修正后的版本
          </div>
          <div className="rounded-md border border-border/50 bg-background/40 p-3 text-sm text-foreground/85">
            {inc.corrected}
          </div>
          <EvidenceLine
            source="AI 顾问 · 自动重放解析链路"
            time="15 分钟前"
            className="mt-3"
          />
        </div>
      </div>

      {/* Reconfirm */}
      <div className="mb-6 surface-2 rounded-xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-[color:var(--state-pending)]" />
            <div className="text-sm font-semibold text-foreground">
              需要重新确认的人 · {total}
            </div>
          </div>
          <StatusBadge
            state={allActed && !hasIssues ? "verified" : "pending"}
            label={
              allActed
                ? hasIssues
                  ? "存在异议"
                  : "全部已确认"
                : `${confirmedCount + issueCount}/${total} 已回应`
            }
          />
        </div>

        {/* Progress bar */}
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-background/60">
          <div
            className="h-full rounded-full bg-[color:var(--state-verified)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mb-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <span className="text-[color:var(--state-verified)]">✓ 已确认 {confirmedCount}</span>
          {hasIssues && <span className="text-[color:var(--state-risk)]">⚠ 异议 {issueCount}</span>}
          {pendingCount > 0 && <span>· 待回应 {pendingCount}</span>}
        </div>

        <ul className="divide-y divide-border/40 rounded-lg border border-border/50 bg-background/30">
          {inc.needReconfirm.map((who) => {
            const r = reviews[who];
            return (
              <li key={who} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-foreground/90">{who}</div>
                    {r.state === "confirmed" && (
                      <span className="rounded-full bg-[color:var(--state-verified)]/15 px-2 py-0.5 text-[10px] font-medium text-[color:var(--state-verified)]">
                        已确认
                      </span>
                    )}
                    {r.state === "issue" && (
                      <span className="rounded-full bg-[color:var(--state-risk)]/15 px-2 py-0.5 text-[10px] font-medium text-[color:var(--state-risk)]">
                        有异议
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setState(who, "confirmed")}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition ${
                        r.state === "confirmed"
                          ? "border-[color:var(--state-verified)]/60 bg-[color:var(--state-verified)]/15 text-[color:var(--state-verified)]"
                          : "border-border/60 text-muted-foreground hover:border-[color:var(--state-verified)]/40 hover:text-foreground"
                      }`}
                    >
                      <Check className="h-3 w-3" /> 确认
                    </button>
                    <button
                      onClick={() => setState(who, "issue")}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition ${
                        r.state === "issue"
                          ? "border-[color:var(--state-risk)]/60 bg-[color:var(--state-risk)]/15 text-[color:var(--state-risk)]"
                          : "border-border/60 text-muted-foreground hover:border-[color:var(--state-risk)]/40 hover:text-foreground"
                      }`}
                    >
                      <CircleAlert className="h-3 w-3" /> 有异议
                    </button>
                  </div>
                </div>
                {r.state === "issue" && (
                  <input
                    value={r.note}
                    onChange={(e) => setNote(who, e.target.value)}
                    placeholder="请简述异议(会写入复核结论)"
                    className="mt-2 w-full rounded-md border border-[color:var(--state-risk)]/30 bg-background/60 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-[color:var(--state-risk)]/60 focus:outline-none"
                  />
                )}
              </li>
            );
          })}
        </ul>

        {hasIssues && issueCount > 0 && Object.values(reviews).some((r) => r.state === "issue" && !r.note.trim()) && (
          <div className="mt-2 flex items-start gap-1.5 text-[11px] text-[color:var(--state-risk)]">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            有异议的相关方尚未填写原因,建议补齐后再生成结论。
          </div>
        )}

        <div className="mt-3 text-[11px] text-muted-foreground">
          在所有人完成复核之前,受影响的字段在整个项目空间中都会带上「AI 修正 · 待复核」的角标。
        </div>
      </div>

      {/* Conclusion */}
      <div className="mb-6 surface-1 rounded-xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkle className="h-4 w-4 text-[color:var(--state-ai)]" />
            复核结论 · 可复制
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!allActed}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                allActed
                  ? "border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/10 text-[color:var(--state-verified)] hover:bg-[color:var(--state-verified)]/15"
                  : "cursor-not-allowed border-border/40 text-muted-foreground/60"
              }`}
            >
              {justSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              {justSaved ? "已保存到 incident" : "保存到 incident"}
            </button>
            <button
              onClick={handleCopy}
              disabled={!allActed}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                allActed
                  ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15"
                  : "cursor-not-allowed border-border/40 text-muted-foreground/60"
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "已复制" : "复制结论"}
            </button>
          </div>
        </div>
        {!allActed ? (
          <div className="rounded-md border border-dashed border-border/60 bg-background/30 p-4 text-xs text-muted-foreground">
            还有 {pendingCount} 位相关方尚未回应。完成全部逐项确认后,这里会生成一段可直接粘贴到群/邮件的复核结论。
          </div>
        ) : (
          <pre className="whitespace-pre-wrap rounded-md border border-border/50 bg-background/40 p-4 font-mono text-[12px] leading-relaxed text-foreground/90">
            {conclusion}
          </pre>
        )}
        <div className="mt-2 text-[11px] text-muted-foreground">
          保存后会写入下方的「复核历史」,便于回看每一次结论及与当前状态对比。
        </div>
      </div>

      {/* Review history */}
      {history.length > 0 && (
        <div className="mb-6 surface-1 rounded-xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-[color:var(--state-ai)]" />
              复核历史 · {history.length}
            </div>
            <button
              onClick={() => {
                if (confirm("确认清空此 incident 的所有复核历史?")) persist([]);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-[color:var(--state-warn)]"
            >
              <Trash2 className="h-3 w-3" /> 清空
            </button>
          </div>
          <ul className="space-y-2">
            {history.map((h) => {
              const isExpanded = expandedEntry === h.id;
              const isComparing = compareEntry === h.id;
              const changes = isComparing ? diffAgainstCurrent(h) : [];
              return (
                <li key={h.id} className="rounded-lg border border-border/50 bg-background/30">
                  <div className="flex items-center justify-between gap-3 p-3">
                    <button
                      onClick={() => setExpandedEntry(isExpanded ? null : h.id)}
                      className="flex flex-1 items-center gap-2 text-left"
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                      <div className="text-sm text-foreground/90">{formatSavedAt(h.savedAt)}</div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-[color:var(--state-verified)]">
                          ✓ {h.counts.confirmed}
                        </span>
                        {h.counts.issue > 0 && (
                          <span className="text-[color:var(--state-warn)]">
                            ⚠ {h.counts.issue}
                          </span>
                        )}
                        <span className="text-muted-foreground">/ {h.counts.total}</span>
                      </div>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCompareEntry(isComparing ? null : h.id)}
                        className={`rounded-md border px-2 py-1 text-[11px] font-medium transition ${
                          isComparing
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {isComparing ? "关闭对比" : "对比当前"}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(h.conclusion).catch(() => {});
                        }}
                        className="rounded-md border border-border/50 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                        title="复制此结论"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="rounded-md border border-border/50 px-2 py-1 text-[11px] text-muted-foreground hover:text-[color:var(--state-warn)]"
                        title="删除此条"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {isComparing && (
                    <div className="border-t border-border/40 bg-background/40 p-3">
                      <div className="mb-2 text-[11px] font-medium text-muted-foreground">
                        与当前状态的差异
                      </div>
                      {changes.length === 0 ? (
                        <div className="text-xs text-[color:var(--state-verified)]">
                          没有差异 · 当前逐项确认与该次保存完全一致
                        </div>
                      ) : (
                        <ul className="space-y-1.5 text-xs">
                          {changes.map((c) => (
                            <li key={c.who} className="flex flex-wrap items-center gap-1.5">
                              <span className="text-foreground/90">{c.who}</span>
                              <span className="rounded bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground line-through">
                                {c.from}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="rounded bg-[color:var(--state-ai)]/10 px-1.5 py-0.5 text-[10px] text-[color:var(--state-ai)]">
                                {c.to}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="border-t border-border/40 p-3">
                      <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-border/40 bg-background/50 p-3 font-mono text-[11px] leading-relaxed text-foreground/85">
                        {h.conclusion}
                      </pre>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-3 text-[11px] text-muted-foreground">
            演示环境:复核历史保存在浏览器本地,后续接入 Lovable Cloud 后会自动同步到该 incident 的服务端记录。
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="mb-6 surface-1 rounded-xl p-5">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground">
          <History className="h-3.5 w-3.5" />
          修正处理时间线
        </div>
        <ol className="space-y-4">
          {timeline.map((t, i) => (
            <li key={i} className="grid grid-cols-[100px_1fr] gap-4">
              <div className="text-[11px] font-mono text-muted-foreground pt-1">{t.at}</div>
              <div className="relative border-l border-border/50 pl-4">
                <span
                  className="absolute -left-[7px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-border bg-card"
                  aria-hidden
                >
                  <t.icon
                    className={
                      t.tone === "warn"
                        ? "h-2 w-2 text-[color:var(--state-warn)]"
                        : t.tone === "ai"
                        ? "h-2 w-2 text-[color:var(--state-ai)]"
                        : t.tone === "pending"
                        ? "h-2 w-2 text-[color:var(--state-pending)]"
                        : "h-2 w-2 text-[color:var(--state-verified)]"
                    }
                  />
                </span>
                <div className="text-sm font-medium text-foreground">{t.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{t.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Agent message · 陪伴 */}
      <div className="rounded-xl border border-[color:var(--state-ai)]/30 bg-[color:var(--state-ai)]/[0.05] p-5">
        <AgentMessage time="持续陪伴">
          我把每一次自我识别的错误都记录在这里,而不是悄悄修好。
          错误不是问题,不披露才是。
          如果你希望进一步降低同类错误,可以让主服务方在解析后加一步"结构核对"。
        </AgentMessage>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Sparkle className="h-3 w-3" />
        AI 修正记录 · 所有影响过的字段都可以追溯到这一页
      </div>
    </div>
  );
}