// The unified backend: AWS Cognito-authed progress API plus the MWCC
// compile/grading service, both behind one custom domain. Defaults to the
// public production API so a fresh clone runs with no configuration; override
// with NEXT_PUBLIC_API_URL to point at a local or staging API.
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() || "https://api.decomp-academy.dev"
).replace(/\/+$/, "");

// The MWCC compile service is versioned by toolchain token so new compiler
// builds can be added without breaking existing clients. `247_92` is the
// Metrowerks CodeWarrior 2.4.7 build 92 ("GC/2.0") toolchain — the same one
// decomp.me knows as `mwcc_247_92`. The unversioned /target, /check, /compile
// routes are being retired in favour of these.
export const COMPILER_URL = `${API_URL}/compile/mwcc/247_92`;
