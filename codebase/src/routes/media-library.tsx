import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { actors, cases } from "@/lib/fixtures";
import { ImageManager } from "@/components/yanlicube/image-manager";
import { Images, User, FileText } from "lucide-react";

export const Route = createFileRoute("/media-library")({
  head: () => ({
    meta: [
      { title: "媒体图集维护 · 演立方" },
      { name: "description", content: "维护演员资料与活动案例的图集,前端 Mock 演示。" },
    ],
  }),
  component: MediaLibraryPage,
});

function MediaLibraryPage() {
  const [tab, setTab] = useState<"actor" | "case">("actor");
  const [actorId, setActorId] = useState<string>(actors[0]?.id ?? "");
  const [caseId, setCaseId] = useState<string>(cases[0]?.id ?? "");

  const actor = actors.find((a) => a.id === actorId);
  const caseItem = cases.find((c) => c.id === caseId);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div className="mb-6 flex items-center gap-2">
        <Images className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-semibold text-foreground">媒体图集维护</h1>
      </div>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        为演员资料与活动案例维护现场图集。用户端在详情页可以左右滑动查看这些图片。
        当前为前端演示环境,变更会保存在本浏览器的本地存储中。
      </p>

      <div className="mb-6 inline-flex rounded-lg border border-border/60 bg-secondary/30 p-1">
        <button
          type="button"
          onClick={() => setTab("actor")}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
            tab === "actor"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="h-3.5 w-3.5" /> 演员资料
        </button>
        <button
          type="button"
          onClick={() => setTab("case")}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
            tab === "case"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> 活动案例
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="surface-1 rounded-xl p-3">
          <div className="mb-2 px-2 text-[11px] tracking-[0.12em] text-muted-foreground">
            {tab === "actor" ? "选择演员" : "选择案例"}
          </div>
          <div className="space-y-1">
            {(tab === "actor" ? actors : cases).map((item) => {
              const active = tab === "actor" ? item.id === actorId : item.id === caseId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    tab === "actor" ? setActorId(item.id) : setCaseId(item.id)
                  }
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-primary/15 text-foreground"
                      : "text-foreground/80 hover:bg-secondary/40"
                  }`}
                >
                  <div className="font-medium">{"name" in item ? item.name : item.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {"city" in item ? item.city : ""}
                    {"title" in item && "name" in item ? ` · ${item.title}` : ""}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div>
          {tab === "actor" && actor && (
            <ImageManager
              kind="actor"
              id={actor.id}
              title={`${actor.name} · 演员图集`}
              fallback={actor.gallery ?? []}
              hint="用户在“发现 · 演员”详情页可以左右滑动查看这些照片。建议使用横幅比例 (3:2 或 16:9)。"
            />
          )}
          {tab === "case" && caseItem && (
            <ImageManager
              kind="case"
              id={caseItem.id}
              title={`${caseItem.title} · 案例图集`}
              fallback={caseItem.gallery ?? []}
              hint="用户在“发现 · 案例”详情页可以左右滑动浏览。建议使用横幅比例 (16:9)。"
            />
          )}
        </div>
      </div>
    </div>
  );
}