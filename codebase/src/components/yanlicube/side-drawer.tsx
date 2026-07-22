import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 通用右侧滑出抽屉
 * - 遮罩点击关闭 / ESC 关闭
 * - 打开时锁定 body 滚动
 * - 移动端全宽 + 顶部左侧「返回」按钮 + 右滑手势关闭
 * - 桌面端 560px 宽,右上角关闭按钮
 * - 进入动画: translateX(100%) → 0
 */
export function SideDrawer({
  open,
  onClose,
  eyebrow,
  title,
  subtitle,
  badge,
  footer,
  children,
  widthClassName = "sm:max-w-[560px]",
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  widthClassName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [dragX, setDragX] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  // 挂载 / 卸载 + 进场动画
  useEffect(() => {
    if (open) {
      setMounted(true);
      const t = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(t);
    }
    setEntered(false);
    const t = setTimeout(() => setMounted(false), 220);
    return () => clearTimeout(t);
  }, [open]);

  // 锁定 body 滚动
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    isDragging.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    // 仅右滑且水平位移显著大于垂直,才判定为滑动关闭
    if (!isDragging.current) {
      if (dx > 8 && Math.abs(dx) > Math.abs(dy) * 1.5) isDragging.current = true;
      else return;
    }
    if (dx > 0) setDragX(dx);
  };
  const onTouchEnd = () => {
    if (isDragging.current && dragX > 120) {
      onClose();
    }
    setDragX(0);
    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  const translate = entered ? dragX : (typeof window !== "undefined" ? window.innerWidth : 800);
  const overlayOpacity = entered ? Math.max(0, 1 - dragX / 400) : 0;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200"
        style={{ opacity: overlayOpacity }}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-[100dvh] w-full flex-col bg-background shadow-2xl",
          "pb-[env(safe-area-inset-bottom)]",
          widthClassName,
        )}
        style={{
          transform: `translateX(${translate}px)`,
          transition: dragX === 0 ? "transform 200ms ease-out" : "none",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
          {/* 移动端: 左侧返回箭头 */}
          <button
            onClick={onClose}
            className="mt-0.5 shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground sm:hidden"
            aria-label="返回"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            {eyebrow && (
              <div className="text-[11px] tracking-[0.14em] text-muted-foreground">{eyebrow}</div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 truncate text-base font-semibold text-foreground sm:text-lg">
                {title}
              </span>
              {badge}
            </div>
            {subtitle && (
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</div>
            )}
          </div>

          {/* 桌面端: 右侧关闭 */}
          <button
            onClick={onClose}
            className="hidden shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground sm:inline-flex"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {children}
        </div>

        {footer && (
          <footer className="flex items-center gap-2 border-t border-border/60 bg-background px-4 py-3 sm:px-5">
            {footer}
          </footer>
        )}
      </aside>
    </>
  );
}
