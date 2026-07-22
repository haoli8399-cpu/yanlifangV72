import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, RotateCcw, Trash2, Upload } from "lucide-react";
import {
  clearGalleryOverride,
  loadGalleryOverride,
  saveGalleryOverride,
} from "@/lib/gallery-store";

type Props = {
  kind: "actor" | "case";
  id: string;
  title: string;
  fallback?: string[];
  hint?: string;
};

export function ImageManager({ kind, id, title, fallback = [], hint }: Props) {
  const [images, setImages] = useState<string[]>(fallback);
  const [url, setUrl] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const override = loadGalleryOverride(kind, id);
    if (override) setImages(override);
    else setImages(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, id]);

  const commit = (next: string[]) => {
    setImages(next);
    saveGalleryOverride(kind, id, next);
    setSavedAt(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
  };

  const addUrl = () => {
    const v = url.trim();
    if (!v) return;
    commit([...images, v]);
    setUrl("");
  };

  const remove = (i: number) => commit(images.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = images.slice();
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  const reset = () => {
    clearGalleryOverride(kind, id);
    setImages(fallback);
    setSavedAt(null);
  };

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(
      (f) =>
        new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = reject;
          r.readAsDataURL(f);
        }),
    );
    Promise.all(readers).then((datas) => commit([...images, ...datas]));
  };

  return (
    <div className="surface-1 rounded-xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {hint ?? "支持添加图片链接或从本地上传;拖拽排序或删除。数据保存在本浏览器,仅用于演示。"}
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
          title="恢复到内置示例"
        >
          <RotateCcw className="h-3 w-3" />
          恢复默认
        </button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addUrl()}
          placeholder="粘贴图片链接 https://..."
          className="flex-1 min-w-[220px] rounded-md border border-border/60 bg-background/60 px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={addUrl}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          添加链接
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-md border border-border/60 px-3 py-2 text-xs text-foreground hover:bg-secondary/40"
        >
          <Upload className="h-3.5 w-3.5" />
          上传本地
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-secondary/20 p-8 text-center text-xs text-muted-foreground">
          还没有图片。添加一张作为封面吧。
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((src, i) => (
            <div
              key={`${src.slice(0, 32)}-${i}`}
              className="group relative overflow-hidden rounded-lg border border-border/60 bg-secondary/20"
            >
              <div className="aspect-[3/2] w-full">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute left-1 top-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-mono text-foreground backdrop-blur">
                {i === 0 ? "封面" : `#${i + 1}`}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-background/90 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="上移"
                    className="rounded bg-background/80 p-1 text-foreground disabled:opacity-30"
                  >
                    <ArrowLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    aria-label="下移"
                    className="rounded bg-background/80 p-1 text-foreground disabled:opacity-30"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="删除"
                  className="rounded bg-background/80 p-1 text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {savedAt && (
        <div className="mt-3 text-[11px] text-muted-foreground">已保存 · {savedAt}</div>
      )}
    </div>
  );
}