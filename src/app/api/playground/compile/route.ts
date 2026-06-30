import { NextRequest, NextResponse } from "next/server";
import { COMPILER_URL } from "@/lib/api-url";
import { postJson } from "@/lib/lessons/remote";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Free-form compile for the playground: forwards arbitrary C to the compile
// service's /compile endpoint (no lesson, no fixed symbol) and passes the result
// straight back. The browser disassembles the returned object with objdiff. We
// proxy server-side (rather than calling the API directly) to mirror /api/check
// and to keep the limit enforcement in one place.
export async function POST(req: NextRequest) {
  let body: { code?: string; context?: string; extraFlags?: string[]; withTypes?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }
  if (typeof body.code !== "string" || !body.code.trim()) {
    return NextResponse.json({ ok: false, error: "Missing code." }, { status: 400 });
  }
  if (body.code.length > 20000) {
    return NextResponse.json({ ok: false, error: "Code too long." }, { status: 413 });
  }
  try {
    const result = await postJson(`${COMPILER_URL}/compile`, {
      code: body.code,
      context: body.context,
      extraFlags: body.extraFlags,
      withTypes: body.withTypes ?? true,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Couldn't reach the compiler. Try again." },
      { status: 502 },
    );
  }
}
