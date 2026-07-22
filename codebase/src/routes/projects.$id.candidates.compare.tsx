import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EvidenceLine, AgentInlineSuggestion } from "@/components/yanlicube/agent";
import { ArrowLeft, CheckCircle2, MinusCircle, Scale } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/projects/$id/candidates/compare")({
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: () => ({ meta: [{ title: "候选服务方 · 深度对比 · 演立方" }] }),
  component: CompareCandidates,
  ...stageBoundaries({ backTo: "/projects/$id/candidates", backLabel: "返回上一环节", homeTo: "/projects/$id" }),
});

type Row = {
  key: string;
  label: string;
  values: (string | { text: string; source?: string; tone?: "pos" | "neg" | "neu" })[];
};

const candidates = [
  { id: "ten_houyang", name: "后仰喜剧", city: "上海", fit: 92 },
  { id: "ten_stagecraft", name: "光弦策划", city: "杭州", fit: 78 },
  { id: "ten_calm", name: "静水策划", city: "上海", fit: 71 },
];

const rows: Row[] = [
  {
    key: "scope",
    label: "整体责任范围",
    values: [
      { text: "全案 · 内容 + 演员 + 现场", tone: "pos" },
      { text: "全案 + 舞美自营(视觉更强)", tone: "pos" },
      { text: "全案 · 视觉部分需外部协作", tone: "neg", source: "服务范围声明" },
    ],
  },
  {
    key: "capacity",
    label: "档期确认",
    values: [
      { text: "本月充足 · 声明有效至 12/31", tone: "pos" },
      { text: "1 月第 3 周紧张 · 3 天内锁", tone: "neu" },
      { text: "充足", tone: "pos" },
    ],
  },
  {
    key: "nps",
    label: "近期 NPS",
    values: [
      { text: "63(12 单)", tone: "pos", source: "已核验评价" },
      { text: "58(8 单,1 次变更)", tone: "neu", source: "已核验评价" },
      { text: "66(5 单,私行强)", tone: "pos", source: "已核验评价" },
    ],
  },
  {
    key: "cost",
    label: "报价区间(参考)",
    values: [
      { text: "¥380k – ¥420k" },
      { text: "¥430k – ¥475k · 视觉高潮更强", tone: "neu" },
      { text: "¥360k – ¥410k · 极简路线" },
    ],
  },
  {
    key: "risk",
    label: "风险与提示",
    values: [
      { text: "无未决争议", tone: "pos" },
      { text: "跨城差旅需另计", tone: "neu" },
      { text: "组合履约会引入第二责任边界", tone: "neg" },
    ],
  },
  {
    key: "reference",
    label: "关键匹配证据",
    values: [
      { text: "何轩、方骑均在其签约名单", source: "已核验合作关系" },
      { text: "「古筝 + 灯光」组合有 5 次履约", source: "已核验案例" },
      { text: "3 次头部券商私行答谢经验", source: "已核验案例" },
    ],
  },
];

function toneCls(t?: "pos" | "neg" | "neu") {
  if (t === "pos") return "text-[color:var(--state-verified)]";
  if (t === "neg") return "text-[color:var(--state-expired)]";
  return "text-foreground";
}

function CompareCandidates() {
  const { project } = Route.useLoaderData();
  const [picked, setPicked] = useState<string | null>(null);
  const pickedName = candidates.find((c) => c.id === picked)?.name;

  const mobileCta = (
    <>
      <div className="min-w-0 flex-1 text-[11px] text-muted-foreground">
        {picked ? (
          <>已选 · <span className="font-medium text-foreground">{pickedName}</span></>
        ) : (
          "在下方卡片中选择主服务方"
        )}
      </div>
      <Link
        to="/projects/$id/candidates"
        params={{ id: project.id }}
        className="shrink-0 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
      >
        {picked ? "确认并返回" : "返回列表"}
      </Link>
    </>
  );

  return (
    <>
      <div className="space-y-6">
        <div>
          <Link
            to="/projects/$id/candidates"
            params={{ id: project.id }}
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> 返回候选列表
          </Link>
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
            <Scale className="h-4 w-4 text-primary" /> 深度对比 · 3 家候选
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground sm:text-sm">
            并排看清责任范围、档期、口碑与风险。每一格都可追溯到证据来源,选择前无金额承诺。
          </p>
        </div>

        <AgentInlineSuggestion title="Agent 观察">
          若你更看重「无第二责任边界」,后仰喜剧综合最稳;若视觉高潮是决定项,光弦策划的舞美自营可省一次对接;静水策划适合极简私宴,但方案 B 会引入协作方边界。
        </AgentInlineSuggestion>

        {/* Mobile: 按候选方分卡显示,每卡内竖排维度 */}
        <div className="grid gap-3 md:hidden">
          {candidates.map((c, ci) => {
            const isPicked = picked === c.id;
            return (
              <div
                key={c.id}
                className={`rounded-lg border bg-card/60 p-3 ${
                  isPicked ? "border-primary/60 ring-1 ring-primary/40" : "border-border/60"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.city}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-lg text-primary">{c.fit}</div>
                    <div className="text-[10px] text-muted-foreground">匹配度</div>
                  </div>
                </div>
                <dl className="space-y-2">
                  {rows.map((row) => {
                    const raw = row.values[ci];
                    const val = typeof raw === "string" ? { text: raw } : raw;
                    return (
                      <div key={row.key} className="border-t border-border/40 pt-2">
                        <dt className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {row.label}
                        </dt>
                        <dd className={`text-[13px] ${toneCls((raw as any).tone)}`}>{val.text}</dd>
                        {val.source && (
                          <div className="mt-1">
                            <EvidenceLine source={val.source}>可溯源</EvidenceLine>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </dl>
                <button
                  onClick={() => setPicked(c.id)}
                  className={`mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-medium ${
                    isPicked
                      ? "bg-primary text-primary-foreground"
                      : "border border-primary/40 bg-primary/10 text-primary"
                  }`}
                >
                  {isPicked ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> 已选为主服务方
                    </>
                  ) : (
                    <>选为主服务方</>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Desktop: 表格 */}
        <div className="hidden overflow-hidden rounded-lg border border-border/60 bg-card/60 md:block">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs text-muted-foreground">
              <tr>
                <th className="w-40 px-4 py-3 text-left font-medium">对比维度</th>
                {candidates.map((c) => (
                  <th key={c.id} className="px-4 py-3 text-left font-medium">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{c.name}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{c.city}</div>
                      </div>
                      <span className="font-mono text-primary">{c.fit}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-border/50 align-top">
                  <td className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </td>
                  {row.values.map((v, idx) => {
                    const val = typeof v === "string" ? { text: v } : v;
                    return (
                      <td key={idx} className="px-4 py-3">
                        <div className={`text-sm ${toneCls((v as any).tone)}`}>{val.text}</div>
                        {val.source && (
                          <div className="mt-1">
                            <EvidenceLine source={val.source}>可溯源</EvidenceLine>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t border-border/50 bg-background/40">
                <td className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                  选择
                </td>
                {candidates.map((c) => {
                  const isPicked = picked === c.id;
                  return (
                    <td key={c.id} className="px-4 py-3">
                      <button
                        onClick={() => setPicked(c.id)}
                        className={`inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium ${
                          isPicked
                            ? "bg-primary text-primary-foreground"
                            : "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                        }`}
                      >
                        {isPicked ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> 已选为主服务方
                          </>
                        ) : (
                          <>选为主服务方</>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-4 text-xs text-muted-foreground">
          <div className="mb-1 flex items-center gap-1 text-foreground">
            <MinusCircle className="h-3.5 w-3.5" /> 边界提醒
          </div>
          选定主服务方后,平台不再干预其内部演员、协作方分工;若你希望撤回,可在候选列表点击「撤回授权 · 转人工分配」。
        </div>

        <div className="flex justify-end">
          <StatusBadge state="ai" label="AI 已列出对比 · 由你决策" />
        </div>
      </div>
    </>
  );
}