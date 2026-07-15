import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Building2, CalendarDays, CheckCircle2,
  CircleDollarSign, Clock3, Lightbulb, LoaderCircle, Megaphone,
  Moon, PartyPopper, RefreshCw, Sparkles, Target, TrendingUp,
  Users, WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ── Types ──

type Step = "cover" | 1 | 2 | 3 | 4 | "result";
type ActivityType = "企业团建" | "年会" | "发布答谢" | "其他";
type Duration = "半天" | "1天" | "2天1夜";
type BudgetTier = "5万" | "10万" | "20万" | "30万+";
type ResultTier = "经济" | "推荐" | "升级";

interface QuoteResult {
  amount: number;
  tier: ResultTier;
  breakdown: { label: string; percentage: number; amount: number; color: string }[];
}

// ── Configs ──

const TRUST_BADGES = [
  { icon: Target, label: "准确率 98%" },
  { icon: TrendingUp, label: "已服务 2,400+ 企业" },
  { icon: Clock3, label: "3 分钟完成" },
] as const;

const ACTIVITY_OPTIONS: { value: ActivityType; icon: typeof Users; desc: string }[] = [
  { value: "企业团建", icon: Users, desc: "团队拓展、协作挑战" },
  { value: "年会", icon: PartyPopper, desc: "年度盛典、总结表彰" },
  { value: "发布答谢", icon: Megaphone, desc: "新品发布、客户答谢" },
  { value: "其他", icon: Lightbulb, desc: "主题派对、定制活动" },
];

const DURATION_OPTIONS: { value: Duration; icon: typeof Clock3; desc: string }[] = [
  { value: "半天", icon: Clock3, desc: "约 4 小时" },
  { value: "1天", icon: CalendarDays, desc: "约 8 小时" },
  { value: "2天1夜", icon: Moon, desc: "含住宿一晚" },
];

const BUDGET_OPTIONS: { value: BudgetTier; desc: string }[] = [
  { value: "5万", desc: "基础配置" },
  { value: "10万", desc: "进阶配置" },
  { value: "20万", desc: "高级配置" },
  { value: "30万+", desc: "豪华定制" },
];

const TYPE_MULTIPLIER: Record<ActivityType, number> = {
  "企业团建": 1.0,
  "年会": 1.3,
  "发布答谢": 1.2,
  "其他": 0.9,
};

const DURATION_MULTIPLIER: Record<Duration, number> = {
  "半天": 0.6,
  "1天": 1.0,
  "2天1夜": 1.5,
};

const BUDGET_VALUE: Record<BudgetTier, number> = {
  "5万": 50000,
  "10万": 100000,
  "20万": 200000,
  "30万+": 300000,
};

const TIER_STYLE: Record<ResultTier, string> = {
  "经济": "border-[#F8DFC2] bg-[#FFF5E8] text-[#A55D12]",
  "推荐": "border-[#E0DDFF] bg-[#F0EEFF] text-[#5B4FD6]",
  "升级": "border-[#D8E9FF] bg-[#EEF6FF] text-[#2563A9]",
};

const QUESTION_META: Record<number, { title: string; subtitle: string }> = {
  1: { title: "你的活动类型是？", subtitle: "选择最符合的活动类型，帮助我们精准匹配方案" },
  2: { title: "预计参与人数？", subtitle: "拖动滑块调整人数，影响场地和餐饮配置" },
  3: { title: "活动时长多久？", subtitle: "不同时长对应不同的服务配置和人员安排" },
  4: { title: "你的预算范围？", subtitle: "选择预算区间，我们推荐最匹配的方案档位" },
};

const BREAKDOWN_COLORS = ["#5B4FD6", "#2563A9", "#317848", "#A55D12"];

// ── Pricing Logic ──

function computeQuote(activityType: ActivityType, participants: number, duration: Duration): QuoteResult {
  const base = participants * 500;
  const raw = base * TYPE_MULTIPLIER[activityType] * DURATION_MULTIPLIER[duration];
  const amount = Math.round(raw / 1000) * 1000;

  let tier: ResultTier;
  if (amount < 80000) tier = "经济";
  else if (amount < 150000) tier = "推荐";
  else tier = "升级";

  const breakdown = [
    { label: "艺人/演出", percentage: 35, amount: Math.round(amount * 0.35) },
    { label: "场地", percentage: 25, amount: Math.round(amount * 0.25) },
    { label: "设备", percentage: 20, amount: Math.round(amount * 0.2) },
    { label: "执行服务", percentage: 20, amount: Math.round(amount * 0.2) },
  ].map((item, i) => ({ ...item, color: BREAKDOWN_COLORS[i]! }));

  return { amount, tier, breakdown };
}

function formatAmount(n: number): string {
  if (n >= 10000) return `¥${(n / 10000).toFixed(1)}万`;
  return `¥${n.toLocaleString("zh-CN")}`;
}

// ── Route ──

export const Route = createFileRoute("/td-tools-budget")({ component: BudgetCalculatorPage });

// ── Main Component ──

function BudgetCalculatorPage() {
  const [step, setStep] = useState<Step>("cover");
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [participants, setParticipants] = useState(80);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [budget, setBudget] = useState<BudgetTier | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [showLeadDialog, setShowLeadDialog] = useState(false);

  const quote = useMemo(() => {
    if (!activityType || !duration) return null;
    return computeQuote(activityType, participants, duration);
  }, [activityType, participants, duration]);

  const canProceed = useMemo(() => {
    if (step === 1) return activityType !== null;
    if (step === 2) return true;
    if (step === 3) return duration !== null;
    if (step === 4) return budget !== null;
    return false;
  }, [step, activityType, duration, budget]);

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) {
      setCalculating(true);
      setTimeout(() => {
        setCalculating(false);
        setStep("result");
      }, 1200);
    }
  };

  const handleBack = () => {
    if (step === 1) setStep("cover");
    else if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
    else if (step === "result") setStep(4);
  };

  const handleRestart = () => {
    setActivityType(null);
    setParticipants(80);
    setDuration(null);
    setBudget(null);
    setStep("cover");
  };

  return (
    <main className="flex min-h-screen justify-center bg-[#F7F8FA]">
      <div className="relative flex min-h-screen w-full max-w-[425px] flex-col bg-white shadow-sm">
        {step === "cover" && <CoverPage onStart={() => setStep(1)} />}

        {(step === 1 || step === 2 || step === 3 || step === 4) && (
          <QuestionStep
            step={step}
            activityType={activityType}
            setActivityType={setActivityType}
            participants={participants}
            setParticipants={setParticipants}
            duration={duration}
            setDuration={setDuration}
            budget={budget}
            setBudget={setBudget}
            canProceed={canProceed}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {step === "result" && (
          calculating ? <ResultSkeleton /> : quote && budget ? (
            <ResultPage
              quote={quote}
              budget={budget}
              activityType={activityType!}
              participants={participants}
              duration={duration!}
              onRestart={handleRestart}
              onGetFullPlan={() => setShowLeadDialog(true)}
            />
          ) : null
        )}
      </div>

      <LeadDialog open={showLeadDialog} onOpenChange={setShowLeadDialog} />
    </main>
  );
}

// ── Cover Page ──

function CoverPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-[#5B4FD6] to-[#3D33B3] px-6 py-12 text-white">
      <div className="flex flex-1 flex-col items-center justify-center gap-10">
        {/* Icon */}
        <div className="flex size-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm">
          <CircleDollarSign className="size-10" />
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Badge className="border-0 bg-white/15 px-3 py-1 text-xs font-medium text-white hover:bg-white/15">增长工具 · 预算测算</Badge>
          <h1 className="text-2xl font-bold leading-tight">活动预算计算器</h1>
          <p className="text-base text-white/80">3 分钟测算你的活动方案报价</p>
        </div>

        {/* Trust badges */}
        <div className="flex w-full flex-col gap-3">
          {TRUST_BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="size-4" />
                </div>
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start button */}
      <div className="flex flex-col gap-3">
        <Button size="lg" className="w-full bg-white text-base font-semibold text-[#5B4FD6] hover:bg-white/90" onClick={onStart}>
          开始测算
          <ArrowRight className="ml-1 size-5" />
        </Button>
        <p className="text-center text-xs text-white/60">测算结果仅供参考，最终报价以顾问沟通为准</p>
      </div>
    </div>
  );
}

// ── Question Step ──

interface QuestionStepProps {
  step: 1 | 2 | 3 | 4;
  activityType: ActivityType | null;
  setActivityType: (v: ActivityType) => void;
  participants: number;
  setParticipants: (v: number) => void;
  duration: Duration | null;
  setDuration: (v: Duration) => void;
  budget: BudgetTier | null;
  setBudget: (v: BudgetTier) => void;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
}

function QuestionStep(props: QuestionStepProps) {
  const { step, canProceed, onBack, onNext } = props;
  const meta = QUESTION_META[step]!;
  const progressPct = (step / 4) * 100;

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <div className="shrink-0 px-5 pt-6 pb-4">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="flex size-9 items-center justify-center rounded-lg border border-[#E5E7EF] bg-white text-[#687083] transition-colors hover:bg-[#F7F8FA] hover:text-[#1F2430]">
            <ArrowLeft className="size-4" />
          </button>
          <span className="text-sm font-medium text-[#687083]">{step} / 4</span>
          <div className="size-9" />
        </div>
        <Progress value={progressPct} className="mt-3 h-1.5 bg-[#E5E7EF] [&>div]:bg-[#5B4FD6]" />
      </div>

      {/* Question content */}
      <div className="flex flex-1 flex-col px-5">
        <div className="flex flex-col gap-1.5 pb-6">
          <h2 className="text-2xl font-bold tracking-tight">{meta.title}</h2>
          <p className="text-sm text-[#687083]">{meta.subtitle}</p>
        </div>

        <div className="flex flex-1 flex-col">
          {step === 1 && <ActivityQuestion {...props} />}
          {step === 2 && <ParticipantsQuestion {...props} />}
          {step === 3 && <DurationQuestion {...props} />}
          {step === 4 && <BudgetQuestion {...props} />}
        </div>
      </div>

      {/* Bottom button */}
      <div className="shrink-0 px-5 pb-8 pt-4">
        <Button size="lg" className="w-full bg-[#5B4FD6] text-base font-semibold text-white hover:bg-[#4C41BF]" disabled={!canProceed} onClick={onNext}>
          {step === 4 ? "查看结果" : "下一步"}
          <ArrowRight className="ml-1 size-5" />
        </Button>
      </div>
    </div>
  );
}

// ── Q1: Activity Type ──

function ActivityQuestion({ activityType, setActivityType }: QuestionStepProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIVITY_OPTIONS.map((opt) => {
        const sel = activityType === opt.value;
        const Icon = opt.icon;
        return (
          <button key={opt.value} type="button" className={cn("flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all", sel ? "border-[#5B4FD6] bg-[#FAFAFF] shadow-sm" : "border-[#E5E7EF] bg-white hover:border-[#BDB7F5] hover:bg-[#F7F8FA]")} onClick={() => setActivityType(opt.value)}>
            <div className={cn("flex size-10 items-center justify-center rounded-lg transition-colors", sel ? "bg-[#5B4FD6] text-white" : "bg-[#F2F3F5] text-[#687083]")}>
              <Icon className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={cn("text-sm font-semibold", sel ? "text-[#5B4FD6]" : "text-[#1F2430]")}>{opt.value}</span>
              <span className="text-xs text-[#9AA0AE]">{opt.desc}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Q2: Participants Slider ──

function ParticipantsQuestion({ participants, setParticipants }: QuestionStepProps) {
  const pct = ((participants - 10) / (500 - 10)) * 100;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 py-8">
      {/* Current value */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-end gap-1">
          <span className="text-4xl font-bold tabular-nums text-[#5B4FD6]">{participants}</span>
          <span className="pb-1 text-base font-medium text-[#687083]">人</span>
        </div>
        <Badge variant="outline" className="border-[#E0DDFF] bg-[#F0EEFF] text-[#5B4FD6]">
          {participants <= 50 ? "小型活动" : participants <= 150 ? "中型活动" : participants <= 300 ? "大型活动" : "超大型活动"}
        </Badge>
      </div>

      {/* Custom slider */}
      <div className="relative w-full px-2 py-4">
        <div className="relative h-2 w-full rounded-full bg-[#E5E7EF]">
          <div className="absolute h-full rounded-full bg-[#5B4FD6] transition-all duration-150" style={{ width: `${pct}%` }} />
          <div className="absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#5B4FD6] bg-white shadow-md transition-all duration-150" style={{ left: `${pct}%` }} />
        </div>
        <input
          type="range"
          min={10}
          max={500}
          step={10}
          value={participants}
          onChange={(e) => setParticipants(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer touch-none opacity-0"
          aria-label="参与人数"
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex w-full items-center justify-between px-2 text-xs text-[#9AA0AE]">
        <span>10 人</span>
        <span>500 人</span>
      </div>

      {/* Quick presets */}
      <div className="flex w-full flex-wrap gap-2">
        {[50, 100, 200, 300].map((preset) => (
          <button key={preset} type="button" className={cn("flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition-colors", participants === preset ? "border-[#5B4FD6] bg-[#F0EEFF] text-[#5B4FD6]" : "border-[#E5E7EF] bg-white text-[#687083] hover:border-[#BDB7F5]")} onClick={() => setParticipants(preset)}>
            {preset} 人
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Q3: Duration ──

function DurationQuestion({ duration, setDuration }: QuestionStepProps) {
  return (
    <div className="flex flex-col gap-3">
      {DURATION_OPTIONS.map((opt) => {
        const sel = duration === opt.value;
        const Icon = opt.icon;
        return (
          <button key={opt.value} type="button" className={cn("flex items-center gap-4 rounded-xl border p-4 text-left transition-all", sel ? "border-[#5B4FD6] bg-[#FAFAFF] shadow-sm" : "border-[#E5E7EF] bg-white hover:border-[#BDB7F5] hover:bg-[#F7F8FA]")} onClick={() => setDuration(opt.value)}>
            <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors", sel ? "bg-[#5B4FD6] text-white" : "bg-[#F2F3F5] text-[#687083]")}>
              <Icon className="size-5" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className={cn("text-base font-semibold", sel ? "text-[#5B4FD6]" : "text-[#1F2430]")}>{opt.value}</span>
              <span className="text-xs text-[#9AA0AE]">{opt.desc}</span>
            </div>
            <div className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors", sel ? "border-[#5B4FD6] bg-[#5B4FD6]" : "border-[#D8DAE3]")}>
              {sel && <div className="size-2 rounded-full bg-white" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Q4: Budget ──

function BudgetQuestion({ budget, setBudget }: QuestionStepProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {BUDGET_OPTIONS.map((opt) => {
        const sel = budget === opt.value;
        return (
          <button key={opt.value} type="button" className={cn("flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all", sel ? "border-[#5B4FD6] bg-[#FAFAFF] shadow-sm" : "border-[#E5E7EF] bg-white hover:border-[#BDB7F5] hover:bg-[#F7F8FA]")} onClick={() => setBudget(opt.value)}>
            <div className="flex items-center gap-1.5">
              <WalletCards className={cn("size-4", sel ? "text-[#5B4FD6]" : "text-[#9AA0AE]")} />
              <span className={cn("text-lg font-bold", sel ? "text-[#5B4FD6]" : "text-[#1F2430]")}>{opt.value}</span>
            </div>
            <span className="text-xs text-[#9AA0AE]">{opt.desc}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Result Page ──

function ResultPage({
  quote,
  budget,
  activityType,
  participants,
  duration,
  onRestart,
  onGetFullPlan,
}: {
  quote: QuoteResult;
  budget: BudgetTier;
  activityType: ActivityType;
  participants: number;
  duration: Duration;
  onRestart: () => void;
  onGetFullPlan: () => void;
}) {
  const budgetMax = BUDGET_VALUE[budget];
  const isWithinBudget = quote.amount <= budgetMax;
  const diff = Math.abs(quote.amount - budgetMax);

  return (
    <div className="flex flex-1 flex-col">
      {/* Scrollable content */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 rounded-xl bg-gradient-to-b from-[#FAFAFF] to-[#F7F8FA] py-6">
          <div className="flex items-center gap-1.5 text-sm text-[#687083]">
            <Sparkles className="size-4 text-[#5B4FD6]" />
            预估方案报价
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold tabular-nums text-[#5B4FD6]">{formatAmount(quote.amount)}</span>
          </div>
          <Badge variant="outline" className={cn("h-7 rounded-md px-3 text-sm font-semibold", TIER_STYLE[quote.tier])}>{quote.tier}档</Badge>
        </div>

        {/* Budget comparison */}
        <div className={cn("flex items-center justify-between gap-3 rounded-xl border px-4 py-3", isWithinBudget ? "border-[#CFE8D7] bg-[#EEF8F1]" : "border-[#F8DFC2] bg-[#FFF5E8]")}>
          <div className="flex items-center gap-2">
            <div className={cn("flex size-8 items-center justify-center rounded-lg", isWithinBudget ? "bg-[#317848]/10 text-[#317848]" : "bg-[#A55D12]/10 text-[#A55D12]")}>
              {isWithinBudget ? <CheckCircle2 className="size-4" /> : <TrendingUp className="size-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#1F2430]">你的预算：{budget}</span>
              <span className={cn("text-xs", isWithinBudget ? "text-[#317848]" : "text-[#A55D12]")}>
                {isWithinBudget ? `在预算范围内，剩余 ${formatAmount(diff)}` : `超出预算 ${formatAmount(diff)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Activity summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "活动类型", value: activityType },
            { label: "参与人数", value: `${participants} 人` },
            { label: "活动时长", value: duration },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1 rounded-lg border border-[#E5E7EF] bg-white px-3 py-2.5">
              <span className="text-xs text-[#9AA0AE]">{item.label}</span>
              <span className="truncate text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Cost breakdown */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">费用拆解</h3>
            <span className="text-xs text-[#9AA0AE]">AI 智能估算</span>
          </div>
          <Card className="rounded-xl border-[#E5E7EF] bg-white shadow-sm">
            <CardContent className="flex flex-col gap-4 p-4">
              {quote.breakdown.map((item) => (
                <div key={item.label} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-[#1F2430]">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums text-[#1F2430]">{formatAmount(item.amount)}</span>
                      <span className="text-xs tabular-nums text-[#9AA0AE]">{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F2F3F5]">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI tip */}
        <div className="flex items-start gap-3 rounded-xl border border-[#E0DDFF] bg-[#FAFAFF] p-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#5B4FD6]">
            <Sparkles className="size-4" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-[#5B4FD6]">AI 建议</span>
            <p className="text-xs leading-5 text-[#687083]">
              {quote.tier === "经济" && "当前预算可覆盖基础演出和场地。建议优先保证核心演艺环节质量，场地可选择性价比高的酒店会议厅。"}
              {quote.tier === "推荐" && "预算充足，可搭配 2-3 位知名演艺人员及中等规模舞美。建议预留 10% 弹性预算应对临时调整。"}
              {quote.tier === "升级" && "预算宽裕，推荐全息投影互动、知名艺人阵容和定制化主题方案。可安排全程跟拍和直播服务。"}
            </p>
          </div>
        </div>

        {/* Restart */}
        <button type="button" onClick={onRestart} className="flex items-center justify-center gap-1.5 py-2 text-sm text-[#687083] transition-colors hover:text-[#5B4FD6]">
          <RefreshCw className="size-3.5" />
          重新测算
        </button>
      </div>

      {/* Fixed bottom CTA */}
      <div className="shrink-0 border-t border-[#E5E7EF] bg-white px-5 pb-8 pt-4">
        <Button size="lg" className="w-full bg-[#5B4FD6] text-base font-semibold text-white hover:bg-[#4C41BF]" onClick={onGetFullPlan}>
          <CircleDollarSign className="mr-1 size-5" />
          获取完整方案
        </Button>
        <p className="mt-2 text-center text-xs text-[#9AA0AE]">提交后活动顾问将在 24 小时内联系你</p>
      </div>
    </div>
  );
}

// ── Result Skeleton ──

function ResultSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-5 px-5 py-6">
      <div className="flex flex-col items-center gap-3 py-8">
        <Skeleton className="h-4 w-28 bg-[#E5E7EF]" />
        <Skeleton className="h-10 w-44 bg-[#E5E7EF]" />
        <Skeleton className="h-7 w-20 rounded-md bg-[#E5E7EF]" />
      </div>
      <Skeleton className="h-14 w-full rounded-xl bg-[#E5E7EF]" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg bg-[#E5E7EF]" />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24 bg-[#E5E7EF]" />
              <Skeleton className="h-4 w-16 bg-[#E5E7EF]" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full bg-[#E5E7EF]" />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full bg-[#E5E7EF]" />
    </div>
  );
}

// ── Lead Dialog ──

function LeadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [submitState, setSubmitState] = useState<"form" | "loading" | "success">("form");

  const canSubmit = name.trim().length >= 1 && phone.trim().length === 11 && company.trim().length >= 1;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitState("loading");
    setTimeout(() => setSubmitState("success"), 1000);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      if (submitState === "success") {
        setSubmitState("form");
        setName("");
        setPhone("");
        setCompany("");
      }
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[340px] overflow-hidden rounded-2xl border-[#E5E7EF] p-0">
        {submitState === "success" ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-[#EEF8F1]">
              <CheckCircle2 className="size-8 text-[#317848]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <DialogTitle className="text-lg font-semibold">已提交，顾问将稍后联系</DialogTitle>
              <DialogDescription className="text-sm text-[#687083]">活动顾问将在 24 小时内电话联系你，请保持手机畅通。</DialogDescription>
            </div>
            <Button className="mt-2 w-full bg-[#5B4FD6] text-white hover:bg-[#4C41BF]" onClick={() => handleClose(false)}>
              完成
            </Button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <DialogHeader className="gap-1.5 px-6 pt-6">
              <DialogTitle className="text-lg font-semibold">获取完整方案</DialogTitle>
              <DialogDescription className="text-sm text-[#687083]">留下你的联系方式，活动顾问将在 24 小时内为你定制专属方案。</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 px-6 py-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2430]">姓名</label>
                <Input
                  placeholder="请输入你的姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-[#E5E7EF] bg-[#F7F8FA] text-sm"
                  maxLength={20}
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2430]">手机号</label>
                <Input
                  placeholder="请输入 11 位手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="border-[#E5E7EF] bg-[#F7F8FA] text-sm"
                  inputMode="tel"
                  maxLength={11}
                />
              </div>

              {/* Company */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2430]">公司名称</label>
                <Input
                  placeholder="请输入你的公司名称"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="border-[#E5E7EF] bg-[#F7F8FA] text-sm"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="px-6 pb-6">
              <Button
                className="w-full bg-[#5B4FD6] text-white hover:bg-[#4C41BF]"
                disabled={!canSubmit || submitState === "loading"}
                onClick={handleSubmit}
              >
                {submitState === "loading" ? (
                  <>
                    <LoaderCircle className="mr-1 size-4 animate-spin" />
                    提交中…
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-1 size-4" />
                    提交并获取方案
                  </>
                )}
              </Button>
              <p className="mt-3 text-center text-xs text-[#9AA0AE]">提交即同意演立方《隐私政策》，我们承诺保护你的信息安全</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
