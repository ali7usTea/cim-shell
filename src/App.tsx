import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { SearchContextProvider, useSearchContexts } from "@/context/SearchContextProvider";
import { useMfeRegistry } from "@/registry/useMfeRegistry";
import { Header } from "@/shell/Header";
import { AppNav } from "@/shell/AppNav";
import { CustomerPanel } from "@/shell/CustomerPanel";
import { MainContent } from "@/shell/MainContent";
import { RightRail } from "@/shell/RightRail";
import { SlideMenu } from "@/shell/SlideMenu";
import { FloatingNotification, type IncomingInteraction } from "@/shell/FloatingNotification";
import { MOCK_INITIAL_SEARCHES, MOCK_SESSION } from "@/mock/data";


function Workspace() {
  const { entries: mfes } = useMfeRegistry();
  const { searches, activeSearch, selectSearch, setActiveMfe, openSearch } = useSearchContexts();

  const [customerPanelCollapsed, setCustomerPanelCollapsed] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [slidePanel, setSlidePanel] = useState<null | "call" | "assist" | "notes" | "settings">(null);
  const [incoming, setIncoming] = useState<IncomingInteraction | null>(null);

  // Demo only: simulate a new Genesys interaction arriving a few seconds in,
  // so the Floating Interaction Notification has something to show without
  // a live Genesys connection.
  useEffect(() => {
    const id = window.setTimeout(() => {
      setIncoming({ id: "int-demo-1", channel: "whatsapp", from: "+971 50 111 2222" });
    }, 4000);
    return () => window.clearTimeout(id);
  }, []);

  const activeMfe = mfes.find((m) => m.id === activeSearch?.activeMfe);

  const slidePanelTitle =
    slidePanel === "call"
      ? "Call controls"
      : slidePanel === "assist"
        ? "AI assist"
        : slidePanel === "notes"
          ? "Notes"
          : "Settings";

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <Header
        session={MOCK_SESSION}
        unreadNotifications={2}
        onToggleCustomerPanel={() => setCustomerPanelCollapsed((c) => !c)}
        onToggleSlideMenu={() => setSlidePanel("settings")}
        onToggleLayout={() => setFocusMode((f) => !f)}
      />

      <div className="flex min-h-0 flex-1">
        {!focusMode && (
          <AppNav
            mfes={mfes}
            activeMfeId={activeMfe?.id}
            onSelect={(mfeId) => activeSearch && setActiveMfe(activeSearch.searchId, mfeId)}
          />
        )}

        <CustomerPanel search={activeSearch} collapsed={customerPanelCollapsed || focusMode} />

        <MainContent search={activeSearch} mfe={activeMfe} session={MOCK_SESSION} />

        <RightRail onOpen={(panel) => setSlidePanel(panel)} />
      </div>

      <SlideMenu open={slidePanel !== null} title={slidePanelTitle} onClose={() => setSlidePanel(null)}>
        {slidePanel === "settings" && (
          <ul className="space-y-3">
            <li>Notification preferences</li>
            <li>Keyboard shortcuts</li>
            <li>Theme</li>
            <li>About Customer360</li>
          </ul>
        )}
        {slidePanel === "call" && <p>Call controls for the active search's live interaction go here.</p>}
        {slidePanel === "assist" && <p>AI assist surfaces suggested replies and knowledge articles here.</p>}
        {slidePanel === "notes" && <p>Interaction notes for {activeSearch?.label ?? "the active search"}.</p>}
      </SlideMenu>

      <FloatingNotification
        interaction={incoming}
        onAccept={() => {
          if (!incoming) return;
          const searchId = openSearch({
            customerId: `C-${incoming.from.replace(/\D/g, "")}`,
            label: incoming.from,
            channel: incoming.channel,
            isLiveCall: incoming.channel === "voice",
          });
          if (searchId) selectSearch(searchId);
          else toast.error(`Can't open a new search — ${searches.length} are already active`);
          setIncoming(null);
        }}
        onDismiss={() => setIncoming(null)}
      />

      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <SearchContextProvider initial={MOCK_INITIAL_SEARCHES}>
      <Workspace />
    </SearchContextProvider>
  );
}
