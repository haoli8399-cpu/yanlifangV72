import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Check,
  Code2,
  Link2,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  getServiceProduct,
  serviceProductCompletenessLabel,
  type PerformanceServiceProduct,
} from "@/lib/fixtures";

export const Route = createFileRoute("/discover/service-products/$id/share")({
  loader: ({ params }) => {
    const product = getServiceProduct(params.id);
    if (!product || product.status !== "listed") throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `分享「${loaderData?.product.title ?? "服务产品"}」· 演立方` },
      { name: "description", content: "生成公开分享链接与嵌入卡片" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SharePage,
});

function SharePage() {
  const { product } = Route.useLoaderData() as { product: PerformanceServiceProduct };

  const [hidePrice, setHidePrice] = useState(false);
  const [hideTenant, setHideTenant] = useState(false);
  const [expiry, setExpiry] = useState<"7" | "30" | "perm">("30");
  const [utm, setUtm] = useState("");

  const shareUrl = useMemo(() => {
    const base =
      (typeof window !== "undefined" ? window.location.origin : "https://yanlicube.app") +
      `/discover/service-products/${product.id}`;
    const params = new URLSearchParams();
    if (hidePrice) params.set("hp", "1");
    if (hideTenant) params.set("ht", "1");
    if (expiry !== "perm") params.set("exp", expiry);
    if (utm) params.set("utm", utm);
    const q = params.toString();
    return q ? `${base}?${q}` : base;
  }, [product.id, hidePrice, hideTenant, expiry, utm]);

  const embedCode = useMemo(() => {
    return `<iframe src="${shareUrl}&embed=1" width="380" height="220" frameborder="0" style="border-radius:12px;border:1px solid #e5e7eb"></iframe>`;
  }, [shareUrl]);

  const markdownCode = useMemo(() => {
    const price = hidePrice ? "—" : product.priceBand;
    return `**[${product.title}](${shareUrl})**\n> ${product.oneLiner}\n> 时长 ${product.durationBand} · 观众 ${product.audienceScale} · 价位 ${price}`;
  }, [shareUrl, product, hidePrice]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-6 md:py-10">
      <Link
        to="/discover/service-products/$id"
        params={{ id: product.id }}
        className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回产品详情
      </Link>

      <div className="mb-5 md:mb-6">
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">分享「{product.title}」</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground md:text-sm">
          <span className="md:hidden">生成公开分享链接。所有出口遵循相同的读取边界与访问日志。</span>
          <span className="hidden md:inline">生成公开分享链接、Markdown 卡片或可嵌入的 iframe。所有分享出口都遵循相同的读取边界与访问日志。</span>
        </p>
      </div>

      <div className="grid gap-5 md:gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* 左：配置 + 输出 */}
        <div className="space-y-6">
          <section className="surface-1 rounded-xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">读取边界</h2>
            </div>
            <div className="space-y-2">
              <Toggle
                label="隐藏价位带"
                sub="访客将看到「面议」,主服务方与你在演立方内查看时不受影响。"
                checked={hidePrice}
                onChange={setHidePrice}
              />
              <Toggle
                label="隐藏主服务方名称"
                sub="仅展示行业与所在城市,防止在线索期被同行拦截。"
                checked={hideTenant}
                onChange={setHideTenant}
              />
            </div>

            <div className="mt-4">
              <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">有效期</div>
              <div className="flex gap-2">
                {(["7", "30", "perm"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setExpiry(v)}
                    className={
                      "rounded-md border px-3 py-1.5 text-xs " +
                      (expiry === v
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card/40 text-muted-foreground hover:text-foreground")
                    }
                  >
                    {v === "perm" ? "永久" : `${v} 天`}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                UTM 来源(可选)
              </div>
              <input
                value={utm}
                onChange={(e) => setUtm(e.target.value)}
                placeholder="wechat / newsletter / partner_xxx"
                className="w-full rounded-md border border-border bg-card/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <div className="mt-1 text-[10px] text-muted-foreground">
                用于在分享后的归因确认中区分线索来源渠道。
              </div>
            </div>
          </section>

          <OutputBlock
            icon={<Link2 className="h-4 w-4 text-primary" />}
            title="公开分享链接"
            value={shareUrl}
          />
          <div className="hidden md:contents">
            <OutputBlock
              icon={<Sparkles className="h-4 w-4 text-primary" />}
              title="Markdown 卡片(适合微信推文 / Notion / 邮件)"
              value={markdownCode}
              multiline
            />
            <OutputBlock
              icon={<Code2 className="h-4 w-4 text-primary" />}
              title="Embed iframe(适合官网 / 落地页)"
              value={embedCode}
              multiline
            />
          </div>
        </div>

        {/* 右:预览卡 + 权限说明 */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <EmbedPreview product={product} hidePrice={hidePrice} hideTenant={hideTenant} />

          <div className="surface-1 rounded-xl p-5 text-xs leading-relaxed text-muted-foreground">
            <div className="mb-2 font-semibold text-foreground">访客能看到什么</div>
            <ul className="space-y-1.5">
              <li>· 产品结构:节目/模块/依赖清单/时长/观众规模</li>
              <li>· 匿名化的社会证明:采纳家数、NPS、复用次数</li>
              <li>· 相关活动案例的公开信息</li>
            </ul>
            <div className="mt-3 mb-2 font-semibold text-foreground">访客不会看到</div>
            <ul className="space-y-1.5">
              <li>· 客户身份 / 具体预算金额 / 结算数据</li>
              <li>· 合同、变更单、内部沟通</li>
              <li>· 演员真实档期与联系方式</li>
            </ul>
            <div className="mt-3 rounded-md border border-border/60 bg-secondary/30 px-3 py-2">
              所有访问都会记入分享链接的访问日志,主服务方可在服务产品管理中查看与撤回。
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Toggle({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border/60 bg-card/40 px-3 py-2 hover:border-primary/40">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-primary"
      />
      <div className="min-w-0">
        <div className="text-sm text-foreground">{label}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </label>
  );
}

function OutputBlock({
  icon,
  title,
  value,
  multiline,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  multiline?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };
  return (
    <section className="surface-1 rounded-xl p-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        <button
          onClick={doCopy}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card/40 px-2.5 py-1 text-[11px] text-foreground hover:bg-secondary"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      {multiline ? (
        <pre className="whitespace-pre-wrap break-all rounded-md border border-border/60 bg-card/40 px-3 py-2 font-mono text-[11px] text-foreground">
          {value}
        </pre>
      ) : (
        <div className="break-all rounded-md border border-border/60 bg-card/40 px-3 py-2 font-mono text-[11px] text-foreground">
          {value}
        </div>
      )}
    </section>
  );
}

function EmbedPreview({
  product,
  hidePrice,
  hideTenant,
}: {
  product: PerformanceServiceProduct;
  hidePrice: boolean;
  hideTenant: boolean;
}) {
  return (
    <div className="surface-1 rounded-xl p-5">
      <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Embed 预览</div>
      <div className="rounded-lg border border-border/60 bg-card/60 p-3">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="rounded-md border border-[color:var(--state-verified)]/50 bg-[color:var(--state-verified)]/15 px-1.5 py-0.5 text-[10px] text-[color:var(--state-verified)]">
            {serviceProductCompletenessLabel[product.completeness]}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {hideTenant ? "已认证主服务方" : product.tenantName}
          </span>
        </div>
        <div className="text-sm font-semibold text-foreground">{product.title}</div>
        <div className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
          {product.oneLiner}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Chip>{product.durationBand}</Chip>
          <Chip>{product.audienceScale}</Chip>
          <Chip tone="price">{hidePrice ? "价位面议" : product.priceBand}</Chip>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2">
          <span className="text-[10px] text-muted-foreground">演立方 · 演出服务产品</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-primary">
            查看详情 <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground">
        实际嵌入外观与目标站点样式一致,以上为示意。
      </div>
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone?: "price" }) {
  return (
    <span
      className={
        "rounded-md border px-1.5 py-0.5 text-[10px] " +
        (tone === "price"
          ? "border-primary/30 bg-primary/5 font-mono text-primary"
          : "border-border/60 bg-card/40 text-muted-foreground")
      }
    >
      {children}
    </span>
  );
}
