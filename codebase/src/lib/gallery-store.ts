// 本地 mock 图集存储：以 localStorage 覆盖 fixtures 中的 gallery 字段。
// 仅用于演示与前端 UI 交互，不做持久化后端。

const PREFIX = "yanlicube.gallery.v1";

function key(kind: "actor" | "case", id: string) {
  return `${PREFIX}.${kind}.${id}`;
}

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadGalleryOverride(
  kind: "actor" | "case",
  id: string,
): string[] | null {
  const ls = safeLocalStorage();
  if (!ls) return null;
  try {
    const raw = ls.getItem(key(kind, id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed as string[];
    }
    return null;
  } catch {
    return null;
  }
}

export function saveGalleryOverride(
  kind: "actor" | "case",
  id: string,
  images: string[],
) {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.setItem(key(kind, id), JSON.stringify(images));
  } catch {
    // ignore
  }
}

export function clearGalleryOverride(kind: "actor" | "case", id: string) {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    ls.removeItem(key(kind, id));
  } catch {
    // ignore
  }
}

export function resolveGallery(
  kind: "actor" | "case",
  id: string,
  fallback?: string[],
): string[] {
  const override = loadGalleryOverride(kind, id);
  if (override) return override;
  return fallback ?? [];
}