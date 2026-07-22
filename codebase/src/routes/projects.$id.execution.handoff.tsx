import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { stageBoundaries } from "@/components/yanlicube/stage-error";
import { getProject } from "@/lib/fixtures";
import { StatusBadge } from "@/components/yanlicube/status-badge";
import {
  ArrowLeft,
  Package,
  ClipboardCheck,
  MapPin,
  Clock,
  FileText,
  Users,
  Mic2,
  Lightbulb,
  Video,
  Sparkles,
  Download,
  Send,
  ShieldCheck,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useMemo, useState } from "react";
import { demoToast } from "@/lib/demo-toast";

export const Route = createFileRoute("/projects/$id/execution/handoff")({
  loader: ({ params }) => {
    const project = getProject(params.id);
    if (!project) throw notFound();
    return { project };
  },
  head: () => ({ meta: [{ title: "履约交接包 · 演立方" }] }),
  component: HandoffPage,
  ...stageBoundaries({ backTo: "/projects/$id/execution", backLabel: "返回上一环节", homeTo: "/projects/$id" }),
});

type Recipient = {
  id: string;
  name: string;
  role: string;
  icon: typeof Mic2;
  scope: string;
  arrival: string;
  deliverable: string;
  status: "ready" | "waiting_ack" | "acknowledged";
};

const recipients: Recipient[] = [
  {
    id: "r1",
    name: "光弦舞美 · 现场组",
    role: "灯光音响",
    icon: Lightbulb,
    scope: "舞美搭建 · 灯光音响调试",
    arrival: "12/06 · 08:00 到场",
    deliverable: "带装彩排验收单 · 灯光走位图 v3",
    status: "acknowledged",
  },
  {
    id: "r2",
    name: "周晔工作室",
    role: "主演",
    icon: Mic2,
    scope: "现场脱口秀 20 min",
    arrival: "12/06 · 15:00 到场彩排",
    deliverable: "定稿脚本 v4 · 已声明无软/硬禁忌冲突",
    status: "waiting_ack",
  },
  {
    id: "r3",
    name: "林知遥",
    role: "开场主持",
    icon: Users,
    scope: "开场互动 15 min · 主持串场",
    arrival: "12/06 · 15:30 到场",
    deliverable: "主持流程稿 · 客户品牌 Do & Don't",
    status: "ready",
  },
  {
    id: "r4",
    name: "云台影像",
    role: "直播分发",
    icon: Video,
    scope: "多机位直播 · 短视频剪辑",
    arrival: "12/06 · 10:00 到场架机",
    deliverable: "机位图 · 直播链路参数 · 客户分发口径",
    status: "waiting_ack",
  },
];

const statusMeta: Record<
  Recipient["status"],
  { label: string; state: "verified" | "pending" | "ai" }
> = {
  acknowledged: { label: "已签收 · 确认无异议", state: "verified" },
  waiting_ack: { label: "等待签收", state: "pending" },
  ready: { label: "已就绪 · 待发送", state: "ai" },
};

type PackageSection = {
  key: string;
  title: string;
  icon: typeof FileText;
  items: { label: string; note?: string }[];
};

const sections: PackageSection[] = [
  {
    key: "venue",
    title: "场地与到场信息",
    icon: MapPin,
    items: [
      { label: "场地: 上海 · 前滩 31 演艺中心 · 主厅" },
      { label: "装台窗口: 12/06 06:00 - 12:00" },
      { label: "带装彩排: 12/06 16:00 - 18:00" },
      { label: "正式演出: 12/06 19:30 - 21:00" },
      { label: "撤场窗口: 12/06 22:00 前" },
    ],
  },
  {
    key: "content",
    title: "内容与品牌 Do & Don't",
    icon: FileText,
    items: [
      { label: "客户品牌基调: 稳健 · 有分寸的幽默 · 面向 30-50 岁高净值客户" },
      { label: "硬禁忌: 政治敏感 · 竞品(招银 / 中信私行) · 具体理财产品名" },
      { label: "软禁忌: 加密货币 / 元宇宙玩笑(客户已声明不接受)" },
      { label: "口径示例见附件《Neo 银行内容边界 v2》" },
    ],
  },
  {
    key: "schedule",
    title: "串场秒表",
    icon: Clock,
    items: [
      { label: "19:30 · 开场互动(林知遥 · 15 min)" },
      { label: "19:45 · 客户领导致辞(6 min · 客户方主控)" },
      { label: "19:51 · 主演 · 周晔(20 min)" },
      { label: "20:11 · 演员+客户高管圆桌(20 min · 主持: 林知遥)" },
      { label: "20:31 · 音乐环节(嘉宾表演 · 15 min)" },
      { label: "20:46 · 送客灯光渐弱 · 网络分发即时切出" },
    ],
  },
  {
    key: "contacts",
    title: "对接人与升级路径",
    icon: Users,
    items: [
      { label: "主服务方现场统筹: 后仰喜剧 · 陈晚 · 138-****-2201" },
      { label: "客户对接人: Neo 银行 · 姚敏 · 仅限主服务方联系" },
      { label: "场地对接: 前滩 31 · 值班经理 021-****-8800" },
      { label: "升级路径: 现场 → 主服务方总控 → 客户对接人(不越级)" },
    ],
  },
];

function HandoffPage() {
  const { project } = Route.useLoaderData();
  const [selectedId, setSelectedId] = useState<string>("r2");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const selected = recipients.find((r) => r.id === selectedId)!;
  const allItems = sections.flatMap((s) => s.items.map((it) => `${s.key}:${it.label}`));
  const doneCount = allItems.filter((k) => checked[`${selectedId}:${k}`]).length;
  const progress = Math.round((doneCount / allItems.length) * 100);

  const summary = useMemo(() => {
    const ackCount = recipients.filter((r) => r.status === "acknowledged").length;
    return { ackCount, total: recipients.length };
  }, []);

  return (
    <>
      <div className="space-y-6">
        <Link
          to="/projects/$id/execution"
          params={{ id: project.id }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> 返回履约时间线
        </Link>

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">现场交接包</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              主服务方向每位协作方/演员发送的一份可核验凭证:包含场地、时间点、内容边界、对接人、验收单。
              签收即视为该协作方对交付信息无异议。
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 px-4 py-3 text-xs">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <div>
              <div className="font-medium text-foreground">
                {summary.ackCount} / {summary.total} 已签收
              </div>
              <div className="text-muted-foreground">剩余对象将在 T-24h 自动催办</div>
            </div>
          </div>
        </header>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-xs text-foreground/85">
          <div className="mb-1 flex items-center gap-1.5 font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI 交接建议
          </div>
          <p>
            周晔工作室的主演脚本 v4 已通过软/硬禁忌自检,建议尽快发送签收。
            云台影像的机位图缺少「客户领导致辞」的双机备份切换点,建议在发送前补齐。
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Recipient list */}
          <nav className="space-y-2">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              接收对象
            </div>
            {recipients.map((r) => {
              const Icon = r.icon;
              const meta = statusMeta[r.status];
              const active = r.id === selectedId;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    active
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/60 bg-card/60 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <span className="text-sm font-medium text-foreground">{r.name}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{r.role} · {r.scope}</div>
                  <div className="mt-2">
                    <StatusBadge state={meta.state} label={meta.label} />
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Package detail */}
          <div className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-card/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {selected.name} · 交接包
                    </h3>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {selected.arrival} · {selected.deliverable}
                  </div>
                </div>
                <StatusBadge
                  state={statusMeta[selected.status].state}
                  label={statusMeta[selected.status].label}
                />
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px]">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-mono text-muted-foreground">
                  {doneCount}/{allItems.length} · {progress}%
                </span>
              </div>
            </div>

            {sections.map((sec) => {
              const Icon = sec.icon;
              return (
                <section
                  key={sec.key}
                  className="rounded-lg border border-border/60 bg-card/60"
                >
                  <div className="flex items-center gap-2 border-b border-border/50 px-5 py-3">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <h4 className="text-xs font-semibold text-foreground">{sec.title}</h4>
                  </div>
                  <ul className="px-5 py-3">
                    {sec.items.map((it) => {
                      const key = `${selectedId}:${sec.key}:${it.label}`;
                      const done = !!checked[key];
                      return (
                        <li key={it.label} className="flex items-start gap-2 py-1.5">
                          <button
                            onClick={() =>
                              setChecked({ ...checked, [key]: !done })
                            }
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                              done
                                ? "border-[color:var(--state-verified)] bg-[color:var(--state-verified)]/20"
                                : "border-border/60 bg-background/40"
                            }`}
                          >
                            {done && (
                              <Check className="h-3 w-3 text-[color:var(--state-verified)]" />
                            )}
                          </button>
                          <span
                            className={`text-xs ${
                              done ? "text-muted-foreground line-through" : "text-foreground/85"
                            }`}
                          >
                            {it.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}

            <div className="rounded-lg border border-border/60 bg-card/60 p-5">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> 存证与签收
              </div>
              <p className="text-xs text-foreground/85">
                当前包体指纹已生成可信时间戳存证,任何一方在演出结束前修改均会生成变更记录并通知。
                协作方点击签收即视为对本包所有条目无异议。
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 font-medium text-primary-foreground">
                  <Send className="h-3 w-3" /> 发送 / 重发交接包
                </button>
                <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded border border-border/60 bg-background px-3 py-1.5 text-muted-foreground hover:text-foreground">
                  <Download className="h-3 w-3" /> 下载 PDF 快照
                </button>
                <button onClick={() => demoToast()} className="inline-flex items-center gap-1 rounded border border-[color:var(--state-expired)]/40 bg-[color:var(--state-expired)]/10 px-3 py-1.5 text-[color:var(--state-expired)]">
                  <AlertTriangle className="h-3 w-3" /> 标记异议
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}