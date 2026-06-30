import { NextResponse } from "next/server";
import { LESSONS } from "@/lib/lessons/registry";
import { COURSE_BY_ID } from "@/curriculum/courses";
import { getTarget } from "@/lib/lessons/service";
import type { GraderKind } from "@/lib/lessons/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 600;

// Grader kinds whose target is compiled on the server (the MWCC "remote"
// service). Browser-only graders — e.g. "wasm-agbcc", which runs agbcc as a WASM
// module inside the lesson workspace — have no server-side compiler, so this
// endpoint can't verify them and must not feed them to the wrong compiler.
const SERVER_VERIFIABLE = new Set<GraderKind>(["remote"]);

type Result = {
  id: string;
  status: "passed" | "failed" | "skipped";
  grader?: GraderKind;
  count?: number;
  error?: string;
  reason?: string;
};

// Dev/QA endpoint: compile every lesson's authoritative reference solution and
// report which ones fail (broken solution, wrong symbol name, etc.). Lessons
// graded in the browser are reported as "skipped" rather than compiled here —
// the server has no compiler for them — so they never show up as false failures.
export async function GET() {
  const results: Result[] = new Array(LESSONS.length);
  // Bounded concurrency so we don't spawn hundreds of compilers at once.
  const CONCURRENCY = 6;
  let next = 0;
  async function worker() {
    while (true) {
      const idx = next++;
      if (idx >= LESSONS.length) return;
      const lesson = LESSONS[idx];
      const grader = COURSE_BY_ID.get(lesson.course)?.grader;
      // A lesson with an exercise graded in the browser can't be compiled here.
      // (Reading-only "concept" lessons have nothing to compile, so let them
      // fall through — getTarget resolves them trivially without a compile.)
      if (grader && !SERVER_VERIFIABLE.has(grader) && !lesson.concept) {
        results[idx] = {
          id: lesson.id,
          status: "skipped",
          grader,
          reason: "graded in-browser; verify it in the lesson workspace",
        };
        continue;
      }
      try {
        const t = await getTarget(lesson);
        results[idx] = {
          id: lesson.id,
          status: t.ok ? "passed" : "failed",
          grader,
          count: t.instructions?.length,
          error: t.ok ? undefined : t.error,
        };
      } catch (e) {
        results[idx] = { id: lesson.id, status: "failed", grader, error: String(e) };
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const failures = results.filter((r) => r.status === "failed");
  const skipped = results.filter((r) => r.status === "skipped");
  return NextResponse.json({
    total: results.length,
    passed: results.filter((r) => r.status === "passed").length,
    failed: failures.length,
    skipped: skipped.length,
    failures,
    skippedLessons: skipped,
  });
}
