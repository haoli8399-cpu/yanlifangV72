import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Users,
  UserCircle2,
  ShieldCheck,
  Sparkle,
  Compass,
  Smartphone,
} from "lucide-react";

export const Route = createFileRoute("/dev-login")({
  head: () => ({
    meta: [
      { title: "开发登录 · 演立方" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DevLoginPage,
});

type Portal = {
  role: string;
  identity: string;
  description: string;
  entries: { label: string; to: string; params?: Record<string, string>; hint?: string }[];
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const portals: Portal[] = [
  {
    role: "企业客户",
    identity: "Neo 银行 · 品牌市场部",
    description: "从发现内容到活动项目空间的完整闭环。",
    icon: Building2,
    accent: "from-primary/40 to-primary/5",
    entries: [
      { label: "发现首页", to: "/", hint: "AI Native landing" },
      { label: "我的活动", to: "/projects" },
      { label: "活动项目空间 · 概览", to: "/projects/$id", params: { id: "proj_neoyear" } },
      { label: "理解 / 活动画像", to: "/projects/$id/understand", params: { id: "proj_neoyear" } },
      { label: "方案 · 故事板", to: "/projects/$id/plans", params: { id: "proj_neoyear" } },
      { label: "决策摘要", to: "/projects/$id/decision", params: { id: "proj_neoyear" } },
      { label: "候选服务方", to: "/projects/$id/candidates", params: { id: "proj_neoyear" } },
      { label: "合作凭证中心", to: "/projects/$id/contract", params: { id: "proj_neoyear" } },
      { label: "收付款", to: "/projects/$id/payments", params: { id: "proj_neoyear" } },
      { label: "履约时间线", to: "/projects/$id/execution", params: { id: "proj_neoyear" } },
      { label: "变更单", to: "/projects/$id/changes", params: { id: "proj_neoyear" } },
      { label: "沟通中心", to: "/projects/$id/messages", params: { id: "proj_neoyear" } },
      { label: "分层评价", to: "/projects/$id/review", params: { id: "proj_neoyear" } },
      { label: "成果 & 再办一次", to: "/projects/$id/outcome", params: { id: "proj_neoyear" } },
      { label: "AI 错误恢复", to: "/projects/$id/incidents", params: { id: "proj_neoyear" } },
      { label: "等待中心", to: "/projects/$id/waiting", params: { id: "proj_neoyear" } },
      { label: "候选服务方 · 对比", to: "/projects/$id/candidates/compare", params: { id: "proj_neoyear" } },
      { label: "方案 · 复盘知识沉淀", to: "/projects/$id/retrospective", params: { id: "proj_neoyear" } },
      { label: "复用推荐", to: "/projects/$id/reuse", params: { id: "proj_neoyear" } },
      { label: "分享给领导", to: "/projects/$id/share", params: { id: "proj_neoyear" } },
      { label: "项目团队", to: "/projects/$id/team", params: { id: "proj_neoyear" } },
      { label: "报价单", to: "/projects/$id/quote", params: { id: "proj_neoyear" } },
      { label: "合同链视图", to: "/projects/$id/contract/tree", params: { id: "proj_neoyear" } },
      { label: "合同凭证预览", to: "/projects/$id/contract/$voucherId", params: { id: "proj_neoyear", voucherId: "voucher_neoyear_main" } },
      { label: "付款方式选择", to: "/projects/$id/payments/scheme", params: { id: "proj_neoyear" } },
      { label: "履约交接包", to: "/projects/$id/execution/handoff", params: { id: "proj_neoyear" } },
      { label: "观众到场感知", to: "/projects/$id/execution/audience", params: { id: "proj_neoyear" } },
      { label: "缺口检查 (D 路径)", to: "/gap-checklist" },
      { label: "匿名快照", to: "/snapshot" },
      { label: "数据主权中心", to: "/account/data" },
    ],
  },
  {
    role: "主服务方(承接活动)",
    identity: "后仰喜剧 · 商务经营组",
    description: "机会、报价、订单、结算与现场履约。",
    icon: Users,
    accent: "from-[color:var(--state-verified)]/40 to-transparent",
    entries: [
      { label: "经营工作台", to: "/tenant" },
      { label: "订单列表", to: "/tenant/orders" },
      { label: "订单详情", to: "/tenant/orders/$id", params: { id: "ord_neobank2" } },
      { label: "节目产品库", to: "/tenant/programs" },
      { label: "演出服务产品库", to: "/tenant/service-products", hint: "PRD §6.2 完整/局部型 SKU" },
      { label: "服务产品详情", to: "/tenant/service-products/$id", params: { id: "sp_annual_signature" } },
      { label: "服务产品 · 版本对比", to: "/tenant/service-products/$id/versions", params: { id: "sp_annual_signature" } },
      { label: "服务产品 · 评价回流", to: "/tenant/service-products/feedback" },
      { label: "机会详情", to: "/tenant/opportunities/$id", params: { id: "opp_neobank2" } },
      { label: "协作方管理", to: "/tenant/partners" },
      { label: "结算中心", to: "/tenant/settlement" },
      { label: "结算 · 当月总览", to: "/tenant/settlement/$month", params: { month: "2026-07" } },
      { label: "现场履约看板", to: "/tenant/execution" },
    ],
  },
  {
    role: "演员",
    identity: "李漫 · 独立喜剧演员",
    description: "档期、偏好与异议处理。",
    icon: UserCircle2,
    accent: "from-[color:var(--state-pending)]/40 to-transparent",
    entries: [
      { label: "演员工作台", to: "/actor" },
      { label: "我的服务片段", to: "/actor/services", hint: "局部型 SKU 上架" },
      { label: "履约日历", to: "/actor/calendar" },
      { label: "偏好中心", to: "/actor/preferences" },
      { label: "异议中心", to: "/actor/disputes" },
    ],
  },
  {
    role: "平台 · 治理",
    identity: "演立方 平台运营",
    description: "仲裁、AI 差错、来源归属、权限矩阵。",
    icon: ShieldCheck,
    accent: "from-[color:var(--state-declared)]/40 to-transparent",
    entries: [
      { label: "治理中心", to: "/admin" },
      { label: "AI 差错监控", to: "/admin/incidents" },
      { label: "来源归属", to: "/admin/attribution" },
      { label: "授权矩阵", to: "/admin/permissions" },
      { label: "仲裁详情", to: "/admin/arbitration/$id", params: { id: "arb-24" } },
      { label: "主服务方审核详情", to: "/admin/tenants/$id", params: { id: "ten_houyang" } },
    ],
  },
  {
    role: "通用工具",
    identity: "无需登录",
    description: "跨角色的 Agent、Demo 与指南。",
    icon: Sparkle,
    accent: "from-primary/20 to-transparent",
    entries: [
      { label: "AI 顾问", to: "/agent" },
      { label: "AI 记忆中心", to: "/agent/memory" },
      { label: "30 秒 Demo", to: "/demo" },
      { label: "指南库", to: "/guides" },
      { label: "发现 · 演员", to: "/discover/actors" },
      { label: "发现 · 节目", to: "/discover/programs" },
      { label: "发现 · 演出服务产品", to: "/discover/service-products", hint: "客户端整体采购" },
      { label: "发现 · 服务产品对比", to: "/discover/service-products/compare" },
      { label: "发现 · 主服务方主页", to: "/discover/tenants/$id", params: { id: "ten_houyang" }, hint: "聚合产品/案例/NPS" },
      { label: "发现 · 案例", to: "/discover/cases" },
      { label: "发现 · 案例对比", to: "/discover/cases/compare" },
      { label: "公开方案页", to: "/plans/$id/public", params: { id: "proj_neoyear--plan_A" } },
      { label: "媒体图集维护", to: "/media-library" },
    ],
  },
  {
    role: "移动端体验 · Mobile First",
    identity: "手机 / 平板视口打开",
    description: "以下入口在移动视口下有专门适配(演员端、公开发现、观众预登记等)。建议顶部工具栏切到 Mobile 预览。",
    icon: Smartphone,
    accent: "from-[color:var(--state-verified)]/30 to-transparent",
    entries: [
      { label: "演员工作台 (M)", to: "/actor", hint: "Mobile First · 底部 Tab" },
      { label: "演员 · 履约日历 (M)", to: "/actor/calendar" },
      { label: "演员 · 我的服务片段 (M)", to: "/actor/services" },
      { label: "演员 · 偏好 (M)", to: "/actor/preferences" },
      { label: "发现首页 (M)", to: "/" },
      { label: "发现 · 服务产品 (M)", to: "/discover/service-products", hint: "顶部搜索 + 横滑筛选" },
      { label: "发现 · 服务产品详情 (M)", to: "/discover/service-products/$id", params: { id: "sp_annual_signature" }, hint: "底部粘性 CTA" },
      { label: "发现 · 主服务方主页 (M)", to: "/discover/tenants/$id", params: { id: "ten_houyang" } },
      { label: "发现 · 演员 (M)", to: "/discover/actors" },
      { label: "发现 · 案例 (M)", to: "/discover/cases" },
      { label: "发现 · 节目 (M)", to: "/discover/programs" },
      { label: "观众预登记 (M)", to: "/projects/$id/execution/audience", params: { id: "proj_neoyear" }, hint: "扫码到场感知" },
      { label: "公开方案页 (M)", to: "/plans/$id/public", params: { id: "proj_neoyear--plan_A" } },
    ],
  },
  {
    role: "H5 移动端 · /h5 专用入口",
    identity: "手机视口 · 真实移动端组件",
    description: "使用独立 /h5 路由和专用移动组件，已接入真实 v2 API。建议 375-480px 视口打开。",
    icon: Smartphone,
    accent: "from-primary/30 to-transparent",
    entries: [
      { label: "移动首页 · /m", to: "/m", hint: "H5 聚合入口" },
      { label: "公共发现 · /h5/discover", to: "/h5/discover", hint: "演员/节目/案例/服务产品" },
      { label: "演员工作台 · /h5/actor", to: "/h5/actor", hint: "邀约 + 档期" },
      { label: "演员日历 · /h5/actor/calendar", to: "/h5/actor/calendar" },
      { label: "演员服务 · /h5/actor/services", to: "/h5/actor/services" },
      { label: "经营工作台 · /h5/tenant", to: "/h5/tenant", hint: "待办 + 快捷入口" },
      { label: "服务机会 · /h5/tenant/msa", to: "/h5/tenant/msa", hint: "v2 API 对接" },
      { label: "订单列表 · /h5/tenant/orders", to: "/h5/tenant/orders" },
      { label: "节目库 · /h5/tenant/programs", to: "/h5/tenant/programs" },
      { label: "项目列表 · /h5/projects", to: "/h5/projects" },
      { label: "项目详情 · /h5/projects/{id}", to: "/h5/projects/$id", params: { id: "proj_neoyear" } },
      { label: "商务确认 · /h5/projects/deal", to: "/h5/projects/deal", hint: "报价接受/拒绝 v2 API" },
      { label: "可行性快照 · /h5/snapshot", to: "/h5/snapshot" },
      { label: "AI 顾问 · /h5/agent", to: "/h5/agent" },
      { label: "发现 · 演员列表", to: "/h5/discover/actors" },
      { label: "发现 · 案例列表", to: "/h5/discover/cases" },
      { label: "发现 · 节目列表", to: "/h5/discover/programs" },
      { label: "发现 · 服务产品列表", to: "/h5/discover/service-products" },
    ],
  },
];

function DevLoginPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <header className="mb-8 flex items-start justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
            <Compass className="h-3 w-3" /> 开发调试 · 仅本地演示
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">多角色登录入口</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            演立方本轮 Demo 未接入真实鉴权。此页汇总企业客户、Tenant、演员、平台四端及通用工具的常用入口,便于开发期一键切换测试。所有身份均为 Mock。
          </p>
        </div>
        <div className="rounded-md border border-dashed border-border/60 bg-secondary/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          当前 Mock 身份:<br />
          <span className="text-foreground">Neo 银行 · 品牌市场部</span>
          <br />
          可在顶部导航右上角切换角色入口。
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {portals.map((p) => (
          <section
            key={p.role}
            className="relative overflow-hidden rounded-xl border border-border/60 bg-card/40 p-5"
          >
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${p.accent} opacity-60`}
            />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background/70">
                  <p.icon className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {p.role}
                  </div>
                  <div className="text-sm font-semibold">{p.identity}</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{p.description}</p>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {p.entries.map((e) => (
                  <li key={`${p.role}-${e.label}`}>
                    <Link
                      to={e.to as never}
                      params={e.params as never}
                      className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[11px] text-foreground/90 transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-foreground"
                      title={e.hint}
                    >
                      {e.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-10 rounded-lg border border-border/60 bg-secondary/30 p-4 text-[11px] leading-relaxed text-muted-foreground">
        提示:本页仅用于开发期快速跳转,不代表最终产品的登录流程。生产环境将接入真实鉴权与角色 RBAC,不同角色进入各自主域(企业客户 → 活动项目空间;Tenant → 经营工作台;演员 → 履约档期;平台 → 治理中心)。
      </footer>
    </div>
  );
}