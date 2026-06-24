import { createHash } from "node:crypto";
import { compile } from "@/lib/compile";
import { Instruction } from "@/lib/asm";
import { getLesson } from "./registry";
import { LessonSource } from "./types";
import { compileApiUrl, postJson } from "./remote";

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

  // Proxy mode: ask the deployed compile service for the target.
  const api = compileApiUrl();
  if (api) {
    try {
      const d = await postJson(`${api}/target`, {
        solution: l.solution,
        symbol: l.symbol,
        context: l.context,
        extraFlags: l.extraFlags,
      });
      if (!d?.ok) return { ok: false, error: d?.error || "Compile service error." };
      if (!d.objBase64) {
        return { ok: false, error: "Compile service returned no target object file." };
      }
      targetCache.set(key, { instructions: d.instructions, objBase64: d.objBase64 });
      return { ok: true, instructions: d.instructions, objBase64: d.objBase64 };
    } catch (e) {
      return { ok: false, error: "Could not reach the compile service." };
    }
  }

  const res = await compile({
    code: l.solution,
    context: l.context,
    symbol: l.symbol,
    extraFlags: l.extraFlags,
  });
  if (!res.ok || !res.instructions) {
    return {
      ok: false,
      error:
        `The reference solution for this lesson failed to compile: ` +
        (res.diagnostics || "unknown error"),
    };
  }
  targetCache.set(key, { instructions: res.instructions, objBase64: res.objBase64 });
  return { ok: true, instructions: res.instructions, objBase64: res.objBase64 };
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
  lessonId: string,
  code: string,
): Promise<CheckResult> {
  const lesson = getLesson(lessonId);
  if (!lesson) return { ok: false, error: "Unknown lesson." };
  if (lesson.concept) return { ok: false, error: "This lesson has no exercise." };

  // Proxy mode: the compile service compiles the learner's code and returns the .o.
  const api = compileApiUrl();
  if (api) {
    try {
      const d = await postJson(`${api}/check`, {
        code,
        symbol: lesson.symbol,
        context: lesson.context,
        extraFlags: lesson.extraFlags,
      });
      if (!d?.ok) {
        return d?.compileError
          ? { ok: false, compileError: d.compileError }
          : { ok: false, error: d?.error || "Compile service error." };
      }
      if (!d.objBase64) {
        return { ok: false, error: "Compile service returned no object file." };
      }
      return { ok: true, objBase64: d.objBase64 };
    } catch (e) {
      return { ok: false, error: "Could not reach the compile service." };
    }
  }

  const userRes = await compile({
    code,
    context: lesson.context,
    symbol: lesson.symbol,
    extraFlags: lesson.extraFlags,
  });
  if (!userRes.ok || !userRes.objBase64) {
    return { ok: false, compileError: userRes.diagnostics };
  }
  return { ok: true, objBase64: userRes.objBase64 };
}
