import type { AgentSession, SearchContext } from "@/types";

export const MOCK_SESSION: AgentSession = {
  id: "agent.demo",
  displayName: "Agent Demo",
  initials: "AD",
  role: "agent.demo",
  status: "available",
  permissions: ["search:create", "search:close", "mfe:home360", "mfe:billing"],
};

// Two tabs mirroring the reference screenshot: one resolved search and one
// live call still counting down, to exercise both tab states.
export const MOCK_INITIAL_SEARCHES: SearchContext[] = [
  {
    searchId: "SEARCH-001",
    customerId: "C-2100000045",
    label: "2100000045",
    channel: "voice",
    activeMfe: "home360",
    createdAt: Date.now() - 5 * 60 * 1000,
  },
  {
    searchId: "SEARCH-002",
    customerId: "C-0500007777",
    label: "0500007777",
    channel: "voice",
    activeMfe: "home360",
    createdAt: Date.now() - 2 * 60 * 1000,
    callStartedAt: Date.now() - 34 * 1000, // counts up from ~00:34
  },
];

export type PlanStatus = "active" | "expiring" | "expired";

export interface PlanCard {
  id: string;
  icon: "billing" | "data" | "roaming" | "call";
  title: string;
  category: string;
  status: PlanStatus;
  expiresInDays?: number;
  usageLabel: string;
  usagePct: number;
  start: string;
  endLabel: string;
}

// Mirrors the Home360 MFE card grid in the reference screenshot — used as
// the Shell's local placeholder while home360Mfe's remoteEntry is "pending"
// in the registry, so the Main Content area has something real to show.
export const MOCK_HOME360_PLANS: PlanCard[] = [
  { id: "p1", icon: "billing", title: "DCB limit", category: "Direct carrier billing", status: "active", usageLabel: "0 of 10,000 AED", usagePct: 0, start: "30 Oct 2025", endLabel: "No expiry" },
  { id: "p2", icon: "data", title: "Data soft cap", category: "Roaming data", status: "expiring", expiresInDays: 19, usageLabel: "0 of 999 AED", usagePct: 0, start: "30 Oct 2023", endLabel: "Ends 1 Aug 2026" },
  { id: "p3", icon: "roaming", title: "Freedom data carry-over", category: "Local data", status: "active", usageLabel: "0 MB of —", usagePct: 0, start: "—", endLabel: "Bill cycle" },
  { id: "p4", icon: "roaming", title: "Roam like home weekly voice & data", category: "Roaming data (RLH)", status: "expiring", expiresInDays: 17, usageLabel: "246 MB of 2 GB", usagePct: 12, start: "30 Jun 2026", endLabel: "Ends 30 Jul 2026" },
  { id: "p5", icon: "roaming", title: "Roam like home weekly data", category: "Roaming data (RLH)", status: "expired", usageLabel: "870 MB of 1 GB", usagePct: 85, start: "23 Jun 2026", endLabel: "Ended 30 Jun 2026" },
  { id: "p6", icon: "call", title: "Roam like home weekly voice", category: "MOC roaming (RLH)", status: "active", usageLabel: "0 min of —", usagePct: 0, start: "—", endLabel: "On demand" },
  { id: "p7", icon: "data", title: "Roaming monthly economy class pack", category: "Roaming data", status: "active", usageLabel: "0 MB of —", usagePct: 0, start: "—", endLabel: "On demand" },
  { id: "p8", icon: "call", title: "Roaming monthly economy class pack", category: "Roaming min (MOC-MTC)", status: "active", usageLabel: "0 min of —", usagePct: 0, start: "—", endLabel: "On demand" },
  { id: "p9", icon: "data", title: "Roaming weekly combo pack", category: "Roaming data", status: "active", usageLabel: "0 MB of —", usagePct: 0, start: "—", endLabel: "On demand" },
  { id: "p10", icon: "data", title: "Roaming weekly combo pack", category: "Roaming data", status: "active", usageLabel: "0 MB of —", usagePct: 0, start: "—", endLabel: "On demand" },
];
