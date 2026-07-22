import { createFileRoute, notFound } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { Share2, Copy, Eye, ShieldOff, ShieldCheck, Clock3, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/projects/$id/share")({
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: () => ({ meta: [{ title: "分享链接 · 演立方" }] }),
  component: SharePage,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

type Scope = "decision" | "plans" | "quote" | "outcome";
const scopeLabel: Record<Scope, string> = {
  decision: "决策摘要(一分钟版)",
  plans: "方案对比",
  quote: "正式报价",
  outcome: "活动成果",
};

type Grant = {
  id: string;
  label: string;
  scopes: Scope[];
  expires: string;
  password: boolean;
  watermark: boolean;
  views: { at: string; who: string }[];
  revoked?: boolean;
};

const initial: Grant[] = [
  {
    id: "g1",
    label: "给财务总监审阅",
    scopes: ["decision", "quote"],
    expires: "7 天(至 2027-01-08)",
    password: true,
    watermark: true,
    views: [
      { at: "3 小时前", who: "邮箱 wa***@neo.bank · IP ***.**.128.4" },
      { at: "昨天", who: "邮箱 wa***@neo.bank · IP ***.**.128.4" },
    ],
  },
  {
    id: "g2",
    label: "给部门总监决策",
    scopes: ["decision"],
    expires: "3 天",
    password: false,
    watermark: true,
    views: [],
  },
];

function SharePage() {
  const { project } = Route.useLoaderData();
  const [grants, setGrants] = useState(initial);

  const revoke = (id: string) =>
    setGrants((gs) => gs.map((g) => (g.id === id ? { ...g, revoked: true } : g)));

  return (
    <>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">分享链接</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              把项目的部分内容以只读链接发给领导或财务,不需要他们登录。每一次访问都会留下审计痕迹,可随时撤回。
            </p>
          </div>
          <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建分享
          </button>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          {grants.map((g) => (
            <article
              key={g.id}
              className={`rounded-lg border p-5 ${
                g.revoked
                  ? "border-border/40 bg-card/30 opacity-70"
                  : "border-border/60 bg-card/60"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <Share2 className="h-3 w-3" /> 只读分享
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{g.label}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3 w-3" /> 有效期 {g.expires}
                  </div>
                </div>
                <StatusBadge
                  state={g.revoked ? "expired" : "verified"}
                  label={g.revoked ? "已撤回" : "有效"}
                />
              </div>

              <div className="mb-3">
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  可见范围
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(scopeLabel) as Scope[]).map((s) => (
                    <span
                      key={s}
                      className={`rounded px-2 py-0.5 text-[11px] ${
                        g.scopes.includes(s)
                          ? "border border-primary/40 bg-primary/10 text-primary"
                          : "border border-border/40 bg-background text-muted-foreground/60"
                      }`}
                    >
                      {scopeLabel[s]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  {g.password ? (
                    <>
                      <ShieldCheck className="h-3 w-3 text-[color:var(--state-verified)]" /> 密码保护
                    </>
                  ) : (
                    <>
                      <ShieldOff className="h-3 w-3" /> 无密码
                    </>
                  )}
                </span>
                <span className="inline-flex items-center gap-1">
                  {g.watermark ? (
                    <>
                      <ShieldCheck className="h-3 w-3 text-[color:var(--state-verified)]" /> 含水印
                    </>
                  ) : (
                    "无水印"
                  )}
                </span>
              </div>

              <div className="rounded border border-border/50 bg-background/40 p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Eye className="h-3 w-3" /> 访问记录 · {g.views.length} 次
                </div>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  {g.views.length === 0 && <li>暂无访问</li>}
                  {g.views.map((v, i) => (
                    <li key={i}>{v.at} · {v.who}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex gap-2 text-xs">
                <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded border border-border/60 bg-background px-3 py-1.5 text-muted-foreground hover:text-foreground">
                  <Copy className="h-3 w-3" /> 复制链接
                </button>
                {!g.revoked && (
                  <button
                    onClick={() => revoke(g.id)}
                    className="inline-flex items-center gap-1 rounded border border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 px-3 py-1.5 text-[color:var(--state-pending)] hover:bg-[color:var(--state-pending)]/15"
                  >
                    <Trash2 className="h-3 w-3" /> 立即撤回
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}