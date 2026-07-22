import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  FolderKanban,
  Sparkles,
  Users,
  Package,
  BookOpenCheck,
  Compass,
  ShieldCheck,
  ArrowRight,
  X,
} from "lucide-react";

type Entry = {
  id: string;
  label: string;
  hint: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  params?: Record<string, string>;
  keywords: string;
};

const ENTRIES: Entry[] = [
  { id: "e1", label: "AI 顾问", hint: "把想法变成活动", group: "AI", icon: Sparkles, to: "/agent", keywords: "ai agent chat 顾问 对话" },
  { id: "e2", label: "AI 记忆中心", hint: "查看 / 编辑 / 遗忘", group: "AI", icon: Sparkles, to: "/agent/memory", keywords: "memory 记忆 隐私 偏好" },
  { id: "e3", label: "我的活动", hint: "全部项目列表", group: "项目", icon: FolderKanban, to: "/projects", keywords: "projects 活动 项目" },
  { id: "e4", label: "Neo 银行 · 2027 年度客户答谢晚宴", hint: "演示项目", group: "项目", icon: FolderKanban, to: "/projects/$id", params: { id: "proj_neoyear" }, keywords: "neo 银行 年会 demo 演示" },
  { id: "e5", label: "复盘知识沉淀 · Neo", hint: "让经验流回资产库", group: "项目", icon: Sparkles, to: "/projects/$id/retrospective", params: { id: "proj_neoyear" }, keywords: "复盘 retro 沉淀 知识" },
  { id: "e6", label: "发现 · 演员", hint: "浏览可合作演员", group: "发现", icon: Compass, to: "/discover/actors", keywords: "actors 演员 discover 发现" },
  { id: "e7", label: "发现 · 案例", hint: "历史活动案例", group: "发现", icon: Compass, to: "/discover/cases", keywords: "case 案例 gallery" },
  { id: "e8", label: "发现 · 服务产品", hint: "SKU 库", group: "发现", icon: Package, to: "/discover/service-products", keywords: "sku 服务产品 service products" },
  { id: "e9", label: "服务方主页 · 星野文化", hint: "作品/边界/口碑", group: "发现", icon: Compass, to: "/discover/tenants/$id", params: { id: "tenant_starfield" }, keywords: "tenant 服务方 主页" },
  { id: "e10", label: "服务方工作台", hint: "订单 / 执行 / 结算", group: "工作台", icon: FolderKanban, to: "/tenant", keywords: "tenant 服务方 工作台" },
  { id: "e11", label: "服务产品库", hint: "SKU 管理", group: "工作台", icon: Package, to: "/tenant/service-products", keywords: "sku 库 管理" },
  { id: "e12", label: "节目库", hint: "可复用节目", group: "工作台", icon: BookOpenCheck, to: "/tenant/programs", keywords: "programs 节目" },
  { id: "e13", label: "协作方", hint: "合作方档案", group: "工作台", icon: Users, to: "/tenant/partners", keywords: "partners 协作方" },
  { id: "e14", label: "演员端 · 工作台", hint: "档期 / 偏好 / 申诉", group: "工作台", icon: Users, to: "/actor", keywords: "actor 演员" },
  { id: "e15", label: "履约日历", hint: "档期与禁忌日", group: "工作台", icon: Users, to: "/actor/calendar", keywords: "calendar 档期" },
  { id: "e16", label: "平台治理", hint: "仲裁 / 准入 / 权限", group: "治理", icon: ShieldCheck, to: "/admin", keywords: "admin 治理 governance" },
  { id: "e17", label: "全局授权矩阵", hint: "跨角色分享审计", group: "治理", icon: ShieldCheck, to: "/admin/permissions", keywords: "permissions 授权 sharegrant" },
  { id: "e18", label: "数据主权中心", hint: "导出 / 撤回 / 销毁", group: "账户", icon: ShieldCheck, to: "/account/data", keywords: "data export 主权 隐私" },
  { id: "e19", label: "指引与教程", hint: "上手引导", group: "帮助", icon: BookOpenCheck, to: "/guides", keywords: "guide 教程 help" },
  { id: "e20", label: "开发者登录切换", hint: "多角色测试", group: "帮助", icon: Users, to: "/dev-login", keywords: "dev login 切换" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ENTRIES;
    return ENTRIES.filter(
      (e) =>
        e.label.toLowerCase().includes(s) ||
        e.hint.toLowerCase().includes(s) ||
        e.keywords.toLowerCase().includes(s),
    );
  }, [q]);

  useEffect(() => {
    if (idx >= results.length) setIdx(0);
  }, [results, idx]);

  function go(e: Entry) {
    setOpen(false);
    navigate({ to: e.to, params: e.params as never });
  }

  function onInputKey(ev: React.KeyboardEvent<HTMLInputElement>) {
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setIdx((i) => Math.max(i - 1, 0));
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      if (results[idx]) go(results[idx]);
    }
  }

  // Group results
  const grouped = useMemo(() => {
    const m = new Map<string, Entry[]>();
    results.forEach((r) => {
      const arr = m.get(r.group) ?? [];
      arr.push(r);
      m.set(r.group, arr);
    });
    return Array.from(m.entries());
  }, [results]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-2 rounded-md border border-border/60 bg-secondary/40 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-label="全局搜索"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden md:inline">搜索…</span>
        <kbd className="hidden rounded border border-border/60 bg-background/60 px-1 font-mono text-[10px] md:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-xl border border-border/70 bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border/60 px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setIdx(0);
                }}
                onKeyDown={onInputKey}
                placeholder="搜索项目、演员、服务产品、页面…"
                className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  没有匹配项
                </div>
              ) : (
                grouped.map(([group, list]) => (
                  <div key={group} className="mb-2 last:mb-0">
                    <div className="px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                      {group}
                    </div>
                    {list.map((e) => {
                      const globalIdx = results.indexOf(e);
                      const active = globalIdx === idx;
                      const Icon = e.icon;
                      return (
                        <button
                          key={e.id}
                          onMouseEnter={() => setIdx(globalIdx)}
                          onClick={() => go(e)}
                          className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition ${
                            active
                              ? "bg-primary/10 text-foreground"
                              : "text-foreground/85 hover:bg-secondary/60"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="flex-1 overflow-hidden">
                            <div className="truncate">{e.label}</div>
                            <div className="truncate text-[11px] text-muted-foreground">
                              {e.hint}
                            </div>
                          </div>
                          {active && <ArrowRight className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 bg-secondary/30 px-3 py-2 text-[10px] text-muted-foreground">
              <div className="flex gap-3">
                <span>
                  <kbd className="rounded border border-border/60 bg-background/60 px-1 font-mono">
                    ↑↓
                  </kbd>{" "}
                  选择
                </span>
                <span>
                  <kbd className="rounded border border-border/60 bg-background/60 px-1 font-mono">
                    ↵
                  </kbd>{" "}
                  打开
                </span>
                <span>
                  <kbd className="rounded border border-border/60 bg-background/60 px-1 font-mono">
                    Esc
                  </kbd>{" "}
                  关闭
                </span>
              </div>
              <span>{results.length} 项</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
