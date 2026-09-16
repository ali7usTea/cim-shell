import type { FederatedMfeModule, MfeRegistryEntry } from "@/types";
import { checkRemoteAvailability } from "./checkRemoteAvailability";

/**
 * Every possible outcome of trying to load one MFE, named explicitly so
 * callers (MainContent) can show the agent the real reason instead of a
 * single generic "failed" state.
 */
export type LoadRemoteResult =
  | { status: "not_configured" }
  | { status: "unreachable"; error?: string }
  | { status: "load_error"; error: string }
  | { status: "ready"; module: FederatedMfeModule };

/**
 * Loads one MFE's federated module at runtime, from the registry entry —
 * never a hardcoded URL. Three gates run in order, each one able to stop
 * the process before the next (fault isolation, proposal §5.2 "validate
 * remote availability before activation and provide a controlled MFE
 * error state"):
 *
 *   1. Is a remoteEntry even configured?              -> not_configured
 *   2. Is that remoteEntry actually reachable right now? -> unreachable
 *   3. Does it load AND expose a valid mount/unmount pair? -> load_error
 *
 *   Only if all three pass do we return `{ status: "ready", module }`.
 */
export async function loadRemoteModule(entry: MfeRegistryEntry): Promise<LoadRemoteResult> {
  // Gate 1 — nothing to even attempt.
  if (!entry.remoteEntry) {
    return { status: "not_configured" };
  }

  // Gate 2 — re-verify right now, at the moment of loading, rather than
  // trusting a registry status that may be up to `pollMs` stale. This is
  // deliberately a second check even though useMfeRegistry already pings
  // periodically: the registry's status is a UI hint (the rail's dot
  // color), this is the actual gate before we let federation touch the
  // network.
  const availability = await checkRemoteAvailability(entry.remoteEntry);
  if (!availability.available) {
    return { status: "unreachable", error: availability.error };
  }

  // Gate 3 — attempt the real dynamic-remote load.
  try {
    // @ts-expect-error -- virtual module injected by @originjs/vite-plugin-federation at build time
    const federation = await import("virtual:__federation__");

    await federation.__federation_method_setRemote(entry.remoteName, {
      url: entry.remoteEntry,
      format: "esm",
      from: "vite",
    });

    const container = await federation.__federation_method_getRemote(
      entry.remoteName,
      entry.exposedModule,
    );

    if (
      !container ||
      typeof (container as Partial<FederatedMfeModule>).mount !== "function" ||
      typeof (container as Partial<FederatedMfeModule>).unmount !== "function"
    ) {
      return {
        status: "load_error",
        error: `"${entry.exposedModule}" from "${entry.remoteName}" doesn't implement the mount/unmount contract`,
      };
    }

    return { status: "ready", module: container as FederatedMfeModule };
  } catch (err) {
    console.error(`[mfe-registry] failed to load remote "${entry.remoteName}"`, err);
    return {
      status: "load_error",
      error: err instanceof Error ? err.message : "unknown federation error",
    };
  }
}
