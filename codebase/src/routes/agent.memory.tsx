import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Brain,
  Sparkles,
  ShieldCheck,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";

export const Route = createFileRoute("/agent/memory")({
  component: MemoryCenter,
  head: () => ({
    meta: [
      { title: "AI 记忆中心 · 演立方" },
      {
        name: "description",
        content: "查看、编辑并撤回 AI 关于你的每一条记忆。记忆可解释、可追溯、可遗忘。",
      },
    ],
  }),
});

type MemScope = "identity" | "preference" | "history" | "boundary";
type Mem = {
  id: string;
  scope: MemScope;
  text: string;
  source: string;
  time: string;
  usedIn: string[];
  sensitive?: boolean;
};

const SCOPE_META: Record<MemScope, { label: string; tone: string; desc: string }> = {
  identity: { label: "身份画像", tone: "text-primary", desc: "你是谁、代表什么组织" },
  preference: {
    label: "偏好",
    tone: "text-[color:var(--state-ai)]",
    desc: "你偏爱的风格、审美、决策方式",
  },
  history: {
    label: "历史",
    tone: "text-[color:var(--state-verified)]",
    desc: "过往合作、成功/失败经验",
  },
  boundary: {
    label: "禁区",
    tone: "text-[color:var(--state-warning,#c98a2b)]",
    desc: "红线,AI 不会越过",
  },
};

const SEED: Mem[] = [
  {
    id: "m1",
    scope: "identity",
    text: "服务方「星野文化」· 上海 · 主打企业年会/发布会 · 团队 6 人",
    source: "服务方档案 · 已核验",
    time: "3 天前",
    usedIn: ["生成报价话术", "客户匹配"],
  },
  {
    id: "m2",
    scope: "preference",
    text: "偏好克制的视觉语言,不使用紫色渐变,不使用「震撼」「打造」等词",
    source: "对话反馈 · 你 3 次纠正",
    time: "本周",
    usedIn: ["方案文案", "分享页文案"],
  },
  {
    id: "m3",
    scope: "history",
    text: "与协作方「星耀灯光」合作 4 次,3 次准时、1 次延迟(冬季华东场地音响接口)",
    source: "复盘沉淀 · 项目 P-231/P-198/…",
    time: "1 天前",
    usedIn: ["协作方推荐", "风险提示"],
  },
  {
    id: "m4",
    scope: "boundary",
    text: "不承接金融衍生品发布会;年会不安排 22:30 后节目",
    source: "偏好设置 · 硬禁区",
    time: "上月",
    usedIn: ["需求过滤", "接单前置校验"],
    sensitive: true,
  },
  {
    id: "m5",
    scope: "preference",
    text: "客户预算敏感,报价倾向先给「必要项」再列「可选项」",
    source: "AI 观察 · 5 次报价路径",
    time: "本月",
    usedIn: ["报价拆解模板"],
  },
];

function MemoryCenter() {
  const [mems, setMems] = useState<Mem[]>(SEED);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const forget = (id: string) => setMems((xs) => xs.filter((m) => m.id !== id));
  const startEdit = (m: Mem) => {
    setEditing(m.id);
    setDraft(m.text);
  };
  const commit = (id: string) => {
    setMems((xs) => xs.map((m) => (m.id === id ? { ...m, text: draft } : m)));
    setEditing(null);
  };

  const byScope = (s: MemScope) => mems.filter((m) => m.scope === s);

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10">
      <Link
        to="/agent"
        className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        ← 返回 AI 顾问
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs tracking-[0.14em] text-muted-foreground">
            <Brain className="h-4 w-4 text-[color:var(--state-ai)]" />
            AI 记忆中心
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            AI 关于你的一切,都可以在这里看见、修改或让它遗忘
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            每一条记忆都会告诉你「从哪来」「正在被用在哪」。你随时可以纠正或删除,
            AI 会在下一次生成时立即生效。
          </p>
        </div>
        <div className="rounded-lg border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/[0.06] px-3 py-2 text-xs text-[color:var(--state-verified)]">
          <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
          记忆仅用于你的账户,不会用于训练平台通用模型
        </div>
      </div>

      <div className="mt-6">
        <AgentInlineSuggestion title="记忆卫生小提示">
          最近你 3 次纠正了「震撼/打造」类词,是否把这条升级为强偏好?升级后 AI 会在文案生成阶段
          直接过滤这些词。
        </AgentInlineSuggestion>
      </div>

      <div className="mt-8 space-y-8">
        {(Object.keys(SCOPE_META) as MemScope[]).map((s) => {
          const meta = SCOPE_META[s];
          const list = byScope(s);
          return (
            <section key={s}>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <div className={`text-sm font-semibold ${meta.tone}`}>{meta.label}</div>
                  <div className="text-xs text-muted-foreground">{meta.desc}</div>
                </div>
                <div className="text-xs text-muted-foreground">{list.length} 条</div>
              </div>
              {list.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/50 px-4 py-6 text-center text-xs text-muted-foreground">
                  这个维度还没有记忆
                </div>
              ) : (
                <div className="space-y-2">
                  {list.map((m) => {
                    const shown = !m.sensitive || reveal[m.id];
                    const isEditing = editing === m.id;
                    return (
                      <div
                        key={m.id}
                        className="surface-1 rounded-xl border border-border/60 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            {isEditing ? (
                              <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                className="w-full rounded-md border border-border bg-background p-2 text-sm text-foreground"
                                rows={2}
                              />
                            ) : (
                              <div className="text-sm text-foreground/90">
                                {m.sensitive && !shown ? (
                                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                                    <Lock className="h-3 w-3" /> 敏感记忆已隐藏
                                  </span>
                                ) : (
                                  m.text
                                )}
                              </div>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <EvidenceLine source={m.source} time={m.time} />
                              <div className="flex flex-wrap gap-1">
                                {m.usedIn.map((u) => (
                                  <span
                                    key={u}
                                    className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                                  >
                                    正被用于 · {u}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            {m.sensitive && !isEditing && (
                              <button
                                aria-label={shown ? "隐藏" : "查看"}
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                onClick={() =>
                                  setReveal((r) => ({ ...r, [m.id]: !r[m.id] }))
                                }
                              >
                                {shown ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                            {isEditing ? (
                              <>
                                <button
                                  className="rounded-md p-1.5 text-[color:var(--state-verified)] hover:bg-[color:var(--state-verified)]/10"
                                  onClick={() => commit(m.id)}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                                  onClick={() => setEditing(null)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                  onClick={() => startEdit(m)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => forget(m.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border border-border/60 bg-card/40 p-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-[color:var(--state-ai)]" />
          遗忘策略
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>· 一次性对话中的信息默认 30 天后自动归档;身份画像除外</li>
          <li>· 你标记为「禁区」的记忆永不过期</li>
          <li>· 撤回一条历史记忆,不会连带删除已经生成的方案/报价</li>
        </ul>
      </div>
    </div>
  );
}
