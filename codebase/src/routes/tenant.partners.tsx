import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, Sparkles, Star, ShieldCheck, AlertTriangle, Handshake, MapPin, Plus, UserRoundPlus, Users2, Pencil, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import { AgentInlineSuggestion, EvidenceLine, AgentMessage } from "@/components/yanlicube/agent";
import { demoToast } from "@/lib/demo-toast";
import { tenantActorsStore, relationMeta, type TenantActorRecord, type TenantActorRelation } from "@/lib/tenant-actors-store";
import { TenantActorDrawer } from "@/components/yanlicube/tenant-actor-drawer";
import { SideDrawer } from "@/components/yanlicube/side-drawer";

export const Route = createFileRoute("/tenant/partners")({
  head: () => ({
    meta: [
      { title: "协作方管理 · 服务方 · 演立方" },
      { name: "description", content: "作为主服务方,统一管理你的执行伙伴与我的签约/常用演员,能力、协作、结算与私有备注一处沉淀。" },
    ],
  }),
  component: PartnersPage,
});

type Partner = {
  id: string;
  name: string;
  scope: string[];
  cities: string[];
  collaborations: number;
  successRate: number;
  outstanding: string;
  status: "trusted" | "onboarding" | "watch";
  lastProject: string;
  lastNps: number;
  tags: string[];
  note?: string;
};

const partners: Partner[] = [
  {
    id: "ptn_stage",
    name: "光弦舞美",
    scope: ["舞台搭建", "灯光音响", "LED 屏"],
    cities: ["上海", "杭州", "南京"],
    collaborations: 22,
    successRate: 96,
    outstanding: "¥ 0",
    status: "trusted",
    lastProject: "2026-06 · 某券商年会",
    lastNps: 72,
    tags: ["长期合作", "首选"],
  },
  {
    id: "ptn_video",
    name: "远视觉影像",
    scope: ["直播导播", "多机位剪辑", "同传流媒体"],
    cities: ["上海", "北京"],
    collaborations: 11,
    successRate: 91,
    outstanding: "¥ 3.2 万",
    status: "trusted",
    lastProject: "2026-05 · SaaS Kickoff",
    lastNps: 68,
    tags: ["直播强项"],
  },
  {
    id: "ptn_host",
    name: "夜白双语主持团",
    scope: ["中英双语主持", "现场翻译"],
    cities: ["上海", "北京", "深圳"],
    collaborations: 6,
    successRate: 88,
    outstanding: "¥ 0",
    status: "onboarding",
    lastProject: "2026-04 · 汽车品牌发布",
    lastNps: 65,
    tags: ["近半年协作 3 次"],
    note: "AI:建议再合作 2 次并核验商务档期后,可加入首选池。",
  },
  {
    id: "ptn_catering",
    name: "尚宴礼仪",
    scope: ["礼仪引导", "接待动线"],
    cities: ["上海"],
    collaborations: 4,
    successRate: 75,
    outstanding: "¥ 0",
    status: "watch",
    lastProject: "2026-03 · 汽车品牌发布",
    lastNps: 58,
    tags: ["需观察"],
    note: "上次现场签到延迟 15 分钟 · AI 建议下次任务限定小规模场景或试点观察。",
  },
];

const statusMap: Record<Partner["status"], { label: string; tone: "verified" | "pending" | "expired" }> = {
  trusted: { label: "长期信任", tone: "verified" },
  onboarding: { label: "考察中", tone: "pending" },
  watch: { label: "需观察", tone: "expired" },
};

function PartnersPage() {
  const [tab, setTab] = useState<"partners" | "actors">("partners");

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <Link to="/tenant" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回经营工作台
      </Link>

      <div className="mb-6">
        <div className="mb-2 text-xs tracking-[0.14em] text-muted-foreground">TENANT · 协作方管理</div>
        <h1 className="text-2xl font-semibold text-foreground">你的执行伙伴与常用演员,像团队一样管理</h1>
        <div className="mt-1 text-xs text-muted-foreground">
          能力范围 · 协作历史 · 内部报价 · 私有备注 —— 所有内部信息仅本商户可见,AI 只在你分派任务时插入建议
        </div>
      </div>

      <div className="mb-6 inline-flex rounded-lg border border-border/60 bg-card/40 p-1">
        <TabBtn active={tab === "partners"} onClick={() => setTab("partners")} icon={<Users2 className="h-3.5 w-3.5" />}>
          协作方
        </TabBtn>
        <TabBtn active={tab === "actors"} onClick={() => setTab("actors")} icon={<UserRoundPlus className="h-3.5 w-3.5" />}>
          我的演员
        </TabBtn>
      </div>

      {tab === "partners" ? <PartnersPanel /> : <ActorsPanel />}
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function PartnersPanel() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Partner | null>(null);

  const filtered = useMemo(
    () => partners.filter((p) => p.name.includes(q) || p.scope.some((s) => s.includes(q)) || p.cities.some((c) => c.includes(q))),
    [q],
  );

  const kpis = [
    { label: "协作方总数", value: partners.length, sub: "1 项需观察" },
    { label: "本月在途结算", value: "¥ 3.2 万", sub: "远视觉影像" },
    { label: "平均协作成功率", value: "90%", sub: "近 12 个月" },
    { label: "首选池", value: partners.filter((p) => p.status === "trusted").length, sub: "AI 会优先推荐" },
  ];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={() => demoToast()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> 邀请新协作方
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="surface-1 rounded-xl p-4">
            <div className="text-[11px] tracking-wide text-muted-foreground">{k.label}</div>
            <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{k.value}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="按名称、能力或城市搜索"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((p) => {
          const meta = statusMap[p.status];
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="surface-1 group w-full rounded-xl p-4 text-left transition-all hover:border-primary/40 hover:ring-1 hover:ring-primary/30"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-base font-medium text-foreground">{p.name}</div>
                    {p.status === "trusted" && <ShieldCheck className="h-4 w-4 text-primary" />}
                    {p.status === "watch" && <AlertTriangle className="h-4 w-4 text-[color:var(--state-expired)]" />}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{p.scope.join(" · ")}</div>
                </div>
                <StatusBadge state={meta.tone} label={meta.label} />
              </div>

              <div className="mb-2 flex flex-wrap gap-1.5">
                {p.cities.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                    <MapPin className="h-3 w-3" />{c}
                  </span>
                ))}
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-foreground/80">{t}</span>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-3 text-[11px] text-muted-foreground">
                <div><span>协作次数</span><div className="font-mono text-foreground">{p.collaborations}</div></div>
                <div><span>成功率</span><div className="font-mono text-foreground">{p.successRate}%</div></div>
                <div><span>末次 NPS</span><div className="font-mono text-foreground">{p.lastNps}</div></div>
                <div><span>在途结算</span><div className="font-mono text-foreground">{p.outstanding}</div></div>
              </div>

              {p.note && (
                <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] text-primary/90">
                  <Sparkles className="mr-1 inline h-3 w-3" /> {p.note}
                </div>
              )}

              <div className="mt-3 flex items-center justify-end text-[11px] text-muted-foreground group-hover:text-primary">
                查看详情 <ChevronRight className="h-3 w-3" />
              </div>
            </button>
          );
        })}
      </div>

      {selected && <PartnerDrawer partner={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function PartnerDrawer({ partner, onClose }: { partner: Partner; onClose: () => void }) {
  const meta = statusMap[partner.status];
  return (
    <SideDrawer
      open
      onClose={onClose}
      eyebrow="协作方 · 详情"
      title={partner.name}
      subtitle={partner.scope.join(" · ")}
      badge={<StatusBadge state={meta.tone} label={meta.label} />}
      footer={
        <>
          <button onClick={() => demoToast()} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card/60 px-3 py-2 text-xs text-foreground hover:bg-secondary">
            <Star className="h-3.5 w-3.5" /> 加入首选池
          </button>
          <button onClick={() => demoToast()} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Handshake className="h-3.5 w-3.5" /> 分派新任务
          </button>
        </>
      }
    >
      <section className="surface-1 rounded-lg p-4">
        <div className="mb-2 text-xs font-medium text-foreground">基础信息</div>
        <div className="space-y-2 text-sm">
          <Row label="覆盖城市" value={partner.cities.join(" / ")} />
          <Row label="累计协作" value={`${partner.collaborations} 次`} />
          <Row label="成功率" value={`${partner.successRate}%`} />
          <Row label="末次项目" value={partner.lastProject} />
          <Row label="末次 NPS" value={String(partner.lastNps)} />
          <Row label="在途应付" value={partner.outstanding} />
        </div>
      </section>

      <section className="surface-1 rounded-lg p-4">
        <div className="mb-2 text-xs font-medium text-foreground">AI 提示</div>
        {partner.note ? (
          <AgentInlineSuggestion
            title="基于历史协作的观察"
            actions={
              <button onClick={() => demoToast()} className="rounded-md bg-primary/90 px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary">
                采纳建议
              </button>
            }
          >
            {partner.note}
          </AgentInlineSuggestion>
        ) : (
          <AgentMessage>
            「{partner.name}」在过去 12 个月与你协作 {partner.collaborations} 次,成功率 {partner.successRate}%。当前无异常。
          </AgentMessage>
        )}
        <div className="mt-3 space-y-2">
          <EvidenceLine source="协作记录">{partner.collaborations} 次完成,最近 {partner.lastProject}</EvidenceLine>
          <EvidenceLine source="服务方结算">当前在途应付 {partner.outstanding}</EvidenceLine>
        </div>
      </section>
    </SideDrawer>
  );
}




function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-2 last:border-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-right text-xs text-foreground">{value}</div>
    </div>
  );
}

// ============= 「我的演员」面板 =============

function ActorsPanel() {
  const [records, setRecords] = useState<TenantActorRecord[]>([]);
  const [q, setQ] = useState("");
  const [relFilter, setRelFilter] = useState<"all" | TenantActorRelation>("all");
  const [privateOnly, setPrivateOnly] = useState(false);
  const [drawer, setDrawer] = useState<{ record: TenantActorRecord | null; mode: "view" | "edit" | "create" }>({
    record: null,
    mode: "view",
  });

  const refresh = () => setRecords(tenantActorsStore.list());
  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        if (relFilter !== "all" && r.relation !== relFilter) return false;
        if (privateOnly && r.linkedActorId) return false;
        if (q) {
          const s = `${r.displayName}${r.headline ?? ""}${r.city ?? ""}${r.note ?? ""}`;
          if (!s.includes(q)) return false;
        }
        return true;
      }),
    [records, q, relFilter, privateOnly],
  );

  const stats = useMemo(
    () => ({
      total: records.length,
      trusted: records.filter((r) => r.relation === "trusted").length,
      watch: records.filter((r) => r.relation === "watch").length,
      priv: records.filter((r) => !r.linkedActorId).length,
    }),
    [records],
  );

  const openCreate = () => {
    const now = new Date().toISOString();
    setDrawer({
      mode: "create",
      record: {
        id: `tact_new_${Date.now()}`,
        displayName: "",
        relation: "onboarding",
        createdAt: now,
        updatedAt: now,
      },
    });
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <EvidenceLine source="本商户私有资料库">
          仅本商户可见 · 演员端不会看到你的内部报价、内部备注与联系人。共 {stats.total} 位。
        </EvidenceLine>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> 新增私有演员
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "我的演员总数", value: stats.total, sub: `${stats.priv} 位仅私有备案` },
          { label: "长期信任", value: stats.trusted, sub: "AI 优先推荐" },
          { label: "需观察", value: stats.watch, sub: "小范围试用" },
          { label: "内部报价平均", value: avgQuote(records), sub: "近 12 个月记录" },
        ].map((k) => (
          <div key={k.label} className="surface-1 rounded-xl p-4">
            <div className="text-[11px] tracking-wide text-muted-foreground">{k.label}</div>
            <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{k.value}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="按姓名、身份、城市或备注搜索"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="flex gap-1 rounded-md border border-border/60 bg-card/40 p-1 text-xs">
          {(["all", "trusted", "onboarding", "watch"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRelFilter(r)}
              className={cn(
                "rounded px-2.5 py-1",
                relFilter === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r === "all" ? "全部" : relationMeta[r].label}
            </button>
          ))}
        </div>
        <label className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={privateOnly} onChange={(e) => setPrivateOnly(e.target.checked)} className="accent-primary" />
          仅显示私有(未链接平台)
        </label>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="surface-1 rounded-xl p-10 text-center text-sm text-muted-foreground">
            没有匹配的演员记录 —— 试试新增,或从「发现 · 演员」详情页点击「加入我的演员库」。
          </div>
        )}
        {filtered.map((r) => (
          <button
            key={r.id}
            onClick={() => setDrawer({ record: r, mode: "view" })}
            className="surface-1 group w-full rounded-xl p-4 text-left transition-colors hover:border-primary/40"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-medium text-foreground">{r.displayName}</span>
                  <StatusBadge state={relationMeta[r.relation].tone} label={relationMeta[r.relation].label} />
                  {r.linkedActorId ? (
                    <span className="rounded-full border border-primary/40 bg-primary/5 px-2 py-px text-[10px] text-primary">
                      已链接平台
                    </span>
                  ) : (
                    <span className="rounded-full border border-border/60 bg-card/40 px-2 py-px text-[10px] text-muted-foreground">
                      仅私有
                    </span>
                  )}
                  {r.relation === "trusted" && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                  {r.relation === "watch" && <AlertTriangle className="h-3.5 w-3.5 text-[color:var(--state-expired)]" />}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {[r.headline, r.city].filter(Boolean).join(" · ") || "未填写身份 / 城市"}
                </div>
                {r.note && (
                  <div className="mt-2 line-clamp-2 rounded-md border border-primary/15 bg-primary/5 px-2.5 py-1.5 text-[11px] text-primary/90">
                    <Sparkles className="mr-1 inline h-3 w-3" />
                    {r.note}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-mono text-lg text-foreground">
                  {r.quote ? `¥ ${r.quote.amount.toLocaleString()}` : "—"}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {r.quote?.note ?? "内部报价"}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  <Pencil className="h-3 w-3" /> 打开详情
                </div>
              </div>
            </div>
            {r.lastCollaboration && (
              <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" /> 最近合作 · {r.lastCollaboration}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <AgentInlineSuggestion title="AI 只用这里的内部信息做私有匹配">
          「我的演员」中的报价与备注不会写入公开档案,也不会被其他商户或演员本人看到。它们只在你下一次
          组盘/派单时被 AI 用作「与本商户契合度」的参考,并且始终在「AI 建议 ↔ 你的决策」的边界内。
        </AgentInlineSuggestion>
      </div>

      {drawer.record && (
        <TenantActorDrawer
          record={drawer.record}
          mode={drawer.mode}
          onClose={() => setDrawer({ record: null, mode: "view" })}
          onSaved={refresh}
        />
      )}
    </>
  );
}

function avgQuote(records: TenantActorRecord[]) {
  const qs = records.map((r) => r.quote?.amount ?? 0).filter((n) => n > 0);
  if (qs.length === 0) return "—";
  const avg = Math.round(qs.reduce((a, b) => a + b, 0) / qs.length);
  return `¥ ${avg.toLocaleString()}`;
}

