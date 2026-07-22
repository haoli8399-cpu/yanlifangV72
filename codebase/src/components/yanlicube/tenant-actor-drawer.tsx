import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Save, Trash2, ShieldAlert } from "lucide-react";
import { SideDrawer } from "@/components/yanlicube/side-drawer";
import {
  tenantActorsStore,
  relationMeta,
  contactKindLabel,
  type TenantActorRecord,
  type TenantActorRelation,
  type TenantActorContactKind,
} from "@/lib/tenant-actors-store";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { cn } from "@/lib/utils";

type Mode = "view" | "edit" | "create";

export function TenantActorDrawer({
  record,
  mode: initialMode,
  onClose,
  onSaved,
}: {
  record: TenantActorRecord | null;
  mode: Mode;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [draft, setDraft] = useState<TenantActorRecord | null>(record);

  useEffect(() => {
    setMode(initialMode);
    setDraft(record);
  }, [record, initialMode]);

  if (!record || !draft) return null;

  const isEditing = mode !== "view";
  const linked = !!record.linkedActorId;

  const set = <K extends keyof TenantActorRecord>(k: K, v: TenantActorRecord[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  const save = () => {
    if (!draft.displayName.trim()) return;
    tenantActorsStore.upsert(draft);
    onSaved();
    setMode("view");
  };

  const remove = () => {
    if (!confirm(`确认删除「${record.displayName}」的私有记录？平台公开档案不受影响。`)) return;
    tenantActorsStore.remove(record.id);
    onSaved();
    onClose();
  };

  return (
    <SideDrawer
      open
      onClose={onClose}
      eyebrow={`我的演员 · ${mode === "create" ? "新增" : mode === "edit" ? "编辑" : "详情"}`}
      title={draft.displayName || "未命名"}
      badge={
        <>
          <StatusBadge state={relationMeta[draft.relation].tone} label={relationMeta[draft.relation].label} />
          {linked && (
            <span className="rounded-full border border-primary/40 bg-primary/5 px-2 py-px text-[10px] text-primary">
              已链接平台
            </span>
          )}
        </>
      }
      footer={
        isEditing ? (
          <>
            <button
              onClick={() => (mode === "create" ? onClose() : setMode("view"))}
              className="rounded-md border border-border bg-card/60 px-3 py-2 text-xs hover:bg-secondary"
            >
              取消
            </button>
            <button
              onClick={save}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-3.5 w-3.5" /> 保存到我的演员库
            </button>
          </>
        ) : (
          <>
            <button
              onClick={remove}
              className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--state-expired)]/40 px-3 py-2 text-xs text-[color:var(--state-expired)] hover:bg-[color:var(--state-expired)]/10"
            >
              <Trash2 className="h-3.5 w-3.5" /> 删除
            </button>
            <button
              onClick={() => setMode("edit")}
              className="ml-auto rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              编辑
            </button>
          </>
        )
      }
    >

          <div className="rounded-md border border-[color:var(--state-expired)]/30 bg-[color:var(--state-expired)]/5 px-3 py-2 text-[11px] text-[color:var(--state-expired)]">
            <ShieldAlert className="mr-1 inline h-3 w-3" />
            隐私边界：内部报价与内部备注仅本商户可见；关联的平台演员在 Actor 端看不到这些内容。
          </div>

          {linked && (
            <div className="flex items-center justify-between rounded-md border border-border/60 bg-card/40 px-3 py-2 text-xs">
              <div className="text-muted-foreground">
                平台公开资料由演员本人维护
                <span className="ml-2 text-foreground/70">/ 下方为你的私有备注</span>
              </div>
              <Link
                to="/discover/actors/$id"
                params={{ id: record.linkedActorId! }}
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                查看公开档案 <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}

          <Field label="姓名 / 显示名">
            {isEditing ? (
              <Input value={draft.displayName} onChange={(v) => set("displayName", v)} />
            ) : (
              <span>{draft.displayName}</span>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="身份 / 领域">
              {isEditing ? (
                <Input value={draft.headline ?? ""} onChange={(v) => set("headline", v)} placeholder="如 脱口秀 · 主持" />
              ) : (
                <span>{draft.headline || "—"}</span>
              )}
            </Field>
            <Field label="城市">
              {isEditing ? (
                <Input value={draft.city ?? ""} onChange={(v) => set("city", v)} />
              ) : (
                <span>{draft.city || "—"}</span>
              )}
            </Field>
          </div>

          <Field label="关系类型">
            {isEditing ? (
              <div className="flex gap-2">
                {(["trusted", "onboarding", "watch"] as TenantActorRelation[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => set("relation", r)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs",
                      draft.relation === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card/40 text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {relationMeta[r].label}
                  </button>
                ))}
              </div>
            ) : (
              <StatusBadge state={relationMeta[draft.relation].tone} label={relationMeta[draft.relation].label} />
            )}
          </Field>

          <section className="surface-1 rounded-lg p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-medium text-foreground">内部报价（仅本商户可见）</div>
              {draft.quote && !isEditing && (
                <div className="text-[11px] text-muted-foreground">
                  更新于 {new Date(draft.quote.updatedAt).toLocaleDateString("zh-CN")}
                </div>
              )}
            </div>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={draft.quote?.amount ? String(draft.quote.amount) : ""}
                  onChange={(v) =>
                    set("quote", {
                      currency: "CNY",
                      amount: Number(v) || 0,
                      note: draft.quote?.note,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  placeholder="金额（元）"
                />
                <Input
                  value={draft.quote?.note ?? ""}
                  onChange={(v) =>
                    set("quote", {
                      currency: "CNY",
                      amount: draft.quote?.amount ?? 0,
                      note: v,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  placeholder="报价备注"
                />
              </div>
            ) : draft.quote ? (
              <div>
                <div className="font-mono text-lg text-foreground">¥ {draft.quote.amount.toLocaleString()}</div>
                {draft.quote.note && <div className="mt-0.5 text-xs text-muted-foreground">{draft.quote.note}</div>}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">尚未记录内部报价</div>
            )}
          </section>

          <Field label="内部备注 · AI 可读">
            {isEditing ? (
              <textarea
                value={draft.note ?? ""}
                onChange={(e) => set("note", e.target.value)}
                rows={4}
                className="w-full rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
                placeholder="合作观察、话术偏好、避坑要点……"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm text-foreground/85">{draft.note || "—"}</p>
            )}
          </Field>

          <section className="surface-1 rounded-lg p-4">
            <div className="mb-2 text-xs font-medium text-foreground">联系人</div>
            {isEditing ? (
              <div className="grid grid-cols-[1fr_120px_1fr] gap-2">
                <Input value={draft.contactName ?? ""} onChange={(v) => set("contactName", v)} placeholder="联系人姓名" />
                <select
                  value={draft.contactKind ?? "wechat"}
                  onChange={(e) => set("contactKind", e.target.value as TenantActorContactKind)}
                  className="rounded-md border border-border/60 bg-card/40 px-2 py-2 text-sm outline-none"
                >
                  <option value="wechat">微信</option>
                  <option value="phone">手机</option>
                  <option value="email">邮箱</option>
                </select>
                <Input value={draft.contactValue ?? ""} onChange={(v) => set("contactValue", v)} placeholder="联系方式" />
              </div>
            ) : draft.contactName ? (
              <div className="text-sm text-foreground/85">
                {draft.contactName}
                <span className="ml-2 text-xs text-muted-foreground">
                  {draft.contactKind ? contactKindLabel[draft.contactKind] : ""} · {draft.contactValue}
                </span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">未填写</div>
            )}
          </section>

          <Field label="凭证引用（文字，不上传文件）">
            {isEditing ? (
              <Input value={draft.credential ?? ""} onChange={(v) => set("credential", v)} placeholder="如：身份证已线下核验 2026-03-12" />
            ) : (
              <span className="text-sm">{draft.credential || "—"}</span>
            )}
          </Field>

          <Field label="最近合作">
            {isEditing ? (
              <Input value={draft.lastCollaboration ?? ""} onChange={(v) => set("lastCollaboration", v)} placeholder="如：2026-05 · Neo Bank 答谢晚宴" />
            ) : (
              <span className="text-sm">{draft.lastCollaboration || "—"}</span>
            )}
          </Field>

          {!isEditing && (
            <div className="space-y-2 pt-2">
              <AgentInlineSuggestion title="AI 只在你分派任务时插入建议">
                这里的报价与备注不会外泄，也不用于对演员的公开评价。仅在你下次组盘/派单时，
                作为「与本商户契合度」的私有输入。
              </AgentInlineSuggestion>
              <EvidenceLine source="本商户私有记录">
                创建于 {new Date(draft.createdAt).toLocaleDateString("zh-CN")}，最近更新 {new Date(draft.updatedAt).toLocaleDateString("zh-CN")}
              </EvidenceLine>
            </div>
          )}
    </SideDrawer>
  );
}



function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] tracking-wide text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm outline-none focus:border-primary/60"
    />
  );
}
