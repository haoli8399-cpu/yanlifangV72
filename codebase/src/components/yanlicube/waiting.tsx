import { Clock3, CheckCircle2, HandHelping } from "lucide-react";
import { AgentMessage } from "./agent";

export function WaitingCompanion({
  waitingFor,
  who,
  since,
  done,
  youCanDo,
  agentText,
}: {
  waitingFor: string;
  who: string;
  since: string;
  done: string[];
  youCanDo: string[];
  agentText: string;
}) {
  return (
    <div className="surface-1 rounded-xl p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[color:var(--state-pending)]/40 bg-[color:var(--state-pending)]/10 px-2 py-0.5 text-[11px] text-[color:var(--state-pending)]">
            <Clock3 className="h-3 w-3" />
            等待中
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            正在等待:{waitingFor}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            负责人 · {who} · 已等待 {since}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--state-verified)]" />
            已经完成
          </div>
          <ul className="space-y-1.5 text-sm text-foreground/85">
            {done.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[color:var(--state-verified)]" />
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <HandHelping className="h-3.5 w-3.5 text-primary" />
            你现在可以
          </div>
          <ul className="space-y-1.5 text-sm text-foreground/85">
            {youCanDo.map((d) => (
              <li key={d} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border/60 bg-background/40 p-4">
        <AgentMessage time="持续陪伴中">{agentText}</AgentMessage>
      </div>
    </div>
  );
}