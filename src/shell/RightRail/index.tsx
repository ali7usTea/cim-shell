import { Headset, Sparkles, StickyNote } from "lucide-react";

interface RightRailProps {
  onOpen: (panel: "call" | "assist" | "notes") => void;
}

/**
 * Slim, always-docked vertical rail on the right edge (matches the
 * reference screenshot's "MICRO APPS" strip). Each icon is a cross-cutting
 * tool available regardless of which MFE is active — clicking one expands
 * the full Side Sliding Menu with that tool's content.
 */
export function RightRail({ onOpen }: RightRailProps) {
  return (
    <div className="flex w-10 shrink-0 flex-col items-center justify-between bg-shell-ink py-3 text-white">
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          title="Call controls"
          onClick={() => onOpen("call")}
          className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <Headset size={16} />
        </button>
        <button
          type="button"
          title="AI assist"
          onClick={() => onOpen("assist")}
          className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <Sparkles size={16} />
        </button>
        <button
          type="button"
          title="Notes"
          onClick={() => onOpen("notes")}
          className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <StickyNote size={16} />
        </button>
      </div>

      <span className="mb-2 [writing-mode:vertical-rl] text-[10px] tracking-[0.2em] text-white/40">
        MICRO APPS
      </span>
    </div>
  );
}
