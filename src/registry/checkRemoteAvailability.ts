/**
 * Answers one question, concretely: "is this MFE's remoteEntry.js actually
 * reachable right now?" — as opposed to "does the registry have a URL
 * string for it," which only tells you someone *intended* to deploy it.
 *
 * This runs BEFORE Module Federation ever attempts
 * __federation_method_setRemote/getRemote, so an unreachable remote never
 * even gets a load attempt — it fails fast, with a reason, instead of
 * timing out deep inside the federation runtime.
 */

export interface AvailabilityResult {
  available: boolean;
  /** which network strategy produced this result — useful when debugging CORS setups */
  checkedVia: "cors-head" | "no-cors-get" | "skipped";
  error?: string;
}

const DEFAULT_TIMEOUT_MS = 4000;

export async function checkRemoteAvailability(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<AvailabilityResult> {
  if (!url) {
    return { available: false, checkedVia: "skipped", error: "no remoteEntry configured" };
  }

  // Strategy 1 — a CORS-aware HEAD request. Most static hosts / CDNs serving
  // a remoteEntry.js will answer HEAD and (if configured for cross-origin
  // federation, as they should be) send back CORS headers, which lets us
  // read the real HTTP status.
  try {
    const res = await fetchWithTimeout(url, { method: "HEAD", mode: "cors" }, timeoutMs);
    return {
      available: res.ok,
      checkedVia: "cors-head",
      error: res.ok ? undefined : `HTTP ${res.status} ${res.statusText}`.trim(),
    };
  } catch (corsErr) {
    void corsErr; // deliberately unused — see comment above on why we can't distinguish causes here
    // A thrown fetch here means either: no CORS headers on the response, a
    // genuine network failure (DNS, connection refused, offline), or a CORS
    // preflight rejection. We can't tell those apart from the error alone,
    // so we fall back rather than conclude "unreachable" too early.
    try {
      // Strategy 2 — a no-cors GET. The browser will still attempt the
      // request; we just can't read its status (an "opaque" response). A
      // *resolved* promise here means the request reached a server and got
      // some response, even if we can't see what it was — good enough to
      // call it "available" in environments where CORS on remoteEntry.js
      // hasn't been configured yet. A *rejected* promise means the request
      // never reached anything (real network failure), which we do trust.
      await fetchWithTimeout(url, { method: "GET", mode: "no-cors" }, timeoutMs);
      return { available: true, checkedVia: "no-cors-get" };
    } catch (noCorsErr) {
      const message =
        noCorsErr instanceof DOMException && noCorsErr.name === "AbortError"
          ? `timed out after ${timeoutMs}ms`
          : noCorsErr instanceof Error
            ? noCorsErr.message
            : "network error";
      return { available: false, checkedVia: "no-cors-get", error: message };
    }
  }
}

function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal, cache: "no-store" }).finally(() =>
    window.clearTimeout(timer),
  );
}
