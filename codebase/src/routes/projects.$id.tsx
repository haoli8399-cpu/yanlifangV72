import { Outlet, createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getProject, type Project } from "@/lib/fixtures";
import { ProjectShell } from "@/components/yanlicube/project-shell";
import { StageError, StageNotFound } from "@/components/yanlicube/stage-error";

export const Route = createFileRoute("/projects/$id")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.project.title ?? "活动"} · 演立方` },
    ],
  }),
  component: ProjectLayout,
  errorComponent: ({ error, reset }) => (
    <ProjectFallback>
      <StageError
        error={error}
        reset={reset}
        backTo="/projects"
        backLabel="返回活动列表"
      />
    </ProjectFallback>
  ),
  notFoundComponent: () => (
    <ProjectFallback>
      <StageNotFound
        title="找不到这场活动"
        description="活动链接可能已失效,或还未创建。你可以回到活动列表重新选择。"
        backTo="/projects"
        backLabel="返回活动列表"
      />
    </ProjectFallback>
  ),
});

function ProjectLayout() {
  const { project } = Route.useLoaderData() as { project: Project };
  return (
    <ProjectShell project={project}>
      <Outlet />
    </ProjectShell>
  );
}

function ProjectFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/projects"
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        ← 返回活动列表
      </Link>
      {children}
    </div>
  );
}
