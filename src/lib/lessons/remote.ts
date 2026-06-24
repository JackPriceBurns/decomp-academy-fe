// Where compilation happens:
//   - COMPILE_API_URL set (and != "local")  -> proxy to that URL
//   - production (e.g. Amplify) with no override -> the deployed compile service
//   - otherwise (local `next dev`)            -> compile locally against ../sfa
//
// The proxy runs server-side only (API routes), so the compile service can be
// plain HTTP and lesson solutions never reach the browser.
const DEFAULT_API = "http://34.255.144.200:8080";

export function compileApiUrl(): string | null {
  const env = process.env.COMPILE_API_URL?.trim();
  if (env === "local") return null;
  if (env) return env.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") return DEFAULT_API;
  return null;
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
