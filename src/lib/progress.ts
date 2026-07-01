"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/auth/api";
import { LESSONS } from "@/lib/lessons/registry.client";
import legacyProgressIds from "@/lib/lessons/legacy-progress-ids.json";

// Legacy anonymous storage (kept as the signed-out backend + migration source).
const LEGACY_KEY = "decomp-academy-progress-v1";
const CODE_PREFIX = "decomp-code-";
const codeKey = (id: string) => `${CODE_PREFIX}${id}`;

// Progress is keyed by a lesson's stable UUIDv5 (progressId) everywhere it's
// persisted or transmitted — never the human slug. Components call us with the
// (course, slug) pair; we translate here so they don't have to care. A slug is
// only unique within its course, so the component-facing lookup is keyed by
// "<course>/<slug>".
const courseSlugKey = (course: string, slug: string) => `${course}/${slug}`;
const SLUG_TO_PID = new Map(LESSONS.map((l) => [courseSlugKey(l.course, l.id), l.progressId]));

// `normalizeKeys` upgrades data stored under an OLD key shape to the current
// progressId. Two old shapes exist, both predating courses (when slugs were
// globally unique):
//   - a bare slug (the original, pre-progressId scheme), resolved against the
//     live slug→pid map below, and
//   - a pre-course progressId, resolved against the frozen table.
const GLOBAL_SLUG_TO_PID = new Map<string, string>();
for (const l of LESSONS)
  if (!GLOBAL_SLUG_TO_PID.has(l.id)) GLOBAL_SLUG_TO_PID.set(l.id, l.progressId);

// Frozen historical map: pre-course progressId (uuidv5 of "<tier>/<chapter>/
// <slug>") → current course-scoped progressId. Adding courses re-hashed every
// lesson, so server/localStorage rows still keyed by the old id fold forward
// through this. It's a one-time snapshot generated from the pre-course hash and
// committed verbatim — not recomputed from the live curriculum — so once no old
// data remains, this table and the fold can just be deleted. A Map (not raw
// object indexing) so a stored key like "toString" can't resolve to an inherited
// Object.prototype member instead of passing through.
const LEGACY_PID_TO_PID = new Map<string, string>(
  Object.entries(legacyProgressIds as Record<string, string>),
);

// Map a STORED key — bare slug, pre-course progressId, or current progressId —
// to the current progressId. Unknown keys pass through unchanged.
function toProgressId(key: string): string {
  return GLOBAL_SLUG_TO_PID.get(key) ?? LEGACY_PID_TO_PID.get(key) ?? key;
}

// Map a component's (course, slug) to the current progressId. Falls back to the
// global slug map (course unrecognized) and finally to the key itself.
function resolveId(course: string, id: string): string {
  return SLUG_TO_PID.get(courseSlugKey(course, id)) ?? GLOBAL_SLUG_TO_PID.get(id) ?? id;
}

// The most recent of two ISO timestamps (ISO-8601 sorts lexically).
function latest(a?: string, b?: string): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

// Pick which side's saved code to keep when folding two records for the same
// lesson. The code should follow the *higher-scoring* side (its source is the
// one that actually achieved that score); ties go to `local` as the freshest
// edit. Truthiness checks ensure an empty string never shadows real code.
function chooseCode(local?: LessonProgress, server?: LessonProgress): string | undefined {
  const lBest = local?.bestPercent ?? 0;
  const sBest = server?.bestPercent ?? 0;
  if (sBest > lBest) return server?.code || local?.code;
  return local?.code || server?.code;
}

function normalizeKeys(ls: Lessons): Lessons {
  const out: Lessons = {};
  for (const [k, v] of Object.entries(ls)) {
    const id = toProgressId(k); // legacy slug / pre-course pid → current pid; else unchanged
    const prev = out[id];
    if (!prev) {
      out[id] = v;
      continue;
    }
    // A legacy row and its current-progressId row can coexist mid-migration —
    // fold them: highest score wins, and the code follows the higher-scoring side.
    const best = Math.max(prev.bestPercent ?? 0, v.bestPercent ?? 0);
    out[id] = {
      bestPercent: best,
      completed: best >= 100,
      code: chooseCode(prev, v),
      solvedWithoutHints: mergeNoHints(prev.solvedWithoutHints, v.solvedWithoutHints),
      updatedAt: latest(prev.updatedAt, v.updatedAt),
    };
  }
  return out;
}

export interface LessonProgress {
  bestPercent: number; // 0–100, highest ever achieved (never decreases)
  completed: boolean; // bestPercent >= 100
  code?: string; // the learner's last saved C source
  solvedWithoutHints?: boolean; // earned the "no hints" badge on a completing solve
  updatedAt?: string;
}

// "No hints" is an earned-on-any-side badge: a single hint-free solve wins.
function mergeNoHints(a?: boolean, b?: boolean): boolean | undefined {
  if (a === true || b === true) return true;
  if (a === false || b === false) return false;
  return undefined;
}

type Lessons = Record<string, LessonProgress>;

// --- module singleton: one in-memory map shared by the hook + imperative API.
let lessons: Lessons = {};
// "loading" until auth resolves: writes during this window (e.g. the lesson's
// auto-run autosaving the seeded code) stay in memory only — never localStorage —
// so a signed-in learner doesn't leak a phantom local entry that later prompts a
// merge. configureAnon/configureAuthed flip us to the real backend.
let mode: "loading" | "anon" | "authed" = "loading";
let ready = false;
// Synchronous local prime so the very first lesson load sees saved code/percent
// before the provider effect (which runs after child effects) has configured us.
let primed = false;

// True only while runConfigureAuthed is reconciling. Lessons the learner *solves*
// during that async window are collected here so finalize can fold them into the
// reconciled snapshot — otherwise `lessons = result` would drop a completion the
// learner just earned. We track bestPercent only (never code), so an auto-seeded
// starter save can't clobber the account's source.
let reconciling = false;
const reconcileWrites = new Set<string>();

// Set once an authed write is rejected for auth reasons (401/403). We mirror the
// in-memory map back to localStorage and ask the auth layer to re-check the
// session, so a silently-expired login degrades to anonymous persistence rather
// than dropping every subsequent write. Guarded so it fires at most once.
let authLost = false;

// Per-document id, used to claim the cross-tab reconcile lock.
const TAB_ID =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("decomp-progress"));
  }
}

/* --------------------------------- local --------------------------------- */

function readLocal(): Lessons {
  if (typeof window === "undefined") return {};
  const out: Lessons = {};
  // Two independent try blocks: a corrupt LEGACY_KEY (solved percentages) must
  // not also throw away the separately-stored per-lesson code blobs, or vice versa.
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    const blob = raw ? JSON.parse(raw) : {};
    const solved: Record<string, number> = blob.solved ?? {};
    const noHints: Record<string, boolean> = blob.noHints ?? {};
    for (const [id, pct] of Object.entries(solved)) {
      out[id] = {
        bestPercent: pct,
        completed: pct >= 100,
        ...(id in noHints ? { solvedWithoutHints: noHints[id] } : {}),
      };
    }
  } catch {
    /* ignore corrupt solved blob */
  }
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith(CODE_PREFIX)) continue;
      const id = k.slice(CODE_PREFIX.length);
      const existing = out[id] ?? { bestPercent: 0, completed: false };
      out[id] = { ...existing, code: localStorage.getItem(k) ?? undefined };
    }
  } catch {
    /* ignore */
  }
  return normalizeKeys(out);
}

function writeLocalBest(id: string, pct: number) {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    const blob = raw ? JSON.parse(raw) : {};
    const solved: Record<string, number> = blob.solved ?? {};
    const noHints: Record<string, boolean> = blob.noHints ?? {};
    solved[id] = pct;
    const flag = lessons[id]?.solvedWithoutHints;
    if (flag !== undefined) noHints[id] = flag;
    localStorage.setItem(LEGACY_KEY, JSON.stringify({ solved, noHints }));
  } catch {
    /* ignore quota errors */
  }
}

function writeLocalCode(id: string, code: string) {
  try {
    localStorage.setItem(codeKey(id), code);
  } catch {
    /* ignore */
  }
}

// Copy the whole in-memory map back into localStorage. Used when an authed
// session is lost mid-flight: the upcoming downgrade to anon reads from
// localStorage, so we prime it here to avoid blanking the learner's view.
function mirrorAllToLocal() {
  for (const [id, l] of Object.entries(lessons)) {
    if ((l.bestPercent ?? 0) > 0) writeLocalBest(id, l.bestPercent);
    if (l.code) writeLocalCode(id, l.code);
  }
}

function primeLocal() {
  if (primed || ready) return;
  lessons = readLocal();
  primed = true;
}

// Wipe the anonymous mirror once its contents have been reconciled onto the
// server, so a later sign-in on this device doesn't re-prompt over stale data.
function clearLocal() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEGACY_KEY);
    const codeKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CODE_PREFIX)) codeKeys.push(k);
    }
    codeKeys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/* ----------------------------- write failures ---------------------------- */

// An authed write that fails to land would otherwise vanish on reload, because
// the local mirror was cleared after sign-in. Re-mirror the affected lesson to
// localStorage for durability, and — if the failure is an auth rejection —
// degrade the whole session to local persistence (see onAuthLost).
function handleWriteError(id: string, err: unknown) {
  const l = lessons[id];
  if (l) {
    if ((l.bestPercent ?? 0) > 0) writeLocalBest(id, l.bestPercent);
    if (l.code) writeLocalCode(id, l.code);
  }
  if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
    onAuthLost();
  }
}

function onAuthLost() {
  if (authLost) return;
  authLost = true;
  // Preserve everything so the imminent downgrade to anon (which re-reads
  // localStorage) keeps the learner's progress instead of blanking it.
  mirrorAllToLocal();
  if (typeof window !== "undefined") {
    // AuthContext listens for this and re-validates the session; a genuinely
    // expired login then flips status → "anon" → configureAnon().
    window.dispatchEvent(new Event("decomp-auth-expired"));
  }
}

/* --------------------------------- server -------------------------------- */

// Debounced per-lesson code PUTs so autosave-on-keystroke doesn't hammer the API.
const codeTimers: Record<string, ReturnType<typeof setTimeout>> = {};
function putCodeServer(id: string, code: string) {
  clearTimeout(codeTimers[id]);
  codeTimers[id] = setTimeout(() => {
    api(`/progress/${id}`, { method: "PUT", body: JSON.stringify({ code }) }).catch((e) =>
      handleWriteError(id, e),
    );
  }, 800);
}

function putBestServer(id: string, bestPercent: number) {
  const body: { bestPercent: number; solvedWithoutHints?: boolean } = { bestPercent };
  const flag = lessons[id]?.solvedWithoutHints;
  if (flag !== undefined) body.solvedWithoutHints = flag;
  api(`/progress/${id}`, { method: "PUT", body: JSON.stringify(body) }).catch((e) =>
    handleWriteError(id, e),
  );
}

/* ------------------------------- public API ------------------------------ */

export function recordResult(
  course: string,
  lessonId: string,
  percent: number,
  opts?: { noHints?: boolean },
) {
  primeLocal();
  const id = resolveId(course, lessonId);
  const prev = lessons[id]?.bestPercent ?? 0;
  if (percent <= prev) return; // bestPercent only moves up (server enforces this too)
  const completed = percent >= 100;
  lessons[id] = {
    ...lessons[id],
    bestPercent: percent,
    completed,
    // The badge is decided at the first completing solve; later re-solves
    // early-return above, so it never gets overwritten by a post-refresh re-run.
    ...(completed && opts?.noHints !== undefined ? { solvedWithoutHints: opts.noHints } : {}),
  };
  // A real solve earned mid-reconcile must survive finalize's snapshot swap.
  if (reconciling) reconcileWrites.add(id);
  notify();
  if (mode === "authed") putBestServer(id, percent);
  else if (mode === "anon") writeLocalBest(id, percent);
  // "loading": in-memory only until auth resolves.
}

export function saveCode(course: string, lessonId: string, code: string) {
  primeLocal();
  const id = resolveId(course, lessonId);
  const existing = lessons[id] ?? { bestPercent: 0, completed: false };
  lessons[id] = { ...existing, code };
  if (mode === "authed") putCodeServer(id, code);
  else if (mode === "anon") writeLocalCode(id, code);
  // "loading": in-memory only until auth resolves.
}

// Synchronous read of the learner's last saved code (from the hydrated map).
export function loadCode(course: string, lessonId: string): string | null {
  primeLocal();
  return lessons[resolveId(course, lessonId)]?.code ?? null;
}

export function totalSolved(): number {
  primeLocal();
  return Object.values(lessons).filter((l) => l.bestPercent >= 100).length;
}

// Whether the lesson's recorded completion was earned without revealing hints.
// Read from the persisted store so a re-run after refresh can't fake the badge.
export function solvedWithoutHints(course: string, lessonId: string): boolean {
  primeLocal();
  return lessons[resolveId(course, lessonId)]?.solvedWithoutHints === true;
}

/* ---------------------------- reconciliation ----------------------------- */
// When a learner signs in with progress on this device *and* on their account,
// we don't silently pick a winner — we surface a choice (merge / keep this
// device / use account). The provider renders <ProgressMergeDialog/>, which
// reads the pending conflict via useReconcile() and calls resolve().

export type MergeStrategy = "merge" | "local" | "server";

let pending: {
  local: Lessons;
  server: Lessons;
  resolve: (s: MergeStrategy) => void;
} | null = null;

// Progress of the sequential upload that follows the learner's choice. Non-null
// only while we're draining the queue; the dialog reads it to draw its bar.
let sync: { done: number; total: number } | null = null;

function notifyReconcile() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("decomp-reconcile"));
  }
}

export function getReconcile(): { local: Lessons; server: Lessons } | null {
  return pending ? { local: pending.local, server: pending.server } : null;
}

export function getSync(): { done: number; total: number } | null {
  return sync;
}

// Open the conflict modal and resolve once the learner picks a strategy. We
// leave `pending` set so the dialog stays mounted for the upload phase;
// runConfigureAuthed clears it once finalize() has drained the queue.
function promptUser(local: Lessons, server: Lessons): Promise<MergeStrategy> {
  return new Promise((resolve) => {
    pending = { local, server, resolve };
    notifyReconcile();
  });
}

function hasData(ls: Lessons): boolean {
  return Object.values(ls).some(
    (l) => (l.bestPercent ?? 0) > 0 || (l.code != null && l.code !== ""),
  );
}

// Lossless union: the higher bestPercent always wins, and the code follows the
// higher-scoring side (ties to this device, the freshest edit).
function mergeProgress(local: Lessons, server: Lessons): Lessons {
  const out: Lessons = {};
  for (const id of new Set([...Object.keys(local), ...Object.keys(server)])) {
    const l = local[id];
    const s = server[id];
    const best = Math.max(l?.bestPercent ?? 0, s?.bestPercent ?? 0);
    out[id] = {
      bestPercent: best,
      completed: best >= 100,
      code: chooseCode(l, s),
      solvedWithoutHints: mergeNoHints(l?.solvedWithoutHints, s?.solvedWithoutHints),
      updatedAt: latest(l?.updatedAt, s?.updatedAt),
    };
  }
  return out;
}

function sameProgress(a: Lessons, b: Lessons): boolean {
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if ((a[id]?.bestPercent ?? 0) !== (b[id]?.bestPercent ?? 0)) return false;
    if ((a[id]?.code ?? "") !== (b[id]?.code ?? "")) return false;
  }
  return true;
}

// Push every non-empty lesson up to the account — one PUT at a time, so we
// don't flood the API (concurrent fan-out was getting us 503s). Returns true
// iff all PUTs landed; we only clear the local mirror on a clean upload.
async function pushAll(
  ls: Lessons,
  onProgress?: (done: number, total: number) => void,
): Promise<boolean> {
  const entries = Object.entries(ls).filter(
    ([, l]) => (l.bestPercent ?? 0) > 0 || (l.code != null && l.code !== ""),
  );
  let ok = true;
  onProgress?.(0, entries.length);
  for (let i = 0; i < entries.length; i++) {
    const [id, l] = entries[i];
    const body: { bestPercent?: number; code?: string; solvedWithoutHints?: boolean } = {};
    if ((l.bestPercent ?? 0) > 0) body.bestPercent = l.bestPercent;
    if (l.code) body.code = l.code;
    if (l.solvedWithoutHints !== undefined) body.solvedWithoutHints = l.solvedWithoutHints;
    try {
      await api(`/progress/${id}`, { method: "PUT", body: JSON.stringify(body) });
    } catch {
      ok = false;
    }
    onProgress?.(i + 1, entries.length);
  }
  return ok;
}

async function finalize(
  result: Lessons,
  opts: {
    push: boolean;
    clear?: boolean;
    onProgress?: (done: number, total: number) => void;
  },
) {
  // Fold in any completions earned while we were reconciling (mode was already
  // "authed", so these PUT to the server during the window, but `result` was
  // computed from a snapshot taken before them). bestPercent only — never code.
  const merged: Lessons = { ...result };
  for (const id of reconcileWrites) {
    const cur = lessons[id];
    if (!cur) continue;
    const best = Math.max(cur.bestPercent ?? 0, merged[id]?.bestPercent ?? 0);
    merged[id] = {
      ...(merged[id] ?? {}),
      bestPercent: best,
      completed: best >= 100,
    };
  }

  const pushedOk = opts.push ? await pushAll(merged, opts.onProgress) : true;

  // Solves earned during the reconcile window must reach the server even on the
  // no-push paths (adopt-account / already-synced / a lesson finished while we
  // waited on another tab's lock). Idempotent when pushAll already sent them.
  if (mode === "authed") {
    for (const id of reconcileWrites) {
      const best = merged[id]?.bestPercent ?? 0;
      if (best > 0) putBestServer(id, best);
    }
  }

  lessons = merged;
  primed = true;
  ready = true;
  if (opts.clear !== false && pushedOk) clearLocal();
  notify();
}

/* ------------------------- cross-tab reconcile lock ---------------------- */
// Two tabs signing in at once would each prompt the merge dialog and each fire
// their own upload. We serialize with a localStorage lock: the tab holding it
// reconciles (prompt + upload + clearLocal); other tabs wait, then find local
// already cleared and silently adopt the server — no second prompt.

const RECONCILE_LOCK = "decomp-reconcile-lock";
const LOCK_TTL_MS = 60_000;

function tryAcquireLock(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(RECONCILE_LOCK);
    if (raw) {
      const held = JSON.parse(raw) as { t: number; id: string };
      if (held.id !== TAB_ID && Date.now() - held.t < LOCK_TTL_MS) return false;
    }
    localStorage.setItem(RECONCILE_LOCK, JSON.stringify({ t: Date.now(), id: TAB_ID }));
    // Re-read to resolve a same-instant race between tabs (best-effort).
    const back = JSON.parse(localStorage.getItem(RECONCILE_LOCK) || "{}");
    return back.id === TAB_ID;
  } catch {
    return true; // storage unavailable → don't block reconciliation
  }
}

async function acquireReconcileLock(): Promise<void> {
  // Wait out another tab's reconcile, but never longer than the lock TTL (in
  // case the holder was closed mid-prompt and left a stale lock behind).
  const deadline = Date.now() + LOCK_TTL_MS + 5_000;
  while (Date.now() < deadline) {
    if (tryAcquireLock()) return;
    await sleep(300);
  }
}

function releaseReconcileLock() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(RECONCILE_LOCK);
    if (!raw) return;
    const held = JSON.parse(raw) as { id: string };
    if (held.id === TAB_ID) localStorage.removeItem(RECONCILE_LOCK);
  } catch {
    /* ignore */
  }
}

/* ------------------------------ configuration ---------------------------- */
// Called by ProgressProvider as auth state resolves.

export function configureAnon() {
  mode = "anon";
  authInflight = null;
  authLost = false;
  reconciling = false;
  reconcileWrites.clear();
  if (pending || sync) {
    pending = null;
    sync = null;
    notifyReconcile();
  }
  lessons = readLocal();
  primed = true;
  ready = true;
  notify();
}

// Guard against the effect firing twice (StrictMode / re-renders) launching two
// reconciliations. Reset in configureAnon so a sign-out → sign-in still runs.
let authInflight: Promise<void> | null = null;

export function configureAuthed(): Promise<void> {
  if (authInflight) return authInflight;
  authInflight = runConfigureAuthed();
  return authInflight;
}

async function runConfigureAuthed() {
  reconciling = true;
  reconcileWrites.clear();
  authLost = false;

  // Serialize reconciliation across tabs (see the lock section above).
  await acquireReconcileLock();
  try {
    mode = "authed";
    const local = readLocal();

    let server: Lessons = {};
    try {
      const res = await api<{ lessons: Lessons }>("/progress");
      // Upgrade any legacy slug-keyed rows to the progressId keyspace so they
      // line up with `local` (also normalized) and the keys we PUT going forward.
      server = normalizeKeys(res.lessons ?? {});
    } catch {
      // Couldn't reach the account: keep the local view rather than blank it, and
      // don't clear local — there's nothing to safely reconcile against.
      await finalize(local, { push: false, clear: false });
      return;
    }

    // Nothing local to lose → adopt the account (the signed-in source of truth).
    if (!hasData(local)) {
      await finalize(server, { push: false, clear: false });
      return;
    }
    // Empty account → first-time upload, no conflict worth a prompt.
    if (!hasData(server)) {
      await finalize(mergeProgress(local, server), { push: true });
      return;
    }
    // Already in sync → nothing to choose.
    if (sameProgress(local, server)) {
      await finalize(server, { push: false });
      return;
    }

    // Genuine divergence → let the learner decide.
    const strategy = await promptUser(local, server);
    const result =
      strategy === "server" ? server : strategy === "local" ? local : mergeProgress(local, server);
    const push = strategy !== "server";

    // Keep the dialog mounted through the upload so it can show a progress bar;
    // tear it down only once the queue has drained.
    await finalize(result, {
      push,
      onProgress: (done, total) => {
        sync = { done, total };
        notifyReconcile();
      },
    });
    pending = null;
    sync = null;
    notifyReconcile();
  } finally {
    reconciling = false;
    reconcileWrites.clear();
    releaseReconcileLock();
  }
}

/* --------------------------------- hook ---------------------------------- */

// Re-read localStorage into the in-memory map when another tab changes it. Only
// meaningful in anon mode (in authed mode the server is the backend); keeps two
// signed-out tabs from drifting out of sync.
function syncFromStorage() {
  if (mode !== "anon") return;
  lessons = readLocal();
}

export function useProgress() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    primeLocal();
    setTick((n) => n + 1);
    const onLocal = () => setTick((n) => n + 1);
    const onStorage = () => {
      syncFromStorage();
      setTick((n) => n + 1);
    };
    window.addEventListener("decomp-progress", onLocal);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("decomp-progress", onLocal);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Keyed on `tick` so consumers' useMemo (e.g. MatchLog) re-runs when progress
  // changes — the callbacks must change identity, not just close over live data.
  const isSolved = useCallback(
    (course: string, id: string) => (lessons[resolveId(course, id)]?.bestPercent ?? 0) >= 100,
    [tick],
  );
  const bestPercent = useCallback(
    (course: string, id: string) => lessons[resolveId(course, id)]?.bestPercent ?? 0,
    [tick],
  );

  return { isSolved, bestPercent, ready };
}

// Subscribes to the pending sign-in conflict (if any). The dialog renders when
// `reconcile` is non-null and calls `resolve` with the learner's choice.
export function useReconcile() {
  const [state, setState] = useState(() => ({
    reconcile: getReconcile(),
    sync: getSync(),
  }));
  useEffect(() => {
    const handler = () => setState({ reconcile: getReconcile(), sync: getSync() });
    window.addEventListener("decomp-reconcile", handler);
    return () => window.removeEventListener("decomp-reconcile", handler);
  }, []);
  const resolve = useCallback((s: MergeStrategy) => pending?.resolve(s), []);
  return { reconcile: state.reconcile, sync: state.sync, resolve };
}
