import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MfeRegistryEntry } from "@/types";

// kebab-case icon name (from the registry JSON) -> PascalCase lucide export
function resolveIcon(name: string): LucideIcon {
  const pascal = name
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join("");
  return (Icons as unknown as Record<string, LucideIcon>)[pascal] ?? Icons.Puzzle;
}

// Status dot color communicates real, currently-verified reachability —
// not just "a URL string is present" (see src/registry/useMfeRegistry.ts).
const STATUS_DOT: Record<MfeRegistryEntry["status"], string | null> = {
  not_configured: "bg-slate-300",
  checking: "bg-amber-400 animate-pulse",
  deployed: null, // fully healthy — no dot needed
  unreachable: "bg-rose-500",
};

const STATUS_LABEL: Record<MfeRegistryEntry["status"], string> = {
  not_configured: "not yet deployed",
  checking: "checking availability…",
  deployed: "deployed",
  unreachable: "configured but unreachable",
};

interface AppNavProps {
  mfes: MfeRegistryEntry[];
  activeMfeId: string | undefined;
  onSelect: (mfeId: string) => void;
}

/**
 * Vertical navigation / application tabs — lets the agent switch which of
 * the 14+ business-capability MFEs is mounted in the Main Content area for
 * the active Search Context. This is Shell chrome (navigation), not part of
 * any MFE (proposal §3: "Global navigation, layout... MFE registry, loading,
 * lifecycle").
 */
export function AppNav({ mfes, activeMfeId, onSelect }: AppNavProps) {
  return (
    <nav
      aria-label="Business capabilities"
      className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-shell-border bg-slate-50/60 py-3"
    >
      {mfes.map((mfe) => {
        const Icon = resolveIcon(mfe.icon);
        const isActive = mfe.id === activeMfeId;
        const dotColor = STATUS_DOT[mfe.status];
        return (
          <button
            key={mfe.id}
            type="button"
            title={`${mfe.name} — ${STATUS_LABEL[mfe.status]}`}
            onClick={() => onSelect(mfe.id)}
            className={[
              "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
              isActive
                ? "bg-brand/10 text-brand"
                : "text-slate-400 hover:bg-slate-200/70 hover:text-slate-600",
            ].join(" ")}
          >
            <Icon size={18} />
            {dotColor && <span className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${dotColor}`} />}
          </button>
        );
      })}
    </nav>
  );
}
