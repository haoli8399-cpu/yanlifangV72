import { createFileRoute, notFound } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject } from "@/lib/fixtures";
import { Star, Send, Lock } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/yanlicube/focus-page";

export const Route = createFileRoute("/projects/$id/review")({
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: () => ({ meta: [{ title: "评价 · 演立方" }] }),
  component: ReviewPage,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

type Target = { id: string; name: string; role: string; sub: string[] };

const targets: Target[] = [
  {
    id: "project",
    name: "本次活动整体",
    role: "项目层评价 · 面向公开(脱敏后)",
    sub: ["目标达成", "预算控制", "沟通体验", "AI 顾问价值"],
  },
  {
    id: "ten_houyang",
    name: "后仰喜剧",
    role: "唯一主服务方 · 全案统筹",
    sub: ["整体责任履行", "主动性与预警", "现场执行", "结算清晰度"],
  },
  {
    id: "act_hexuan",
    name: "何轩 · 脱口秀开场",
    role: "演员评价 · 影响演员职业档案",
    sub: ["内容契合度", "现场表现", "配合度"],
  },
  {
    id: "act_arknight",
    name: "方骑 · 双语主持",
    role: "演员评价",
    sub: ["现场表现", "配合度"],
  },
];

function ReviewPage() {
  const { project } = Route.useLoaderData();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [publish, setPublish] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  if (project.stage !== "completed") {
    return (
      <EmptyState
        icon={Star}
        title="活动结束后才能提交评价"
        description="评价分 3 层:项目整体 / 主服务方 / 每位演员。评价会脱敏后沉淀到平台信誉体系,是同行判断服务方能力的关键证据。"
        primary={{ label: "查看当前进度", to: `/projects/${project.id}` }}
        secondary={{ label: "去看成果沉淀", to: `/projects/${project.id}/outcome` }}
        whatShowsUp={[
          "项目层 · 主服务方层 · 演员层三层评分",
          "一句话公开评语(可选择是否脱敏公开)",
          "AI 会把「关键成功因子」写入你的下次活动模板",
        ]}
      />
    );
  }

  const setScore = (key: string, v: number) =>
    setScores((s) => ({ ...s, [key]: v }));

  const done = targets.every((t) =>
    t.sub.every((s) => scores[`${t.id}.${s}`] != null),
  );

  return (
    <>
      <div className="space-y-6">
        <header>
          <h2 className="text-lg font-semibold text-foreground">活动评价</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            分三层留下事实性评价:项目 · 主服务方 · 演员。评价会以脱敏方式沉淀到平台信誉体系,是同行判断服务方能力的关键证据。
          </p>
        </header>

        {submitted ? (
          <div className="rounded-lg border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/5 p-6 text-sm text-foreground">
            <div className="mb-1 text-base font-semibold">评价已提交 ✓</div>
            AI 顾问会把你的评价脱敏后同步给平台信誉体系,同时把「关键成功因子」写入你的下次活动模板。
          </div>
        ) : (
          <>
            {targets.map((t) => (
              <section key={t.id} className="rounded-lg border border-border/60 bg-card/60 p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
                  <div className="mt-0.5 text-xs text-muted-foreground">{t.role}</div>
                </div>
                <div className="space-y-2.5">
                  {t.sub.map((sub) => {
                    const key = `${t.id}.${sub}`;
                    const v = scores[key] ?? 0;
                    return (
                      <div key={key} className="flex items-center justify-between gap-4">
                        <div className="text-xs text-foreground/85">{sub}</div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => setScore(key, n)}
                              className="p-0.5"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  n <= v
                                    ? "fill-primary text-primary"
                                    : "text-muted-foreground/40"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            <section className="rounded-lg border border-border/60 bg-card/60 p-5">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                你希望其他企业客户看到的一句话
              </h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="例如:主服务方主动预警了 2 处风险,现场超预期"
                className="w-full rounded border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50"
              />
              <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                />
                同意脱敏后作为公开案例证据展示
                {!publish && <Lock className="ml-1 h-3 w-3" />}
              </label>
            </section>

            <button
              disabled={!done}
              onClick={() => setSubmitted(true)}
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
              {done ? "提交评价" : "请完成全部三层评价"}
            </button>
          </>
        )}
      </div>
    </>
  );
}