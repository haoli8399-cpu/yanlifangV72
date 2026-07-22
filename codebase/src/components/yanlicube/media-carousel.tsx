import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

type Props = {
  images: string[];
  aspect?: string; // e.g. "aspect-[3/2]"
  rounded?: string;
  showThumbs?: boolean;
  emptyLabel?: string;
};

export function MediaCarousel({
  images,
  aspect = "aspect-[3/2]",
  rounded = "rounded-xl",
  showThumbs = true,
  emptyLabel = "暂无图片",
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = el.clientWidth;
        if (w > 0) {
          const i = Math.round(el.scrollLeft / w);
          setIndex(Math.min(images.length - 1, Math.max(0, i)));
        }
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [images.length]);

  const scrollTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.min(images.length - 1, Math.max(0, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };

  if (!images || images.length === 0) {
    return (
      <div
        className={`${aspect} ${rounded} flex items-center justify-center border border-dashed border-border/60 bg-secondary/20 text-xs text-muted-foreground`}
      >
        <ImageOff className="mr-2 h-4 w-4" />
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={`relative group ${rounded} overflow-hidden bg-secondary/30`}>
        <div
          ref={scrollerRef}
          className={`flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth ${aspect} [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") scrollTo(index - 1);
            if (e.key === "ArrowRight") scrollTo(index + 1);
          }}
          tabIndex={0}
          role="region"
          aria-label="图集"
        >
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="relative w-full flex-shrink-0 snap-center">
              <img
                src={src}
                alt={`第 ${i + 1} 张`}
                loading={i === 0 ? "eager" : "lazy"}
                draggable={false}
                className="h-full w-full object-cover select-none"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="上一张"
              onClick={() => scrollTo(index - 1)}
              disabled={index === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground opacity-0 backdrop-blur transition-opacity hover:bg-background disabled:opacity-30 group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="下一张"
              onClick={() => scrollTo(index + 1)}
              disabled={index === images.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground opacity-0 backdrop-blur transition-opacity hover:bg-background disabled:opacity-30 group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-background/70 px-2 py-1 text-[10px] font-medium text-foreground backdrop-blur">
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {showThumbs && images.length > 1 && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <button
              key={`thumb-${src}-${i}`}
              type="button"
              onClick={() => scrollTo(i)}
              className={`relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-md border transition ${
                i === index
                  ? "border-primary ring-1 ring-primary"
                  : "border-border/60 opacity-70 hover:opacity-100"
              }`}
              aria-label={`跳到第 ${i + 1} 张`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}