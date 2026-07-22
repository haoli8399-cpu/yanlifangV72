import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, Bot, CheckCheck, ChevronRight, Headphones, Inbox, LoaderCircle, Megaphone, MessageSquareText, ReceiptText, RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type MessageCategory = "all" | "system" | "solution" | "ai" | "support";
type MessageType = Exclude<MessageCategory, "all">;
type PageState = "default" | "loading" | "empty";
type MessageItem = { id: string; type: MessageType; title: string; summary: string; time: string; dateTime: string; unread: boolean };

const CATEGORY_OPTIONS = [
  { value: "all" as const, label: "全部" },
  { value: "system" as const, label: "系统" },
  { value: "solution" as const, label: "方案" },
  { value: "ai" as const, label: "AI 提醒" },
  { value: "support" as const, label: "客服" },
];

const INITIAL_MESSAGES: MessageItem[] = [
  { id: "m1", type: "solution", title: "「城市探索 · 团队协作挑战」报价方案已更新", summary: "根据你补充的 80 人规模和两天一夜需求，顾问已更新场地、住宿及执行服务报价。", time: "10 分钟前", dateTime: "2026-07-11T14:20", unread: true },
  { id: "m2", type: "ai", title: "AI 发现 3 套更匹配的团建方案", summary: "结合预算范围与上海周边场地档期，为你新增了轻户外、城市探索和主题共创方案。", time: "35 分钟前", dateTime: "2026-07-11T13:55", unread: true },
  { id: "m3", type: "support", title: "活动顾问林悦回复了你的咨询", summary: "周六上午的场地仍有档期，我们可以先为你保留 24 小时，并同步确认餐饮标准。", time: "1 小时前", dateTime: "2026-07-11T13:30", unread: true },
  { id: "m4", type: "system", title: "需求单已成功提交", summary: "你的「华东销售团队季度团建」需求已进入方案匹配阶段，预计很快会有顾问与你联系。", time: "今天 11:08", dateTime: "2026-07-11T11:08", unread: false },
  { id: "m5", type: "solution", title: "方案报价将在 24 小时后失效", summary: "「山野同行 · 轻户外团建」当前场地与住宿报价即将到期，建议及时确认档期。", time: "昨天 18:42", dateTime: "2026-07-10T18:42", unread: true },
  { id: "m6", type: "ai", title: "建议补充活动餐饮偏好", summary: "补充用餐形式、忌口与酒水需求后，AI 可以进一步优化预算分配和场地推荐。", time: "昨天 15:20", dateTime: "2026-07-10T15:20", unread: false },
  { id: "m7", type: "support", title: "客服已完成发票信息核验", summary: "你提交的企业抬头和税号已通过核验，活动完成后可直接申请开具增值税专用发票。", time: "7 月 9 日", dateTime: "2026-07-09T16:10", unread: false },
  { id: "m8", type: "system", title: "账号安全提醒", summary: "你的账号于昨日在新设备登录。如非本人操作，请及时修改密码并联系平台客服。", time: "7 月 8 日", dateTime: "2026-07-08T09:15", unread: false },
];

const TYPE_CONFIG: Record<MessageType, { label: string; icon: typeof ReceiptText; badgeClassName: string; iconClassName: string }> = {
  solution: { label: "报价", icon: ReceiptText, badgeClassName: "border-[#E0DDFF] bg-[#F0EEFF] text-[#5B4FD6] hover:bg-[#F0EEFF]", iconClassName: "bg-[#F0EEFF] text-[#5B4FD6]" },
  ai: { label: "AI 提醒", icon: Bot, badgeClassName: "border-[#D8E9FF] bg-[#EEF6FF] text-[#2563A9] hover:bg-[#EEF6FF]", iconClassName: "bg-[#EEF6FF] text-[#2563A9]" },
  system: { label: "系统", icon: Megaphone, badgeClassName: "border-[#E5E7EF] bg-[#F2F3F5] text-[#687083] hover:bg-[#F2F3F5]", iconClassName: "bg-[#F2F3F5] text-[#687083]" },
  support: { label: "客服", icon: Headphones, badgeClassName: "border-[#F8DFC2] bg-[#FFF5E8] text-[#A55D12] hover:bg-[#FFF5E8]", iconClassName: "bg-[#FFF5E8] text-[#A55D12]" },
};

export const Route = createFileRoute("/v0-messages")({ component: AgentMessageCenterPage });

function AgentMessageCenterPage() {
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [activeCategory, setActiveCategory] = useState<MessageCategory>("all");
  const [pageState, setPageState] = useState<PageState>("default");

  const categoryCounts = useMemo(() => ({
    all: messages.length,
    system: messages.filter((m) => m.type === "system").length,
    solution: messages.filter((m) => m.type === "solution").length,
    ai: messages.filter((m) => m.type === "ai").length,
    support: messages.filter((m) => m.type === "support").length,
  }), [messages]);

  const unreadCount = useMemo(() => messages.filter((m) => m.unread).length, [messages]);
  const visibleMessages = useMemo(() => activeCategory === "all" ? messages : messages.filter((m) => m.type === activeCategory), [activeCategory, messages]);
  const effectiveState = pageState === "loading" ? "loading" : pageState === "empty" || visibleMessages.length === 0 ? "empty" : "default";

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1F2430]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-5 py-8 md:px-8 lg:py-10">
        <header className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[#5B4FD6]"><MessageSquareText className="size-4" />消息中心</div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">消息中心</h1>
                {unreadCount > 0 && <Badge className="min-w-6 justify-center border-0 bg-[#D83B3B] px-2 text-white hover:bg-[#D83B3B]">{unreadCount}</Badge>}
              </div>
              <p className="text-sm leading-6 text-[#687083] md:text-base">查看方案进展、AI 建议、系统通知与客服回复。</p>
            </div>
            <Button variant="outline" disabled={unreadCount === 0} className="w-fit border-[#D8DAE3] bg-white text-[#5B4FD6] hover:border-[#5B4FD6] hover:bg-[#F0EEFF] hover:text-[#5B4FD6]" onClick={() => setMessages((c) => c.map((m) => ({ ...m, unread: false })))}><CheckCheck className="mr-1 size-4" />全部标为已读</Button>
          </div>
          <nav className="overflow-x-auto border-b border-[#E5E7EF]">
            <div className="flex min-w-max gap-7">
              {CATEGORY_OPTIONS.map((cat) => {
                const isActive = activeCategory === cat.value;
                return (
                  <button key={cat.value} type="button" aria-current={isActive ? "page" : undefined}
                    className={cn("relative flex min-h-12 items-center gap-2 border-b-2 px-0 text-sm font-medium transition-colors", isActive ? "border-[#5B4FD6] text-[#5B4FD6]" : "border-transparent text-[#687083] hover:text-[#1F2430]")}
                    onClick={() => { if (cat.value !== activeCategory) { setPageState("loading"); setActiveCategory(cat.value); setTimeout(() => setPageState("default"), 350); } }}>
                    <span>{cat.label}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs tabular-nums", isActive ? "bg-[#F0EEFF] text-[#5B4FD6]" : "bg-[#EDEEF2] text-[#687083]")}>{categoryCounts[cat.value]}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </header>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold">{CATEGORY_OPTIONS.find((c) => c.value === activeCategory)?.label}消息</h2>
            <span className="text-sm text-[#687083]">{effectiveState === "loading" ? "正在加载消息…" : `共 ${visibleMessages.length} 条`}</span>
          </div>

          {effectiveState === "loading" && <MsgSkeleton />}
          {effectiveState === "empty" && <EmptyMsg isDemo={pageState === "empty"} onReset={() => { setMessages(INITIAL_MESSAGES); setActiveCategory("all"); setPageState("default"); }} />}
          {effectiveState === "default" && (
            <Card className="overflow-hidden rounded-xl border-[#E5E7EF] bg-white py-0 shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-[#E5E7EF]">
                  {visibleMessages.map((m) => {
                    const cfg = TYPE_CONFIG[m.type]; const Icon = cfg.icon;
                    return (
                      <article key={m.id} className={cn("group relative transition-colors", m.unread ? "bg-[#FAFAFF] hover:bg-[#F6F5FF]" : "bg-white hover:bg-[#F7F8FA]")}>
                        <button type="button" className="flex w-full items-start gap-3 px-4 py-5 text-left md:gap-4 md:px-6" onClick={() => setMessages((c) => c.map((msg) => msg.id === m.id ? { ...msg, unread: false } : msg))}>
                          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", cfg.iconClassName)}><Icon className="size-5" /></div>
                          <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <Badge variant="outline" className={cn("h-6 shrink-0 rounded-md px-2 font-medium", cfg.badgeClassName)}>{cfg.label}</Badge>
                              <h3 className={cn("min-w-0 text-sm leading-6 text-[#1F2430] md:text-base", m.unread ? "font-semibold" : "font-medium")}>{m.title}</h3>
                              {m.unread && <span className="size-2 shrink-0 rounded-full bg-[#D83B3B]" />}
                            </div>
                            <p className="line-clamp-1 text-sm leading-6 text-[#687083]">{m.summary}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <time dateTime={m.dateTime} className="whitespace-nowrap text-xs text-[#9AA0AE] md:text-sm">{m.time}</time>
                            <ChevronRight className="hidden size-4 text-[#C1C5CF] transition-transform group-hover:translate-x-0.5 group-hover:text-[#5B4FD6] md:block" />
                          </div>
                        </button>
                      </article>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        <footer className="flex flex-col gap-3 border-t border-[#E5E7EF] pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-xs leading-5 text-[#9AA0AE]">消息默认保留 90 天，重要报价与方案信息请及时查看。</p>
          <div className="flex w-fit gap-1 rounded-lg border border-[#E5E7EF] bg-white p-1">
            {(["default","loading","empty"] as PageState[]).map((s) => (
              <button key={s} onClick={() => setPageState(s)} className={cn("rounded-md px-3 py-1.5 text-sm font-medium", pageState === s ? "bg-[#F0EEFF] text-[#5B4FD6]" : "text-[#687083] hover:bg-[#F7F8FA]")}>
                {s === "default" ? "默认态" : s === "loading" ? "加载态" : "空数据态"}
              </button>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}

function MsgSkeleton() {
  return <Card className="overflow-hidden rounded-xl border-[#E5E7EF] bg-white py-0 shadow-sm"><CardContent className="divide-y divide-[#E5E7EF] p-0">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="flex items-start gap-3 px-4 py-5 md:gap-4 md:px-6"><Skeleton className="size-10 shrink-0 rounded-lg bg-[#E5E7EF]" /><div className="flex min-w-0 flex-1 flex-col gap-3"><div className="flex items-center gap-3"><Skeleton className="h-6 w-16 rounded-md bg-[#E5E7EF]" /><Skeleton className={cn("h-5 bg-[#E5E7EF]", i % 2 === 0 ? "w-2/3" : "w-1/2")} /></div><Skeleton className="h-4 w-4/5 bg-[#E5E7EF]" /></div><Skeleton className="h-4 w-16 shrink-0 bg-[#E5E7EF]" /></div>)}</CardContent></Card>;
}

function EmptyMsg({ isDemo, onReset }: { isDemo: boolean; onReset: () => void }) {
  return <Card className="rounded-xl border-dashed border-[#D8DAE3] bg-white shadow-none"><CardHeader className="items-center px-5 py-16 text-center md:py-20"><div className="mb-2 flex size-14 items-center justify-center rounded-xl bg-[#F0EEFF] text-[#5B4FD6]"><Inbox className="size-6" /></div><CardTitle className="text-xl">暂无消息</CardTitle><CardDescription className="max-w-md text-pretty leading-6 text-[#687083]">当前分类下还没有消息。新的方案进展、AI 建议和客服回复会及时出现在这里。</CardDescription>{isDemo && <Button className="mt-3 bg-[#5B4FD6] text-white hover:bg-[#4C41BF]" onClick={onReset}><RefreshCw className="mr-1 size-4" />恢复消息列表</Button>}</CardHeader></Card>;
}
