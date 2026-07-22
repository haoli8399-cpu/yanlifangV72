import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, MapPin, Sparkles, UserRoundPlus, Check, Award } from "lucide-react";
import { getActor, getProgram, getCase, type Actor } from "@/lib/fixtures";
import { getActorAvatar, AI_AVATAR_NOTE } from "@/lib/actor-avatars";
import { realActors, type RealActor } from "@/lib/real-actors";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion, EvidenceLine } from "@/components/yanlicube/agent";
import { MediaCarousel } from "@/components/yanlicube/media-carousel";
import { resolveGallery } from "@/lib/gallery-store";
import { tenantActorsStore } from "@/lib/tenant-actors-store";
import { useEffect, useState } from "react";

// 稳定的旧 fixture id → real-actors.ts 中的真实事实源 id
const REAL_ACTOR_MAP: Record<string, string> = {
  act_hexuan: "real_fengzihao",
  act_linshu: "real_tuaner",
  act_zhouye: "real_aike",
  act_muyao: "real_yangxin",
  act_arknight: "real_7788",
};
function realFor(actor: Actor): RealActor | undefined {
  const id = REAL_ACTOR_MAP[actor.id];
  return id ? realActors.find((r) => r.id === id) : undefined;
}

export const Route = createFileRoute("/discover/actors/$id")({
  loader: ({ params }): { actor: Actor } => {
    const actor = getActor(params.id);
    if (!actor) throw notFound();
    return { actor };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.actor;
    return {
      meta: [
        { title: a ? `${a.name} · ${a.title} · 演立方` : "演员详情 · 演立方" },
        { name: "description", content: a?.bio ?? "演员详情" },
        { property: "og:title", content: a ? `${a.name} · 演立方` : "" },
        { property: "og:description", content: a?.bio ?? "" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-muted-foreground">演员不存在</div>
  ),
  component: ActorDetail,
});


function ActorDetail() {
  const { actor } = Route.useLoaderData() as { actor: Actor };
  const real = realFor(actor);
  const program = getProgram(actor.signatureProgram);
  const cases = actor.representativeCases
    .map((id: string) => getCase(id))
    .filter(Boolean);
  const [gallery, setGallery] = useState<string[]>(actor.gallery ?? []);
  useEffect(() => {
    setGallery(resolveGallery("actor", actor.id, actor.gallery));
  }, [actor.id, actor.gallery]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-4 pb-24 md:px-6 md:py-10 md:pb-10">
      <Link
        to="/discover/actors"
        params={{}}
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:mb-6"
      >
        <ArrowLeft className="h-3 w-3" />
        返回演员列表
      </Link>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-5 flex items-start gap-4 md:mb-6 md:gap-5">
            {getActorAvatar(actor.avatarSeed) ? (
              <img
                src={getActorAvatar(actor.avatarSeed)}
                alt={`${actor.name} · ${AI_AVATAR_NOTE}`}
                title={AI_AVATAR_NOTE}
                width={96}
                height={96}
                className="h-24 w-24 shrink-0 rounded-2xl object-cover md:h-20 md:w-20"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-accent text-2xl font-semibold text-foreground/60 md:h-20 md:w-20">
                {actor.name[0]}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{actor.name}</h1>
              <div className="mt-1 text-[13px] text-muted-foreground md:text-sm">{actor.title}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2 md:mt-3">
                {actor.verified && <StatusBadge state="verified" label="档案已核验" />}
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground md:text-xs">
                  <MapPin className="h-3 w-3" />
                  {actor.city}
                </span>
              </div>
              <EvidenceLine
                source="演员本人档案 · 授权公开"
                time="更新于 3 天前"
                className="mt-2"
              />
            </div>
          </div>

          <section className="mb-8">
            <h2 className="mb-2 text-sm font-semibold text-foreground">介绍</h2>
            <p className="text-sm leading-relaxed text-foreground/85">{actor.bio}</p>
          </section>

          {real && real.honors.length > 0 && (
            <section className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">履历与荣誉</h2>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {real.honors.map((h) => (
                  <li
                    key={h}
                    className="rounded-md border border-border/60 bg-secondary/30 px-3 py-2 text-xs text-foreground/85"
                  >
                    · {h}
                  </li>
                ))}
              </ul>
              <EvidenceLine
                source="来源:后仰喜剧提供的演员介绍资料"
                time="真实资料 · 图片待补充"
                className="mt-3"
              />
            </section>
          )}


          <section className="mb-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-foreground">现场图集</h2>
              <span className="text-[11px] text-muted-foreground">左右滑动查看 · 共 {gallery.length} 张</span>
            </div>
            <MediaCarousel images={gallery} emptyLabel="演员暂未上传现场图集" />
          </section>

          {program && (
            <section className="mb-8">
              <h2 className="mb-3 text-sm font-semibold text-foreground">代表节目</h2>
              <div className="surface-1 rounded-xl p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-base font-semibold text-foreground">
                    {program.title}
                  </span>
                  <StatusBadge state={program.status} />
                </div>
                <div className="mb-3 text-xs text-muted-foreground">
                  {program.type} · {program.duration}
                </div>
                <p className="text-sm text-foreground/85">{program.summary}</p>
              </div>
            </section>
          )}

          {cases.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-sm font-semibold text-foreground">代表案例</h2>
              <div className="space-y-3">
                {cases.map((c) => (
                  <div key={c!.id} className="surface-1 rounded-lg p-4">
                    <div className="mb-1 text-sm font-medium text-foreground">
                      {c!.title}
                    </div>
                    <div className="mb-2 text-xs text-muted-foreground">
                      {c!.industry} · {c!.scale} · {c!.budgetBand}
                    </div>
                    <div className="text-xs text-foreground/80">{c!.outcome}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold text-foreground">适合的场合</h2>
            <div className="flex flex-wrap gap-2">
              {actor.fitFor.map((f: string) => (
                <span
                  key={f}
                  className="rounded-md border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs text-foreground/80"
                >
                  {f}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="surface-1 sticky top-20 rounded-xl p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              快速操作
            </div>
            <Link
              to="/snapshot"
              search={{ actor: actor.id }}
              className="mb-2 flex items-center justify-between rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              用 {actor.name} 的风格，看看你的活动方案大概长什么样
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              无需登录。AI 顾问将结合 {actor.name} 的代表节目和过往案例,
              先给你一份匿名可行性快照:包含、不包含、价格影响因素、主要风险、待确认事项。
            </p>
          </div>

          <TenantAddCard actor={actor} />

          <AgentInlineSuggestion title="为什么可以选 TA">
            基于你的活动画像与 {actor.name} 的代表节目、履历,匹配度较高;需要更多类似风格的演员时,我可以再挑 2-3 位给你对比。
          </AgentInlineSuggestion>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <Link
          to="/snapshot"
          search={{ actor: actor.id }}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground"
        >
          基于 {actor.name} 生成方案 <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function TenantAddCard({ actor }: { actor: Actor }) {
  const [state, setState] = useState<"idle" | "added" | "existed">("idle");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const already = tenantActorsStore.list().some((r) => r.linkedActorId === actor.id);
    if (already) setState("existed");
    setChecking(false);
  }, [actor.id]);

  const onAdd = () => {
    const { created } = tenantActorsStore.addFromPlatform({
      linkedActorId: actor.id,
      displayName: actor.name,
      headline: actor.title,
      city: actor.city,
    });
    setState(created ? "added" : "existed");
  };

  return (
    <div className="surface-1 rounded-xl p-4">
      <div className="mb-2 text-[11px] tracking-[0.14em] text-muted-foreground">TENANT · 私有资料库</div>
      {state === "idle" && !checking && (
        <>
          <button
            onClick={onAdd}
            className="mb-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/50 bg-primary/5 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10"
          >
            <UserRoundPlus className="h-3.5 w-3.5" /> 加入我的演员库
          </button>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            仅本商户可见,后续可填写内部报价、联系人与私有备注。演员本人看不到你的备注与报价。
          </p>
        </>
      )}
      {state === "added" && (
        <div className="rounded-md border border-[color:var(--state-verified)]/40 bg-[color:var(--state-verified)]/5 px-3 py-2 text-[11px] text-[color:var(--state-verified)]">
          <Check className="mr-1 inline h-3 w-3" />
          已加入你的演员库 · 前往{" "}
          <Link to="/tenant/partners" className="underline">
            协作方管理 → 我的演员
          </Link>{" "}
          补充内部报价与备注。
        </div>
      )}
      {state === "existed" && (
        <div className="rounded-md border border-border/60 bg-card/40 px-3 py-2 text-[11px] text-muted-foreground">
          <Check className="mr-1 inline h-3 w-3 text-primary" />
          已在你的演员库中 ·{" "}
          <Link to="/tenant/partners" className="text-primary underline">
            打开管理
          </Link>
        </div>
      )}
    </div>
  );
}