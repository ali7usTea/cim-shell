import { X } from "lucide-react";
import type { ReactNode } from "react";

interface SlideMenuProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Right-side sliding drawer. Triggered from the Header's settings icon or
 * from any RightRail shortcut. Owned entirely by the Shell (proposal §3:
 * "Global navigation, layout and notifications") — its contents are Shell
 * tools/settings, not MFE business UI.
 */
export function SlideMenu({ open, title, onClose, children }: SlideMenuProps) {
  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/20 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label={title}
        className={`absolute right-0 top-0 flex h-full w-80 flex-col border-l border-shell-border bg-white shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-shell-border px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-sm text-slate-600">{children}</div>
      </aside>
    </div>
  );
}
