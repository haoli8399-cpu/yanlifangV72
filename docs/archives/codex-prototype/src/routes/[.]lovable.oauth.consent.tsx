import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

type ConsentDetails = {
  redirect_url?: string;
  redirect_to?: string;
  client?: { name?: string; client_id?: string; redirect_uri?: string; scope?: string };
  scope?: string;
};

type AuthOAuth = {
  getAuthorizationDetails: (id: string) => Promise<{ data: ConsentDetails | null; error: Error | null }>;
  approveAuthorization: (id: string) => Promise<{ data: ConsentDetails | null; error: Error | null }>;
  denyAuthorization: (id: string) => Promise<{ data: ConsentDetails | null; error: Error | null }>;
};

function oauthClient(): AuthOAuth {
  // The @supabase/supabase-js beta oauth namespace isn't in the shipped types yet.
  return (supabase.auth as unknown as { oauth: AuthOAuth }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  // Browser-only: the Supabase client reads its session from localStorage,
  // absent on the SSR pass. Without this, getSession() is null on the server
  // and bounces signed-in users to login.
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id") ?? "";
    const { data, error } = await oauthClient().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) {
      window.location.href = immediate;
      return null;
    }
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md rounded-xl border bg-card p-6 text-sm">
        <h1 className="text-lg font-semibold mb-2">无法加载授权请求</h1>
        <p className="text-muted-foreground">{String((error as Error)?.message ?? error)}</p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const client = oauthClient();
    const { data, error } = approve
      ? await client.approveAuthorization(authorization_id)
      : await client.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("授权服务器未返回跳转地址。");
      return;
    }
    window.location.href = target;
  }

  async function switchAccount() {
    await supabase.auth.signOut();
    router.invalidate();
  }

  const clientName = details?.client?.name ?? "外部应用";
  const scope = details?.client?.scope ?? details?.scope ?? "";

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">
          将 {clientName} 连接到演立方
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {clientName} 将以你的身份调用本应用启用的 MCP 工具（只读演示数据）。
        </p>
        {email && (
          <p className="mt-4 text-sm">
            当前账号：<span className="font-medium">{email}</span>{" "}
            <button
              type="button"
              onClick={switchAccount}
              className="ml-1 text-primary underline underline-offset-2"
            >
              切换账号
            </button>
          </p>
        )}
        {details?.client?.redirect_uri && (
          <p className="mt-2 text-xs text-muted-foreground break-all">
            回跳地址：{details.client.redirect_uri}
          </p>
        )}
        {scope && (
          <p className="mt-2 text-xs text-muted-foreground">请求的权限范围：{scope}</p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          授权不会绕过本应用的权限或后端策略。
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            批准
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            拒绝
          </button>
        </div>
      </div>
    </main>
  );
}

// Silence unused-import warning: lovable is intentionally available for future extensions.
void lovable;
