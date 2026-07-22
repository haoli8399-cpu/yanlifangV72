import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Package, Info } from "lucide-react";
import {
  getServiceProduct,
  serviceProductCompletenessLabel,
  type PerformanceServiceProduct,
} from "@/lib/fixtures";
import { AgentInlineSuggestion } from "@/components/yanlicube/agent";

export const Route = createFileRoute("/discover/service-products/$id/start")({
  loader: ({ params }) => {
    const product = getServiceProduct(params.id);
    if (!product || product.status !== "listed") throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `以「${loaderData?.product.title ?? "服务产品"}」发起活动 · 演立方` },
      { name: "description", content: "复用服务产品的节目、模块与依赖清单,快速发起一个活动项目。" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StartFromServiceProduct,
});

const steps = ["场合与目标", "日期与规模", "预算与联系人", "确认发起"] as const;

function StartFromServiceProduct() {
  const { product } = Route.useLoaderData() as { product: PerformanceServiceProduct };
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    scene: product.typicalScenes[0] ?? "",
    goal: "",
    date: "",
    city: "",
    scale: product.audienceScale,
    budget: product.priceBand,
    contact: "",
  });

  const canNext =
    (step === 0 && form.scene && form.goal.length >= 4) ||
    (step === 1 && form.date && form.city) ||
    (step === 2 && form.contact.length >= 2) ||
    step === 3;

  function submit() {
    // demo:落到已 seed 的示例项目空间
    navigate({ to: "/projects/$id", params: { id: "proj_neoyear" } });
  }

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10">
      <Link
        to="/discover/service-products/$id"
        params={{ id: product.id }}
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回服务产品详情
      </Link>

      <div className="mb-6">
        <div className="mb-1 text-xs tracking-[0.14em] text-muted-foreground">
          从服务产品发起 · FE-013
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          以「{product.title}」发起一个活动
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          我们已经把该产品自带的节目、服务模块与依赖清单复用到你的项目里,你只需要补齐场合、日期、规模与联系人。
          发起后 AI 会自动生成第一版方案,不产生费用或承诺,可随时撤回。
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2 text-[11px]">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={
                "flex h-6 min-w-6 items-center justify-center rounded-full border px-2 " +
                (i < step
                  ? "border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/15 text-[color:var(--state-verified)]"
                  : i === step
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border bg-secondary/40 text-muted-foreground")
              }
            >
              {i < step ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
            </div>
            <span className={i === step ? "text-foreground" : "text-muted-foreground"}>{label}</span>
            {i < steps.length - 1 && <span className="text-muted-foreground/40">/</span>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-1 rounded-xl p-6">
          {step === 0 && (
            <div className="space-y-4">
              <Field label="活动场合">
                <div className="flex flex-wrap gap-2">
                  {product.typicalScenes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm({ ...form, scene: s })}
                      className={
                        "rounded-md border px-3 py-1.5 text-xs " +
                        (form.scene === s
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border bg-card/40 text-muted-foreground hover:text-foreground")
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="活动想要达成的目标(1-2 句)">
                <textarea
                  rows={3}
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  placeholder="例如:给核心客户一次「被重视」的私享体验,巩固签约意愿。"
                  className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="活动日期">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
              </Field>
              <Field label="城市">
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="例如:上海"
                  className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
              </Field>
              <Field label="观众规模">
                <input
                  value={form.scale}
                  onChange={(e) => setForm({ ...form, scale: e.target.value })}
                  className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  已按服务产品建议值填充,可覆盖。
                </p>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Field label="预算带">
                <input
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm font-mono outline-none focus:border-primary/50"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  仅用于 AI 生成合理方案,不会公开,可随时调整。
                </p>
              </Field>
              <Field label="项目联系人">
                <input
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="姓名或称呼"
                  className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/50"
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 text-sm">
              <SummaryRow label="服务产品" value={product.title} />
              <SummaryRow label="主服务方" value={product.tenantName} />
              <SummaryRow label="场合 / 目标" value={`${form.scene} · ${form.goal}`} />
              <SummaryRow label="日期 / 城市 / 规模" value={`${form.date} · ${form.city} · ${form.scale}`} />
              <SummaryRow label="预算带" value={form.budget} />
              <SummaryRow label="联系人" value={form.contact} />

              <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3 text-[12px] leading-relaxed text-foreground">
                <div className="mb-1 flex items-center gap-1 text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> 发起后 AI 将自动完成
                </div>
                <ul className="ml-4 list-disc space-y-0.5 text-muted-foreground">
                  <li>复用产品的 {product.includedPrograms.length} 个节目与 {product.includedModules.length} 个服务模块作为方案骨架</li>
                  <li>把 {product.dependencies.length} 项依赖生成到「等待中心」跟进</li>
                  <li>把主服务方 {product.tenantName} 加入候选并预约首轮沟通</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <ArrowLeft className="h-3 w-3" /> 上一步
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => canNext && setStep(step + 1)}
                disabled={!canNext}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                下一步 <ArrowRight className="h-3 w-3" />
              </button>
            ) : (
              <button
                onClick={submit}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                确认发起并进入项目空间 <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="surface-1 rounded-xl p-5">
            <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Package className="h-3.5 w-3.5" /> 会被复用到项目
            </div>
            <div className="text-sm font-medium text-foreground">{product.title}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {serviceProductCompletenessLabel[product.completeness]}
            </div>
            <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
              <div>· {product.includedPrograms.length} 节目 / {product.includedModules.length} 服务模块</div>
              <div>· {product.dependencies.length} 项依赖清单</div>
              <div>· 建议时长 {product.durationBand} · 观众 {product.audienceScale}</div>
            </div>
          </div>

          <AgentInlineSuggestion title="AI 提示">
            {product.completeness === "complete"
              ? `${product.tenantName} 可作为唯一主服务方对该产品承担整体责任,你无需自己拼装。`
              : "该产品为局部型模块,发起后 AI 会建议一个能整体承接的主服务方作为组合入口。"}
          </AgentInlineSuggestion>

          <div className="surface-1 flex items-start gap-2 rounded-xl p-4 text-[11px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              发起阶段不进入合同与付款。所有信息只对你和被邀请的候选主服务方可见,可随时撤回或删除。
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/40 py-2 text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[70%] text-right text-foreground">{value}</span>
    </div>
  );
}
