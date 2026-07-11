import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, Bell, Bot, Building2, CheckCheck,
  Clock3, Copy, FileCheck2, History, Inbox, Lightbulb,
  MessageSquareText, Phone, RefreshCw, Search, Send,
  Sparkles, UserRound, Users, WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ── Types ──

type ActorFilter = "all" | "客户" | "运营" | "AI";
type PageState = "default" | "loading" | "empty";
type FollowUpActor = "客户" | "运营" | "AI";
type FollowUpChannel = "电话" | "微信" | "邮件" | "系统";
type OppStatus = "待跟进" | "需求确认" | "方案制作" | "已报价" | "谈判中";

interface FollowUpRecord {
  id: string;
  time: string;
  dateTime: string;
  actor: FollowUpActor;
  channel: FollowUpChannel;
  content: string;
}

interface FollowUpGroup {
  id: string;
  company: string;
  code: string;
  activityType: string;
  people: string;
  date: string;
  budget: string;
  status: OppStatus;
  avatarColor: string;
  contactName: string;
  contactTitle: string;
  lastFollowUp: string;
  followUps: FollowUpRecord[];
}

interface SmartReminder {
  id: string;
  groupId: string;
  severity: "紧急" | "重要";
  title: string;
  description: string;
  suggestedAction: string;
}

// ── Mock Data ──

const SMART_REMINDERS: SmartReminder[] = [
  {
    id: "r1",
    groupId: "g1",
    severity: "紧急",
    title: "字节跳动 · 3 天未跟进",
    description: "客户处于谈判阶段已 3 天未联系，存在流失风险。客户上次提出预算压缩至 ¥30万，尚未回复调整后方案。",
    suggestedAction: "建议立即电话沟通，发送调整后报价并确认意向",
  },
  {
    id: "r2",
    groupId: "g2",
    severity: "重要",
    title: "蔚来汽车 · 报价 48 小时未回复",
    description: "正式报价单 v2 已发送 48 小时，客户尚未查看确认。活动日期临近（8月15日），需尽快锁定档期。",
    suggestedAction: "建议微信跟进确认报价查看情况，强调档期紧迫性",
  },
];

const STATS = [
  { label: "今日待跟进", value: "5", icon: Clock3, color: "#5B4FD6" },
  { label: "本周逾期", value: "2", icon: AlertTriangle, color: "#C2413B" },
  { label: "本周已完成", value: "12", icon: FileCheck2, color: "#317848" },
  { label: "AI 自动跟进", value: "8", icon: Bot, color: "#2563A9" },
] as const;

const FOLLOW_UP_GROUPS: FollowUpGroup[] = [
  {
    id: "g1",
    company: "字节跳动",
    code: "YLF-20260705-001",
    activityType: "年度盛典",
    people: "500 人",
    date: "7 月 20 日",
    budget: "¥30 万",
    status: "谈判中",
    avatarColor: "#5B4FD6",
    contactName: "王雅琳",
    contactTitle: "行政总监",
    lastFollowUp: "12 分钟前",
    followUps: [
      { id: "f1-1", time: "今天 14:20", dateTime: "2026-07-12T14:20", actor: "AI", channel: "系统", content: "AI 已根据客户反馈调整方案报价，从 ¥32万 优化至 ¥30万，替换 1 名高成本艺人为同级别替代，整体演出效果不变。" },
      { id: "f1-2", time: "昨天 16:30", dateTime: "2026-07-11T16:30", actor: "运营", channel: "微信", content: "与王雅琳确认演出阵容倾向，客户偏好脱口秀+乐队组合，对呼兰和庞博的报价表示满意，但预算需进一步压缩。" },
      { id: "f1-3", time: "7 月 10 日", dateTime: "2026-07-10T10:15", actor: "客户", channel: "电话", content: "提出预算从 35万 压缩到 30万，希望调整方案。同时确认活动日期 7 月 20 日不变，场地已预订北京嘉里中心。" },
      { id: "f1-4", time: "7 月 9 日", dateTime: "2026-07-09T14:00", actor: "运营", channel: "邮件", content: "发送初步方案 v1，包含脱口秀专场（呼兰+庞博）、乐队演出和互动环节，报价 ¥32万。" },
    ],
  },
  {
    id: "g2",
    company: "蔚来汽车",
    code: "YLF-20260703-007",
    activityType: "ET9 上市发布会",
    people: "800 人",
    date: "8 月 15 日",
    budget: "¥50 万",
    status: "已报价",
    avatarColor: "#00C8B8",
    contactName: "李明哲",
    contactTitle: "品牌活动经理",
    lastFollowUp: "1 小时前",
    followUps: [
      { id: "f2-1", time: "今天 11:00", dateTime: "2026-07-12T11:00", actor: "AI", channel: "系统", content: "AI 检测到报价已发送 48 小时未收到回复，自动生成跟进提醒。建议主动联系客户确认报价查看情况。" },
      { id: "f2-2", time: "7 月 9 日", dateTime: "2026-07-09T15:20", actor: "运营", channel: "邮件", content: "发送正式报价单 v2，含场地搭建、灯光音响、演艺人员全套方案，总价 ¥50万。方案包含全息投影互动环节。" },
      { id: "f2-3", time: "7 月 8 日", dateTime: "2026-07-08T14:00", actor: "客户", channel: "微信", content: "确认活动日期 8 月 15 日，场地定在上海国际会展中心 H1 馆，预计 800 人规模，希望突出科技感。" },
    ],
  },
  {
    id: "g3",
    company: "美团",
    code: "YLF-20260708-012",
    activityType: "客户答谢晚宴",
    people: "200 人",
    date: "8 月 8 日",
    budget: "¥18 万",
    status: "需求确认",
    avatarColor: "#FFC700",
    contactName: "陈思雨",
    contactTitle: "市场部高级经理",
    lastFollowUp: "3 小时前",
    followUps: [
      { id: "f3-1", time: "今天 10:30", dateTime: "2026-07-12T10:30", actor: "运营", channel: "电话", content: "首次电话沟通，了解客户预算范围 ¥15-20万，活动调性偏温馨感恩，希望有爵士乐队伴奏和抽奖环节。" },
      { id: "f3-2", time: "今天 09:15", dateTime: "2026-07-12T09:15", actor: "AI", channel: "系统", content: "AI 完成需求结构化识别，提取到 200人、晚宴、¥18万、8月8日 等关键信息，完整度 88%，匹配 3 套备选方案。" },
      { id: "f3-3", time: "昨天 17:00", dateTime: "2026-07-11T17:00", actor: "客户", channel: "系统", content: "客户通过增长工具「预算计算器」提交活动需求，AI 评分 88 分，自动分配至销售队列。" },
    ],
  },
  {
    id: "g4",
    company: "小红书",
    code: "YLF-20260706-003",
    activityType: "品牌共创大会",
    people: "300 人",
    date: "9 月 10 日",
    budget: "¥25 万",
    status: "待跟进",
    avatarColor: "#FF2442",
    contactName: "赵婉清",
    contactTitle: "品牌总监",
    lastFollowUp: "昨天",
    followUps: [
      { id: "f4-1", time: "7 月 9 日", dateTime: "2026-07-09T11:40", actor: "AI", channel: "系统", content: "AI 识别到商机优先级较高（权重 92），客户行业属性匹配度强，建议 24 小时内完成首次触达。" },
      { id: "f4-2", time: "7 月 8 日", dateTime: "2026-07-08T16:20", actor: "客户", channel: "系统", content: "客户通过官网 AI 顾问入口提交需求，活动类型为品牌共创大会，期望融入 KOL 互动环节和沉浸式体验。" },
    ],
  },
  {
    id: "g5",
    company: "滴滴出行",
    code: "YLF-20260704-005",
    activityType: "年度总结大会",
    people: "600 人",
    date: "1 月 15 日",
    budget: "¥35 万",
    status: "方案制作",
    avatarColor: "#FF6B35",
    contactName: "孙浩然",
    contactTitle: "人力资源副总裁",
    lastFollowUp: "2 小时前",
    followUps: [
      { id: "f5-1", time: "今天 13:45", dateTime: "2026-07-12T13:45", actor: "运营", channel: "微信", content: "与孙总确认年会主题方向为「破浪前行」，正在制作方案中。客户特别强调需要高管互动环节和员工抽奖。" },
      { id: "f5-2", time: "昨天 15:00", dateTime: "2026-07-11T15:00", actor: "AI", channel: "系统", content: "AI 生成 3 套方案初稿：脱口秀专场、综艺互动、音乐会+脱口秀混合。根据 600 人规模推荐混合方案。" },
      { id: "f5-3", time: "7 月 8 日", dateTime: "2026-07-08T10:30", actor: "客户", channel: "电话", content: "确认 600 人规模，预算 35 万以内，需要包含餐饮和场地。活动日期初步定在 1 月中旬，地点北京。" },
    ],
  },
  {
    id: "g6",
    company: "商汤科技",
    code: "YLF-20260702-001",
    activityType: "AI 产业峰会",
    people: "400 人",
    date: "9 月 25 日",
    budget: "¥45 万",
    status: "已报价",
    avatarColor: "#4F46E5",
    contactName: "周建国",
    contactTitle: "会议运营负责人",
    lastFollowUp: "7 月 9 日",
    followUps: [
      { id: "f6-1", time: "7 月 9 日", dateTime: "2026-07-09T14:00", actor: "运营", channel: "邮件", content: "发送正式报价单，含主题演讲、圆桌论坛、互动展示区方案，报价 ¥45万。客户已读未回复。" },
      { id: "f6-2", time: "7 月 8 日", dateTime: "2026-07-08T11:30", actor: "AI", channel: "系统", content: "AI 根据客户行业属性推荐科技感强的方案组合，包含全息投影互动和 AI 对话体验区，匹配度 94%。" },
      { id: "f6-3", time: "7 月 7 日", dateTime: "2026-07-07T09:20", actor: "客户", channel: "系统", content: "客户提交峰会需求，期望融入 AI 互动体验环节，预计 400 人规模，预算 ¥40-50万。" },
    ],
  },
];

const ACTOR_FILTERS: { value: ActorFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "客户", label: "客户" },
  { value: "运营", label: "运营" },
  { value: "AI", label: "AI" },
];

const STATUS_STYLE: Record<OppStatus, string> = {
  "待跟进": "border-[#F8DFC2] bg-[#FFF5E8] text-[#A55D12]",
  "需求确认": "border-[#E0DDFF] bg-[#F0EEFF] text-[#5B4FD6]",
  "方案制作": "border-[#D8E9FF] bg-[#EEF6FF] text-[#2563A9]",
  "已报价": "border-[#CFE8D7] bg-[#EEF8F1] text-[#317848]",
  "谈判中": "border-[#F8D0D0] bg-[#FEF0F0] text-[#C2413B]",
};

const ACTOR_STYLE: Record<FollowUpActor, { icon: typeof Bot; dot: string; bg: string; text: string; label: string }> = {
  AI: { icon: Bot, dot: "bg-[#2563A9]", bg: "bg-[#EEF6FF]", text: "text-[#2563A9]", label: "AI" },
  运营: { icon: UserRound, dot: "bg-[#5B4FD6]", bg: "bg-[#F0EEFF]", text: "text-[#5B4FD6]", label: "运营" },
  客户: { icon: Users, dot: "bg-[#317848]", bg: "bg-[#EEF8F1]", text: "text-[#317848]", label: "客户" },
};

const CHANNEL_ICON: Record<FollowUpChannel, typeof Phone> = {
  "电话": Phone,
  "微信": MessageSquareText,
  "邮件": Send,
  "系统": Sparkles,
};

export const Route = createFileRoute("/td-followups")({ component: FollowUpsPage });

function FollowUpsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actorFilter, setActorFilter] = useState<ActorFilter>("all");
  const [pageState, setPageState] = useState<PageState>("default");
  const [selectedId, setSelectedId] = useState(FOLLOW_UP_GROUPS[0]!.id);
  const [scriptRegenerating, setScriptRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [followUpText, setFollowUpText] = useState("");
  const [recorded, setRecorded] = useState(false);

  const actorCounts = useMemo(() => ({
    all: FOLLOW_UP_GROUPS.length,
    客户: FOLLOW_UP_GROUPS.filter((g) => g.followUps.some((f) => f.actor === "客户")).length,
    运营: FOLLOW_UP_GROUPS.filter((g) => g.followUps.some((f) => f.actor === "运营")).length,
    AI: FOLLOW_UP_GROUPS.filter((g) => g.followUps.some((f) => f.actor === "AI")).length,
  }), []);

  const filteredGroups = useMemo(() => {
    let groups = FOLLOW_UP_GROUPS;
    if (actorFilter !== "all") {
      groups = groups.filter((g) => g.followUps.some((f) => f.actor === actorFilter));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      groups = groups.filter((g) =>
        g.company.toLowerCase().includes(q) ||
        g.activityType.toLowerCase().includes(q) ||
        g.followUps.some((f) => f.content.includes(searchQuery))
      );
    }
    return groups;
  }, [actorFilter, searchQuery]);

  const selected = FOLLOW_UP_GROUPS.find((g) => g.id === selectedId) ?? FOLLOW_UP_GROUPS[0]!;
  const effectiveState: "loading" | "empty" | "default" =
    pageState === "loading" ? "loading" : pageState === "empty" || filteredGroups.length === 0 ? "empty" : "default";

  const scriptText = `${selected.contactName}您好，我是演立方的活动顾问。关于您${selected.activityType}的方案，根据您之前提到的预算调整，我们已经优化了报价至${selected.budget}的版本——在不影响演出效果的前提下调整了艺人配置。方案 PDF 我这就发您微信，方便的话今天下午 3 点电话同步一下细节？档期比较紧，想帮您提前锁定场地。`;

  const handleCopy = () => {
    try { navigator.clipboard?.writeText(scriptText); } catch { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRecord = () => {
    if (!followUpText.trim()) return;
    setFollowUpText("");
    setRecorded(true);
    setTimeout(() => setRecorded(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1F2430]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-6 md:px-6 lg:px-8">
        {/* ── Header ── */}
        <header className="flex flex-col gap-3 border-b border-[#E5E7EF] pb-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-[#5B4FD6]">
              <History className="size-4" />跟进中心
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">跟进中心</h1>
            <p className="text-sm text-[#687083]">智能提醒驱动的高效跟进工作台，AI 辅助话术让每一步沟通都精准到位。</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#687083]">
            <span className="size-2 rounded-full bg-[#317848]" />数据更新于今天 14:32
          </div>
        </header>

        {/* ── Smart Reminders (2 cards) ── */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SMART_REMINDERS.map((r) => (
            <Card key={r.id} className={cn("rounded-xl border bg-white shadow-sm", r.severity === "紧急" ? "border-[#F8D0D0]" : "border-[#F8DFC2]")}>
              <CardContent className="flex items-start gap-4 p-4">
                <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", r.severity === "紧急" ? "bg-[#FEF0F0] text-[#C2413B]" : "bg-[#FFF5E8] text-[#A55D12]")}>
                  {r.severity === "紧急" ? <AlertTriangle className="size-5" /> : <Bell className="size-5" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("h-5 rounded px-1.5 text-xs font-medium", r.severity === "紧急" ? "border-[#F8D0D0] bg-[#FEF0F0] text-[#C2413B]" : "border-[#F8DFC2] bg-[#FFF5E8] text-[#A55D12]")}>{r.severity}</Badge>
                    <h3 className="text-sm font-semibold">{r.title}</h3>
                  </div>
                  <p className="text-xs leading-5 text-[#687083]">{r.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-[#5B4FD6]">
                    <Sparkles className="size-3.5" />
                    <span>AI 建议：{r.suggestedAction}</span>
                  </div>
                  <Button size="sm" className="mt-1 w-fit bg-[#5B4FD6] text-white hover:bg-[#4C41BF]" onClick={() => setSelectedId(r.groupId)}>
                    <ArrowRight className="mr-1 size-4" />立即处理
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* ── Stats Bar ── */}
        <Card className="overflow-hidden rounded-xl border-[#E5E7EF] bg-white shadow-sm">
          <CardContent className="grid grid-cols-2 gap-px bg-[#E5E7EF] p-0 md:grid-cols-4">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-3 bg-white px-5 py-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#9AA0AE]">{s.label}</span>
                    <strong className="text-xl font-semibold tabular-nums" style={{ color: s.color }}>{s.value}</strong>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ── Dual-column workspace ── */}
        <section className="grid grid-cols-1 items-start gap-4 md:grid-cols-[40fr_60fr]">
          {/* ═══ LEFT: Follow-up List ═══ */}
          <Card className="overflow-hidden rounded-xl border-[#E5E7EF] bg-white py-0 shadow-sm">
            <CardHeader className="gap-3 border-b border-[#E5E7EF] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">跟进列表</CardTitle>
                  <CardDescription className="mt-1">{filteredGroups.length} 个商机待跟进</CardDescription>
                </div>
                <Badge className="border-0 bg-[#F0EEFF] text-[#5B4FD6] hover:bg-[#F0EEFF]">今日 +5</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9AA0AE]" />
                <Input
                  placeholder="搜索客户名称、活动类型或跟进内容"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-[#E5E7EF] bg-[#F7F8FA] pl-9 text-sm"
                />
              </div>
              <div className="flex gap-1 rounded-lg bg-[#F2F3F5] p-1">
                {ACTOR_FILTERS.map((f) => {
                  const isActive = actorFilter === f.value;
                  return (
                    <button key={f.value} type="button" className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors", isActive ? "bg-white text-[#5B4FD6] shadow-sm" : "text-[#687083] hover:text-[#1F2430]")} onClick={() => setActorFilter(f.value)}>
                      <span>{f.label}</span>
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] tabular-nums", isActive ? "bg-[#F0EEFF] text-[#5B4FD6]" : "bg-[#E5E7EF] text-[#9AA0AE]")}>{actorCounts[f.value]}</span>
                    </button>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent className="max-h-[820px] overflow-y-auto p-2">
              {effectiveState === "loading" && <ListSkeleton />}
              {effectiveState === "empty" && <EmptyList isDemo={pageState === "empty"} onReset={() => { setSearchQuery(""); setActorFilter("all"); setPageState("default"); }} />}
              {effectiveState === "default" && (
                <div className="flex flex-col gap-2">
                  {filteredGroups.map((g) => {
                    const sel = selectedId === g.id;
                    const latest = g.followUps[0]!;
                    const ActorIcon = ACTOR_STYLE[latest.actor].icon;
                    return (
                      <button key={g.id} type="button" className={cn("flex flex-col gap-3 rounded-xl border p-3 text-left transition-colors", sel ? "border-[#BDB7F5] bg-[#FAFAFF]" : "border-transparent bg-white hover:border-[#E5E7EF] hover:bg-[#F7F8FA]")} onClick={() => setSelectedId(g.id)}>
                        <div className="flex w-full items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: g.avatarColor }}>{g.company.slice(0, 1)}</div>
                            <h3 className="truncate text-sm font-semibold">{g.company}</h3>
                          </div>
                          <Badge variant="outline" className={cn("h-6 shrink-0 rounded-md px-2 font-medium", STATUS_STYLE[g.status])}>{g.status}</Badge>
                        </div>
                        <p className="line-clamp-1 text-xs text-[#687083]">{g.activityType} · {g.people} · {g.date} · {g.budget}</p>
                        <div className="flex w-full items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className={cn("flex size-5 shrink-0 items-center justify-center rounded", ACTOR_STYLE[latest.actor].bg, ACTOR_STYLE[latest.actor].text)}><ActorIcon className="size-3" /></span>
                            <span className="truncate text-xs text-[#9AA0AE]">{latest.content}</span>
                          </div>
                          <span className="shrink-0 text-xs text-[#9AA0AE]">{g.lastFollowUp}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ═══ RIGHT: Detail ═══ */}
          <Card className="overflow-hidden rounded-xl border-[#E5E7EF] bg-white py-0 shadow-sm">
            <CardHeader className="border-b border-[#E5E7EF] px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: selected.avatarColor }}>{selected.company.slice(0, 1)}</div>
                    <CardTitle className="text-lg">{selected.company}</CardTitle>
                    <Badge variant="outline" className={cn("h-6 shrink-0 rounded-md px-2 font-medium", STATUS_STYLE[selected.status])}>{selected.status}</Badge>
                  </div>
                  <CardDescription className="mt-1.5">商机编号 {selected.code} · 联系人：{selected.contactName}（{selected.contactTitle}）</CardDescription>
                </div>
                <Button size="sm" className="w-fit shrink-0 bg-[#5B4FD6] text-white hover:bg-[#4C41BF]"><Send className="mr-1 size-4" />立即跟进</Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 p-5">
              {/* Activity Info */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#E5E7EF] p-4 sm:grid-cols-4">
                {[
                  { icon: Building2, label: "活动类型", value: selected.activityType },
                  { icon: Users, label: "参与人数", value: selected.people },
                  { icon: Clock3, label: "活动日期", value: selected.date },
                  { icon: WalletCards, label: "预算范围", value: selected.budget },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-[#9AA0AE]"><Icon className="size-3.5" />{item.label}</div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  );
                })}
              </div>

              {/* Batch Operation Bar */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E0DDFF] bg-[#FAFAFF] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#687083]">已选跟进记录</span>
                  <strong className="text-sm text-[#5B4FD6]">{selected.followUps.length}</strong>
                  <span className="text-sm text-[#9AA0AE]">/ {selected.followUps.length} 条</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-[#D8DAE3] text-[#5B4FD6] hover:border-[#5B4FD6] hover:bg-[#F0EEFF] hover:text-[#5B4FD6]"><Bell className="mr-1 size-3.5" />批量提醒</Button>
                  <Button size="sm" variant="outline" className="border-[#D8DAE3] text-[#317848] hover:border-[#317848] hover:bg-[#EEF8F1] hover:text-[#317848]"><CheckCheck className="mr-1 size-3.5" />标记已处理</Button>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">跟进时间线</h2>
                  <div className="flex items-center gap-3 text-xs text-[#9AA0AE]">
                    {(["AI", "运营", "客户"] as FollowUpActor[]).map((a) => {
                      const cfg = ACTOR_STYLE[a];
                      return <span key={a} className="flex items-center gap-1"><span className={cn("size-2 rounded-full", cfg.dot)} />{cfg.label}</span>;
                    })}
                  </div>
                </div>
                <ol className="flex flex-col gap-0">
                  {selected.followUps.map((f, i) => {
                    const cfg = ACTOR_STYLE[f.actor];
                    const ActorIcon = cfg.icon;
                    const ChannelIcon = CHANNEL_ICON[f.channel];
                    const isLast = i === selected.followUps.length - 1;
                    return (
                      <li key={f.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", cfg.bg, cfg.text)}><ActorIcon className="size-4" /></div>
                          {!isLast && <div className="w-px flex-1 bg-[#E5E7EF]" />}
                        </div>
                        <div className={cn("flex flex-1 flex-col gap-1.5 rounded-xl border p-3", isLast ? "mb-0" : "mb-3", f.actor === "AI" ? "border-[#E0DDFF] bg-[#FAFAFF]" : "border-[#E5E7EF] bg-white")}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("h-5 rounded px-1.5 text-xs font-medium border-0", cfg.bg, cfg.text)}>{cfg.label}</Badge>
                            <span className="flex items-center gap-1 text-xs text-[#9AA0AE]"><ChannelIcon className="size-3" />{f.channel}</span>
                            <time dateTime={f.dateTime} className="text-xs text-[#9AA0AE]">{f.time}</time>
                          </div>
                          <p className="text-sm leading-6 text-[#1F2430]">{f.content}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* AI Script Module */}
              <div className="flex flex-col gap-4 rounded-xl border border-[#E0DDFF] bg-[#FAFAFF] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#5B4FD6]"><Lightbulb className="size-4" /></div>
                    <div>
                      <h3 className="text-sm font-semibold">AI 推荐跟进话术</h3>
                      <p className="mt-1 text-xs text-[#687083]">基于客户当前阶段和沟通历史生成</p>
                    </div>
                  </div>
                  <Badge className="border-0 bg-[#EEF8F1] text-[#317848] hover:bg-[#EEF8F1]">置信度 高</Badge>
                </div>
                <blockquote className="rounded-lg border-l-2 border-[#5B4FD6] bg-white px-4 py-3 text-sm leading-6 text-[#1F2430]">
                  {scriptText}
                </blockquote>
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" className="bg-[#5B4FD6] text-white hover:bg-[#4C41BF]"><Send className="mr-1 size-4" />一键发送微信</Button>
                  <Button size="sm" variant="outline" className="border-[#D8DAE3] text-[#5B4FD6] hover:border-[#5B4FD6] hover:bg-[#F0EEFF] hover:text-[#5B4FD6]" onClick={handleCopy}>
                    <Copy className="mr-1 size-4" />{copied ? "已复制" : "复制"}
                  </Button>
                  <Button size="sm" variant="outline" disabled={scriptRegenerating} className="border-[#D8DAE3] text-[#5B4FD6] hover:border-[#5B4FD6] hover:bg-[#F0EEFF] hover:text-[#5B4FD6]" onClick={() => { setScriptRegenerating(true); setTimeout(() => setScriptRegenerating(false), 850); }}>
                    <RefreshCw className={cn("mr-1 size-4", scriptRegenerating && "animate-spin")} />{scriptRegenerating ? "生成中…" : "再生成"}
                  </Button>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex flex-col gap-3 rounded-xl border border-[#E5E7EF] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">新增跟进记录</h3>
                  <span className="text-xs text-[#9AA0AE]">Enter 提交</span>
                </div>
                <Textarea
                  placeholder="输入本次跟进内容，如沟通结果、客户反馈、下一步计划..."
                  value={followUpText}
                  onChange={(e) => setFollowUpText(e.target.value)}
                  className="min-h-[80px] resize-none border-[#E5E7EF] text-sm"
                />
                <div className="flex items-center justify-between">
                  <Button size="sm" variant="outline" className="border-[#D8DAE3] text-[#5B4FD6] hover:border-[#5B4FD6] hover:bg-[#F0EEFF] hover:text-[#5B4FD6]"><Bot className="mr-1 size-4" />AI 辅助撰写</Button>
                  <Button size="sm" className="bg-[#5B4FD6] text-white hover:bg-[#4C41BF]" disabled={!followUpText.trim()} onClick={handleRecord}>
                    <Send className="mr-1 size-4" />{recorded ? "已记录" : "记录跟进"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Demo State Toggle ── */}
        <footer className="flex flex-col gap-3 border-t border-[#E5E7EF] pt-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-[#9AA0AE]">跟进记录默认保留 180 天，已成交商机自动归档。</p>
          <div className="flex w-fit gap-1 rounded-lg border border-[#E5E7EF] bg-white p-1">
            {(["default", "loading", "empty"] as PageState[]).map((s) => (
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

// ── Skeleton ──

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border border-[#E5E7EF] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-lg bg-[#E5E7EF]" />
              <Skeleton className="h-4 w-24 bg-[#E5E7EF]" />
            </div>
            <Skeleton className="h-6 w-16 rounded-md bg-[#E5E7EF]" />
          </div>
          <Skeleton className="h-3 w-3/4 bg-[#E5E7EF]" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-1/2 bg-[#E5E7EF]" />
            <Skeleton className="h-3 w-16 bg-[#E5E7EF]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty State ──

function EmptyList({ isDemo, onReset }: { isDemo: boolean; onReset: () => void }) {
  return (
    <Card className="rounded-xl border-dashed border-[#D8DAE3] bg-white shadow-none">
      <CardHeader className="items-center px-5 py-14 text-center">
        <div className="mb-2 flex size-14 items-center justify-center rounded-xl bg-[#F0EEFF] text-[#5B4FD6]"><Inbox className="size-6" /></div>
        <CardTitle className="text-lg">暂无跟进记录</CardTitle>
        <CardDescription className="max-w-sm text-pretty leading-6 text-[#687083]">当前筛选条件下没有跟进记录。试试切换分类标签或清空搜索关键词。</CardDescription>
        {isDemo && <Button className="mt-3 bg-[#5B4FD6] text-white hover:bg-[#4C41BF]" onClick={onReset}><RefreshCw className="mr-1 size-4" />恢复列表</Button>}
      </CardHeader>
    </Card>
  );
}
