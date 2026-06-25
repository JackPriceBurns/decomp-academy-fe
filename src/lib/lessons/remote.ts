// Where compilation happens:
//   - NEXT_PUBLIC_API_URL set    -> proxy to that API's compile endpoints (/target, /check)
//   - NEXT_PUBLIC_API_URL unset  -> compile locally against ../sfa (dev only)
//
// The compile/grading service lives behind the same custom domain as the auth +
// progress API, so it reuses NEXT_PUBLIC_API_URL. The proxy runs server-side only
// (API routes), so lesson solutions never reach the browser.
export function compileApiUrl(): string | null {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!env) return null;
  return env.replace(/\/+$/, "");
}

/** POST JSON to the compile service with a timeout; returns parsed JSON or throws. */
export async function postJson(
  url: string,
  body: unknown,
  timeoutMs = 30000,
): Promise<any> {
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
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}
