import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, BadgeCheck, CalendarDays, CheckCircle2, CircleDollarSign,
  Clock3, Headphones, MapPin, Mic2, Music4, PartyPopper, Phone,
  Shield, Sparkles, Star, TrendingUp, Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ── Types ──

type Tier = "经济" | "推荐" | "升级";

interface Artist {
  name: string;
  role: string;
  avatarColor: string;
}

interface TimelineItem {
  time: string;
  title: string;
  desc: string;
  icon: typeof Mic2;
}

interface CostItem {
  label: string;
  percentage: number;
  amount: string;
  color: string;
}

interface ServiceCard {
  icon: typeof Shield;
  title: string;
  desc: string;
  color: string;
}

// ── Data ──

const TIER: Tier = "推荐";

const ACTIVITY_INFO = [
  { icon: PartyPopper, label: "活动类型", value: "年度团队团建" },
  { icon: Users, label: "参与人数", value: "80 人" },
  { icon: Clock3, label: "活动时长", value: "2 天 1 夜" },
  { icon: MapPin, label: "活动场地", value: "上海·滴水湖" },
  { icon: CalendarDays, label: "活动日期", value: "8 月 16–17 日" },
] as const;

const ARTISTS: Artist[] = [
  { name: "呼兰", role: "脱口秀专场", avatarColor: "#5B4FD6" },
  { name: "庞博", role: "脱口秀嘉宾", avatarColor: "#2563A9" },
  { name: "房东的猫", role: "现场乐队", avatarColor: "#317848" },
  { name: "刘旸", role: "互动主持", avatarColor: "#A55D12" },
];

const TIMELINE: TimelineItem[] = [
  { time: "08:30–09:00", title: "签到入场", desc: "主题签到墙·合影留念", icon: Users },
  { time: "09:00–10:00", title: "开场致辞", desc: "年度回顾·战略展望", icon: Sparkles },
  { time: "10:00–12:00", title: "脱口秀专场", desc: "呼兰+庞博定制企业段子", icon: Mic2 },
  { time: "14:00–17:00", title: "户外协作挑战", desc: "分组定向·团队共创", icon: TrendingUp },
  { time: "19:00–21:00", title: "乐队晚宴", desc: "房东的猫现场+自助餐", icon: Music4 },
];

const TOTAL_PRICE = "¥11.8 万";

const COST_BREAKDOWN: CostItem[] = [
  { label: "艺人/演出", percentage: 35, amount: "¥4.13 万", color: "#5B4FD6" },
  { label: "场地", percentage: 25, amount: "¥2.95 万", color: "#2563A9" },
  { label: "设备", percentage: 20, amount: "¥2.36 万", color: "#317848" },
  { label: "执行服务", percentage: 20, amount: "¥2.36 万", color: "#A55D12" },
];

const SERVICES: ServiceCard[] = [
  { icon: Users, title: "专业执行团队", desc: "5 人现场执行·全程跟场", color: "#5B4FD6" },
  { icon: Shield, title: "活动保险", desc: "全员意外险·保额 100 万", color: "#317848" },
  { icon: Headphones, title: "24h 支持", desc: "专属顾问·随时响应", color: "#2563A9" },
];

const TIER_STYLE: Record<Tier, string> = {
  "经济": "border-[#F8DFC2] bg-[#FFF5E8] text-[#A55D12]",
  "推荐": "border-[#E0DDFF] bg-[#F0EEFF] text-[#5B4FD6]",
  "升级": "border-[#D8E9FF] bg-[#EEF6FF] text-[#2563A9]",
};

// ── Route ──

export const Route = createFileRoute("/td-proposal")({ component: ProposalPage });

// ── Main Component ──

function ProposalPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setShowConfirm(false);
    setAccepted(true);
  };

  return (
    <main className="flex min-h-screen justify-center bg-[#F7F8FA]">
      <div className="relative flex min-h-screen w-full max-w-[425px] flex-col bg-white shadow-sm">
        {/* ── Cover ── */}
        <section className="flex flex-col items-center gap-6 bg-gradient-to-b from-[#5B4FD6] to-[#3D33B3] px-6 py-12 text-white">
          <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            <span className="text-xs font-medium">演立方 · 专属活动方案</span>
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-2xl font-bold leading-tight">华东销售团队年度团建</h1>
            <p className="text-sm text-white/80">字节跳动 · 字节跳动科技有限公司</p>
            <Badge variant="outline" className={cn("h-7 rounded-md border-0 px-3 text-sm font-semibold", "bg-white/20 text-white")}>{TIER}档方案</Badge>
          </div>
        </section>

        {/* ── Transition ── */}
        <section className="flex flex-col items-center gap-2 px-6 py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#F0EEFF] text-[#5B4FD6]">
            <Star className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-[#1F2430]">为你专属定制</h2>
          <p className="max-w-[300px] text-sm leading-6 text-[#687083]">基于你 80 人规模、两天一夜、轻松互动的需求，我们为你打造了一场融合脱口秀、户外协作和音乐晚宴的专属团建方案。</p>
        </section>

        {/* ── Activity Info Grid ── */}
        <section className="px-5 pb-6">
          <Card className="rounded-xl border-[#E5E7EF] bg-white shadow-sm">
            <CardContent className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-[#E5E7EF] p-0">
              {ACTIVITY_INFO.map((item, i) => {
                const Icon = item.icon;
                const isLastRow = i >= ACTIVITY_INFO.length - 2;
                return (
                  <div key={item.label} className={cn("flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center", i % 3 !== 2 && "border-r border-[#E5E7EF]", !isLastRow && i < 3 && "border-b border-[#E5E7EF]", i === 4 && "col-span-3 border-t border-[#E5E7EF]")}>
                    <Icon className="size-4 text-[#5B4FD6]" />
                    <span className="text-xs text-[#9AA0AE]">{item.label}</span>
                    <span className="text-sm font-medium text-[#1F2430]">{item.value}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        {/* ── Artist Lineup ── */}
        <section className="px-5 pb-6">
          <div className="mb-3 flex items-center gap-2">
            <Mic2 className="size-4 text-[#5B4FD6]" />
            <h2 className="text-base font-semibold">艺人阵容</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ARTISTS.map((artist) => (
              <Card key={artist.name} className="flex items-center gap-3 rounded-xl border-[#E5E7EF] bg-white shadow-sm">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: artist.avatarColor }}>
                    {artist.name.slice(0, 1)}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-[#1F2430]">{artist.name}</span>
                    <span className="truncate text-xs text-[#9AA0AE]">{artist.role}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="px-5 pb-6">
          <div className="mb-3 flex items-center gap-2">
            <Clock3 className="size-4 text-[#5B4FD6]" />
            <h2 className="text-base font-semibold">环节流程</h2>
          </div>
          <Card className="rounded-xl border-[#E5E7EF] bg-white shadow-sm">
            <CardContent className="p-4">
              <ol className="flex flex-col gap-0">
                {TIMELINE.map((item, i) => {
                  const Icon = item.icon;
                  const isLast = i === TIMELINE.length - 1;
                  return (
                    <li key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F0EEFF] text-[#5B4FD6]">
                          <Icon className="size-4" />
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-[#E5E7EF]" />}
                      </div>
                      <div className={cn("flex flex-1 flex-col gap-1 rounded-xl border border-[#E5E7EF] p-3", isLast ? "mb-0" : "mb-3")}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-[#1F2430]">{item.title}</span>
                          <span className="shrink-0 text-xs font-medium tabular-nums text-[#5B4FD6]">{item.time}</span>
                        </div>
                        <p className="text-xs leading-5 text-[#687083]">{item.desc}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* ── Cost ── */}
        <section className="px-5 pb-6">
          <div className="mb-3 flex items-center gap-2">
            <CircleDollarSign className="size-4 text-[#5B4FD6]" />
            <h2 className="text-base font-semibold">费用明细</h2>
          </div>
          <Card className="overflow-hidden rounded-xl border-[#E5E7EF] bg-white shadow-sm">
            {/* Total */}
            <div className="flex flex-col items-center gap-1 bg-gradient-to-b from-[#FAFAFF] to-[#F7F8FA] px-5 py-6">
              <span className="text-sm text-[#687083]">方案总价</span>
              <span className="text-4xl font-bold tabular-nums text-[#5B4FD6]">{TOTAL_PRICE}</span>
              <Badge variant="outline" className={cn("mt-1 h-6 rounded-md px-2 text-xs font-medium", TIER_STYLE[TIER])}>{TIER}档</Badge>
            </div>
            {/* Breakdown */}
            <CardContent className="flex flex-col gap-4 border-t border-[#E5E7EF] p-4">
              {COST_BREAKDOWN.map((item) => (
                <div key={item.label} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-[#1F2430]">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums text-[#1F2430]">{item.amount}</span>
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
        </section>

        {/* ── Service Guarantee ── */}
        <section className="px-5 pb-28">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="size-4 text-[#5B4FD6]" />
            <h2 className="text-base font-semibold">服务保障</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SERVICES.map((svc) => {
              const Icon = svc.icon;
              return (
                <Card key={svc.title} className="flex flex-col items-center gap-2 rounded-xl border-[#E5E7EF] bg-white p-3 text-center shadow-sm">
                  <div className="flex size-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${svc.color}15`, color: svc.color }}>
                    <Icon className="size-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#1F2430]">{svc.title}</span>
                  <span className="text-[10px] leading-4 text-[#9AA0AE]">{svc.desc}</span>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── Fixed bottom CTA ── */}
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[425px] items-center justify-between gap-3 border-t border-[#E5E7EF] bg-white px-5 pb-6 pt-4">
          <a href="tel:400-888-0000" className="flex flex-col items-center gap-0.5 text-[#687083]">
            <div className="flex size-9 items-center justify-center rounded-lg border border-[#E5E7EF]">
              <Phone className="size-4 text-[#5B4FD6]" />
            </div>
            <span className="text-[10px]">客服电话</span>
          </a>
          {accepted ? (
            <Button size="lg" className="flex-1 bg-[#317848] text-white hover:bg-[#317848]" disabled>
              <CheckCircle2 className="mr-1 size-5" />方案已接受
            </Button>
          ) : (
            <Button size="lg" className="flex-1 bg-[#5B4FD6] text-white hover:bg-[#4C41BF]" onClick={() => setShowConfirm(true)}>
              接受方案<ArrowRight className="ml-1 size-5" />
            </Button>
          )}
        </div>

        {/* ── Accept Confirmation Dialog ── */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent className="max-w-[340px] overflow-hidden rounded-2xl border-[#E5E7EF] p-0">
            <DialogHeader className="gap-2 px-6 pt-6 text-center">
              <div className="mx-auto mb-1 flex size-14 items-center justify-center rounded-full bg-[#F0EEFF]">
                <BadgeCheck className="size-7 text-[#5B4FD6]" />
              </div>
              <DialogTitle className="text-lg font-semibold">确认接受方案？</DialogTitle>
              <DialogDescription className="text-sm text-[#687083]">接受后活动顾问将在 24 小时内联系你，确认活动细节并推进后续流程。</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 px-6 pb-6 pt-4">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-[#FAFAFF] px-4 py-3">
                <CircleDollarSign className="size-4 text-[#5B4FD6]" />
                <span className="text-sm text-[#687083]">方案总价</span>
                <strong className="text-base text-[#5B4FD6]">{TOTAL_PRICE}</strong>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-[#D8DAE3] text-[#687083] hover:bg-[#F7F8FA]" onClick={() => setShowConfirm(false)}>
                  再想想
                </Button>
                <Button className="flex-1 bg-[#5B4FD6] text-white hover:bg-[#4C41BF]" onClick={handleAccept}>
                  <CheckCircle2 className="mr-1 size-4" />确认接受
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
