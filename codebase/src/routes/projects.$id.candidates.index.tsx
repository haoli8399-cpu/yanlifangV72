import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject } from "@/lib/fixtures";
import { getRoutingDecision } from "@/lib/api-client";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EvidenceLine } from "@/components/yanlicube/agent";
import { Building2, CheckCircle2, RotateCcw, UserRoundX, ShieldCheck, Scale } from "lucide-react";
import { useState } from "react";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/projects/$id/candidates/")({
  loader: async ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    let routingData = null;
    try {
      const res = await getRoutingDecision(params.id);
      routingData = res.data;
    } catch {}
    return { project, routingData };
  },
  head: () => ({ meta: [{ title: "候选服务方 · 演立方" }] }),
  component: CandidatesPage,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

type Candidate = {
  id: string;
  name: string;
  tagline: string;
  fitScore: number;
  city: string;
  reasons: { text: string; source: string }[];
  capacity: "available" | "limited" | "unavailable";
  capacityNote: string;
  eligibility: string[];
  historyNps: string;
  responsibleFor: string;
};

const initial: Candidate[] = [
  {
    id: "ten_houyang",
    name: "后仰喜剧",
    tagline: "内容驱动 · 全案统筹见长",
    fitScore: 92,
    city: "上海",
    capacity: "available",
    capacityNote: "本月档期充足 · 声明有效期至 12/31",
    responsibleFor: "全案统筹 · 唯一整体责任方",
    historyNps: "近 12 单平均 NPS 63 · 未见争议",
    reasons: [
      { text: "已核验案例覆盖金融、科技行业年会", source: "证据 · 3 个客户实名评价" },
      { text: "旗下签约脱口秀演员何轩、主持方骑均在你的方案中被指定", source: "证据 · 已核验合作关系" },
      { text: "上海本地演员 · 无跨城差旅溢价", source: "证据 · 城市匹配" },
    ],
    eligibility: ["满足主服务方门禁", "已完成 KYC · 具备开票资质", "含框架合同能力"],
  },
  {
    id: "ten_stagecraft",
    name: "光弦策划",
    tagline: "视觉与舞美路线 · 品牌方案能力强",
    fitScore: 78,
    city: "杭州",
    capacity: "limited",
    capacityNote: "1 月第 3 周档期紧张 · 建议 3 天内锁定",
    responsibleFor: "全案统筹 + 舞美视觉自营",
    historyNps: "近 8 单平均 NPS 58 · 1 次已核实变更",
    reasons: [
      { text: "在方案 B 中「古筝电声 + 灯光」组合有 5 次成熟履约", source: "证据 · 已核验案例" },
      { text: "报价通常比同类方案高 12-18%,视觉高潮更强", source: "证据 · 历史报价样本" },
    ],
    eligibility: ["满足主服务方门禁", "跨城差旅需另计"],
  },
  {
    id: "ten_calm",
    name: "静水策划",
    tagline: "极简内容路线 · 私行客户经验多",
    fitScore: 71,
    city: "上海",
    capacity: "available",
    capacityNote: "档期充足 · 但方案 B 的视觉部分需要外部协作方",
    responsibleFor: "全案统筹 · 视觉部分需协作方",
    historyNps: "近 5 单平均 NPS 66 · 私行客户口碑好",
    reasons: [
      { text: "3 次为头部券商私行做过类似规模的答谢晚宴", source: "证据 · 已核验案例" },
      { text: "缺少自营舞美,方案 B 需要额外协作方(会影响单一责任边界)", source: "证据 · 服务范围声明" },
    ],
    eligibility: ["满足主服务方门禁", "组合履约需增加协作方"],
  },
];

const capacityLabel: Record<Candidate["capacity"], string> = {
  available: "档期可承接",
  limited: "档期紧张",
  unavailable: "暂不可承接",
};

function CandidatesPage() {
  const { project } = Route.useLoaderData() as { project: import("@/lib/fixtures").Project };
  const [chosen, setChosen] = useState<string | null>(project.team.main?.id ?? null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const list = initial.filter((c) => !dismissed.includes(c.id));

  return (
    <>
      <div className="space-y-6">
        <header>
          <h2 className="text-lg font-semibold text-foreground">候选服务方(最多 3 家)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            平台依据你的活动画像、预算、演员偏好、历史评价与档期新鲜度,匿名筛选 3 家候选。理由与证据可溯源,选择前无金额承诺。
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link
              to="/projects/$id/candidates/compare"
              params={{ id: project.id }}
              className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-3 py-1.5 text-primary hover:bg-primary/15"
            >
              <Scale className="h-3 w-3" /> 深度对比 3 家
            </Link>
            <button
              onClick={() => setDismissed(list.map((c) => c.id))}
              className="inline-flex items-center gap-1 rounded border border-border/60 bg-background px-3 py-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" /> 换一批候选
            </button>
            <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded border border-border/60 bg-background px-3 py-1.5 text-muted-foreground hover:text-foreground">
              <UserRoundX className="h-3 w-3" /> 撤回授权 · 转人工分配
            </button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          {list.map((c) => {
            const picked = chosen === c.id;
            return (
              <article
                key={c.id}
                className={`flex flex-col rounded-lg border p-5 transition-colors ${
                  picked
                    ? "border-primary/60 bg-primary/5"
                    : "border-border/60 bg-card/60"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      <Building2 className="h-3 w-3" /> 候选 · {c.city}
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{c.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.tagline}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg text-primary">{c.fitScore}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      匹配度
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <StatusBadge
                    state={
                      c.capacity === "available"
                        ? "verified"
                        : c.capacity === "limited"
                        ? "pending"
                        : "expired"
                    }
                    label={capacityLabel[c.capacity]}
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">{c.capacityNote}</p>
                </div>

                <div className="mb-3 rounded border border-border/50 bg-background/40 p-3">
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    唯一整体责任范围
                  </div>
                  <div className="text-xs text-foreground">{c.responsibleFor}</div>
                </div>

                <div className="mb-3 space-y-1">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    为什么推荐
                  </div>
                  {c.reasons.map((r) => (
                    <EvidenceLine key={r.text} source={r.source}>
                      {r.text}
                    </EvidenceLine>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <ShieldCheck className="mr-1 inline h-3 w-3" /> 适格与信誉
                  </div>
                  <ul className="space-y-1 text-[11px] text-muted-foreground">
                    <li>{c.historyNps}</li>
                    {c.eligibility.map((e) => (
                      <li key={e}>· {e}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => setChosen(c.id)}
                    className={`flex-1 rounded px-3 py-2 text-xs font-medium ${
                      picked
                        ? "bg-primary text-primary-foreground"
                        : "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                    }`}
                  >
                    {picked ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> 已选定为主服务方
                      </span>
                    ) : (
                      "选为主服务方"
                    )}
                  </button>
                  <button
                    onClick={() => setDismissed((d) => [...d, c.id])}
                    className="rounded border border-border/60 bg-background px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    忽略
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            候选已清空。点击「换一批候选」重新生成,或选择「撤回授权 · 转人工分配」。
          </div>
        )}
      </div>
    </>
  );
}