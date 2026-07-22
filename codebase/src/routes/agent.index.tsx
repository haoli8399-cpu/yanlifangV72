import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Send, Wand2 } from "lucide-react";
import { AgentMessage, HumanMessage, AgentInlineSuggestion } from "@/components/yanlicube/agent";

export const Route = createFileRoute("/agent/")({
  head: () => ({
    meta: [
      { title: "AI 顾问 · 演立方" },
      { name: "description", content: "和 AI 顾问一起把模糊的活动想法变成清晰的活动画像。" },
    ],
  }),
  component: AgentPage,
});

const seedQuestions = [
  "帮我策划一场 500 人的客户答谢晚宴",
  "我们要做一场新产品发布,面向媒体",
  "想给团队做一次不太一样的年会",
];

function AgentPage() {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<{ who: "ai" | "you"; text: string; time?: string }[]>([
    {
      who: "ai",
      time: "刚刚",
      text: "你好。我是演立方的 AI 顾问。你可以直接说一个活动的初步想法 —— 哪怕只是一句话。我会帮你把它变成一个可以推进的活动。我不会替你做决定,所有推进都会先问过你。",
    },
  ]);

  function send(text: string) {
    if (!text.trim()) return;
    setTurns((t) => [
      ...t,
      { who: "you", text, time: "刚刚" },
      {
        who: "ai",
        time: "刚刚",
        text: "我理解到几个关键点。让我先给你三个初步方向 —— 你选一个,我们再往下推进;也可以告诉我我理解错了什么。",
      },
    ]);
    setInput("");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-[900px] flex-col px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--state-ai)]/40 bg-[color:var(--state-ai)]/10 text-[color:var(--state-ai)]">
          <Wand2 className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">AI 顾问</h1>
          <p className="text-xs text-muted-foreground">
            理解 · 探索 · 生成初稿 · 从不替你做决定
          </p>
        </div>
        <Link
          to="/agent/memory"
          className="rounded-md border border-border/60 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
        >
          AI 记忆中心
        </Link>
      </div>

      <div className="flex-1 space-y-6">
        {turns.map((t, i) =>
          t.who === "ai" ? (
            <AgentMessage key={i} time={t.time}>{t.text}</AgentMessage>
          ) : (
            <HumanMessage key={i} by="你" time={t.time}>{t.text}</HumanMessage>
          ),
        )}

        {turns.length > 1 && (
          <AgentInlineSuggestion
            title="要不要直接看一个已经从这类需求生成的完整方案?"
            actions={
              <Link
                to="/projects/$id"
                params={{ id: "proj_neoyear" }}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                打开 Neo 银行演示项目
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            演示项目「Neo 银行 · 2027 年度客户答谢晚宴」已经从类似的初步想法走完了理解 → 方案 → 主服务方分配 → 报价的过程,你可以直接看结果。
          </AgentInlineSuggestion>
        )}
      </div>

      {turns.length === 1 && (
        <div className="my-8">
          <div className="mb-3 text-xs text-muted-foreground">或者从这里开始</div>
          <div className="flex flex-wrap gap-2">
            {seedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs text-foreground/85 transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="mt-8 flex items-center gap-2 rounded-xl border border-border bg-card p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="说一个活动的初步想法…"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
          disabled={!input.trim()}
        >
          <Send className="h-3.5 w-3.5" />
          发送
        </button>
      </form>
    </div>
  );
}