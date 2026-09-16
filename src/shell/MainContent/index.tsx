import { useEffect, useRef, useState } from "react";
import { PlugZap, AlertTriangle, RotateCw } from "lucide-react";
import { PlanCard } from "./PlanCard";
import { MOCK_HOME360_PLANS } from "@/mock/data";
import { loadRemoteModule, type LoadRemoteResult } from "@/registry/loadRemote";
import type { AgentSession, MfeRegistryEntry, SearchContext } from "@/types";

interface MainContentProps {
  search: SearchContext | null;
  mfe: MfeRegistryEntry | undefined;
  session: AgentSession;
}

type ViewState =
  | { kind: "loading" }
  | { kind: "not_configured" }
  | { kind: "unreachable"; error?: string }
  | { kind: "load_error"; error: string }
  | { kind: "ready" };

/**
 * Body / Main Business Content Area — where Module Federation loads the
 * active MFE for the active Search Context (proposal §3.1/§4, step 7-8).
 *
 * The three non-happy-path states below map 1:1 onto loadRemoteModule's
 * gates (src/registry/loadRemote.ts) — this component never has to guess
 * *why* something didn't load, it's told explicitly:
 *   not_configured -> no remoteEntry in the registry at all
 *   unreachable    -> a remoteEntry exists but didn't respond
 *   load_error     -> it responded, but federation loading/mounting failed
 */
export function MainContent({ search, mfe, session }: MainContentProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ViewState>({ kind: "loading" });
  const [retryToken, setRetryToken] = useState(0);

  const isDemo = mfe?.id === "home360" && !mfe.remoteEntry;

  useEffect(() => {
    if (!mfe || !search) return;

    if (isDemo) {
      setView({ kind: "not_configured" }); // rendered locally below instead, not shown as an error
      return;
    }

    let unmountFn: ((el: HTMLElement) => void) | null = null;
    const mountEl = mountRef.current;
    let cancelled = false;

    setView({ kind: "loading" });

    loadRemoteModule(mfe).then((result: LoadRemoteResult) => {
      if (cancelled) return;

      switch (result.status) {
        case "not_configured":
          setView({ kind: "not_configured" });
          return;
        case "unreachable":
          setView({ kind: "unreachable", error: result.error });
          return;
        case "load_error":
          setView({ kind: "load_error", error: result.error });
          return;
        case "ready":
          if (!mountEl) {
            setView({ kind: "load_error", error: "mount point unavailable" });
            return;
          }
          result.module.mount(mountEl, { searchContext: search, session });
          unmountFn = result.module.unmount;
          setView({ kind: "ready" });
      }
    });

    return () => {
      cancelled = true;
      if (unmountFn && mountEl) unmountFn(mountEl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mfe?.id, search?.searchId, retryToken]);

  if (!search) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
        Open or select a search tab to get started.
      </div>
    );
  }

  if (!mfe) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
        Choose a business capability from the left rail.
      </div>
    );
  }

  if (isDemo) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h1 className="text-base font-semibold text-slate-800">Home360</h1>
          <span className="text-xs text-slate-400">
            Local demo content — swap for the real Home360 remote once registered
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {MOCK_HOME360_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    );
  }

  if (view.kind === "not_configured") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
        <PlugZap size={28} className="text-slate-300" />
        <p className="font-medium text-slate-500">{mfe.name} isn't deployed yet</p>
        <p className="max-w-xs text-xs">
          No remoteEntry is configured for it in the registry. Add its built remoteEntry.js URL to
          public/mfe-registry.json — the Shell will pick it up without a rebuild.
        </p>
      </div>
    );
  }

  if (view.kind === "unreachable") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
        <PlugZap size={28} className="text-amber-400" />
        <p className="font-medium text-slate-500">{mfe.name} isn't reachable right now</p>
        <p className="max-w-xs text-xs">
          A remoteEntry is configured, but it didn't respond{view.error ? ` (${view.error})` : ""}.
          It may still be deploying.
        </p>
        <button
          type="button"
          onClick={() => setRetryToken((n) => n + 1)}
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-shell-border px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <RotateCw size={13} /> Check again
        </button>
      </div>
    );
  }

  if (view.kind === "load_error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-rose-500">
        <AlertTriangle size={28} className="text-rose-400" />
        <p className="font-medium">{mfe.name} failed to load</p>
        <p className="max-w-xs text-xs text-slate-400">{view.error}</p>
        <p className="max-w-xs text-xs text-slate-400">
          The rest of the workspace is unaffected — this failure is contained to this panel.
        </p>
        <button
          type="button"
          onClick={() => setRetryToken((n) => n + 1)}
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-shell-border px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <RotateCw size={13} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-y-auto p-6">
      {view.kind === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm text-slate-400">
          Loading {mfe.name}...
        </div>
      )}
      {/* Real federated remotes mount directly into this node via their mount(el, ctx) contract. */}
      <div ref={mountRef} data-mfe={mfe.id} />
    </div>
  );
}
