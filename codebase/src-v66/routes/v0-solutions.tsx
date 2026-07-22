import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Building2, CalendarDays, Clock3, Compass, MapPin, Search, SlidersHorizontal, Sparkles, Users, WalletCards, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";

type PageState = "default" | "loading" | "empty";
type Solution = {
  id: string; category: string; scene: string; title: string; description: string;
  people: string; peopleMax: number; duration: string; durationValue: string;
  location: string; price: number; priceLabel: string; match: number; highlights: string[]; featured?: boolean;
};
type Filters = { keyword: string; type: string; scene: string; people: string; duration: string; budget: number };

const INITIAL_FILTERS: Filters = { keyword: "", type: "all", scene: "all", people: "all", duration: "all", budget: 200000 };
const SOLUTIONS: Solution[] = [
  { id: "s1", category: "团队建设", scene: "企业团建", title: "城市探索 · 团队协作挑战", description: "以城市地标为任务场景，通过分组探索、线索解谜与团队共创，提升成员间的协作效率和信任感。", people: "50–100 人", peopleMax: 100, duration: "1 天", durationValue: "1-day", location: "上海市区", price: 88000, priceLabel: "¥8.8 万起", match: 96, highlights: ["城市定向", "团队共创", "成果复盘"], featured: true },
  { id: "s2", category: "共创工作坊", scene: "战略共创", title: "未来实验室 · 创新工作坊", description: "将设计思维与沉浸式任务结合，引导团队发现业务机会，在一天内完成从创意到方案原型的共创。", people: "30–80 人", peopleMax: 80, duration: "1 天", durationValue: "1-day", location: "室内场地", price: 66000, priceLabel: "¥6.6 万起", match: 92, highlights: ["设计思维", "跨组协作", "原型展示"] },
  { id: "s3", category: "团队建设", scene: "户外拓展", title: "山野同行 · 轻户外团建", description: "结合自然徒步、轻量协作任务和营地交流，在舒适节奏中帮助团队释放压力并建立真实连接。", people: "40–120 人", peopleMax: 120, duration: "2 天 1 夜", durationValue: "2-days", location: "江浙周边", price: 118000, priceLabel: "¥11.8 万起", match: 89, highlights: ["自然徒步", "营地交流", "轻量挑战"] },
  { id: "s4", category: "品牌活动", scene: "新品发布", title: "未来序章 · 沉浸式发布会", description: "通过空间叙事、数字互动与主题演绎，打造兼具科技感和传播力的新品发布体验。", people: "100–300 人", peopleMax: 300, duration: "半天", durationValue: "half-day", location: "城市展厅", price: 186000, priceLabel: "¥18.6 万起", match: 87, highlights: ["空间叙事", "数字互动", "媒体传播"] },
  { id: "s5", category: "文化活动", scene: "员工融入", title: "文化寻宝 · 新员工融入计划", description: "将企业文化转化为探索任务，通过团队挑战和角色互动，帮助新员工快速理解组织价值观。", people: "30–150 人", peopleMax: 150, duration: "半天", durationValue: "half-day", location: "企业园区", price: 48000, priceLabel: "¥4.8 万起", match: 85, highlights: ["文化认知", "伙伴连接", "互动闯关"] },
  { id: "s6", category: "客户活动", scene: "客户答谢", title: "雅集之夜 · 高端客户答谢会", description: "融合精致餐叙、艺术体验与品牌内容，为核心客户创造有温度、有记忆点的深度交流场景。", people: "50–200 人", peopleMax: 200, duration: "半天", durationValue: "half-day", location: "精品酒店", price: 158000, priceLabel: "¥15.8 万起", match: 82, highlights: ["精致餐叙", "艺术体验", "品牌交流"] },
];
const TYPE_OPTIONS = [{ value: "all", label: "全部类型" },{ value: "团队建设", label: "团队建设" },{ value: "共创工作坊", label: "共创工作坊" },{ value: "品牌活动", label: "品牌活动" },{ value: "文化活动", label: "文化活动" },{ value: "客户活动", label: "客户活动" }];
const SCENE_OPTIONS = [{ value: "all", label: "全部场景" },{ value: "企业团建", label: "企业团建" },{ value: "战略共创", label: "战略共创" },{ value: "户外拓展", label: "户外拓展" },{ value: "新品发布", label: "新品发布" },{ value: "员工融入", label: "员工融入" },{ value: "客户答谢", label: "客户答谢" }];
const PEOPLE_OPTIONS = [{ value: "all", label: "不限人数" },{ value: "under-50", label: "50 人以下" },{ value: "50-100", label: "50–100 人" },{ value: "over-100", label: "100 人以上" }];
const DURATION_OPTIONS = [{ value: "all", label: "不限时长" },{ value: "half-day", label: "半天" },{ value: "1-day", label: "1 天" },{ value: "2-days", label: "2 天及以上" }];

export const Route = createFileRoute("/v0-solutions")({ component: AgentSolutionDiscoveryPage });

function AgentSolutionDiscoveryPage() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [pageState, setPageState] = useState<PageState>("default");
  const filteredSolutions = useMemo(() => {
    const kw = filters.keyword.trim().toLowerCase();
    return SOLUTIONS.filter((s) => {
      const kwMatch = !kw || [s.title, s.description, s.category, s.scene, s.location, ...s.highlights].some((v) => v.toLowerCase().includes(kw));
      return kwMatch && (filters.type === "all" || s.category === filters.type) && (filters.scene === "all" || s.scene === filters.scene) && (filters.people === "all" || (filters.people === "under-50" && s.peopleMax < 50) || (filters.people === "50-100" && s.peopleMax >= 50 && s.peopleMax <= 100) || (filters.people === "over-100" && s.peopleMax > 100)) && (filters.duration === "all" || s.durationValue === filters.duration) && s.price <= filters.budget;
    });
  }, [filters]);
  const hasActive = filters.keyword !== "" || filters.type !== "all" || filters.scene !== "all" || filters.people !== "all" || filters.duration !== "all" || filters.budget !== 200000;
  const state = pageState === "loading" ? "loading" : filteredSolutions.length === 0 ? "empty" : "default";
  function u<K extends keyof Filters>(k: K, v: Filters[K]) { setFilters((c) => ({ ...c, [k]: v })); setPageState("default"); }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#1F2430]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-5 py-8 md:px-8 lg:px-12 lg:py-10">
        <header className="flex flex-col gap-3 border-b border-[#E5E7EF] pb-7 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-3xl flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-[#5B4FD6]"><Compass className="size-4" />方案发现</div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">发现适合你的活动方案</h1>
            <p className="text-pretty text-sm leading-6 text-[#687083] md:text-base">从专业活动方案库中筛选类型、场景、规模和预算，快速找到适合当前需求的执行方向。</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#687083]"><Sparkles className="size-4 text-[#5B4FD6]" />已收录 {SOLUTIONS.length} 套精选方案</div>
        </header>

        <Card className="rounded-xl border-[#E5E7EF] bg-white shadow-sm">
          <CardHeader className="gap-1 border-b border-[#E5E7EF] px-5 py-4 md:px-6">
            <div className="flex items-center gap-2"><SlidersHorizontal className="size-4 text-[#5B4FD6]" /><CardTitle className="text-base">筛选方案</CardTitle></div>
            <CardDescription>组合多个筛选条件，缩小方案范围。</CardDescription>
          </CardHeader>
          <CardContent className="p-5 md:p-6">
            <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); setPageState("loading"); setTimeout(() => setPageState("default"), 650); }}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9AA0AE]" /><Input id="search" value={filters.keyword} placeholder="搜索方案名称、场景或关键词" className="h-10 border-[#D8DAE3] bg-white pl-9 focus-visible:border-[#5B4FD6]" onChange={(e) => u("keyword", e.target.value)} /></div>
                <FSel label="活动类型" value={filters.type} opts={TYPE_OPTIONS} onChange={(v) => u("type", v)} />
                <FSel label="应用场景" value={filters.scene} opts={SCENE_OPTIONS} onChange={(v) => u("scene", v)} />
                <FSel label="参与人数" value={filters.people} opts={PEOPLE_OPTIONS} onChange={(v) => u("people", v)} />
                <FSel label="活动时长" value={filters.duration} opts={DURATION_OPTIONS} onChange={(v) => u("duration", v)} />
                <Button type="submit" className="h-10 shrink-0 bg-[#5B4FD6] text-white hover:bg-[#4C41BF]"><Search className="mr-1 size-4" />搜索</Button>
              </div>
              <div className="flex flex-col gap-4 border-t border-[#E5E7EF] pt-5 md:flex-row md:items-center">
                <div className="flex items-center gap-2 md:w-36"><WalletCards className="size-4 text-[#5B4FD6]" /><span className="text-sm font-medium">单场预算上限</span></div>
                <div className="flex flex-1 flex-col gap-3">
                  <Slider min={30000} max={200000} step={10000} value={[filters.budget]} className="[&_[data-slot=slider-range]]:bg-[#5B4FD6] [&_[data-slot=slider-thumb]]:border-[#5B4FD6]" onValueChange={(v) => u("budget", v[0] ?? 200000)} />
                  <div className="flex items-center justify-between text-xs text-[#9AA0AE]"><span>¥3 万</span><strong className="text-sm font-semibold text-[#5B4FD6]">{filters.budget >= 200000 ? "¥20 万以上" : `¥${Math.round(filters.budget / 10000)} 万以内`}</strong><span>¥20 万+</span></div>
                </div>
                {hasActive && <Button type="button" size="sm" variant="ghost" className="w-fit shrink-0 text-[#687083] hover:bg-[#F7F8FA]" onClick={() => setFilters(INITIAL_FILTERS)}><X className="mr-1 size-4" />清除筛选</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div><h2 className="text-xl font-semibold">精选方案</h2><p className="text-sm text-[#687083]">{state === "loading" ? "正在筛选…" : `共找到 ${filteredSolutions.length} 套方案`}</p></div>
            <div className="flex w-fit gap-1 rounded-lg border border-[#E5E7EF] bg-white p-1">
              {(["default","loading"] as PageState[]).map((s) => <button key={s} onClick={() => setPageState(s)} className={`rounded-md px-3 py-1.5 text-sm font-medium ${pageState === s ? "bg-[#F0EEFF] text-[#5B4FD6]" : "text-[#687083]"}`}>{s==="default"?"默认态":"加载态"}</button>)}
              <button onClick={() => u("keyword","不存在的演示方案")} className="rounded-md px-3 py-1.5 text-sm font-medium text-[#687083] hover:bg-[#F7F8FA]">空数据态</button>
            </div>
          </div>
          {state === "loading" && <GridSkeleton />}
          {state === "empty" && <EmptyState hasActive={hasActive} onReset={() => setFilters(INITIAL_FILTERS)} />}
          {state === "default" && <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredSolutions.map((s) => <SCard key={s.id} s={s} />)}</div>}
        </section>
      </div>
    </main>
  );
}

function FSel({ label, value, opts, onChange }: { label: string; value: string; opts: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return <div className="w-full lg:w-36"><Select value={value} onValueChange={onChange}><SelectTrigger className="h-10 w-full border-[#D8DAE3] bg-white"><SelectValue placeholder={label} /></SelectTrigger><SelectContent><SelectGroup>{opts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectGroup></SelectContent></Select></div>;
}

function SCard({ s }: { s: Solution }) {
  return (
    <Card className={s.featured ? "group h-full rounded-xl border-[#BDB7F5] bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md" : "group h-full rounded-xl border-[#E5E7EF] bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:border-[#BDB7F5] hover:shadow-md"}>
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2"><Badge className="border-0 bg-[#F0EEFF] text-[#5B4FD6] hover:bg-[#F0EEFF]">{s.category}</Badge><Badge variant="outline" className="border-[#E5E7EF] font-normal text-[#687083]">{s.scene}</Badge></div>
          <span className="shrink-0 text-xs font-semibold text-[#317848]">{s.match}% 匹配</span>
        </div>
        <CardTitle className="text-xl leading-7">{s.title}</CardTitle>
        <CardDescription className="line-clamp-3 text-sm leading-6">{s.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-[#F7F8FA] p-4">
          <Fact icon={Users} label="适合人数" value={s.people} /><Fact icon={Clock3} label="活动时长" value={s.duration} />
          <Fact icon={MapPin} label="建议地点" value={s.location} /><Fact icon={CalendarDays} label="执行周期" value="7–14 天" />
        </dl>
        <div className="flex flex-wrap gap-2">{s.highlights.map((h) => <Badge key={h} variant="outline" className="border-[#E5E7EF] bg-white font-normal text-[#687083]">{h}</Badge>)}</div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4 border-t border-[#E5E7EF] pt-5">
        <div><span className="text-xs text-[#9AA0AE]">参考预算</span><strong className="text-base text-[#5B4FD6]">{s.priceLabel}</strong></div>
        <Button variant={s.featured ? "default" : "outline"} className={s.featured ? "bg-[#5B4FD6] text-white hover:bg-[#4C41BF]" : "border-[#D8DAE3] text-[#5B4FD6] hover:bg-[#F0EEFF] hover:text-[#5B4FD6]"}>查看方案<ArrowRight className="ml-1 size-4" /></Button>
      </CardFooter>
    </Card>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return <div className="flex min-w-0 items-start gap-2"><Icon className="mt-0.5 size-4 shrink-0 text-[#9AA0AE]" /><div className="flex min-w-0 flex-col gap-0.5"><dt className="text-xs text-[#9AA0AE]">{label}</dt><dd className="truncate text-sm font-medium">{value}</dd></div></div>;
}

function GridSkeleton() {
  return <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Card key={i} className="rounded-xl border-[#E5E7EF] bg-white"><CardHeader className="gap-4"><Skeleton className="h-5 w-28 bg-[#E5E7EF]" /><Skeleton className="h-7 w-4/5 bg-[#E5E7EF]" /><Skeleton className="h-16 w-full bg-[#E5E7EF]" /></CardHeader><CardContent className="flex flex-col gap-5"><Skeleton className="h-28 w-full bg-[#E5E7EF]" /><Skeleton className="h-6 w-3/4 bg-[#E5E7EF]" /></CardContent><CardFooter className="flex items-center justify-between border-t border-[#E5E7EF] pt-5"><Skeleton className="h-10 w-24 bg-[#E5E7EF]" /><Skeleton className="h-9 w-28 bg-[#E5E7EF]" /></CardFooter></Card>)}</div>;
}

function EmptyState({ hasActive, onReset }: { hasActive: boolean; onReset: () => void }) {
  return <section className="flex min-h-96 items-center justify-center rounded-xl border border-dashed border-[#D8DAE3] bg-white px-5 py-12"><div className="flex max-w-md flex-col items-center gap-5 text-center"><div className="flex size-14 items-center justify-center rounded-xl bg-[#F0EEFF] text-[#5B4FD6]"><Search className="size-6" /></div><div><h2 className="text-xl font-semibold">没有找到匹配的方案</h2><p className="text-sm leading-6 text-[#687083]">当前筛选条件下暂无合适方案。建议提高预算上限、扩大人数范围，或尝试更简短的搜索关键词。</p></div>{hasActive && <Button className="bg-[#5B4FD6] text-white hover:bg-[#4C41BF]" onClick={onReset}><X className="mr-1 size-4" />清除全部筛选</Button>}<div className="flex items-center gap-2 text-xs text-[#9AA0AE]"><Building2 className="size-4" />也可以联系活动顾问为你定制专属方案</div></div></section>;
}
