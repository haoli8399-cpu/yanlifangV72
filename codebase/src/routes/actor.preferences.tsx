import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Ban, Heart, ShieldCheck, X, Plus } from "lucide-react";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";
import { demoToast } from "@/lib/demo-toast";
import { AgentPanelProvider } from "@/components/yanlicube/agent-side-panel";
import { ActorBottomTabs } from "@/components/yanlicube/actor-h5-nav";

export const Route = createFileRoute("/actor/preferences")({
  head: () => ({
    meta: [
      { title: "演员偏好与禁忌 · 演立方" },
      { name: "description", content: "把你的内容边界、擅长题材、地域偏好告诉 AI,由 AI 在收到邀请时代你初判。" },
    ],
  }),
  component: PreferencesCenter,
});

type Item = { id: string; text: string; hard: boolean };
type Section = { key: "topic" | "audience" | "geo" | "commercial"; label: string; items: Item[] };

const initial: Section[] = [
  {
    key: "topic",
    label: "题材禁忌 / 擅长",
    items: [
      { id: "t1", text: "不承接房地产年会", hard: true },
      { id: "t2", text: "不做政治与宏观经济梗", hard: true },
      { id: "t3", text: "擅长金融科技从业者观众", hard: false },
      { id: "t4", text: "擅长中场穿插式脱口秀 15–25 分钟", hard: false },
    ],
  },
  {
    key: "audience",
    label: "观众画像",
    items: [
      { id: "a1", text: "回避未成年为主的场次", hard: true },
      { id: "a2", text: "偏好 25–45 岁职场受众", hard: false },
    ],
  },
  {
    key: "geo",
    label: "地域与档期",
    items: [
      { id: "g1", text: "每月最多 4 场,周末优先", hard: false },
      { id: "g2", text: "北京、上海、深圳优先;其他城市需提前 30 天", hard: false },
    ],
  },
  {
    key: "commercial",
    label: "商务边界",
    items: [
      { id: "c1", text: "不接受 15 分钟以下的现场脱口秀", hard: true },
      { id: "c2", text: "不参与客户方内部政治性表态", hard: true },
    ],
  },
];

function PreferencesCenter() {
  const [sections, setSections] = useState(initial);
  const [aiReview, setAiReview] = useState(true);
  const [autoDecline, setAutoDecline] = useState(true);

  const toggleHard = (sk: string, id: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.key !== sk ? s : { ...s, items: s.items.map((it) => (it.id === id ? { ...it, hard: !it.hard } : it)) },
      ),
    );
  const remove = (sk: string, id: string) =>
    setSections((prev) =>
      prev.map((s) => (s.key !== sk ? s : { ...s, items: s.items.filter((it) => it.id !== id) })),
    );
  const add = (sk: string) => {
    const text = window.prompt("添加一条偏好");
    if (!text) return;
    setSections((prev) =>
      prev.map((s) =>
        s.key !== sk
          ? s
          : { ...s, items: [...s.items, { id: crypto.randomUUID(), text, hard: false }] },
      ),
    );
  };

  const hardCount = sections.reduce((a, s) => a + s.items.filter((i) => i.hard).length, 0);
  const softCount = sections.reduce((a, s) => a + s.items.filter((i) => !i.hard).length, 0);

  return (
    <AgentPanelProvider scopeLabel="演员端 · 偏好中心" quickPrompts={["帮我把偏好写得更礼貌", "这条硬禁忌会不会影响我的曝光", "把我近半年拒绝的邀约总结一下"]}>
    <>
    <div className="mx-auto max-w-[1100px] px-4 pb-24 pt-6 sm:px-6 sm:py-8 md:pb-8">
      <Link
        to="/actor"
        className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        ← 演员工作台
      </Link>
      <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        偏好中心 · AI 初判依据
      </div>
      <h1 className="text-2xl font-semibold text-foreground">你的内容边界与偏好</h1>
      <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
        AI 会用这些条目在邀请到达时代你初判:硬性条目=一票否决,柔性条目=建议但你最终决定。你随时可以修改。
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="surface-1 rounded-xl p-4">
          <div className="text-[11px] tracking-wide text-muted-foreground">硬性禁忌</div>
          <div className="mt-1 font-mono text-2xl font-semibold text-[color:var(--state-pending)]">
            {hardCount}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">出现即自动礼貌回绝</div>
        </div>
        <div className="surface-1 rounded-xl p-4">
          <div className="text-[11px] tracking-wide text-muted-foreground">柔性偏好</div>
          <div className="mt-1 font-mono text-2xl font-semibold text-[color:var(--state-ai)]">
            {softCount}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">影响匹配权重与建议</div>
        </div>
        <div className="surface-1 rounded-xl p-4">
          <div className="text-[11px] tracking-wide text-muted-foreground">近 30 天代处理</div>
          <div className="mt-1 font-mono text-2xl font-semibold text-[color:var(--state-verified)]">3</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">AI 已代你回绝 3 项 · 你可回看</div>
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-6 rounded-xl border border-border/60 bg-card/60 p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[color:var(--state-verified)]" />
          <div className="text-sm font-medium text-foreground">AI 代处理规则</div>
        </div>
        <div className="space-y-2 text-sm">
          <Toggle checked={aiReview} onChange={setAiReview} label="AI 收到邀请时先用偏好初判,再通知我" />
          <Toggle checked={autoDecline} onChange={setAutoDecline} label="命中硬性禁忌时,AI 直接以礼貌措辞回绝并同步主服务方" />
          <Toggle checked={false} onChange={() => {}} label="每次代处理都要求我最终确认(会增加你的响应负担)" />
        </div>
      </div>

      {/* Sections */}
      <div className="mt-6 space-y-4">
        {sections.map((s) => (
          <div key={s.key} className="rounded-xl border border-border/60 bg-card/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium text-foreground">{s.label}</div>
              <button
                onClick={() => add(s.key)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> 添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {s.items.map((it) => (
                <div
                  key={it.id}
                  className={cn(
                    "group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px]",
                    it.hard
                      ? "border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 text-[color:var(--state-pending)]"
                      : "border-border bg-secondary text-foreground/85",
                  )}
                >
                  {it.hard ? <Ban className="h-3 w-3" /> : <Heart className="h-3 w-3" />}
                  <span>{it.text}</span>
                  <button
                    onClick={() => toggleHard(s.key, it.id)}
                    className="ml-1 rounded px-1 text-[10px] text-muted-foreground hover:text-foreground"
                    title="切换硬性/柔性"
                  >
                    {it.hard ? "→柔" : "→硬"}
                  </button>
                  <button
                    onClick={() => remove(s.key, it.id)}
                    className="rounded hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {s.items.length === 0 && (
                <div className="text-[11px] text-muted-foreground">未添加任何条目</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <AgentInlineSuggestion title="AI 想向你追问 1 个模糊点">
          你写了"擅长金融科技从业者观众"—— 这个偏好该只影响匹配推荐,还是也用于匹配时的话题选择?你的选择决定 AI 是否会向主服务方主动建议相关内容切入点。
          <div className="mt-2 flex gap-2">
            <button onClick={() => demoToast()} className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] text-primary hover:bg-primary/20">
              仅影响匹配
            </button>
            <button onClick={() => demoToast()} className="rounded-md border border-border bg-secondary px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground">
              也用于话题建议
            </button>
          </div>
        </AgentInlineSuggestion>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3 text-[11px]">
        <div className="text-muted-foreground">
          偏好会与你的档期回复历史一起,构成 AI 决策的完整依据。硬性条目对客户端与主服务方仅显示为"不匹配",不透露具体原因。
        </div>
        <StatusBadge state="verified" label="仅你可见" />
      </div>
    </div>
    <ActorBottomTabs />
    </>
    </AgentPanelProvider>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border/60 bg-background/40 px-3 py-2 text-[12px] text-foreground/90 hover:border-border">
      <span>{label}</span>
      <button
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-secondary",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-all",
            checked ? "left-4" : "left-0.5",
          )}
        />
      </button>
    </label>
  );
}
