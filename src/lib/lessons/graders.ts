import { compileToObject, preloadAgbcc } from "agbcc";
import type { AsmDialect } from "@/lib/asm";
import type { GraderKind } from "./types";

/** The normalized result of compiling a learner's (or reference) C source. Both
 *  graders return this shape so the workspace stays grader-agnostic. */
export interface CompileResult {
  ok: boolean;
  /** base64 of the produced object file, present when `ok`. */
  objBase64?: string;
  /** Compiler diagnostics (the source didn't compile). */
  compileError?: string;
  /** Infrastructure failure (couldn't reach/load the compiler). */
  error?: string;
}

export interface CompileArgs {
  course: string;
  lesson: string;
  code: string;
  /** Compile preamble injected before the learner's code (no #include). */
  context?: string;
}

export interface TargetArgs {
  course: string;
  lesson: string;
  /** Reference C the target object is built from (in-browser graders). */
  solution: string;
  context?: string;
}

/** Everything that differs between platforms, gathered in one place so the React
 *  workspace never branches on the grader kind itself. */
export interface GraderProfile {
  /** Instruction set the diff/glossary should render. */
  dialect: AsmDialect;
  /** Compiler + flags shown in the workspace header, for the lesson's opt preset
   *  (undefined = the default). */
  compilerLabel: (opt?: string) => string;
  /** Warm up heavy assets (the WASM compiler) ahead of the first compile. */
  preload(): void;
  /** Compile the learner's code. */
  compile(args: CompileArgs): Promise<CompileResult>;
  /** Load the target object (base64) the learner must match, or null on failure. */
  loadTarget(args: TargetArgs): Promise<string | null>;
}

/** base64-encode raw object bytes for objdiff (which takes base64 strings). */
function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

const remote: GraderProfile = {
  dialect: "ppc",
  compilerLabel: (opt) => `mwcceppc.exe -${opt ?? "O4,p"}`,
  preload() {},
  async compile({ course, lesson, code }) {
    try {
      const r = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, lesson, code }),
      });
      return await r.json();
    } catch {
      // Network failure or a non-JSON response — resolve a normal CompileResult
      // (like loadTarget/wasmAgbcc.compile) instead of rejecting the promise.
      return { ok: false, error: "Couldn't reach the compile service." };
    }
  },
  async loadTarget({ course, lesson }) {
    try {
      const response = await fetch(`/api/target?course=${course}&lesson=${lesson}`);
      const data = await response.json();
      return data?.ok && data.objBase64 ? (data.objBase64 as string) : null;
    } catch {
      return null;
    }
  },
};

const remoteIdo53: GraderProfile = {
  ...remote,
  dialect: "mips",
  compilerLabel: (opt) => {
    const flags = (opt ?? "O2,g3")
      .split(",")
      .map((flag) => `-${flag}`)
      .join(" ");
    return `IDO 5.3 cc ${flags} -mips2`;
  },
};

// Types every GBA lesson can use without declaring them, matching the fixed-width
// names real Game Boy Advance decomp projects use throughout. The server-side
// graders get an equivalent preamble from the compile service; agbcc runs in the
// browser with no service in front of it, so the course's preamble lives here.
// It is prepended ahead of a lesson's own `context`, which must therefore never
// redeclare these names — agbcc (C89) rejects a duplicate typedef outright.
const GBA_PREAMBLE = `typedef signed char s8;
typedef unsigned char u8;
typedef signed short s16;
typedef unsigned short u16;
typedef signed int s32;
typedef unsigned int u32;
typedef signed long long s64;
typedef unsigned long long u64;
typedef float f32;
typedef double f64;
typedef unsigned char bool8;
typedef volatile signed char vs8;
typedef volatile unsigned char vu8;
typedef volatile signed short vs16;
typedef volatile unsigned short vu16;
typedef volatile signed int vs32;
typedef volatile unsigned int vu32;
#define NULL ((void *)0)
#define TRUE 1
#define FALSE 0
`;

/**
 * Remove C comments before agbcc sees the source.
 *
 * agbcc is `cc1` — the compiler proper, which normally receives input that `cpp`
 * has already preprocessed. Stripping comments is part of that job, and the
 * agbcc package's minimal in-browser shim only expands `#define`s, so a comment
 * reaches the lexer as a raw `/` and every form of one — line, block, trailing,
 * multi-line — dies with "syntax error before `/`". Learners comment their
 * decompiled C constantly, and the editor's own placeholder starter is itself a
 * comment, so this has to happen before the source is handed over.
 *
 * A comment collapses to a single space, so a block comment wedged between two
 * tokens still separates them, and newlines inside one are preserved so
 * diagnostic line numbers keep lining up with what the learner is looking at.
 * String and character literals are copied through untouched, escapes included,
 * so comment-like text inside a literal survives.
 */
function stripComments(src: string): string {
  let out = "";
  for (let i = 0; i < src.length;) {
    const c = src[i];
    if (c === '"' || c === "'") {
      out += c;
      for (i++; i < src.length;) {
        if (src[i] === "\\") {
          out += src.slice(i, i + 2);
          i += 2;
          continue;
        }
        out += src[i];
        if (src[i] === c) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const body = src.slice(i + 2, end < 0 ? src.length : end);
      out += ` ${body.replace(/[^\n]/g, "")}`;
      i = end < 0 ? src.length : end + 2;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      const end = src.indexOf("\n", i);
      out += " ";
      i = end < 0 ? src.length : end;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/** A lesson's compile preamble: the shared GBA types, then the lesson's own. */
function agbccContext(context?: string): string {
  return context ? `${GBA_PREAMBLE}${stripComments(context)}` : GBA_PREAMBLE;
}

const wasmAgbcc: GraderProfile = {
  dialect: "arm:thumb",
  compilerLabel: () => "agbcc -O2",
  preload() {
    preloadAgbcc();
  },
  async compile({ code, context }) {
    try {
      const r = await compileToObject(stripComments(code), { context: agbccContext(context) });
      if (!r.ok) return { ok: false, compileError: r.stderr };
      return { ok: true, objBase64: bytesToBase64(r.obj) };
    } catch (e) {
      console.error("in-browser agbcc failed", e);
      return { ok: false, error: "Couldn't load the in-browser compiler." };
    }
  },
  async loadTarget({ solution, context }) {
    // The target is the reference solution compiled with the same in-browser
    // compiler, so target and learner objects are consistent by construction.
    try {
      const data = await compileToObject(stripComments(solution), {
        context: agbccContext(context),
      });
      return data.ok ? bytesToBase64(data.obj) : null;
    } catch {
      return null;
    }
  },
};

export const GRADERS: Record<GraderKind, GraderProfile> = {
  remote,
  "remote-ido53": remoteIdo53,
  "wasm-agbcc": wasmAgbcc,
};
