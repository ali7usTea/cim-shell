/**
 * Shell <-> MFE contract types.
 *
 * Per CLAUDE.md / proposal §4.2: this stays small and typed. It carries only
 * the context multiple MFEs need (search identity, customer identifiers,
 * agent/session, permissions, active MFE). Everything else is the MFE's own
 * local/business state — do not grow this into a shared app-wide store.
 */

/** Channel the interaction arrived on (proposal §2 — Voice/WhatsApp/Chat/Other). */
export type InteractionChannel = "voice" | "whatsapp" | "chat" | "other";

/**
 * One customer/work item, owned by the Shell. Up to MAX_CONCURRENT_SEARCHES
 * can be open at once; the agent switches the active one via the tab strip.
 */
export interface SearchContext {
  searchId: string; // e.g. "SEARCH-002"
  customerId: string;
  accountNo?: string;
  accountCode?: string;
  partyId?: string;
  contractId?: string;
  email?: string;
  emiratedId?: string;
  passport?: string;

  /** Display identifier shown on the tab (e.g. phone number). */
  label: string;
  channel: InteractionChannel;

  /** id of the MFE currently active for this search (see MfeRegistryEntry.id) */
  activeMfe: string;

  /** set when the interaction is a live call, drives the tab's timer */
  callStartedAt?: number;

  createdAt: number;
}

export const MAX_CONCURRENT_SEARCHES = 10;

export type MfeLoadStatus = "not_configured" | "checking" | "deployed" | "unreachable";

/**
 * One entry in the runtime remote registry (public/mfe-registry.json).
 *
 * `status` reflects whether the remote is actually reachable right now, not
 * just whether a URL string happens to be present — see
 * src/registry/checkRemoteAvailability.ts and src/registry/useMfeRegistry.ts.
 */
export interface MfeRegistryEntry {
  id: string;
  name: string;
  remoteName: string;
  remoteEntry: string; // built remoteEntry.js URL — populated by platform/ops config, never hardcoded in source
  exposedModule: string;
  route: string;
  icon: string;
  status: MfeLoadStatus;
  /** epoch ms of the last availability check, if any has run yet */
  lastCheckedAt?: number;
  /** human-readable reason the last availability check failed, if it did */
  lastError?: string;
}

export interface MfeRegistryFile {
  version: number;
  mfes: MfeRegistryEntry[];
}

/** Minimal agent/session info the Shell exposes to MFEs — no MFE owns auth. */
export interface AgentSession {
  id: string;
  displayName: string;
  initials: string;
  role: string;
  status: "available" | "busy" | "away" | "offline";
  permissions: string[];
}

/** The federated module every MFE exposes — the "stable mount/unmount contract" (proposal §7). */
export interface FederatedMfeModule {
  mount: (el: HTMLElement, ctx: MfeMountContext) => void;
  unmount: (el: HTMLElement) => void;
}

export interface MfeMountContext {
  searchContext: SearchContext;
  session: AgentSession;
}
