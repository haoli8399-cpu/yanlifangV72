import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { actors } from "@/lib/fixtures";
import { useCapabilities } from "@/lib/hooks";
import { getActorAvatar, AI_AVATAR_NOTE } from "@/lib/actor-avatars";
import { StatusBadge } from "@/components/yanlicube/status-badge";

export const Route = createFileRoute("/discover/actors/")({
  head: () => ({
    meta: [
      { title: "演员 · 发现 · 演立方" },
      { name: "description", content: "浏览已核验演员,直接基于演员生成活动方案。" },
    ],
  }),
  component: ActorsList,
});

const scheduleLabel = {
  open: { label: "档期充裕", state: "verified" as const },
  tight: { label: "档期紧张", state: "pending" as const },
  busy: { label: "近期已满", state: "expired" as const },
};

function ActorsList() {
  const { data: capabilities } = useCapabilities();
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <div className="mb-1 text-[11px] tracking-[0.14em] text-muted-foreground sm:text-xs">发现 · 演员</div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">选一位演员,直接开始</h1>
        <p className="mt-2 max-w-2xl text-[13px] text-muted-foreground sm:text-sm">
          从任一演员出发,一键生成"基于 TA"的方案草稿。资料来自演员本人或经纪确认,「档案已核验」的可点击查看来源与时间。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actors.map((a) => (
          <div key={a.id} className="surface-1 flex flex-col rounded-xl p-5">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getActorAvatar(a.avatarSeed) ? (
                  <img
                    src={getActorAvatar(a.avatarSeed)}
                    alt={`${a.name} · ${AI_AVATAR_NOTE}`}
                    title={AI_AVATAR_NOTE}
                    loading="lazy"
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent font-semibold text-foreground/60">
                    {a.name[0]}
                  </div>
                )}
                <div>
                  <div className="text-base font-semibold text-foreground">{a.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{a.title}</div>
                </div>
              </div>
              {a.verified && <StatusBadge state="verified" label="档案已核验" />}
            </div>

            <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {a.city}
              </span>
              <StatusBadge
                state={scheduleLabel[a.scheduleState].state}
                label={scheduleLabel[a.scheduleState].label}
              />
            </div>

            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{a.bio}</p>

            <div className="mb-4 flex flex-wrap gap-1">
              {a.tags.map((t) => (
                <span
                  key={t}
                  className="rounded border border-border/60 bg-secondary/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center gap-2">
              <Link
                to="/discover/actors/$id"
                params={{ id: a.id }}
                className="flex-1 rounded-md border border-border/70 bg-background/40 px-3 py-2 text-center text-xs font-medium text-foreground/80 transition-colors hover:border-primary/50 hover:text-foreground"
              >
                查看详情
              </Link>
              <Link
                to="/snapshot"
                search={{ actor: a.id }}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                基于 TA 生成方案
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}