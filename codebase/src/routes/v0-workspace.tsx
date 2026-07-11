import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Bot, Building2, CalendarDays, Check, CheckCircle2, CircleDollarSign, Clock3, FileCheck2, Flame, History, Lightbulb, MapPin, MessageSquareText, MoreHorizontal, RefreshCw, Send, Sparkles, Target, TrendingUp, UserRound, Users, WalletCards } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type SortMode = "recommended" | "latest";
type OppStatus = "待跟进" | "需求确认" | "方案制作" | "已报价";

type KpiItem = { label: string; value: string; trend: string; trendDirection: "up" | "down"; comparison: string; icon: typeof TrendingUp };
type Opportunity = { id: string; company: string; status: OppStatus; activityType: string; people: string; date: string; budget: string; priority: "高"|"中"|"低"; score: number; lastFollowUp: string; updatedAt: number };
type Solution = { id: string; title: string; type: string; match: number; price: string; duration: string; highlights: string[] };

const KPI_ITEMS: KpiItem[] = [
  { label: "今日新增商机", value: "18", trend: "12.5%", trendDirection: "up", comparison: "较昨日", icon: Target },
  { label: "待跟进商机", value: "36", trend: "8.3%", trendDirection: "down", comparison: "较昨日", icon: Clock3 },
  { label: "本月已报价", value: "82", trend: "18.6%", trendDirection: "up", comparison: "较上月", icon: FileCheck2 },
  { label: "本月成交额", value: "¥286.4 万", trend: "24.2%", trendDirection: "up", comparison: "较上月", icon: CircleDollarSign },
];

const OPPORTUNITIES: Opportunity[] = [
  { id: "o1", company: "星河科技有限公司", status: "需求确认", activityType: "年度团队团建", people: "80 人", date: "8 月 16–17 日", budget: "12–15 万", priority: "高", score: 96, lastFollowUp: "12 分钟前", updatedAt: 6 },
  { id: "o2", company: "华东智造集团", status: "待跟进", activityType: "客户答谢会", people: "200 人", date: "9 月上旬", budget: "25 万", priority: "高", score: 91, lastFollowUp: "38 分钟前", updatedAt: 5 },
  { id: "o3", company: "远景生物医药", status: "方案制作", activityType: "战略共创会", people: "45 人", date: "8 月 8 日", budget: "8–10 万", priority: "中", score: 86, lastFollowUp: "今天 10:24", updatedAt: 4 },
  { id: "o4", company: "云启消费品牌", status: "已报价", activityType: "新品发布会", people: "300 人", date: "9 月 20 日", budget: "35 万", priority: "中", score: 82, lastFollowUp: "昨天 18:40", updatedAt: 3 },
  { id: "o5", company: "海川物流服务", status: "待跟进", activityType: "新员工融入", people: "120 人", date: "时间待定", budget: "6–8 万", priority: "低", score: 68, lastFollowUp: "7 月 9 日", updatedAt: 2 },
];

const SOLUTIONS: Solution[] = [
  { id: "s1", title: "城市探索 · 团队协作挑战", type: "城市团建", match: 96, price: "¥12.6 万", duration: "2 天 1 夜", highlights: ["城市定向", "主题晚宴", "成果复盘"] },
  { id: "s2", title: "未来实验室 · 创新共创营", type: "主题共创", match: 91, price: "¥13.8 万", duration: "2 天 1 夜", highlights: ["设计思维", "跨组协作", "原型路演"] },
  { id: "s3", title: "山野同行 · 轻户外团建", type: "轻户外", match: 87, price: "¥14.5 万", duration: "2 天 1 夜", highlights: ["自然徒步", "营地活动", "团队晚宴"] },
];

const STATUS_STEPS: OppStatus[] = ["待跟进", "需求确认", "方案制作", "已报价"];

function StatusBadge({ status }: { status: OppStatus }) {
  const map: Record<OppStatus, string> = { "待跟进": "border-[#F8DFC2] bg-[#FFF5E8] text-[#A55D12]", "需求确认": "border-[#E0DDFF] bg-[#F0EEFF] text-[#5B4FD6]", "方案制作": "border-[#D8E9FF] bg-[#EEF6FF] text-[#2563A9]", "已报价": "border-[#CFE8D7] bg-[#EEF8F1] text-[#317848]" };
  return <Badge variant="outline" className={cn("h-6 shrink-0 rounded-md px-2 font-medium", map[status])}>{status}</Badge>;
}

export const Route = createFileRoute("/v0-workspace")({ component: WorkspacePage });

function WorkspacePage() {
  const [sortMode, setSortMode] = useState<SortMode>("recommended");
  const [selectedId, setSelectedId] = useState(OPPORTUNITIES[0].id);
  const [status, setStatus] = useState<OppStatus>("需求确认");
  const [isGenerating, setIsGenerating] = useState(false);
  const sorted = useMemo(() => [...OPPORTUNITIES].sort((a, b) => sortMode === "recommended" ? b.score - a.score : b.updatedAt - a.updatedAt), [sortMode]);
  const selected = OPPORTUNITIES.find((o) => o.id === selectedId) ?? OPPORTUNITIES[0];

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1F2430]">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-[#E5E7EF] pb-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2"><div className="flex items-center gap-2 text-sm font-medium text-[#5B4FD6]"><Sparkles className="size-4" />销售作战台</div><h1 className="text-3xl font-semibold">销售作战台</h1><p className="text-sm text-[#687083]">聚焦高价值商机，利用 AI 快速识别需求、生成方案并推进成交。</p></div>
          <div className="flex items-center gap-2 text-sm text-[#687083]"><span className="size-2 rounded-full bg-[#317848]" />数据更新于今天 14:32</div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPI_ITEMS.map((item) => { const Icon = item.icon; const TrendIcon = item.trendDirection === "up" ? ArrowUpRight : ArrowDownRight; const pos = item.trendDirection === "up" || item.label === "待跟进商机"; return (
            <Card key={item.label} className="rounded-xl border-[#E5E7EF] bg-white shadow-sm"><CardContent className="flex items-start justify-between gap-4 p-5"><div className="flex min-w-0 flex-col gap-3"><span className="text-sm font-medium text-[#687083]">{item.label}</span><strong className="truncate text-2xl font-semibold">{item.value}</strong><div className="flex items-center gap-1.5 text-xs"><span className={cn("flex items-center font-semibold", pos ? "text-[#317848]" : "text-[#C2413B]")}><TrendIcon className="size-3.5" />{item.trend}</span><span className="text-[#9AA0AE]">{item.comparison}</span></div></div><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#5B4FD6]"><Icon className="size-5" /></div></CardContent></Card>
          );})}
        </section>

        <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(260px,25fr)_minmax(390px,40fr)_minmax(340px,35fr)]">
          {/* LEFT: Opportunity Queue */}
          <Card className="overflow-hidden rounded-xl border-[#E5E7EF] bg-white py-0 shadow-sm">
            <CardHeader className="gap-4 border-b border-[#E5E7EF] px-4 py-4"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-base">商机队列</CardTitle><CardDescription className="mt-1">{sorted.length} 条待处理商机</CardDescription></div><Badge className="border-0 bg-[#F0EEFF] text-[#5B4FD6] hover:bg-[#F0EEFF]">今日 +18</Badge></div><div className="grid grid-cols-2 gap-1 rounded-lg bg-[#F2F3F5] p-1"><button onClick={() => setSortMode("recommended")} className={cn("rounded-md px-3 py-1.5 text-xs font-medium", sortMode === "recommended" ? "bg-white text-[#5B4FD6] shadow-sm" : "text-[#687083]")}><Sparkles className="mr-1 inline size-3" />推荐排序</button><button onClick={() => setSortMode("latest")} className={cn("rounded-md px-3 py-1.5 text-xs font-medium", sortMode === "latest" ? "bg-white text-[#5B4FD6] shadow-sm" : "text-[#687083]")}><History className="mr-1 inline size-3" />最近更新</button></div></CardHeader>
            <CardContent className="max-h-[950px] overflow-y-auto p-2"><div className="flex flex-col gap-2">{sorted.map((o) => { const sel = selectedId === o.id; return (
              <button key={o.id} type="button" className={cn("flex flex-col gap-3 rounded-xl border p-3 text-left transition-colors", sel ? "border-[#BDB7F5] bg-[#FAFAFF]" : "border-transparent bg-white hover:border-[#E5E7EF] hover:bg-[#F7F8FA]")} onClick={() => { setSelectedId(o.id); setStatus(o.status); }}>
                <div className="flex w-full items-start justify-between gap-2"><div className="flex min-w-0 items-center gap-2">{o.priority === "高" && <Flame className="size-4 shrink-0 text-[#C2413B]" />}<h3 className="truncate text-sm font-semibold">{o.company}</h3></div><StatusBadge status={o.status} /></div>
                <p className="line-clamp-1 text-xs text-[#687083]">{o.activityType} · {o.people} · {o.date} · {o.budget}</p>
                <div className="flex w-full items-center justify-between gap-3"><div className="flex items-center gap-1.5"><span className="text-xs text-[#9AA0AE]">优先权重</span><strong className="text-xs text-[#5B4FD6]">{o.score}</strong></div><span className="text-xs text-[#9AA0AE]">最近跟进 {o.lastFollowUp}</span></div>
              </button>
            );})}</div></CardContent>
          </Card>

          {/* CENTER: Opportunity Details */}
          <Card className="overflow-hidden rounded-xl border-[#E5E7EF] bg-white py-0 shadow-sm">
            <CardHeader className="border-b border-[#E5E7EF] px-5 py-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><CardTitle className="text-lg">{selected.company}</CardTitle><StatusBadge status={status} /></div><CardDescription className="mt-1.5">商机编号 YLF-20260711-082 · 负责人：林悦</CardDescription></div><Button size="sm" className="w-fit shrink-0 bg-[#5B4FD6] text-white hover:bg-[#4C41BF]"><Send className="mr-1 size-4" />立即跟进</Button></div></CardHeader>
            <CardContent className="flex flex-col gap-5 p-5">
              <Alert className="border-[#E0DDFF] bg-[#FAFAFF]"><MessageSquareText className="text-[#5B4FD6]" /><AlertTitle>客户原始需求</AlertTitle><AlertDescription className="mt-1 leading-6 text-[#687083]">"我们计划在 8 月中旬为华东区 80 位员工组织一次两天一夜的年度团建，希望加强跨部门协作。地点优先考虑上海周边，整体预算控制在 15 万以内，最好包含住宿和晚宴。"</AlertDescription></Alert>
              <div><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">结构化信息</h2><span className="text-xs text-[#9AA0AE]">AI 自动提取</span></div><dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#E5E7EF]">{[{ icon: Target, label: "活动类型", value: selected.activityType },{ icon: CalendarDays, label: "活动日期", value: selected.date },{ icon: MapPin, label: "活动场地", value: "上海及周边" },{ icon: Users, label: "参与人数", value: selected.people },{ icon: WalletCards, label: "预算范围", value: selected.budget },{ icon: Clock3, label: "活动时长", value: "2 天 1 夜" }].map((item) => { const Icon = item.icon; return <div key={item.label} className="flex items-start gap-3 border-b border-[#E5E7EF] p-3 last:border-b-0 [&:nth-last-child(-n+2)]:border-b-0 [&:nth-child(odd)]:border-r"><Icon className="mt-0.5 size-4 shrink-0 text-[#9AA0AE]" /><div className="flex min-w-0 flex-col gap-1"><dt className="text-xs text-[#9AA0AE]">{item.label}</dt><dd className="truncate text-sm font-medium">{item.value}</dd></div></div>; })}</dl></div>
              <div className="flex flex-col gap-4 rounded-xl border border-[#E5E7EF] p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">AI 需求识别</h2><p className="mt-1 text-xs text-[#687083]">信息完整度与方案生成依据</p></div><strong className="text-lg text-[#5B4FD6]">86%</strong></div><Progress value={86} className="h-2 bg-[#E5E7EF] [&>div]:bg-[#5B4FD6]" /><div className="flex flex-col gap-3"><div className="flex flex-wrap items-center gap-2"><span className="flex items-center gap-1 text-xs font-medium text-[#317848]"><CheckCircle2 className="size-3.5" />已识别</span>{["企业团建","80 人","上海","两天一夜","12–15 万"].map((f) => <Badge key={f} className="border-0 bg-[#EEF8F1] font-normal text-[#317848] hover:bg-[#EEF8F1]">{f}</Badge>)}</div><div className="flex flex-wrap items-center gap-2"><span className="flex items-center gap-1 text-xs font-medium text-[#A55D12]"><Clock3 className="size-3.5" />待补充</span>{["具体场地","餐饮标准","住宿房型"].map((f) => <Badge key={f} className="border-0 bg-[#FFF5E8] font-normal text-[#A55D12] hover:bg-[#FFF5E8]">{f}</Badge>)}</div></div></div>
              <div><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">状态流转</h2><span className="text-xs text-[#9AA0AE]">点击更新状态</span></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{STATUS_STEPS.map((step, i) => { const curIdx = STATUS_STEPS.indexOf(status); const done = i <= curIdx; return <button key={step} type="button" className={cn("flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border px-2 text-center transition-colors", status === step ? "border-[#5B4FD6] bg-[#F0EEFF] text-[#5B4FD6]" : done ? "border-[#CFE8D7] bg-[#EEF8F1] text-[#317848]" : "border-[#E5E7EF] bg-white text-[#687083] hover:border-[#BDB7F5]")} onClick={() => setStatus(step)}><span className="flex size-5 items-center justify-center rounded-full border text-[10px]">{done ? <Check className="size-3" /> : i + 1}</span><span className="text-xs font-medium">{step}</span></button>; })}</div></div>
            </CardContent>
          </Card>

          {/* RIGHT: AI Solution Panel */}
          <Card className="overflow-hidden rounded-xl border-[#E5E7EF] bg-white py-0 shadow-sm">
            <CardHeader className="border-b border-[#E5E7EF] bg-[#FAFAFF] px-5 py-4"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Bot className="size-5 text-[#5B4FD6]" /><CardTitle className="text-lg">AI 方案生成</CardTitle></div><CardDescription className="mt-1.5">已根据当前需求生成 3 套匹配方案</CardDescription></div><Badge className="border-0 bg-[#F0EEFF] text-[#5B4FD6] hover:bg-[#F0EEFF]">AI 生成</Badge></div></CardHeader>
            <CardContent className="flex flex-col gap-3 p-4">{SOLUTIONS.map((s, i) => (
              <article key={s.id} className={cn("flex flex-col gap-3 rounded-xl border bg-white p-4 transition-colors", isGenerating && "opacity-60", i === 0 ? "border-[#BDB7F5]" : "border-[#E5E7EF] hover:border-[#BDB7F5]")}>
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="mb-1.5 flex flex-wrap items-center gap-2"><Badge variant="outline" className="border-[#E0DDFF] bg-[#F0EEFF] text-[#5B4FD6]">{s.type}</Badge>{i === 0 && <span className="text-xs font-semibold text-[#317848]">最匹配</span>}</div><h3 className="text-sm font-semibold leading-5">{s.title}</h3></div><DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="size-8 shrink-0 text-[#687083]"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuGroup><DropdownMenuItem><Users className="mr-2 size-4" />调整参与人数</DropdownMenuItem><DropdownMenuItem><WalletCards className="mr-2 size-4" />调整预算范围</DropdownMenuItem><DropdownMenuItem><CalendarDays className="mr-2 size-4" />调整活动日期</DropdownMenuItem><DropdownMenuItem><MapPin className="mr-2 size-4" />更换推荐场地</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-[#F7F8FA] px-3 py-2"><div><span className="block text-xs text-[#9AA0AE]">预估报价</span><strong className="text-sm text-[#5B4FD6]">{s.price}</strong></div><div className="text-right"><span className="block text-xs text-[#9AA0AE]">需求匹配</span><strong className="text-sm text-[#317848]">{s.match}%</strong></div></div>
                <div className="flex flex-wrap gap-1.5">{s.highlights.map((h) => <Badge key={h} variant="outline" className="border-[#E5E7EF] bg-white font-normal text-[#687083]">{h}</Badge>)}</div>
                <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5 text-xs text-[#687083]"><Clock3 className="size-3.5" />{s.duration}</span><Button size="sm" variant={i === 0 ? "default" : "outline"} className={i === 0 ? "bg-[#5B4FD6] text-white hover:bg-[#4C41BF]" : "border-[#D8DAE3] text-[#5B4FD6] hover:bg-[#F0EEFF] hover:text-[#5B4FD6]"}>查看方案<ArrowRight className="ml-1 size-4" /></Button></div>
              </article>
            ))}</CardContent>
            <CardFooter className="border-t border-[#E5E7EF] p-4"><Button variant="outline" disabled={isGenerating} className="w-full border-[#D8DAE3] text-[#5B4FD6] hover:border-[#5B4FD6] hover:bg-[#F0EEFF] hover:text-[#5B4FD6]" onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 850); }}><RefreshCw className={cn("mr-1 size-4", isGenerating && "animate-spin")} />{isGenerating ? "正在重新生成…" : "重新生成方案"}</Button></CardFooter>
          </Card>
        </section>

        {/* Bottom: Tabs */}
        <Card className="rounded-xl border-[#E5E7EF] bg-white shadow-sm"><CardContent className="p-4 md:p-5"><Tabs defaultValue="timeline">
          <TabsList className="grid h-auto w-full grid-cols-3 bg-[#F2F3F5] p-1"><TabsTrigger value="timeline"><History className="mr-1 size-4" />跟进时间线</TabsTrigger><TabsTrigger value="script"><MessageSquareText className="mr-1 size-4" />AI 推荐话术</TabsTrigger><TabsTrigger value="action"><Target className="mr-1 size-4" />下一步行动</TabsTrigger></TabsList>
          <TabsContent value="timeline" className="mt-5"><ol className="grid grid-cols-1 gap-3 lg:grid-cols-3">{[{ time: "今天 14:20", title: "AI 完成需求结构化识别", desc: "识别出活动类型、人数、日期、城市和预算，完整度 86%。", icon: Bot },{ time: "今天 13:48", title: "销售林悦完成首次电话沟通", desc: "客户关注跨部门协作效果，希望方案包含住宿及主题晚宴。", icon: UserRound },{ time: "今天 11:36", title: "客户提交活动需求", desc: "来自官网 AI 顾问入口，商机优先权重自动评估为 96。", icon: Building2 }].map((r) => { const Icon = r.icon; return <li key={r.title} className="flex items-start gap-3 rounded-xl border border-[#E5E7EF] p-4"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#5B4FD6]"><Icon className="size-4" /></div><div className="flex flex-col gap-1"><time className="text-xs text-[#9AA0AE]">{r.time}</time><h3 className="text-sm font-semibold">{r.title}</h3><p className="text-xs leading-5 text-[#687083]">{r.desc}</p></div></li>; })}</ol></TabsContent>
          <TabsContent value="script" className="mt-5"><div className="flex flex-col gap-4 rounded-xl border border-[#E0DDFF] bg-[#FAFAFF] p-5"><div className="flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#5B4FD6]"><Lightbulb className="size-4" /></div><div><h3 className="text-sm font-semibold">AI 推荐跟进话术</h3><p className="mt-1 text-xs text-[#687083]">基于客户当前关注点和所处销售阶段生成</p></div></div><blockquote className="rounded-lg border-l-2 border-[#5B4FD6] bg-white px-4 py-3 text-sm leading-6">林总您好，根据我们刚才沟通的 80 人跨部门团建需求，我为您初步匹配了 3 套两天一夜方案，预算均控制在 15 万以内。其中城市探索方案在团队协作和执行稳定性上最符合您的目标。为了进一步锁定场地，我想再确认一下住宿房型与晚宴标准，今天下午方便沟通 10 分钟吗？</blockquote><div className="flex justify-end"><Button size="sm" className="bg-[#5B4FD6] text-white hover:bg-[#4C41BF]"><Send className="mr-1 size-4" />发送给客户</Button></div></div></TabsContent>
          <TabsContent value="action" className="mt-5"><div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[{ title: "确认住宿房型与餐饮标准", desc: "建议今天 16:00 前完成", priority: "高优先级" },{ title: "发送 3 套初步方案摘要", desc: "帮助客户快速确定方向", priority: "中优先级" },{ title: "锁定城市探索方案场地档期", desc: "热门场地需提前预定", priority: "中优先级" }].map((a) => <div key={a.title} className="flex flex-col gap-3 rounded-xl border border-[#E5E7EF] p-4"><div className="flex items-center justify-between"><h4 className="text-sm font-semibold">{a.title}</h4><Badge className={a.priority === "高优先级" ? "border-0 bg-[#FFF5E8] text-[#A55D12]" : "border-0 bg-[#EEF6FF] text-[#2563A9]"}>{a.priority}</Badge></div><p className="text-xs text-[#687083]">{a.desc}</p><Button size="sm" variant="outline" className="w-full border-[#D8DAE3] text-[#5B4FD6]">标记完成</Button></div>)}</div></TabsContent>
        </Tabs></CardContent></Card>
      </div>
    </main>
  );
}
