import { NextRequest, NextResponse } from "next/server";
import { checkLesson } from "@/lib/lessons/service";
import { DEFAULT_COURSE } from "@/lib/lessons/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { course?: string; lesson?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  if (!body.lesson || typeof body.code !== "string") {
    return NextResponse.json({ ok: false, error: "Missing lesson id or code." }, { status: 400 });
  }
  if (body.code.length > 20000) {
    return NextResponse.json({ ok: false, error: "Code too long." }, { status: 413 });
  }
  // `course` is optional for backwards compatibility: a client bundle from before
  // the multi-course migration posts without it. Fall back to the default course
  // so an in-flight old client isn't broken across a deploy.
  const course = body.course ?? DEFAULT_COURSE.id;
  const result = await checkLesson(course, body.lesson, body.code);
  return NextResponse.json(result);
}
