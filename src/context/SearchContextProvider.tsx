import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { InteractionChannel, SearchContext } from "@/types";
import { MAX_CONCURRENT_SEARCHES } from "@/types";

interface SearchContextState {
  searches: SearchContext[];
  activeSearchId: string | null;
  activeSearch: SearchContext | null;
  atCapacity: boolean;

  openSearch: (input: {
    customerId: string;
    label: string;
    channel: InteractionChannel;
    activeMfe?: string;
    isLiveCall?: boolean;
  }) => string | null;
  closeSearch: (searchId: string) => void;
  selectSearch: (searchId: string) => void;
  setActiveMfe: (searchId: string, mfeId: string) => void;
}

const Ctx = createContext<SearchContextState | null>(null);

let seq = 0;
function nextSearchId() {
  seq += 1;
  return `SEARCH-${String(seq).padStart(3, "0")}`;
}

export function SearchContextProvider({
  children,
  initial = [],
}: {
  children: ReactNode;
  initial?: SearchContext[];
}) {
  const [searches, setSearches] = useState<SearchContext[]>(initial);
  const [activeSearchId, setActiveSearchId] = useState<string | null>(initial[0]?.searchId ?? null);

  const atCapacity = searches.length >= MAX_CONCURRENT_SEARCHES;

  // Step 4 (proposal §4): Genesys → Shell request lands here as a Search
  // Context creation. The Shell (not Genesys) owns the tab lifecycle.
  const openSearch = useCallback<SearchContextState["openSearch"]>(
    ({ customerId, label, channel, activeMfe = "home360", isLiveCall }) => {
      if (searches.length >= MAX_CONCURRENT_SEARCHES) return null;
      const searchId = nextSearchId();
      const next: SearchContext = {
        searchId,
        customerId,
        label,
        channel,
        activeMfe,
        createdAt: Date.now(),
        callStartedAt: isLiveCall ? Date.now() : undefined,
      };
      setSearches((prev) => [...prev, next]);
      setActiveSearchId(searchId);
      return searchId;
    },
    [searches.length],
  );

  const closeSearch = useCallback((searchId: string) => {
    setSearches((prev) => {
      const remaining = prev.filter((s) => s.searchId !== searchId);
      setActiveSearchId((current) => {
        if (current !== searchId) return current;
        return remaining[remaining.length - 1]?.searchId ?? null;
      });
      return remaining;
    });
  }, []);

  const selectSearch = useCallback((searchId: string) => {
    setActiveSearchId(searchId);
  }, []);

  const setActiveMfe = useCallback((searchId: string, mfeId: string) => {
    setSearches((prev) =>
      prev.map((s) => (s.searchId === searchId ? { ...s, activeMfe: mfeId } : s)),
    );
  }, []);

  const activeSearch = useMemo(
    () => searches.find((s) => s.searchId === activeSearchId) ?? null,
    [searches, activeSearchId],
  );

  const value: SearchContextState = {
    searches,
    activeSearchId,
    activeSearch,
    atCapacity,
    openSearch,
    closeSearch,
    selectSearch,
    setActiveMfe,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSearchContexts() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSearchContexts must be used within SearchContextProvider");
  return ctx;
}
