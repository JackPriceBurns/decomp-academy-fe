import { createHash } from "node:crypto";
import { Instruction } from "@/lib/asm";
import { API_URL, COMPILER_URL } from "@/lib/api-url";
import { getLesson } from "./registry";
import { LessonSource } from "./types";
import { postJson } from "./remote";

// In-memory cache of compiled reference targets, keyed by a hash of the inputs
// that affect codegen. The reference solution is authoritative, so caching it is
// safe until the lesson definition changes.
interface CachedTarget {
  instructions: Instruction[];
  /** The reference object file (base64) — diffed against the learner's in the browser. */
  objBase64?: string;
}
const targetCache = new Map<string, CachedTarget>();

function targetKey(l: LessonSource): string {
  const h = createHash("sha1");
  h.update(l.solution);
  h.update("\0");
  h.update(l.context || "");
  h.update("\0");
  h.update(l.symbol);
  h.update("\0");
  h.update((l.extraFlags || []).join(" "));
  return h.digest("hex");
}

export interface TargetResult {
  ok: boolean;
  instructions?: Instruction[];
  /** Reference object file (base64) for browser-side objdiff. */
  objBase64?: string;
  error?: string;
}

/** Compile (and cache) the authoritative target asm + object file for a lesson. */
export async function getTarget(l: LessonSource): Promise<TargetResult> {
  // Reading-only lessons have no compile exercise.
  if (l.concept) return { ok: true, instructions: [] };

  const key = targetKey(l);
  const cached = targetCache.get(key);
  if (cached) return { ok: true, instructions: cached.instructions, objBase64: cached.objBase64 };

  // Ask the unified compile service for the authoritative target.
  try {
    const d = await postJson<CompileResponse>(`${COMPILER_URL}/target`, {
      solution: l.solution,
      symbol: l.symbol,
      context: l.context,
      extraFlags: l.extraFlags,
    });
    if (!d?.ok) return { ok: false, error: d?.error || "Compile service error." };
    if (!d.objBase64) {
      return { ok: false, error: "Compile service returned no target object file." };
    }
    targetCache.set(key, { instructions: d.instructions ?? [], objBase64: d.objBase64 });
    return { ok: true, instructions: d.instructions, objBase64: d.objBase64 };
  } catch (e) {
    return { ok: false, error: "Could not reach the compile service." };
  }
}

interface CompileResponse {
  ok?: boolean;
  objBase64?: string;
  instructions?: Instruction[];
  error?: string;
  compileError?: string;
}

export interface CheckResult {
  ok: boolean;
  /** Compiler diagnostics if the user's code failed to compile. */
  compileError?: string;
  /** Service-level error (bad lesson id, reference broken, etc.). */
  error?: string;
  /** The learner's object file (base64), diffed against the target in the browser. */
  objBase64?: string;
}

/** Compile the learner's code and return its object file for browser-side diffing. */
export async function checkLesson(
  course: string,
  lessonId: string,
  code: string,
): Promise<CheckResult> {
  const lesson = getLesson(course, lessonId);
  if (!lesson) return { ok: false, error: "Unknown lesson." };
  if (lesson.concept) return { ok: false, error: "This lesson has no exercise." };

  // The compile service compiles the learner's code and returns the .o. It has
  // no concept of lessons — the per-lesson stat is recorded separately against
  // the main API below, once we know whether the code built.
  try {
    const d = await postJson<CompileResponse>(`${COMPILER_URL}/check`, {
      code,
      symbol: lesson.symbol,
      context: lesson.hideContext ? undefined : lesson.context,
      extraFlags: lesson.extraFlags,
    });
    if (!d?.ok) {
      if (d?.compileError) {
        await recordCompile(lesson.progressId, false);
        return { ok: false, compileError: d.compileError };
      }
      // A service/infra error isn't a failed compile, so it isn't counted.
      return { ok: false, error: d?.error || "Compile service error." };
    }
    await recordCompile(lesson.progressId, true);
    if (!d.objBase64) {
      return { ok: false, error: "Compile service returned no object file." };
    }
    return { ok: true, objBase64: d.objBase64 };
  } catch (e) {
    return { ok: false, error: "Could not reach the compile service." };
  }
}

// Best-effort per-lesson compile counter on the main API, keyed by the lesson's
// stable progressId (the same key its progress uses). Never let a stats write
// change or fail a check.
async function recordCompile(progressId: string, compiled: boolean): Promise<void> {
  try {
    await fetch(`${API_URL}/stats/${encodeURIComponent(progressId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: compiled }),
    });
  } catch {
    // ignore — stats are non-critical
  }
}
