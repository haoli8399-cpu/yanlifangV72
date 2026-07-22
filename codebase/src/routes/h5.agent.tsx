import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Send, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/h5/agent")({ component: H5Agent });

function H5Agent() {
  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <h1 className="text-lg font-bold text-foreground">AI 顾问</h1>
      <p className="mt-1 text-xs text-muted-foreground">帮你理解需求、比较方案、准备决策</p>

      {/* 快捷追问 */}
      <div className="mt-6 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">快速开始</p>
        {["如何选择适合年会的节目形式？", "20 万预算能做什么样的活动？", "帮我比较一下剧场包场和企业外出演出"].map((q, i) => (
          <button key={i} className="w-full rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-left text-sm text-foreground active:bg-secondary/40">
            <MessageSquare className="mr-2 inline h-3.5 w-3.5 text-primary/60" />{q}
          </button>
        ))}
      </div>

      {/* 输入框 */}
      <div className="mt-8 flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 px-4 py-3">
        <input className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50" placeholder="输入你的问题..." />
        <Send className="h-4 w-4 shrink-0 text-primary" />
      </div>

      <div className="mt-4 text-center text-[10px] text-muted-foreground">
        AI 建议仅供参考，不构成正式报价或档期承诺
      </div>
    </div>
  );
}
