import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { getPublicActor } from "@/features/demand/fixtures";
import { formatDT } from "@/features/demand/components";
import { CustomerTopBar, DemoBar, useActionBarHeight } from "@/features/demand/ui";
import { setSession, type FlowPreference } from "@/features/demand/session-state";

type Search = { pref?: "reference" | "preferred" | "only_consider" };

export const Route = createFileRoute("/m/actors/$actorId")({
  head: () => ({
    meta: [
      { title: "林舟 · 演员公开档案 — 演立方（演示）" },
      {
        name: "description",
        content: "演立方 V7.2 演示 · 公开演员档案与需求发起入口。",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    pref:
      s.pref === "reference" || s.pref === "preferred" || s.pref === "only_consider"
        ? s.pref
        : undefined,
  }),
  component: ActorPublicPage,
});

function ActorPublicPage() {
  const resp = getPublicActor();
  const actor = resp.data!.resource;
  const search = useSearch({ from: "/m/actors/$actorId" }) as Search;
  const [pref, setPref] = useState<"reference" | "preferred" | "only_consider">(
    search.pref ?? "preferred",
  );
  const actionBarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useActionBarHeight(actionBarRef);

  return (
    <div className="yl-app min-h-screen">
      <CustomerTopBar subtitle="演员公开资料" />

      <main className="yl-main-with-actionbar mx-auto max-w-[960px] px-5 py-6 sm:px-8 sm:py-8">
        <div className="mb-5">
          <DemoBar page="演员公开资料页" />
        </div>

        {/* Hero */}
        <section
          aria-label="演员介绍"
          className="rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 shadow-[var(--yl-shadow-sm)] sm:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div
              aria-hidden
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--yl-bg-primary-soft)] to-[#e8e2ff] text-[28px] font-semibold text-[var(--yl-primary)] shadow-[var(--yl-shadow-sm)] sm:h-24 sm:w-24"
            >
              林
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-[var(--yl-text-tertiary)]">
                脱口秀演员 · 公开资料
              </div>

              <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-tight text-[var(--yl-text-primary)] sm:text-[30px]">
                {actor.display_name}
              </h1>
              <p className="mt-3 text-[16px] leading-[1.7] text-[var(--yl-text-secondary)]">
                {actor.short_bio}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FieldRow label="擅长风格">
              <TagList items={actor.style_tags.slice(0, 4)} tone="primary" />
            </FieldRow>
            <FieldRow label="适配活动">
              <TagList items={actor.suitable_event_types.map((t) => t.label)} />
            </FieldRow>
            <FieldRow label="服务城市">
              <TagList items={actor.service_cities.map((c) => c.label)} />
            </FieldRow>
          </div>
        </section>

        {/* Representative programs - simple list */}
        <section
          aria-label="代表节目"
          className="mt-6 rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 sm:p-8"
        >
          <h2 className="text-[18px] font-semibold text-[var(--yl-text-primary)]">代表节目</h2>
          <ul className="mt-4 divide-y divide-[var(--yl-border)]">
            {actor.representative_programs.map((p) => (
              <li key={p.program_version_id} className="py-4 first:pt-0 last:pb-0">
                <div className="text-[16px] font-medium text-[var(--yl-text-primary)]">
                  {p.name}
                </div>
                <div className="mt-1.5 text-[14px] leading-relaxed text-[var(--yl-text-secondary)]">
                  {p.summary}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Evidence — quiet */}
        <section
          aria-label="资料来源"
          className="mt-6 rounded-[12px] border border-[var(--yl-border)] bg-[var(--yl-bg-muted)] p-4"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--yl-text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--yl-warning)]" />
              <span className="font-medium text-[var(--yl-warning)]">档期与合作条件需另行确认</span>
            </span>
            <span className="text-[var(--yl-text-tertiary)]">·</span>
            <span>来源：{actor.evidence.source_label}</span>
            <span className="text-[var(--yl-text-tertiary)]">·</span>
            <span>更新于 {formatDT(actor.evidence.last_verified_at)}</span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--yl-text-tertiary)]">
            这里的资料是演员自己发布的公开介绍。你能不能约到这位演员、什么价格、走哪种合作方式，都还需要平台和服务团队进一步确认。
          </p>

        </section>

        {/* Preference */}
        <section
          aria-label="偏好强度"
          className="mt-6 rounded-[14px] border border-[var(--yl-border)] bg-[var(--yl-bg-surface)] p-6 sm:p-8"
        >
          <h2 className="text-[18px] font-semibold text-[var(--yl-text-primary)]">
            你有多希望邀请这位演员？
          </h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--yl-text-secondary)]">
            你的选择会跟着你的需求一起提交，只是告诉平台你更倾向什么样的方向。演员的档期、价格和合作方式还需要平台和服务团队去确认。
          </p>
          <div role="radiogroup" aria-label="邀请倾向" className="mt-4 grid gap-3 sm:grid-cols-3">
            {(
              [
                { v: "reference", l: "可以推荐相似演员", d: "把这位演员作为方向，也可以给我推荐风格接近的其他人" },
                { v: "preferred", l: "优先联系这位演员", d: "如果档期允许，希望优先安排这位演员" },
                { v: "only_consider", l: "只考虑这位演员", d: "只有这位演员能来才继续，否则暂时不办" },
              ] as const
            ).map((opt) => {


              const selected = pref === opt.v;
              return (
                <button
                  key={opt.v}
                  role="radio"
                  aria-checked={selected}
                  type="button"
                  onClick={() => setPref(opt.v)}
                  className={[
                    "min-h-[80px] rounded-[12px] border-2 p-4 text-left transition-colors",
                    selected
                      ? "border-[var(--yl-primary)] bg-[var(--yl-bg-primary-soft)]"
                      : "border-[var(--yl-border)] bg-[var(--yl-bg-surface)] hover:border-[var(--yl-border-strong)]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={[
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                        selected
                          ? "border-[var(--yl-primary)] bg-[var(--yl-primary)]"
                          : "border-[var(--yl-border-strong)] bg-transparent",
                      ].join(" ")}
                    >
                      {selected && (
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <div
                      className={[
                        "text-[15px] font-semibold",
                        selected ? "text-[var(--yl-primary)]" : "text-[var(--yl-text-primary)]",
                      ].join(" ")}
                    >
                      {opt.l}
                    </div>
                  </div>
                  <div className="mt-2 text-[13px] leading-relaxed text-[var(--yl-text-tertiary)]">
                    {opt.d}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Sticky footer with single primary CTA */}
      <div ref={actionBarRef} className="yl-action-bar">
        <div className="mx-auto flex max-w-[960px] flex-col gap-2 px-5 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8 sm:pt-3 yl-safe-bottom">
          <div className="min-w-0 text-[12px] leading-relaxed text-[var(--yl-text-tertiary)]">
            选择偏好不代表已经预订，档期与价格仍需确认。
          </div>

          <button
            type="button"
            onClick={() => {
              const prefLabel: FlowPreference extends never
                ? never
                : "作为参考" | "优先考虑" | "仅考虑" =
                pref === "reference"
                  ? "作为参考"
                  : pref === "preferred"
                    ? "优先考虑"
                    : "仅考虑";
              setSession({
                source: {
                  kind: "actor",
                  actorId: actor.id,
                  actorName: actor.display_name,
                  preference: pref,
                  preferenceLabel: prefLabel,
                },
                form: null,
                briefConfirmed: null,
                consentGranted: null,
              });
              navigate({ to: "/m/demands/new" });
            }}
            className="inline-flex min-h-[48px] items-center justify-center rounded-[12px] bg-[var(--yl-primary)] px-6 text-[16px] font-semibold text-white shadow-[var(--yl-shadow-sm)] transition-colors hover:bg-[var(--yl-primary-hover)]"
          >
            选择{actor.display_name}并填写活动需求
          </button>

        </div>
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[13px] font-medium text-[var(--yl-text-tertiary)]">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function TagList({ items, tone }: { items: string[]; tone?: "primary" | "neutral" }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span
          key={t}
          className={[
            "rounded-full px-2.5 py-1 text-[13px]",
            tone === "primary"
              ? "bg-[var(--yl-bg-primary-soft)] text-[var(--yl-primary)]"
              : "bg-[var(--yl-bg-muted)] text-[var(--yl-text-secondary)]",
          ].join(" ")}
        >
          {t}
        </span>
      ))}
    </div>
  );
}
