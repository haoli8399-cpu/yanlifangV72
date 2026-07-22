import { Monitor, Moon, Sun, RotateCcw } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/theme";
import { cn } from "@/lib/utils";

const items: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "系统", icon: Monitor },
  { value: "light", label: "明亮", icon: Sun },
  { value: "dark", label: "深色", icon: Moon },
];

interface Props {
  /** 作用域,例如 `project.<id>`。传入后按项目覆盖全局。 */
  scope?: string;
  /** 作用域下的显示标签,例如“本项目”。 */
  scopeLabel?: string;
  showLabels?: boolean;
}

export function ThemeToggle({ scope, scopeLabel, showLabels = false }: Props) {
  const { mode, setTheme, hasScopeOverride, clearScope } = useTheme(scope);
  return (
    <div className="inline-flex items-center gap-1">
      {scope && scopeLabel && (
        <span className="hidden text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
          {scopeLabel}
        </span>
      )}
      <div
        className="inline-flex items-center gap-0.5 rounded-md border border-border/60 bg-secondary/40 p-0.5"
        role="group"
        aria-label={scope ? `${scopeLabel ?? "作用域"}主题` : "全局主题"}
      >
        {items.map((it) => {
          const active = mode === it.value;
          const Icon = it.icon;
          return (
            <button
              key={it.value}
              type="button"
              onClick={() => setTheme(it.value)}
              aria-pressed={active}
              title={it.label}
              className={cn(
                "inline-flex h-6 items-center gap-1 rounded px-1.5 text-[11px] transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3 w-3" />
              {showLabels && <span>{it.label}</span>}
            </button>
          );
        })}
      </div>
      {scope && hasScopeOverride && (
        <button
          type="button"
          onClick={clearScope}
          title="清除项目覆盖,恢复全局"
          className="inline-flex h-6 items-center gap-1 rounded-md border border-border/60 bg-secondary/40 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="hidden sm:inline">用全局</span>
        </button>
      )}
    </div>
  );
}
