import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  AlertCircle, ArrowRight, Bot, CheckCircle2, Clock3,
  FileText, Lightbulb, LoaderCircle, MapPin, MessageSquareText,
  RefreshCw, Send, Sparkles, Target, Users,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type ViewMode = "conversation" | "browse";
type BrowseState = "default" | "loading" | "empty" | "error";
type MessageRole = "assistant" | "user";
type Message = { id: number; role: MessageRole; content: string };
type IdentifiedField = { label: string; value: string };

type Recommendation = {
  id: string; label: string; title: string; description: string;
  audience: string; duration: string; location: string; price: string; highlights: string[];
};
type RecentRequest = {
  id: string; title: string; description: string; date: string; status: "已生成方案" | "待完善";
};

const COLORS = {
  brand: "#5B4FD6", brandHover: "#4C41BF", brandSoft: "#F0EEFF", brandBorder: "#E0DDFF",
  page: "#F7F8FA", card: "#FFFFFF", border: "#E5E7EF",
  foreground: "#1F2430", muted: "#687083", subtle: "#9AA0AE",
  successBg: "#EEF8F1", successFg: "#317848", warningBg: "#FFF5E8", warningFg: "#A55D12",
} as const;

const EXAMPLE_PROMPTS = [
  "为 80 人策划一场上海两天一夜的团队团建",
  "设计一场面向高管的年度战略共创会",
  "策划一场有科技感的新品发布会",
];

const INITIAL_MESSAGE: Message = { id: 1, role: "assistant", content: "你好，我是演立方 AI 活动顾问。请告诉我活动类型、参与人数、举办时间和预算范围，我会逐步帮你梳理需求并推荐合适的方案。" };

const RECOMMENDATIONS: Recommendation[] = [
  { id: "r1", label: "最匹配", title: "城市探索 · 团队协作挑战", description: "以城市地标为任务场景，通过分组探索、线索解谜和团队共创，提升成员间的协作效率与信任感。", audience: "50–100 人", duration: "1 天", location: "上海市区", price: "¥8.8 万起", highlights: ["城市定向", "团队共创", "成果复盘"] },
  { id: "r2", label: "创意推荐", title: "未来实验室 · 创新工作坊", description: "将设计思维与沉浸式任务结合，引导团队发现业务机会，并完成从创意到方案原型的共创。", audience: "30–80 人", duration: "1 天", location: "室内场地", price: "¥6.6 万起", highlights: ["设计思维", "跨组协作", "原型展示"] },
  { id: "r3", label: "热门方案", title: "山野同行 · 轻户外团建", description: "结合自然徒步、轻量协作任务和营地交流，帮助团队释放压力、建立更真实的连接。", audience: "40–120 人", duration: "2 天 1 夜", location: "江浙周边", price: "¥11.8 万起", highlights: ["自然徒步", "营地交流", "轻量挑战"] },
];

const RECENT_REQUESTS: RecentRequest[] = [
  { id: "req1", title: "华东销售团队季度团建", description: "约 80 人，希望增强跨区域销售团队之间的协作与交流。", date: "今天 10:24", status: "已生成方案" },
  { id: "req2", title: "年度管理层战略共创会", description: "为期两天，包含战略研讨、团队共识和行动计划制定。", date: "昨天 16:40", status: "已生成方案" },
  { id: "req3", title: "新能源产品发布活动", description: "突出科技感与可持续理念，预计邀请约 300 位嘉宾。", date: "7 月 8 日", status: "待完善" },
  { id: "req4", title: "新员工文化融入活动", description: "帮助新员工快速了解企业文化，并建立跨部门伙伴关系。", date: "7 月 5 日", status: "已生成方案" },
];

const AI_REPLIES = [
  "已识别活动类型、人数规模和活动场景。请问计划在哪个城市举办？期望的活动时长是多久？",
  "城市和时长信息已记录。你希望活动整体呈现什么风格？是轻松互动型、商务正式型，还是两者兼顾？另外请告诉我大致预算范围。",
  "信息已非常完整，我为你匹配了 3 套方案。你可以查看右侧推荐，也可以继续补充特殊需求（如双语主持、企业定制段子等）。",
];

function getRequirementState(round: number): { progress: number; identified: IdentifiedField[]; missing: string[] } {
  if (round === 0) return { progress: 0, identified: [], missing: ["活动类型", "人数规模", "活动场景", "活动时长", "举办城市", "风格偏好", "预算范围", "特殊需求"] };
  if (round === 1) return { progress: 38, identified: [{ label: "活动类型", value: "团队团建" }, { label: "人数规模", value: "约 80 人" }, { label: "活动场景", value: "户外拓展" }], missing: ["活动时长", "举办城市", "风格偏好", "预算范围", "特殊需求"] };
  if (round === 2) return { progress: 70, identified: [{ label: "活动类型", value: "团队团建" }, { label: "人数规模", value: "约 80 人" }, { label: "活动场景", value: "户外拓展" }, { label: "举办城市", value: "上海" }, { label: "活动时长", value: "两天一夜" }, { label: "风格偏好", value: "轻松互动" }], missing: ["预算范围", "特殊需求"] };
  return { progress: 94, identified: [{ label: "活动类型", value: "团队团建" }, { label: "人数规模", value: "约 80 人" }, { label: "活动场景", value: "户外拓展" }, { label: "举办城市", value: "上海" }, { label: "活动时长", value: "两天一夜" }, { label: "风格偏好", value: "轻松互动" }, { label: "预算范围", value: "约 12 万元" }], missing: ["特殊需求"] };
}

export const Route = createFileRoute("/v0-demo")({ component: AgentHomePage });

function AgentHomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("conversation");
  const [browseState, setBrowseState] = useState<BrowseState>("default");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [round, setRound] = useState(0);
  const [isReplying, setIsReplying] = useState(false);
  const requirementState = useMemo(() => getRequirementState(round), [round]);

  function sendMessage(value = prompt) {
    const content = value.trim();
    if (!content || isReplying) return;
    const nextRound = Math.min(round + 1, 3);
    setMessages((c) => [...c, { id: Date.now(), role: "user", content }]);
    setPrompt(""); setIsReplying(true);
    setTimeout(() => {
      setMessages((c) => [...c, { id: Date.now() + 1, role: "assistant", content: AI_REPLIES[nextRound - 1] }]);
      setRound(nextRound); setIsReplying(false);
    }, 650);
  }

  return (
    <main className="min-h-screen text-[#1F2430]" style={{ backgroundColor: COLORS.page }}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-5 py-8 md:px-8 lg:px-12 lg:py-10">
        <header className="flex flex-col gap-5 border-b border-[#E5E7EF] pb-7 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-3xl flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-[#5B4FD6]"><Sparkles className="size-4" />AI 活动顾问</div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">今天想策划什么活动？</h1>
            <p className="text-pretty text-sm leading-6 text-[#687083] md:text-base">通过对话补充活动需求，AI 将实时识别关键信息并推荐匹配方案。</p>
          </div>
          <div className="flex w-fit gap-1 rounded-xl border border-[#E5E7EF] bg-white p-1">
            <button onClick={() => setViewMode("conversation")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "conversation" ? "bg-[#F0EEFF] text-[#5B4FD6]" : "text-[#687083] hover:bg-[#F7F8FA]"}`}><MessageSquareText className="size-4" />对话模式</button>
            <button onClick={() => setViewMode("browse")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === "browse" ? "bg-[#F0EEFF] text-[#5B4FD6]" : "text-[#687083] hover:bg-[#F7F8FA]"}`}><FileText className="size-4" />浏览模式</button>
          </div>
        </header>

        {viewMode === "conversation" ? (
          <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-5">
            {/* Left: Chat */}
            <Card className="overflow-hidden rounded-xl border-[#E5E7EF] bg-white shadow-sm md:col-span-3">
              <CardHeader className="flex-row items-center justify-between gap-4 border-b border-[#E5E7EF]">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#5B4FD6] text-white"><Bot className="size-5" /></div>
                  <div><CardTitle className="text-base">AI 需求访谈</CardTitle><CardDescription className="mt-1">{round < 3 ? `需求确认第 ${round + 1} 轮，共 3 轮` : "需求信息已基本完整"}</CardDescription></div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setMessages([INITIAL_MESSAGE]); setPrompt(""); setRound(0); setIsReplying(false); }}><RefreshCw className="mr-1 size-4" />重新开始</Button>
              </CardHeader>
              <CardContent className="flex min-h-[390px] max-h-[520px] flex-col gap-4 overflow-y-auto bg-[#FAFAFF] p-5 md:p-6">
                {messages.map((m) => (
                  <div key={m.id} className={m.role === "assistant" ? "flex items-start gap-3" : "flex items-start justify-end gap-3"}>
                    {m.role === "assistant" && <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#5B4FD6]"><Bot className="size-4" /></div>}
                    <div className={m.role === "assistant" ? "max-w-[84%] rounded-xl rounded-tl-sm border border-[#E0DDFF] bg-white px-4 py-3 text-sm leading-6" : "max-w-[84%] rounded-xl rounded-tr-sm bg-[#5B4FD6] px-4 py-3 text-sm leading-6 text-white"}>{m.content}</div>
                    {m.role !== "assistant" && <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1F2430] text-white"><Users className="size-4" /></div>}
                  </div>
                ))}
                {isReplying && (
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#5B4FD6]"><Bot className="size-4" /></div>
                    <div className="flex items-center gap-2 rounded-xl rounded-tl-sm border border-[#E0DDFF] bg-white px-4 py-3 text-sm text-[#687083]"><LoaderCircle className="size-4 animate-spin text-[#5B4FD6]" />正在识别你的需求…</div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="block border-t border-[#E5E7EF] p-5">
                <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                  {round === 0 && (
                    <div className="flex flex-wrap gap-2">
                      {EXAMPLE_PROMPTS.map((ex) => (
                        <button key={ex} type="button" disabled={isReplying} className="inline-flex items-center gap-1.5 rounded-md border border-[#E0DDFF] bg-white px-3 py-2 text-sm text-[#5B4FD6] hover:border-[#5B4FD6] hover:bg-[#F0EEFF] disabled:opacity-50" onClick={() => sendMessage(ex)}><Lightbulb className="size-3.5" />{ex}</button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-end gap-3">
                    <Textarea id="conv-prompt" value={prompt} rows={2} maxLength={1000} disabled={isReplying} placeholder={round === 0 ? "描述你的活动需求…" : "回复 AI 的问题，或继续补充其他要求…"} className="min-h-20 resize-none border-[#D8DAE3] bg-white leading-6 focus-visible:border-[#5B4FD6]" onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
                    <Button type="submit" size="icon" disabled={!prompt.trim() || isReplying} className="size-10 shrink-0 bg-[#5B4FD6] text-white hover:bg-[#4C41BF]">{isReplying ? <LoaderCircle className="animate-spin" /> : <Send />}</Button>
                  </div>
                  <p className="text-xs text-[#9AA0AE]">按 Enter 发送，Shift + Enter 换行</p>
                </form>
              </CardFooter>
            </Card>

            {/* Right: Requirements + Recommendations */}
            <aside className="flex flex-col gap-5 md:col-span-2">
              <Card className="rounded-xl border-[#E5E7EF] bg-white shadow-sm">
                <CardHeader className="gap-4">
                  <div><CardTitle className="text-lg">当前需求进度</CardTitle><CardDescription className="mt-1">AI 将根据对话实时更新识别结果</CardDescription></div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm"><span className="font-medium">匹配度</span><strong className="text-[#5B4FD6]">{requirementState.progress}%</strong></div>
                    <Progress value={requirementState.progress} className="h-2 bg-[#E5E7EF] [&>div]:bg-[linear-gradient(90deg,#5B4FD6,#00875A)]" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  {requirementState.identified.length === 0 ? (
                    <div className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#E0DDFF] bg-[#FAFAFF] px-5 text-center">
                      <MessageSquareText className="size-6 text-[#5B4FD6]" />
                      <p className="text-sm font-medium">等待你的第一条需求描述</p>
                      <p className="text-xs leading-5 text-[#687083]">AI 会自动提取活动类型、人数、时间与预算等信息。</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3">
                        <h3 className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="size-4 text-[#317848]" />已识别信息</h3>
                        <dl className="flex flex-wrap gap-2">
                          {requirementState.identified.map((f) => (
                            <div key={f.label} className="flex items-center gap-1 rounded-full bg-[#EEF8F1] px-3 py-1.5 text-xs text-[#317848]"><dt>{f.label}：</dt><dd className="font-medium">{f.value}</dd></div>
                          ))}
                        </dl>
                      </div>
                      {requirementState.missing.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <h3 className="flex items-center gap-2 text-sm font-semibold"><AlertCircle className="size-4 text-[#A55D12]" />缺失信息（建议追问）</h3>
                          <div className="flex flex-wrap gap-2">{requirementState.missing.map((item) => <Badge key={item} className="border-0 bg-[#FFF5E8] font-normal text-[#A55D12] hover:bg-[#FFF5E8]">{item}</Badge>)}</div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl border-[#E5E7EF] bg-white shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div><CardTitle className="text-lg">AI 推荐方案</CardTitle><CardDescription className="mt-1">根据当前需求动态匹配</CardDescription></div>
                    {requirementState.progress >= 75 && <Badge className="border-0 bg-[#F0EEFF] text-[#5B4FD6] hover:bg-[#F0EEFF]">3 套</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  {requirementState.progress < 75 ? (
                    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#E5E7EF] bg-[#F7F8FA] px-6 text-center">
                      <Sparkles className="size-7 text-[#9AA0AE]" />
                      <p className="text-sm font-semibold">暂无推荐方案</p>
                      <p className="text-xs leading-5 text-[#687083]">补充活动时间与预算，AI 会为你生成 3 套推荐方案</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {RECOMMENDATIONS.map((item, i) => (
                        <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-[#E5E7EF] p-4 transition-colors hover:border-[#BDB7F5]">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="mb-1 flex items-center gap-2"><span className="text-xs font-medium text-[#5B4FD6]">方案 {i + 1}</span>{i === 0 && <Badge className="border-0 bg-[#F0EEFF] text-[#5B4FD6] hover:bg-[#F0EEFF]">最匹配</Badge>}</div>
                              <h3 className="text-sm font-semibold leading-5">{item.title}</h3>
                            </div>
                            <strong className="shrink-0 text-sm text-[#5B4FD6]">{item.price}</strong>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#687083]"><span>{item.audience}</span><span>{item.duration}</span><span>{item.location}</span></div>
                          <Button size="sm" variant={i === 0 ? "default" : "outline"} className={i === 0 ? "bg-[#5B4FD6] text-white hover:bg-[#4C41BF]" : "border-[#D8DAE3] text-[#5B4FD6] hover:bg-[#F0EEFF] hover:text-[#5B4FD6]"}>获取方案<ArrowRight className="ml-1 size-4" /></Button>
                        </article>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        ) : (
          /* Browse Mode */
          <div className="flex flex-col gap-8">
            <Card className="overflow-hidden rounded-xl border-[#E0DDFF] bg-[#FAFAFF] shadow-sm">
              <CardHeader className="border-b border-[#E0DDFF]">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#5B4FD6] text-white"><Sparkles className="size-5" /></div>
                  <div><CardTitle className="text-lg">描述你的活动需求</CardTitle><CardDescription className="mt-1">信息越具体，生成的活动建议越贴近你的目标。</CardDescription></div>
                </div>
              </CardHeader>
              <CardContent className="p-5 md:p-7">
                <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setBrowseState("loading"); setTimeout(() => setBrowseState("default"), 700); }}>
                  <Textarea id="browse-prompt" value={prompt} rows={4} disabled={browseState === "loading"} placeholder="例如：我们计划在上海为 80 人组织一场两天一夜的团队团建……" className="min-h-28 resize-none border-[#D8DAE3] bg-white leading-6 focus-visible:border-[#5B4FD6]" onChange={(e) => setPrompt(e.target.value)} />
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-wrap gap-2">{EXAMPLE_PROMPTS.map((ex) => <button key={ex} type="button" className="inline-flex items-center gap-1.5 rounded-md border border-[#E0DDFF] bg-white px-3 py-2 text-sm text-[#5B4FD6] hover:bg-[#F0EEFF]" onClick={() => setPrompt(ex)}><Lightbulb className="size-3.5" />{ex}</button>)}</div>
                    <Button type="submit" disabled={!prompt.trim() || browseState === "loading"} className="shrink-0 bg-[#5B4FD6] text-white hover:bg-[#4C41BF]">{browseState === "loading" ? <><LoaderCircle className="mr-1 size-4 animate-spin" />生成中</> : <><Send className="mr-1 size-4" />生成方案</>}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            <div className="flex flex-wrap gap-1">{(["default", "loading", "empty", "error"] as BrowseState[]).map((s) => <button key={s} onClick={() => setBrowseState(s)} className={`rounded-md px-3 py-1.5 text-sm font-medium ${browseState === s ? "bg-[#F0EEFF] text-[#5B4FD6]" : "text-[#687083] hover:bg-[#F7F8FA]"}`}>{{ default: "默认态", loading: "加载态", empty: "空数据态", error: "错误态" }[s]}</button>)}</div>
            {browseState === "loading" && <BrowseLoading />}
            {browseState === "empty" && <BrowseEmpty />}
            {browseState === "error" && <BrowseError onRetry={() => setBrowseState("default")} />}
            {browseState === "default" && <BrowseDefault />}
          </div>
        )}
      </div>
    </main>
  );
}

function BrowseDefault() {
  return (<>
    <section className="flex flex-col gap-5">
      <div className="flex items-start gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#5B4FD6]"><Target className="size-4" /></div><div><h2 className="text-xl font-semibold">为你推荐</h2><p className="mt-1 text-sm text-[#687083]">根据常见活动目标精选的方案方向。</p></div></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{RECOMMENDATIONS.map((r) => (
        <Card key={r.id} className="rounded-xl border-[#E5E7EF] bg-white shadow-sm">
          <CardHeader className="gap-3"><Badge className="w-fit border-0 bg-[#F0EEFF] text-[#5B4FD6] hover:bg-[#F0EEFF]">{r.label}</Badge><CardTitle className="text-lg">{r.title}</CardTitle><CardDescription className="line-clamp-3 leading-6">{r.description}</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-4"><div className="grid grid-cols-3 gap-3 text-xs text-[#687083]"><span className="flex items-center gap-1.5"><Users className="size-3.5 text-[#9AA0AE]" />{r.audience}</span><span className="flex items-center gap-1.5"><Clock3 className="size-3.5 text-[#9AA0AE]" />{r.duration}</span><span className="flex items-center gap-1.5"><MapPin className="size-3.5 text-[#9AA0AE]" />{r.location}</span></div><div className="flex flex-wrap gap-2">{r.highlights.map((h) => <Badge key={h} variant="outline">{h}</Badge>)}</div></CardContent>
          <CardFooter><Button className="w-full bg-[#5B4FD6] text-white hover:bg-[#4C41BF]">查看方案详情<ArrowRight className="ml-1 size-4" /></Button></CardFooter>
        </Card>
      ))}</div>
    </section>
    <section className="flex flex-col gap-5">
      <div className="flex items-start gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#5B4FD6]"><FileText className="size-4" /></div><div><h2 className="text-xl font-semibold">最近需求</h2><p className="mt-1 text-sm text-[#687083]">继续查看或完善你近期提交的活动需求。</p></div></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{RECENT_REQUESTS.map((r) => (
        <Card key={r.id} className="rounded-xl border-[#E5E7EF] bg-white shadow-sm">
          <CardHeader className="gap-3"><div className="flex items-center justify-between gap-3"><Badge className={r.status === "已生成方案" ? "border-0 bg-[#EEF8F1] text-[#317848] hover:bg-[#EEF8F1]" : "border-0 bg-[#FFF5E8] text-[#A55D12] hover:bg-[#FFF5E8]"}>{r.status}</Badge><span className="text-xs text-[#9AA0AE]">{r.date}</span></div><CardTitle className="text-base leading-6">{r.title}</CardTitle></CardHeader>
          <CardContent><p className="line-clamp-3 text-sm leading-6 text-[#687083]">{r.description}</p></CardContent>
          <CardFooter><a className="inline-flex w-full items-center justify-between text-sm font-medium text-[#5B4FD6] hover:text-[#4C41BF]">继续查看<ArrowRight className="size-4" /></a></CardFooter>
        </Card>
      ))}</div>
    </section>
  </>);
}

function BrowseLoading() { return <div className="flex flex-col gap-5"><Skeleton className="h-7 w-40 bg-[#E5E7EF]" /><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Card key={i} className="rounded-xl border-[#E5E7EF] bg-white"><CardHeader className="gap-3"><Skeleton className="h-5 w-20 bg-[#E5E7EF]" /><Skeleton className="h-6 w-4/5 bg-[#E5E7EF]" /><Skeleton className="h-16 w-full bg-[#E5E7EF]" /></CardHeader><CardContent><Skeleton className="h-10 w-full bg-[#E5E7EF]" /></CardContent><CardFooter><Skeleton className="h-9 w-full bg-[#E5E7EF]" /></CardFooter></Card>)}</div></div>; }
function BrowseEmpty() { return <section className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-[#D8DAE3] bg-white p-8 text-center"><div className="flex max-w-md flex-col items-center gap-4"><div className="flex size-14 items-center justify-center rounded-xl bg-[#F0EEFF] text-[#5B4FD6]"><Sparkles className="size-6" /></div><div><h2 className="text-xl font-semibold">还没有可展示的方案</h2><p className="mt-2 text-sm leading-6 text-[#687083]">输入活动目标、参与人数和预算，AI 顾问会为你推荐合适的活动方向。</p></div></div></section>; }
function BrowseError({ onRetry }: { onRetry: () => void }) { return <Alert className="border-[#F0C7C7] bg-[#FFF7F7] text-[#8D2D2D]"><AlertCircle /><AlertTitle>方案加载失败</AlertTitle><AlertDescription className="mt-2 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"><span>暂时无法获取推荐方案，你填写的活动需求不会丢失。</span><Button size="sm" variant="outline" onClick={onRetry}><RefreshCw className="mr-1 size-4" />重新加载</Button></AlertDescription></Alert>; }
