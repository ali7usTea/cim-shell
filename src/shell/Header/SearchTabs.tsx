import { useEffect, useState } from "react";
import { Phone, MessageCircle, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchContexts } from "@/context/SearchContextProvider";
import { MAX_CONCURRENT_SEARCHES } from "@/types";

function formatElapsed(startedAt: number) {
  const totalSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * The tab strip is the visible half of the Search Context model
 * (proposal §3.2/3.3): one tab per open customer/work item, max
 * MAX_CONCURRENT_SEARCHES, switching tabs changes the active context
 * without destroying the others.
 */
export function SearchTabs() {
  const { searches, activeSearchId, selectSearch, closeSearch, openSearch, atCapacity } =
    useSearchContexts();
  const [, forceTick] = useState(0);

  // Re-render every second so live-call timers stay accurate.
  useEffect(() => {
    const id = window.setInterval(() => forceTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <button
        type="button"
        aria-label="Scroll tabs left"
        className="hidden shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:inline-flex"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1">
        {searches.map((s) => {
          const isActive = s.searchId === activeSearchId;
          const ChannelIcon = s.channel === "chat" ? MessageCircle : Phone;
          return (
            <button
              key={s.searchId}
              type="button"
              onClick={() => selectSearch(s.searchId)}
              className={[
                "group flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "border-emerald-500 bg-white text-slate-900 shadow-sm"
                  : "border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              <ChannelIcon size={14} className={isActive ? "text-emerald-600" : "text-slate-400"} />
              <span className="font-medium tabular-nums">{s.label}</span>
              {s.callStartedAt && (
                <span className="flex items-center gap-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {formatElapsed(s.callStartedAt)}
                </span>
              )}
              <span
                role="button"
                aria-label={`Close search ${s.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  closeSearch(s.searchId);
                }}
                className="rounded p-0.5 text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-200 hover:text-slate-600"
              >
                <X size={13} />
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={atCapacity}
        title={atCapacity ? `Maximum ${MAX_CONCURRENT_SEARCHES} concurrent searches` : "New search"}
        onClick={() =>
          openSearch({
            customerId: `C-${Math.floor(Math.random() * 900000000)}`,
            label: "New search",
            channel: "chat",
          })
        }
        className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={16} />
      </button>

      <button
        type="button"
        aria-label="Scroll tabs right"
        className="hidden shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:inline-flex"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
