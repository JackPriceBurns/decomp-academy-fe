// Browser-side diffing with objdiff-wasm — the same engine (objdiff-core, compiled
// to a WebAssembly Component) that powers the objdiff app and VS Code extension.
// We hand it two relocatable object files (the cached target + the learner's fresh
// compile) and it produces a relocation-aware, instruction-level diff: exactly how
// a real decomp workflow compares against the original.
//
// This module must only run in the browser (the wasm fetches itself via
// `import.meta.url` and the package does a top-level await on init). Import it
// lazily from client components.

type ObjdiffModule = typeof import("objdiff-wasm");
type ObjDiffH = NonNullable<ReturnType<ObjdiffModule["diff"]["runDiff"]>["left"]>;
type DisplayApi = ObjdiffModule["display"];
type DiffConfigH = InstanceType<ObjdiffModule["diff"]["DiffConfig"]>;

let modPromise: Promise<ObjdiffModule> | null = null;

/** Lazy-load and init the wasm component exactly once per page. */
function load(): Promise<ObjdiffModule> {
  if (!modPromise) {
    modPromise = import("objdiff-wasm").then((m) => {
      try {
        m.init("error");
      } catch {
        // init() is idempotent-ish; ignore double-init / logging setup errors.
      }
      return m;
    });
  }
  return modPromise;
}

/** Warm the wasm module ahead of the first diff (e.g. on lesson open). */
export function preloadObjdiff(): void {
  void load();
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// ---- View model the renderer consumes (plain data; no live wasm handles) ----

export type SegColor =
  "normal" | "dim" | "bright" | "replace" | "data-flow" | "delete" | "insert" | "rotating";

/** One rendered token of an instruction line. */
export interface Seg {
  text: string;
  /** Syntax class: mnemonic | num | symbol | addr | branch | plain. */
  tok: string;
  /** Diff color from objdiff (drives mismatch highlighting). */
  color: SegColor;
  /** Palette index when color === "rotating" (data-flow groups). */
  rot?: number;
}

export type RowKind = "none" | "op-mismatch" | "arg-mismatch" | "replace" | "insert" | "delete";

export interface DiffRowVM {
  kind: RowKind;
  /** Target (reference) side; null on an "insert" row. */
  target: Seg[] | null;
  /** Learner side; null on a "delete" row. */
  user: Seg[] | null;
}

export interface ObjDiffVM {
  /** 0–100, one decimal. */
  matchPercent: number;
  exact: boolean;
  /** Whether the learner's object actually contained the target symbol. */
  symbolFound: boolean;
  /** Aligned, side-by-side rows. */
  rows: DiffRowVM[];
  /** Target instructions on their own (for the "Target asm" tab). */
  targetRows: Seg[][];
  /** Learner instructions on their own (for the "Your asm" tab). */
  userRows: Seg[][];
}

// objdiff's DiffText is a tagged union; pull a flat string + syntax class out of it.
type DiffText = { tag: string; val?: unknown };

function segText(t: DiffText): string {
  switch (t.tag) {
    case "basic":
    case "opaque":
      return String(t.val);
    case "opcode":
      return (t.val as { mnemonic: string }).mnemonic;
    case "symbol":
      return (t.val as { name: string }).name;
    case "signed":
    case "unsigned":
    case "address":
    case "branch-dest":
    case "addend":
      return String(t.val);
    case "line":
      return `${t.val}:`;
    case "spacing":
      return " ".repeat(Number(t.val) || 0);
    case "branch-arrow":
      return " ~>";
    case "eol":
      return "";
    default:
      return "";
  }
}

function segTok(t: DiffText): string {
  switch (t.tag) {
    case "opcode":
      return "mnemonic";
    case "signed":
    case "unsigned":
    case "addend":
      return "num";
    case "symbol":
      return "symbol";
    case "address":
    case "line":
      return "addr";
    case "branch-dest":
    case "branch-arrow":
      return "branch";
    default:
      return "plain";
  }
}

type DiffTextColor = { tag: SegColor; val?: number };
type DiffTextSegment = { text: DiffText; color: DiffTextColor; padTo: number };
type InstructionDiffRow = { segments: DiffTextSegment[]; diffKind: RowKind };

// objdiff indents instructions by a gutter (the leading `spacing` segment — width
// 4 for PowerPC). On a branch-target line that gutter is replaced by a leading
// branch-arrow, so we render the arrow into the same width to keep mnemonics
// aligned. The width is derived per symbol (see symbolIndent); this is the fallback.
const DEFAULT_INDENT = 4;

/** Flatten an objdiff instruction row into renderable, column-padded segments. */
function toSegs(row: InstructionDiffRow, indent: number): Seg[] {
  const out: Seg[] = [];
  let seenOpcode = false;
  for (const s of row.segments) {
    const tag = s.text.tag;
    if (tag === "opcode") seenOpcode = true;
    let text: string;
    if (tag === "branch-arrow" && !seenOpcode) {
      // Leading arrow stands in for the instruction indent: right-align the "~>"
      // in the gutter so the mnemonic lands in the same column as every other row.
      text = "~>".padStart(indent);
    } else {
      text = segText(s.text);
      // padTo is this segment's own minimum field width (right-padded with spaces),
      // which is how objdiff aligns the address / mnemonic / operand columns.
      if (s.padTo && text.length < s.padTo) {
        text += " ".repeat(s.padTo - text.length);
      }
    }
    if (text === "") continue;
    out.push({ text, tok: segTok(s.text), color: s.color.tag, rot: s.color.val });
  }
  return out;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Best-effort release of objdiff wasm resource handles. */
function disposeAll(...handles: unknown[]): void {
  for (const h of handles) {
    try {
      (h as { [Symbol.dispose]?: () => void } | undefined)?.[Symbol.dispose]?.();
    } catch {
      /* best-effort */
    }
  }
}

// The instruction indent (gutter) width objdiff uses for this symbol, read from
// the first `spacing` segment so a leading branch-arrow can occupy the same width.
function symbolIndent(rows: Array<InstructionDiffRow | null>): number {
  for (const row of rows) {
    if (!row) continue;
    for (const s of row.segments) {
      if (s.text.tag === "spacing")
        return Number((s.text as { val?: number }).val) || DEFAULT_INDENT;
    }
  }
  return DEFAULT_INDENT;
}

/**
 * Build one symbol's side-by-side instruction diff from an already-computed
 * runDiff result (no parsing here — the caller owns the wasm handles).
 */
function buildSymbolDiff(
  left: ObjDiffH | undefined,
  right: ObjDiffH | undefined,
  symbol: string,
  display: DisplayApi,
  cfg: DiffConfigH,
): ObjDiffVM {
  const lSym = left?.findSymbol(symbol, undefined);
  const rSym = right?.findSymbol(symbol, undefined);
  const lDisp = left && lSym ? display.displaySymbol(left, lSym.id) : null;
  const rDisp = right && rSym ? display.displaySymbol(right, rSym.id) : null;
  const ln = lDisp?.rowCount ?? 0;
  const rn = rDisp?.rowCount ?? 0;
  // objdiff reports the same match% on both sides; prefer the learner side.
  const rawMatch = rDisp?.matchPercent ?? lDisp?.matchPercent ?? 0;

  // Materialize each row exactly once (used for both the aligned diff and the
  // per-side listings).
  const lRows: Array<InstructionDiffRow | null> = [];
  for (let i = 0; i < ln; i++) {
    lRows.push(
      left && lSym
        ? (display.displayInstructionRow(left, lSym.id, i, cfg) as InstructionDiffRow)
        : null,
    );
  }
  const rRows: Array<InstructionDiffRow | null> = [];
  for (let i = 0; i < rn; i++) {
    rRows.push(
      right && rSym
        ? (display.displayInstructionRow(right, rSym.id, i, cfg) as InstructionDiffRow)
        : null,
    );
  }

  const indent = symbolIndent([...lRows, ...rRows]);

  const n = Math.max(ln, rn);
  const rows: DiffRowVM[] = [];
  for (let i = 0; i < n; i++) {
    const lr = lRows[i] ?? null;
    const rr = rRows[i] ?? null;
    rows.push({
      kind: rr?.diffKind ?? lr?.diffKind ?? "none",
      target: lr ? toSegs(lr, indent) : null,
      user: rr ? toSegs(rr, indent) : null,
    });
  }
  const targetRows = lRows.flatMap((r) => (r ? [toSegs(r, indent)] : []));
  const userRows = rRows.flatMap((r) => (r ? [toSegs(r, indent)] : []));

  // Structural exactness: the symbol exists on the learner side and every aligned
  // row matches (no diff/insert/delete). Avoids a rounded 99.96% reading as solved.
  const exact = !!rSym && rows.length > 0 && rows.every((r) => r.kind === "none");

  return { matchPercent: round1(rawMatch), exact, symbolFound: !!rSym, rows, targetRows, userRows };
}

// ---- Object overview (the section / symbol navigator, objdiff-web style) ----

export interface HoverLine {
  label: string;
  value: string;
}

export interface OverviewSymbol {
  name: string;
  demangled?: string;
  /** Flag glyphs: g(lobal) l(ocal) w(eak) c(ommon). */
  flags: string;
  matchPercent?: number;
  /** Data/bss symbols aren't drillable into an instruction diff. */
  isData: boolean;
  /** Lines for the hover tooltip (name, section, address, size, …). */
  hover: HoverLine[];
}

export interface OverviewSection {
  name: string;
  /** Section size in hex (objdiff convention). */
  sizeHex: string;
  matchPercent?: number;
  kind: string;
  symbols: OverviewSymbol[];
}

/** Both objects' section/symbol trees, side by side. */
export interface Overview {
  target: OverviewSection[];
  base: OverviewSection[];
}

function flagStr(f: {
  global?: boolean;
  local?: boolean;
  weak?: boolean;
  common?: boolean;
}): string {
  let s = "";
  if (f.global) s += "g";
  if (f.local) s += "l";
  if (f.weak) s += "w";
  if (f.common) s += "c";
  return s;
}

export interface Analysis {
  overview: Overview;
  /** Diff view-model per code symbol name (the lesson symbol + overview drill-in). */
  diffs: Record<string, ObjDiffVM>;
}

const DISPLAY_CONFIG = { showHiddenSymbols: false, showMappedSymbols: true, reverseFnOrder: false };

/**
 * One objdiff pass over a (target, user) object pair: parse once, runDiff once,
 * then derive BOTH the section/symbol overview and a per-code-symbol instruction
 * diff. The learner's compile and every overview drill-in read from this single
 * result instead of re-parsing. Pass `userB64 = null` for the target alone.
 */
export async function analyze(
  targetB64: string | null,
  userB64: string | null,
  ensureSymbol?: string,
): Promise<Analysis> {
  const { diff, display } = await load();

  const cfg = new diff.DiffConfig();
  const targetObj = targetB64 ? diff.Object.parse(b64ToBytes(targetB64), cfg, "target") : undefined;
  const userObj = userB64 ? diff.Object.parse(b64ToBytes(userB64), cfg, "base") : undefined;
  const result = diff.runDiff(targetObj, userObj, cfg, { mappings: [] });
  const left = result.left;
  const right = result.right;

  const codeNames = new Set<string>();
  const buildSide = (objDiff: ObjDiffH | undefined): OverviewSection[] => {
    if (!objDiff) return [];
    return display.displaySections(objDiff, {}, DISPLAY_CONFIG).map((s) => ({
      name: s.name,
      sizeHex: s.size.toString(16),
      matchPercent: s.matchPercent != null ? round1(s.matchPercent) : undefined,
      kind: s.kind,
      symbols: Array.from(s.symbols).map((id) => {
        const sd = display.displaySymbol(objDiff, id);
        const isData = s.kind === "data" || s.kind === "bss" || s.kind === "common";
        if (!isData) codeNames.add(sd.info.name);
        const hover = (
          display.symbolHover(objDiff, id) as Array<{
            tag: string;
            val?: { label: string; value: string };
          }>
        )
          .filter(
            (h): h is { tag: string; val: { label: string; value: string } } =>
              h.tag === "text" && !!h.val,
          )
          .map((h) => ({ label: h.val.label, value: h.val.value }));
        return {
          name: sd.info.name,
          demangled: sd.info.demangledName || undefined,
          flags: flagStr(sd.info.flags),
          matchPercent: sd.matchPercent != null ? round1(sd.matchPercent) : undefined,
          isData,
          hover,
        };
      }),
    }));
  };

  const overview: Overview = { target: buildSide(left), base: buildSide(right) };
  if (ensureSymbol) codeNames.add(ensureSymbol);

  const diffs: Record<string, ObjDiffVM> = {};
  for (const name of codeNames) {
    diffs[name] = buildSymbolDiff(left, right, name, display, cfg);
  }

  disposeAll(targetObj, userObj, left, right, cfg);
  return { overview, diffs };
}
