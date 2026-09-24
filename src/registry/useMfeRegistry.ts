import { useCallback, useEffect, useState } from "react";
import type { MfeRegistryEntry, MfeRegistryFile } from "@/types";
import { checkRemoteAvailability } from "./checkRemoteAvailability";

const DEFAULT_POLL_MS = 30_000;

/**
 * Loads the runtime remote registry (public/mfe-registry.json — never a
 * hardcoded URL in source, per proposal §5.2) and then goes further than a
 * plain fetch: it actively pings every entry that has a `remoteEntry` set
 * and updates its `status` to "deployed" or "unreachable" based on a real
 * network check, not just "a URL string happens to be present."
 *
 * Entries with no `remoteEntry` at all are left as "not_configured" and are
 * never pinged — there's nothing to check yet.
 *
 * Re-checks on an interval (default 30s) so an MFE that comes online after
 * the Shell has already loaded gets picked up without a page refresh, and
 * exposes `refresh()` for an explicit "check now" action.
 */
export function useMfeRegistry(pollMs: number = DEFAULT_POLL_MS) {
  const [entries, setEntries] = useState<MfeRegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pings every checkable entry in `list`, writing results back into state
  // as each one resolves (not all-at-once), so fast remotes light up
  // immediately instead of waiting on the slowest one.
  const checkAll = useCallback((list: MfeRegistryEntry[]) => {
    list
      .filter((entry) => Boolean(entry.remoteEntry))
      .forEach((entry) => {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entry.id ? { ...e, status: "checking" } : e,
          ),
        );

        checkRemoteAvailability(entry.remoteEntry).then((result) => {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entry.id
                ? {
                    ...e,
                    status: result.available ? "deployed" : "unreachable",
                    lastCheckedAt: Date.now(),
                    lastError: result.error,
                  }
                : e,
            ),
          );
        });
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/mfe-registry.json")
      .then((res) => {
        if (!res.ok) throw new Error(`registry fetch failed: ${res.status}`);
        return res.json() as Promise<MfeRegistryFile>;
      })
      .then((file) => {
        console.log(file);
        console.log(file.mfes);
        if (cancelled) return;
        const seeded: MfeRegistryEntry[] = file.mfes.map((m) => ({
          ...m,
          status: m.remoteEntry ? "checking" : "not_configured",
        }));
        setEntries(seeded);
        checkAll(seeded);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "unknown registry error",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [checkAll]);

  useEffect(() => {
    if (pollMs <= 0) return;
    const id = window.setInterval(() => {
      setEntries((current) => {
        checkAll(current);
        return current;
      });
    }, pollMs);
    return () => window.clearInterval(id);
  }, [pollMs, checkAll]);

  const refresh = useCallback(() => {
    setEntries((current) => {
      checkAll(current);
      return current;
    });
  }, [checkAll]);

  return { entries, loading, error, refresh };
}
