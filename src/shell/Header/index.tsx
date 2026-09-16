import { Menu, Search, Bell, LayoutPanelLeft, Grid3x3, ExternalLink, Settings } from "lucide-react";
import { SearchTabs } from "./SearchTabs";
import { AgentBadge } from "./AgentBadge";
import type { AgentSession } from "@/types";

interface HeaderProps {
  session: AgentSession;
  unreadNotifications: number;
  onToggleCustomerPanel: () => void;
  onToggleSlideMenu: () => void;
  onToggleLayout: () => void;
}

/**
 * Shell-owned global chrome (proposal §3: "Global navigation, layout and
 * notifications" belongs to the Shell, not to any MFE).
 */
export function Header({
  session,
  unreadNotifications,
  onToggleCustomerPanel,
  onToggleSlideMenu,
  onToggleLayout,
}: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-shell-border bg-shell-header px-3">
      <button
        type="button"
        aria-label="Toggle customer panel"
        onClick={onToggleCustomerPanel}
        className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
      >
        <Menu size={18} />
      </button>

      <div className="flex shrink-0 items-baseline gap-0.5 pr-2 text-lg font-semibold text-slate-800">
        <span>Customer</span>
        <span className="text-brand">360</span>
      </div>

      <SearchTabs />

      <label className="hidden shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 md:flex">
        <Search size={14} />
        <span>Search...</span>
        <kbd className="ml-2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
          Ctrl K
        </kbd>
      </label>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <Bell size={18} />
          {unreadNotifications > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
              {unreadNotifications}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-label="Toggle layout"
          onClick={onToggleLayout}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <LayoutPanelLeft size={18} />
        </button>
        <button type="button" aria-label="Apps" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Grid3x3 size={18} />
        </button>
        <button
          type="button"
          aria-label="Open in new window"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <ExternalLink size={18} />
        </button>
        <button
          type="button"
          aria-label="Settings"
          onClick={onToggleSlideMenu}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <Settings size={18} />
        </button>
        <AgentBadge session={session} />
      </div>
    </header>
  );
}
