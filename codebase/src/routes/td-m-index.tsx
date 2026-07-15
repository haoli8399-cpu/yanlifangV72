import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Bot, Megaphone, MessageSquareText,
  PartyPopper, Phone, Sparkles, Users, WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ── Types ──

interface SceneCard {
  icon: typeof Users;
  title: string;
  desc: string;
  color: string;
  bg: string;
}

interface CapabilityCard {
  icon: typeof Bot;
  title: string;
  desc: string;
  color: string;
}

// ── Data ──

const SCENE_CARDS: SceneCard[] = [
  { icon: Users, title: "企业团建", desc: "团队拓展·协作挑战", color: "#5B4FD6", bg: "#F0EEFF" },
  { icon: PartyPopper, title: "年会盛典", desc: "年度总结·表彰庆典", color: "#2563A9", bg: "#EEF6FF" },
  { icon: Megaphone, title: "发布会", desc: "新品发布·品牌展示", color: "#317848", bg: "#EEF8F1" },
  { icon: MessageSquareText, title: "客户答谢", desc: "答谢晚宴·关系维护", color: "#A55D12", bg: "#FFF5E8" },
];

const CAPABILITIES: CapabilityCard[] = [
  { icon: Sparkles, title: "智能匹配方案", desc: "AI 根据需求自动生成 3 套匹配方案，精准推荐最合适的活动方向", color: "#5B4FD6" },
  { icon: WalletCards, title: "实时报价预估", desc: "输入人数和时长，30 秒内获取透明报价，费用拆解一目了然", color: "#2563A9" },
  { icon: Bot, title: "专属活动顾问", desc: "24h 在线 AI 顾问 + 资深策划师，随时解答你的活动策划问题", color: "#317848" },
];

const STATS = [
  { value: "2,400+", label: "服务企业" },
  { value: "98%", label: "客户满意度" },
  { value: "3 min", label: "方案生成" },
] as const;

// ── Route ──

export const Route = createFileRoute("/td-m-index")({ component: MobileHomePage });

// ── Main Component ──

function MobileHomePage() {
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen justify-center bg-[#F7F8FA]">
      <div className="relative flex min-h-screen w-full max-w-[425px] flex-col bg-[#F7F8FA] shadow-sm">
        {/* ── Hero ── */}
        <section className="relative flex flex-col gap-6 bg-gradient-to-b from-[#5B4FD6] to-[#3D33B3] px-6 pb-10 pt-12 text-white">
          {/* Top badge */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              <span className="text-xs font-medium">演立方 · AI 驱动的活动策划平台</span>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-3xl font-bold leading-tight">AI 活动策划</h1>
            <p className="text-base text-white/80">3 分钟生成专属活动方案</p>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-bold tabular-nums">{stat.value}</span>
                <span className="text-xs text-white/60">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Start button */}
          <Button size="lg" className="w-full bg-white text-base font-semibold text-[#5B4FD6] hover:bg-white/90">
            开始策划活动
            <ArrowRight className="ml-1 size-5" />
          </Button>
        </section>

        {/* ── Scene Cards (2x2) ── */}
        <section className="px-5 py-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#1F2430]">选择活动场景</h2>
            <span className="text-xs text-[#9AA0AE]">点击开始</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SCENE_CARDS.map((scene) => {
              const Icon = scene.icon;
              const isSel = selectedScene === scene.title;
              return (
                <button key={scene.title} type="button" className={cn("flex flex-col items-start gap-3 rounded-xl border bg-white p-4 text-left transition-all", isSel ? "border-[#5B4FD6] shadow-sm" : "border-[#E5E7EF] hover:border-[#BDB7F5]")} onClick={() => setSelectedScene(scene.title)}>
                  <div className="flex size-10 items-center justify-center rounded-lg" style={{ backgroundColor: scene.bg, color: scene.color }}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-[#1F2430]">{scene.title}</span>
                    <span className="text-xs text-[#9AA0AE]">{scene.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── AI Capabilities ── */}
        <section className="px-5 pb-28">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-[#F0EEFF]">
              <Sparkles className="size-4 text-[#5B4FD6]" />
            </div>
            <h2 className="text-base font-semibold text-[#1F2430]">AI 能力</h2>
          </div>
          <div className="flex flex-col gap-3">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <Card key={cap.title} className="flex items-start gap-4 rounded-xl border-[#E5E7EF] bg-white p-4 shadow-sm transition-colors hover:border-[#BDB7F5]">
                  <CardContent className="flex items-start gap-4 p-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${cap.color}15`, color: cap.color }}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#1F2430]">{cap.title}</h3>
                        <Badge className="border-0 bg-[#F0EEFF] px-1.5 py-0 text-[10px] font-medium text-[#5B4FD6] hover:bg-[#F0EEFF]">AI</Badge>
                      </div>
                      <p className="text-xs leading-5 text-[#687083]">{cap.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── Floating CTA ── */}
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[425px] border-t border-[#E5E7EF] bg-white px-5 pb-6 pt-4">
          <div className="flex items-center gap-3">
            <a href="tel:400-888-0000" className="flex flex-col items-center gap-0.5">
              <div className="flex size-11 items-center justify-center rounded-lg border border-[#E5E7EF]">
                <Phone className="size-4 text-[#5B4FD6]" />
              </div>
            </a>
            <Button size="lg" className="flex-1 bg-[#5B4FD6] text-base font-semibold text-white hover:bg-[#4C41BF]">
              免费获取方案
              <ArrowRight className="ml-1 size-5" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
