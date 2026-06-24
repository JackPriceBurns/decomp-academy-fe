import { NextRequest, NextResponse } from "next/server";
import { getLesson } from "@/lib/lessons/registry";
import { getTarget } from "@/lib/lessons/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("lesson");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing lesson id." }, { status: 400 });
  }
  const lesson = getLesson(id);
  if (!lesson) {
    return NextResponse.json({ ok: false, error: "Unknown lesson." }, { status: 404 });
  }
  const target = await getTarget(lesson);
  if (!target.ok) {
    return NextResponse.json({ ok: false, error: target.error }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    instructions: target.instructions,
    objBase64: target.objBase64,
  });
}
