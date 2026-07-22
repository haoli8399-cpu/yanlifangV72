import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Receipt, FileText, CreditCard, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { getProject, type Project } from "@/lib/fixtures";
import { acceptQuote, confirmCredential, declarePayment } from "@/lib/api-client";
import { StatusBadge } from "@/components/yanlicube/status-badge";

export const Route = createFileRoute("/projects/$id/deal")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw new Error("not found");
    return { project };
  },
  component: DealPage,
});

const credentialTypeLabel: Record<string, string> = {
  platform_e_contract: "平台电子合同",
  external_contract: "外部合同",
  framework_order: "框架订单",
  simplified_confirmation: "简化确认",
};

const credentialStatusLabel: Record<string, { label: string; tone: "default" | "warn" | "done" }> = {
  draft: { label: "草稿", tone: "default" },
  pending: { label: "待签署", tone: "warn" },
  effective: { label: "已生效", tone: "done" },
  expired: { label: "已过期", tone: "default" },
};

function EmptyDeal({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Receipt className="h-5 w-5" />
      </div>
      <div className="text-sm text-foreground/70">{message}</div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

function DealPage() {
  const [project, setProject] = useState<Project | undefined>(undefined);
  const _data = Route.useLoaderData() as { project: Project };
  // 初始化：从 loader 获取数据（仅首次）
  if (!project && _data) setProject(_data.project);
  // 如果 project 还未加载，显示空状态
  if (!project) return <div className="p-4 text-center text-sm text-muted-foreground">加载中...</div>;

  const handleAccept = async () => {
    if (!project?.quote) return;
    setProject({ ...project, quote: { ...project.quote, status: "confirmed" } });
    try { await acceptQuote(project.id); } catch (e) { console.warn("API fail", e); }
  };
  const handleReject = () => {
    if (!project?.quote) return;
    setProject({ ...project, quote: { ...project.quote, status: "draft" } });
  };
  const handleSign = async () => {
    if (!project?.credential) return;
    setProject({ ...project, credential: { ...project.credential, status: "effective" } });
    try { await confirmCredential(project.id); } catch (e) { console.warn("API fail", e); }
  };
  const handlePay = async (idx: number) => {
    if (!project?.paymentSchedule) return;
    const ps = [...project.paymentSchedule];
    ps[idx] = { ...ps[idx], status: "paid" };
    setProject({ ...project, paymentSchedule: ps });
    try { await declarePayment(project.id + "_" + idx); } catch (e) { console.warn("API fail", e); }
  };

  if (project.stage === "exploring") {
    return <EmptyDeal message="活动还在理解需求阶段，尚无商务确认信息" />;
  }

  if (project.stage === "completed") {
    return (
      <div className="space-y-4">
        <EmptyDeal message="活动已完成。如需再办一次，请从活动总结页发起复购。" />
        <div className="text-center">
          <Link
            to="/projects/$id/outcome"
            params={{ id: project.id }}
            className="text-xs text-primary hover:underline"
          >
            查看活动总结 →
          </Link>
        </div>
      </div>
    );
  }

  const hasQuote = Boolean(project.quote);
  const hasCredential = Boolean(project.credential);
  const hasPayments = Boolean(project.paymentSchedule?.length);

  if (!hasQuote && !hasCredential && !hasPayments) {
    return <EmptyDeal message="方案确认后，主服务方将为你生成报价与商务方案" />;
  }

  return (
    <div className="space-y-5">
      {/* 报价区 */}
      {project.quote && (
        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <SectionTitle icon={Receipt} title="正式报价" />
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-bold text-foreground">{project.quote.total}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                有效期至 {project.quote.validUntil}
              </div>
            </div>
            <StatusBadge
              state={project.quote.status === "confirmed" ? "verified" : project.quote.status === "sent" ? "declared" : "pending"}
              label={project.quote.status === "draft" ? "草稿" : project.quote.status === "sent" ? "已发送" : "已确认"}
            />
          </div>
          {project.quote.breakdown && (
            <div className="mt-4 space-y-1.5 border-t border-border/50 pt-3">
              {project.quote.breakdown.map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground/80">{item.amount}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            {project.quote.status !== "confirmed" ? (
              <>
                <button onClick={handleAccept} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 active:opacity-80">
                  <CheckCircle2 className="h-3.5 w-3.5" />接受报价
                </button>
                <button onClick={handleReject} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border/60 bg-card/50 px-3.5 py-2 text-xs text-foreground/80 hover:border-primary/40 active:bg-secondary/30">
                  拒绝报价
                </button>
              </>
            ) : (
              <span className="w-full text-center text-xs text-green-600 font-medium py-2">报价已确认</span>
            )}
          </div>
        </section>
      )}

      {/* 合同/凭证区 */}
      {project.credential && (
        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <SectionTitle icon={FileText} title="合同与合作凭证" />
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">{project.credential.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {credentialTypeLabel[project.credential.type] || project.credential.type}
              </div>
            </div>
            <StatusBadge
              state={project.credential.status === "effective" ? "verified" : project.credential.status === "pending" ? "pending" : "declared"}
              label={(credentialStatusLabel[project.credential.status] || { label: project.credential.status }).label}
            />
          </div>
          {project.credential.status === "pending" && (
            <div className="mt-4">
              <button onClick={handleSign} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 active:opacity-80">
              <CheckCircle2 className="h-3.5 w-3.5" />确认合作
            </button>
            </div>
          )}
        </section>
      )}

      {/* 付款节点区 */}
      {project.paymentSchedule && project.paymentSchedule.length > 0 && (
        <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <SectionTitle icon={CreditCard} title="付款节点" />
          <div className="space-y-3">
            {project.paymentSchedule.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <StatusBadge
                      state={item.status === "paid" ? "verified" : item.status === "overdue" ? "pending" : "pending"}
                      label={item.status === "paid" ? "已付" : item.status === "overdue" ? "逾期" : "待付"}
                    />
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {item.amount} · {item.dueDate}
                  </div>
                </div>
                {item.status === "pending" && (
                  <button onClick={() => handlePay(i)} className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2.5 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/10 active:bg-primary/20">
                    我已付款
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 底部提示 */}
      <div className="rounded-xl border border-border/50 bg-background/50 p-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground/70">
              {project.team.main ? project.team.main.name : "主服务方"}
            </span>
            作为唯一主服务方，统一管理报价、合同与收款。
            你不含你的姓名、手机号、微信、邮箱、精确场地地址和完整对话记录。
            如需开票或对公转账，请联系主服务方。
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 rounded-md border border-[color:var(--state-ai)]/30 bg-[color:var(--state-ai)]/5 px-2.5 py-1.5">
          <AlertCircle className="h-3 w-3 text-[color:var(--state-ai)]" />
          <span className="text-[10px] text-foreground/70">演示状态 — 状态变化为本地 Mock，不产生真实业务事实</span>
        </div>
      </div>
    </div>
  );
}
