// 主题模式:跟随系统 / 明亮 / 深色。支持全局与按作用域(如项目)覆盖。
import { useEffect, useState, useCallback, useMemo } from "react";

export type ThemeMode = "system" | "light" | "dark";
const GLOBAL_KEY = "ylc.theme";
const scopeKey = (scope: string) => `ylc.theme.${scope}`;

export function readStoredTheme(scope?: string): ThemeMode | null {
  if (typeof window === "undefined") return null;
  const key = scope ? scopeKey(scope) : GLOBAL_KEY;
  const v = window.localStorage.getItem(key);
  return v === "light" || v === "dark" || v === "system" ? v : null;
}

export function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode;
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(mode);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.themeMode = mode;
}

/** 头部内联脚本:水合前应用主题,避免闪烁。 */
export const themeBootstrapScript = `
(function(){try{
  var m = localStorage.getItem('${GLOBAL_KEY}') || 'system';
  // 若当前路径匹配 /projects/:id, 读取项目级覆盖
  var mm = location.pathname.match(/^\\/projects\\/([^\\/]+)/);
  if (mm) { var pm = localStorage.getItem('ylc.theme.project.' + mm[1]); if (pm) m = pm; }
  var dark = m === 'dark' || (m === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.dataset.themeMode = m;
}catch(e){}})();
`;

/**
 * useTheme:
 *  - 无 scope: 读写全局主题
 *  - 传 scope: 读写该作用域(如 `project.abc123`),未设置时回退全局
 */
export function useTheme(scope?: string) {
  const [globalMode, setGlobalMode] = useState<ThemeMode>("system");
  const [scopedMode, setScopedMode] = useState<ThemeMode | null>(null);

  // 水合读取
  useEffect(() => {
    setGlobalMode(readStoredTheme() ?? "system");
    if (scope) setScopedMode(readStoredTheme(scope));
  }, [scope]);

  const effective: ThemeMode = scopedMode ?? globalMode;

  // 应用
  useEffect(() => {
    applyTheme(effective);
  }, [effective]);

  // 跟随系统
  useEffect(() => {
    if (effective !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [effective]);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      try {
        if (scope) {
          window.localStorage.setItem(scopeKey(scope), next);
          setScopedMode(next);
        } else {
          window.localStorage.setItem(GLOBAL_KEY, next);
          setGlobalMode(next);
        }
      } catch {}
    },
    [scope],
  );

  const clearScope = useCallback(() => {
    if (!scope) return;
    try { window.localStorage.removeItem(scopeKey(scope)); } catch {}
    setScopedMode(null);
  }, [scope]);

  return useMemo(
    () => ({
      mode: scope ? scopedMode ?? globalMode : globalMode,
      globalMode,
      scopedMode,
      hasScopeOverride: scopedMode !== null,
      setTheme,
      clearScope,
      resolved: resolveTheme(effective),
    }),
    [scope, scopedMode, globalMode, setTheme, clearScope, effective],
  );
}
