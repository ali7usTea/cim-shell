import type { AgentSession } from "@/types";

const STATUS_COLOR: Record<AgentSession["status"], string> = {
  available: "bg-emerald-500",
  busy: "bg-rose-500",
  away: "bg-amber-500",
  offline: "bg-slate-400",
};

export function AgentBadge({ session }: { session: AgentSession }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-100"
      title={`${session.displayName} — ${session.status}`}
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
        {session.initials}
        <span
          className={[
            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white",
            STATUS_COLOR[session.status],
          ].join(" ")}
        />
      </span>
      <span className="hidden text-left leading-tight lg:block">
        <span className="block text-[10px] uppercase tracking-wide text-slate-400">Agent</span>
        <span className="block text-xs font-medium text-slate-700">{session.role}</span>
      </span>
    </button>
  );
}
