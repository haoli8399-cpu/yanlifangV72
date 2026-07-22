import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Clock, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/h5/actor/calendar")({ component: H5ActorCalendar });

interface Slot {
  id: string; date: string; time: string; project: string; venue: string;
  status: "confirmed" | "pending" | "declined" | "past";
}

const slots: Slot[] = [
  { id: "s1", date: "2026-08-22", time: "14:00-14:15", project: "华创科技 · 经销商大会", venue: "成都世纪城天堂洲际大饭店", status: "confirmed" },
  { id: "s2", date: "2026-09-14", time: "19:00-19:30", project: "Miracle 汽车 · 新车区域上市", venue: "杭州 · 钱江新城", status: "pending" },
  { id: "s3", date: "2027-01-18", time: "18:30-19:00", project: "Neo 银行 · 客户答谢晚宴", venue: "上海", status: "pending" },
  { id: "s4", date: "2026-07-10", time: "20:00-21:30", project: "后仰喜剧 · 王府井常规场", venue: "成都王府井1号馆", status: "past" },
];

function H5ActorCalendar() {
  return (
    <div className="mx-auto max-w-[480px] px-4 pb-24 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">档期</h1>
          <p className="text-xs text-muted-foreground">{slots.filter((s) => s.status === "pending").length} 个待确认</p>
        </div>
      </div>

      <div className="space-y-3">
        {slots.map((s) => (
          <div key={s.id} className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{s.date}</span>
                {s.status === "confirmed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {s.status === "pending" && <Clock className="h-4 w-4 text-amber-500" />}
                {s.status === "declined" && <XCircle className="h-4 w-4 text-red-400" />}
                {s.status === "past" && <span className="text-[10px] text-muted-foreground">已结束</span>}
              </div>
              <span className={`text-[11px] font-medium ${s.status === "confirmed" ? "text-green-600" : s.status === "pending" ? "text-amber-600" : "text-muted-foreground"}`}>
                {s.status === "confirmed" ? "已确认" : s.status === "pending" ? "待确认" : s.status === "declined" ? "已婉拒" : ""}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-foreground/80">{s.project}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.time}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.venue}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-border/60 pt-4 text-center text-[10px] text-muted-foreground">
        Demo 数据
      </div>
    </div>
  );
}
