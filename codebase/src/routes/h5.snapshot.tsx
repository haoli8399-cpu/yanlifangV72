import { createFileRoute, Link } from "@tanstack/react-router";
import { Lightbulb, AlertCircle, HelpCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/h5/snapshot")({ component: H5Snapshot });

function H5Snapshot() {
  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600">
        <Lightbulb className="h-5 w-5" />
      </div>
      <h1 className="text-lg font-bold text-foreground">可行性快照</h1>
      <p className="mt-1 text-xs text-muted-foreground">输入活动信息，获得初步判断</p>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <label className="text-xs font-medium text-foreground">活动类型</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["企业年会", "客户答谢", "品牌活动", "团队建设", "庆典活动", "其他"].map((t) => (
              <button key={t} className="rounded-lg border border-border/60 px-3 py-2 text-xs text-foreground active:bg-secondary/40">{t}</button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4">
          <label className="text-xs font-medium text-foreground">城市</label>
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2.5 text-sm text-muted-foreground/70">
            选择城市
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4">
          <label className="text-xs font-medium text-foreground">预计人数</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {["50人以内", "50-200", "200-500", "500+"].map((t) => (
              <button key={t} className="rounded-lg border border-border/60 px-3 py-2 text-xs text-foreground active:bg-secondary/40">{t}</button>
            ))}
          </div>
        </div>

        <button className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground active:opacity-80">
          生成初步判断
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="text-xs text-muted-foreground">
            快照为 AI 基于行业经验生成的非绑定判断，不构成正式报价、档期承诺或合同条件。
          </div>
        </div>
      </div>
    </div>
  );
}
