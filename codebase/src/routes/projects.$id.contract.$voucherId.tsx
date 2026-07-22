import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import {
  ArrowLeft,
  Download,
  Pen,
  FileSignature,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/projects/$id/contract/$voucherId")({
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project, voucherId: params.voucherId };
  },
  head: () => ({ meta: [{ title: "合作凭证预览 · 演立方" }] }),
  component: ContractPreviewPage,
  ...stageBoundaries({ backTo: "/projects/$id/contract", backLabel: "返回上一环节", homeTo: "/projects/$id" }),
});

type Clause = {
  id: string;
  no: string;
  title: string;
  body: string;
  aiNote?: string;
  risk?: "info" | "warn" | "critical";
  evidence?: string;
};

const clauses: Clause[] = [
  {
    id: "c1",
    no: "第 1 条",
    title: "服务范围与整体责任",
    body: "乙方(后仰喜剧)作为主服务方,承担对甲方(Neo 银行)的唯一整体责任,包含全案统筹、内容创作、演员协调、现场执行及成果交付。协作方与演员的对接、结算与风险,由乙方内部处理,不改变本合同的整体责任归属。",
    aiNote: "该条款对应 PRD 单一责任模型,已按主服务方模板生成。",
    risk: "info",
    evidence: "来自:方案 B · 主推方案确认 · 活动画像 §2.3",
  },
  {
    id: "c2",
    no: "第 2 条",
    title: "合同金额与付款节点",
    body: "合同总金额为人民币 88 万元(含税)。付款节点如下:定金 30% 于合同签署后 5 个工作日内支付;款项 40% 于演出前 3 天支付;尾款 30% 于演出结束、验收合格后 15 天内支付。",
    aiNote: "尾款周期(15 天)与你此前偏好(10 天)存在差异 —— 是主服务方按其对协作方结算周期反推,已在候选对比页出现过。",
    risk: "warn",
    evidence: "对比:候选服务方对比表 · 支付节奏字段",
  },
  {
    id: "c3",
    no: "第 3 条",
    title: "取消与退款",
    body: "演出前 21 天以上取消,全额退还已支付款项;15-21 天之间取消,退还已付款 70%;15 天内取消或因甲方原因无法演出,已付款不予退还,乙方需保留合理证据以备核对。",
    aiNote: "行业标准区间,与你的三个候选方相符。",
    risk: "info",
  },
  {
    id: "c4",
    no: "第 4 条",
    title: "内容评审轮次",
    body: "包含 2 轮内容评审(初稿 + 定稿)。第 3 轮起,如需重大调整,按变更单流程另行报价,由变更单页面留痕。",
    aiNote: "轮次少于你曾经沟通的 3 轮 —— 建议在签署前与主服务方对齐,或走一次变更单预留。",
    risk: "critical",
    evidence: "沟通中心 · 06-12 讨论: '至少 3 轮微调'",
  },
  {
    id: "c5",
    no: "第 5 条",
    title: "现场执行与人员",
    body: "乙方派驻现场执行统筹 3 人,含总负责人 1 人。演员及协作方名单以《服务团队》页面签署时的最终版本为准,后续变更走变更单流程。",
    aiNote: "对齐 · 服务团队页当前锁定的 5 位演员 + 光弦舞美协作方。",
    risk: "info",
    evidence: "服务团队 · 已锁定名单快照 v3",
  },
  {
    id: "c6",
    no: "第 6 条",
    title: "知识产权与素材使用",
    body: "演出创作内容的著作权归乙方与创作者共有。甲方可在企业内部宣传、社交媒体传播中使用现场素材,商业二次使用需另行书面授权。",
    aiNote: "如需二次商业使用(如广告投放),建议提前在此加一条授权范围。",
    risk: "warn",
  },
  {
    id: "c7",
    no: "第 7 条",
    title: "违约与仲裁",
    body: "任一方违约,守约方有权要求继续履行或解除合同并主张损失。争议协商不成的,提交演立方平台仲裁通道,由 AI 起草 + 人类仲裁员签发处置意见;仍不服的,提交合同签署地法院管辖。",
    aiNote: "平台仲裁通道为可选优先项,不排斥司法救济。",
    risk: "info",
  },
];

const riskTone: Record<NonNullable<Clause["risk"]>, string> = {
  info: "border-border/50 bg-card/40",
  warn: "border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/5",
  critical: "border-[color:var(--state-expired)]/50 bg-[color:var(--state-expired)]/5",
};

function ContractPreviewPage() {
  const { project, voucherId } = Route.useLoaderData();
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [showSign, setShowSign] = useState(false);

  const critical = clauses.filter((c) => c.risk === "critical");
  const allConfirmed = critical.every((c) => confirmed[c.id]);

  return (
    <>
      <div className="space-y-6">
        <div>
          <Link
            to="/projects/$id/contract"
            params={{ id: project.id }}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> 返回合作凭证中心
          </Link>
          <h2 className="mt-2 text-lg font-semibold text-foreground">
            主服务方 · 全案统筹电子合同
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            凭证编号 {voucherId} · Neo 银行 ↔ 后仰喜剧 · ¥ 88 万 · 更新于 2 小时前
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> AI 摘要 · 3 项需要你关注
              </div>
              <ul className="space-y-1.5 text-[11.5px] text-foreground/85">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--state-expired)]" />
                  <span>
                    <b className="text-foreground">内容评审仅 2 轮</b> —— 与你先前沟通的 3 轮不一致
                    (第 4 条)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--state-pending)]" />
                  <span>
                    尾款周期为 <b className="text-foreground">15 天</b>,你偏好 10 天(第 2 条)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--state-pending)]" />
                  <span>素材二次商业使用 <b className="text-foreground">未包含</b>,可提前追加(第 6 条)</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/40 p-6">
              <div className="mb-6 border-b border-border/40 pb-4 text-center">
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  演立方电子合同
                </div>
                <h3 className="mt-2 text-base font-semibold text-foreground">
                  {project.title} · 全案统筹合作协议
                </h3>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  甲方: Neo 银行 &nbsp;·&nbsp; 乙方: 后仰喜剧
                </div>
              </div>

              <div className="space-y-4">
                {clauses.map((c) => (
                  <article
                    key={c.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      c.risk ? riskTone[c.risk] : "border-border/50 bg-card/40"
                    }`}
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {c.no}
                      </span>
                      <span className="text-sm font-medium text-foreground">{c.title}</span>
                      {c.risk === "critical" && (
                        <StatusBadge state="expired" label="需要注意" />
                      )}
                      {c.risk === "warn" && <StatusBadge state="pending" label="建议对齐" />}
                    </div>
                    <p className="text-[12px] leading-relaxed text-foreground/90">{c.body}</p>
                    {c.aiNote && (
                      <div className="mt-2 flex gap-2 rounded border border-border/40 bg-background/50 p-2 text-[11px] text-muted-foreground">
                        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                        <div>
                          <span className="text-foreground/80">{c.aiNote}</span>
                          {c.evidence && (
                            <div className="mt-0.5 text-[10px] text-muted-foreground/80">
                              {c.evidence}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {c.risk === "critical" && (
                      <label className="mt-3 flex cursor-pointer items-center gap-2 rounded border border-[color:var(--state-expired)]/40 bg-background/60 px-3 py-2 text-[11px] text-foreground/85">
                        <input
                          type="checkbox"
                          checked={!!confirmed[c.id]}
                          onChange={(e) =>
                            setConfirmed((prev) => ({ ...prev, [c.id]: e.target.checked }))
                          }
                          className="h-3.5 w-3.5 accent-primary"
                        />
                        我已就该条与主服务方对齐,或接受当前措辞
                      </label>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border/60 bg-card/60 p-4">
              <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> 签署状态
              </div>
              <ul className="space-y-2 text-[11px]">
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">主服务方(后仰喜剧)</span>
                  <StatusBadge state="verified" label="已签署" />
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">客户方(Neo 银行)</span>
                  <StatusBadge state="pending" label="待你签署" />
                </li>
              </ul>
              <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" /> 建议 48 小时内签署,以保留档期
              </div>
            </div>

            <div className="rounded-xl border border-[color:var(--state-expired)]/40 bg-[color:var(--state-expired)]/5 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-[color:var(--state-expired)]" />
                需要你确认的关键条款
              </div>
              <div className="text-[11px] text-muted-foreground">
                在签署前请逐条确认 <b className="text-foreground">{critical.length}</b> 个关键项。
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/60">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${
                      (Object.values(confirmed).filter(Boolean).length / critical.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <button
                disabled={!allConfirmed}
                onClick={() => setShowSign(true)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground transition-opacity disabled:opacity-40"
              >
                <Pen className="h-3.5 w-3.5" /> 电子签署
              </button>
              <button onClick={() => demoToast()} className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border/60 bg-background px-4 py-2 text-xs text-muted-foreground hover:text-foreground">
                <Download className="h-3.5 w-3.5" /> 下载 PDF 存档
              </button>
              <button onClick={() => demoToast()} className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border/60 bg-background px-4 py-2 text-xs text-muted-foreground hover:text-foreground">
                <FileSignature className="h-3.5 w-3.5" /> 提出条款修订
              </button>
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              电子签署由 可信时间戳存证,平台不读取合同正文,仅记录签署行为与哈希指纹。
            </p>
          </aside>
        </div>

        {showSign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" /> 电子签署确认
              </div>
              <p className="text-[11.5px] text-muted-foreground">
                你即将以 Neo 银行·活动采购(你的账户)签署此合同。签署后立即触发定金付款流程与档期锁定。
              </p>
              <div className="mt-4 flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setShowSign(false)}
                  className="rounded border border-border/60 px-3 py-1.5 text-muted-foreground"
                >
                  取消
                </button>
                <button
                  onClick={() => setShowSign(false)}
                  className="rounded bg-primary px-3 py-1.5 font-medium text-primary-foreground"
                >
                  确认签署
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}