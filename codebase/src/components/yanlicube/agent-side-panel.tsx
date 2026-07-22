import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X, Send, Wand2, ChevronRight, MessageSquarePlus } from "lucide-react";
import { AgentMessage, HumanMessage } from "./agent";
import { cn } from "@/lib/utils";

type ChatTurn =
  | { id: string; role: "agent"; text: ReactNode; time?: string }
  | { id: string; role: "human"; text: string; time?: string };

type Ctx = {
  open: boolean;
  openPanel: (opts?: { seed?: string; context?: string }) => void;
  close: () => void;
  setContext: (ctx: string) => void;
};

const AgentPanelCtx = createContext<Ctx | null>(null);

export function useAgentPanel() {
  const c = useContext(AgentPanelCtx);
  if (!c) throw new Error("AgentPanel context missing");
  return c;
}

/** Non-throwing variant — returns null when no AgentPanelProvider is present. */
export function useAgentPanelOptional() {
  return useContext(AgentPanelCtx);
}

/** 上下文侧栏 Agent · 在任一项目页可召唤 */
export function AgentPanelProvider({
  children,
  scopeLabel,
  quickPrompts,
}: {
  children: ReactNode;
  /** 显示在面板顶部的当前上下文,例如 "Neo 银行 · 方案页" */
  scopeLabel: string;
  /** 上下文相关的快捷问题 */
  quickPrompts: string[];
}) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState(scopeLabel);
  const [turns, setTurns] = useState<ChatTurn[]>(() => [
    {
      id: "seed",
      role: "agent",
      text: (
        <>
          你在<strong>{scopeLabel}</strong>。这里的任何对象我都可以帮你解释、生成摘要或推进下一步。
          先问点简单的?
        </>
      ),
      time: "刚刚",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const panelId = useId();
  const titleId = `${panelId}-title`;

  useEffect(() => {
    setContext(scopeLabel);
  }, [scopeLabel]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [turns, open, thinking]);

  const openPanel = useCallback((opts?: { seed?: string; context?: string }) => {
    lastTriggerRef.current = (document.activeElement as HTMLElement) ?? null;
    setOpen(true);
    if (opts?.context) setContext(opts.context);
    if (opts?.seed) {
      setInput(opts.seed);
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // Restore focus to the element that opened the panel.
    requestAnimationFrame(() => {
      lastTriggerRef.current?.focus?.();
    });
  }, []);

  // Focus the panel when it opens; listen for Escape to close.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Global shortcut: Alt+A toggles the panel. Ignored when the user is typing
  // in an editable field so it never eats real keystrokes, and skipped when
  // any other modifier is held to avoid colliding with Ctrl/Cmd/Shift combos.
  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    };
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== "a" && e.key !== "A") return;
      if (isEditable(e.target)) return;
      e.preventDefault();
      if (open) close();
      else openPanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openPanel, close]);

  const send = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      const now = "刚刚";
      const id = crypto.randomUUID();
      setTurns((prev) => [
        ...prev,
        { id: `u_${id}`, role: "human", text: t, time: now },
      ]);
      setInput("");
      setThinking(true);
      window.setTimeout(() => {
        setTurns((prev) => [
          ...prev,
          {
            id: `a_${id}`,
            role: "agent",
            text: mockReply(t, context),
            time: "刚刚",
          },
        ]);
        setThinking(false);
      }, 900);
    },
    [context],
  );

  const value = useMemo<Ctx>(
    () => ({
      open,
      openPanel,
      close,
      setContext,
    }),
    [open, openPanel, close],
  );

  return (
    <AgentPanelCtx.Provider value={value}>
      {children}

      {/* Floating summon buttons — always mounted so aria-expanded reflects state. */}
      {/* Desktop — bottom-right pill */}
      <button
        type="button"
        onClick={() => openPanel()}
        aria-label={open ? "AI 顾问面板已打开 (Alt+A 关闭)" : "召唤 AI 顾问 (Alt+A)"}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-keyshortcuts="Alt+A"
        title="Alt+A"
        tabIndex={open ? -1 : 0}
        className={cn(
          "fixed bottom-6 right-6 z-40 hidden items-center gap-2 rounded-full border border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/15 px-4 py-2.5 text-sm font-medium text-[color:var(--state-ai)] shadow-2xl backdrop-blur-md transition-all hover:bg-[color:var(--state-ai)]/25 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-ai)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex",
          open && "pointer-events-none opacity-0",
        )}
      >
        <Wand2 className="h-4 w-4" aria-hidden="true" />
        问 AI 顾问
      </button>
      {/* Mobile — raised circular button, sits in the tabbar center notch */}
      <button
        type="button"
        onClick={() => openPanel()}
        aria-label={open ? "AI 顾问面板已打开 (Alt+A 关闭)" : "召唤 AI 顾问 (Alt+A)"}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-keyshortcuts="Alt+A"
        title="Alt+A"
        tabIndex={open ? -1 : 0}
        className={cn(
          "fixed left-1/2 z-40 flex -translate-x-1/2 flex-col items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--state-ai)] to-primary text-primary-foreground shadow-[0_10px_30px_-6px_color-mix(in_oklab,var(--state-ai)_65%,transparent)] ring-4 ring-background transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--state-ai)]/70 md:hidden",
          open && "pointer-events-none opacity-0",
        )}
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 10px)",
          height: "56px",
          width: "56px",
        }}
      >
        <Wand2 className="h-5 w-5" aria-hidden="true" />
        <span
          aria-hidden="true"
          className="mt-0.5 text-[9px] font-semibold leading-none tracking-wide"
        >
          AI
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/40 backdrop-blur-[2px] transition-opacity lg:bg-transparent lg:backdrop-blur-0"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <aside
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        tabIndex={-1}
        inert={!open}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border/70 bg-card/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 focus:outline-none",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs tracking-[0.14em] text-muted-foreground">
              <Wand2 className="h-3.5 w-3.5 text-[color:var(--state-ai)]" aria-hidden="true" />
              AI 顾问 · 上下文侧栏
            </div>
            <h2
              id={titleId}
              className="mt-0.5 truncate text-sm font-medium text-foreground"
            >
              {context}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="关闭 AI 顾问"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>


        {/* Messages */}
        <div
          ref={bodyRef}
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5"
        >
          {turns.map((t) =>
            t.role === "agent" ? (
              <AgentMessage key={t.id} time={t.time}>{t.text}</AgentMessage>
            ) : (
              <HumanMessage key={t.id} by="你" time={t.time}>{t.text}</HumanMessage>
            ),
          )}
          {thinking && (
            <AgentMessage time="正在整理…">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--state-ai)]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--state-ai)] [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--state-ai)] [animation-delay:300ms]" />
                <span className="ml-1">在读这一页的上下文…</span>
              </span>
            </AgentMessage>
          )}
        </div>

        {/* Quick prompts */}
        {quickPrompts.length > 0 && (
          <div className="border-t border-border/50 px-5 py-3">
            <div className="mb-2 flex items-center gap-1 text-[10px] tracking-[0.16em] text-muted-foreground">
              <MessageSquarePlus className="h-3 w-3" />
              快捷追问
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="group inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-[11px] text-foreground/80 hover:border-[color:var(--state-ai)]/40 hover:text-foreground"
                >
                  {q}
                  <ChevronRight className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-border/60 p-3"
        >
          <div className="flex items-end gap-2 rounded-lg border border-border/60 bg-background/60 p-2 focus-within:border-[color:var(--state-ai)]/40">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="问点关于这一页的事…"
              className="flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="发送"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-1.5 px-1 text-[10px] text-muted-foreground">
            演示模式 · 回复为预设内容,不调用真实模型
          </div>
        </form>
      </aside>
    </AgentPanelCtx.Provider>
  );
}

function mockReply(q: string, ctx: string): ReactNode {
  const l = q.toLowerCase();
  if (l.includes("汇报") || l.includes("摘要") || l.includes("领导")) {
    return (
      <>
        我可以给你一个 4 段式领导汇报模板:
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-foreground/85">
          <li>一句话结论 · 推荐哪个方向、为什么</li>
          <li>关键代价 · 花了什么、换到了什么</li>
          <li>主要风险 · 谁在盯、如何兜底</li>
          <li>需要拍板的事项 · 每项一句话</li>
        </ol>
        <div className="mt-2 text-xs text-muted-foreground">
          点击项目内的「决策摘要」可以直接生成 · 可打印为 PDF。
        </div>
      </>
    );
  }
  if (l.includes("差异") || l.includes("对比") || l.includes("比较")) {
    return (
      <>
        方案对比我建议从这五轴来看:定位、预算带、优势、牺牲、待确认项。
        当前上下文({ctx})下最容易被忽视的是"牺牲"——问一次"如果不选它,失去什么"。
      </>
    );
  }
  if (l.includes("等") || l.includes("档期")) {
    return (
      <>
        当前有一位演员的档期还在等经纪反馈。平均耗时 2 天,超过 3 天会自动提醒。
        你现在能做:准备一份 B 方案演员名单,我可以基于同类型档期给出 3 位候选。
      </>
    );
  }
  if (l.includes("错误") || l.includes("修正") || l.includes("incident")) {
    return (
      <>
        AI 错误恢复流程分三段:识别 · 修正 · 需重新确认。
        在项目概览页有当前项目的一次修正记录,点开可以看到影响范围与谁需要重新确认。
      </>
    );
  }
  if (l.includes("解释") || l.includes("这是什么") || l.includes("为什么")) {
    return (
      <>
        我在读这一页的对象来源。要不要我把这里的每一个字段都用「客户视角」重写一遍?
        重写不会改动数据,只是给你一份可以直接抄进邮件的说明。
      </>
    );
  }
  return (
    <>
      收到。在{ctx}这一页,我可以做三件事:
      <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/85">
        <li>解释这一页上任何一个对象或状态</li>
        <li>把当前进度整理成给领导的一页摘要</li>
        <li>基于当前上下文起草下一步的动作</li>
      </ul>
      你更想先做哪一个?
    </>
  );
}