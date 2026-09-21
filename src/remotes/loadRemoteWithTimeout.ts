export class RemoteTimeoutError extends Error {
  constructor(mfeKey: string, timeoutMs: number) {
    super(`Remote "${mfeKey}" did not respond within ${timeoutMs}ms`);
    this.name = "RemoteTimeoutError";
  }
}

/**
 * Races a remote-loading promise (e.g. a federation dynamic import) against
 * a timeout, so a remote that is deployed but hanging/unresponsive - not
 * just one that's outright missing = fails predictably instead of leaving
 * that tab stuck on a spinner forever.
 */
export function loadRemoteWithTimeout<T>(
  loader: () => Promise<T>,
  mfeKey: string,
  timeoutMS = 8000,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new RemoteTimeoutError(mfeKey, timeoutMS));
    }, timeoutMS);

    loader()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
