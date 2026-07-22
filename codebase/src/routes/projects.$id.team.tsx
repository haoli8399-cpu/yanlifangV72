import { createFileRoute } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { Shield, Users, Handshake, UsersRound } from "lucide-react";
import { getProject, type Project, type Party } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { EmptyState } from "@/components/yanlicube/focus-page";
import { getActorAvatarByName, AI_AVATAR_NOTE } from "@/lib/actor-avatars";

export const Route = createFileRoute("/projects/$id/team")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw new Error("not found");
    return { project };
  },
  component: Team,
  ...stageBoundaries({ backTo: "/projects/$id", backLabel: "返回项目主页", homeTo: "/projects/$id" }),
});

function Team() {
  const { project } = Route.useLoaderData() as { project: Project };
  const { main, collaborators, actors } = project.team;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 text-xs tracking-[0.14em] text-muted-foreground">服务团队</div>
        <h2 className="text-xl font-semibold text-foreground">这场活动只有一位整体责任方</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          主服务方对客户承担整体责任,协作方与演员通过主服务方对接。
        </p>
      </div>

      {main ? (
        <div className="rounded-xl border border-primary/40 bg-primary/[0.06] p-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-primary">
            <Shield className="h-4 w-4" />
            唯一主服务方
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-foreground">{main.name}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">{main.scope}</div>
              {main.contact && (
                <div className="mt-2 text-xs text-foreground/80">对接人 · {main.contact}</div>
              )}
            </div>
            <StatusBadge state={main.confirmed ? "verified" : "pending"} />
          </div>
        </div>
      ) : (
        <EmptyState
          icon={UsersRound}
          title="还没有主服务方"
          description="主服务方是这场活动的唯一整体责任方。看完候选服务方的匹配理由后,你选一家,协作方与演员由他们统筹。"
          primary={{ label: "查看候选服务方", to: `/projects/${project.id}/candidates` }}
          secondary={{ label: "让 AI 顾问先介绍匹配原则", to: "/agent" }}
          whatShowsUp={[
            "主服务方名称 · 责任范围 · 对接人",
            "由主服务方引入的协作方(灯光 / 舞美 / 视觉)",
            "由主服务方对接的演员名单与档期状态",
          ]}
        />
      )}

      <TeamSection
        icon={Handshake}
        title="协作方 · 由主服务方选择与统筹"
        parties={collaborators}
        emptyText="主服务方尚未引入协作方(或暂不需要)"
      />

      <TeamSection
        icon={Users}
        title="演员 · 由主服务方对接"
        parties={actors}
        emptyText="尚未确定演员"
      />
    </div>
  );
}

function TeamSection({
  icon: Icon,
  title,
  parties,
  emptyText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  parties: Party[];
  emptyText: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">· {parties.length}</div>
      </div>
      {parties.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/30 p-4 text-xs text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {parties.map((p) => {
            const avatar = p.role === "actor" ? getActorAvatarByName(p.name) : undefined;
            return (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 px-4 py-3">
                <div className="flex items-center gap-3">
                  {avatar && (
                    <img
                      src={avatar}
                      alt={`${p.name} · ${AI_AVATAR_NOTE}`}
                      title={AI_AVATAR_NOTE}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="text-sm font-medium text-foreground">{p.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{p.scope}</div>
                  </div>
                </div>
                <StatusBadge state={p.confirmed ? "verified" : "pending"} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}