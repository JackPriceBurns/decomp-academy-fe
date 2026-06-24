import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { BASE_FLAGS, MWCC, OBJDUMP, SFA_ROOT, TYPES_PREAMBLE, WIBO } from "./config";
import { Instruction, parseObjdump } from "./asm";

const exec = promisify(execFile);

export interface CompileRequest {
  /** User C source for the target function (and any helpers). */
  code: string;
  /** Preamble inserted before the code: typedefs, struct/extern decls. */
  context?: string;
  /** Symbol whose disassembly we extract. */
  symbol: string;
  /** Extra MWCC flags appended after the base flag set (e.g. opt overrides). */
  extraFlags?: string[];
  /** Whether to inject the shared types preamble (default true). */
  withTypes?: boolean;
}

export interface CompileResult {
  ok: boolean;
  /** Compiler stderr/stdout on failure, or warnings. */
  diagnostics: string;
  /** Disassembled, normalized instructions of `symbol`, if compile succeeded. */
  instructions?: Instruction[];
  /** All symbols found (helps when the expected symbol name is wrong). */
  symbols?: string[];
  /** The raw object file (base64) for browser-side objdiff-wasm diffing. */
  objBase64?: string;
}

const TIMEOUT_MS = 25_000;

/** Compile a single translation unit and return the named function's asm. */
export async function compile(req: CompileRequest): Promise<CompileResult> {
  const id = randomUUID();
  const dir = path.join(os.tmpdir(), "mwcc-lessons", id);
  await fs.mkdir(dir, { recursive: true });
  const cFile = path.join(dir, "u.c");
  const oFile = path.join(dir, "u.o");

  // Refuse `#include`: under wibo the compiler can open host files via relative
  // traversal and echo their contents back in diagnostics. Lessons never need
  // includes (the shared preamble + lesson context cover everything).
  if (/^\s*#\s*include\b/m.test(req.code)) {
    return {
      ok: false,
      diagnostics:
        "#include is not allowed here. Everything you need (u8/s16/f32, " +
        "and any lesson-specific structs) is already in scope — just write the function.",
    };
  }

  const preamble = (req.withTypes === false ? "" : TYPES_PREAMBLE) +
    (req.context ? req.context + "\n" : "");
  const source = preamble + req.code + "\n";
  // How many hidden lines sit above the learner's line 1, so we can remap the
  // compiler's absolute line numbers back onto their editor.
  const lineOffset = preamble.split("\n").length - 1;

  try {
    await fs.writeFile(cFile, source, "utf8");

    const flags = [...BASE_FLAGS, ...(req.extraFlags || [])];
    // wibo <mwcc.exe> <flags> -c u.c -o u.o
    const args = [MWCC, ...flags, "-c", cFile, "-o", oFile];

    try {
      await exec(WIBO, args, {
        cwd: SFA_ROOT,
        timeout: TIMEOUT_MS,
        maxBuffer: 8 * 1024 * 1024,
      });
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string; killed?: boolean; signal?: string };
      if (err.killed || err.signal === "SIGTERM" || err.signal === "SIGKILL") {
        return { ok: false, diagnostics: "Compilation timed out (possible infinite loop in code generation)." };
      }
      const diag = cleanDiagnostics((err.stderr || "") + (err.stdout || ""), lineOffset);
      // mwcc sometimes returns nonzero but still emits an object; only fail if no .o.
      if (!(await fileExists(oFile))) {
        return { ok: false, diagnostics: diag || "Compilation failed." };
      }
    }

    if (!(await fileExists(oFile))) {
      return { ok: false, diagnostics: "Compiler produced no object file." };
    }

    let stdout: string;
    try {
      ({ stdout } = await exec(OBJDUMP, ["-M", "gekko", "-drz", oFile], {
        cwd: SFA_ROOT,
        timeout: TIMEOUT_MS,
        maxBuffer: 64 * 1024 * 1024,
      }));
    } catch {
      return {
        ok: false,
        diagnostics: "Your code compiled but produced too much output to disassemble. Try a smaller function.",
      };
    }

    const map = parseObjdump(stdout);
    const symbols = [...map.keys()];
    const instructions = map.get(req.symbol);
    if (!instructions) {
      return {
        ok: false,
        diagnostics:
          `Function '${req.symbol}' not found in the compiled output. ` +
          `Found: ${symbols.join(", ") || "(none)"}. ` +
          `Make sure your function is named '${req.symbol}'.`,
        symbols,
      };
    }

    // The raw object file (base64) so the browser can diff it with objdiff-wasm —
    // exactly the artifact a real decomp workflow compares against.
    const objBase64 = (await fs.readFile(oFile)).toString("base64");
    return { ok: true, diagnostics: "", instructions, symbols, objBase64 };
  } finally {
    fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// Patterns of pure decoration / runner noise we drop from compiler output.
const NOISE = [
  /^wibo/i,
  /User break, cancelled/i,
  /Too many errors printed/i,
  /^#{2,}\s*mwcceppc/i,
  /^#\s*-{5,}/,
  /^#\s*File:/i,
  /^\s*$/,
];

/**
 * Turn raw MWCC/wibo output into a tidy, learner-facing message: strip runner
 * noise, rename the temp file to "your code", and remap absolute line numbers
 * back onto the editor by subtracting the hidden preamble offset.
 */
function cleanDiagnostics(text: string, lineOffset: number): string {
  const lines = text
    .replace(/[^\s]*mwcc-lessons[^\s]*u\.c/g, "your code")
    .replace(/\r/g, "")
    .split("\n");

  const out: string[] = [];
  for (const raw of lines) {
    if (NOISE.some((re) => re.test(raw))) continue;
    // Remap "#     28: ..." or "Error: line 28" style line references.
    const remapped = raw.replace(/(\b)(\d+)(\s*:)/, (m, pre, num, post) => {
      const n = parseInt(num, 10);
      if (n > lineOffset) return `${pre}${n - lineOffset}${post}`;
      return m;
    });
    out.push(remapped.replace(/^#\s?/, ""));
  }
  return out.join("\n").trim().slice(0, 4000);
}
