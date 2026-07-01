// Compilation always happens on the unified API (see API_URL): the server-side
// API routes proxy to its /target and /check endpoints, so lesson solutions
// never reach the browser. The compile/grading service shares the same custom
// domain as the auth + progress API.

/** POST JSON to the compile service with a timeout; returns parsed JSON or throws. */
export async function postJson<T = unknown>(
  url: string,
  body: unknown,
  timeoutMs = 30000,
): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      cache: "no-store",
    });
    return (await r.json()) as T;
  } finally {
    clearTimeout(t);
  }
}
