import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { StageError, StageNotFound } from "./components/yanlicube/stage-error";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ({ error, reset }) => (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <StageError error={error} reset={reset} homeTo="/" backLabel="返回首页" backTo="/" />
      </div>
    ),
    defaultNotFoundComponent: () => (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <StageNotFound
          title="页面不存在"
          description="链接可能已失效,或对应的资源尚未创建。"
          homeTo="/"
          backLabel="返回首页"
          backTo="/"
        />
      </div>
    ),
  });

  return router;
};
