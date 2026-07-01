"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type {
  DiffRowVM,
  Overview,
  OverviewSection,
  OverviewSymbol,
  RowKind,
  Seg,
} from "@/lib/objdiff/client";
import type { AsmDialect } from "@/lib/asm";

export type { AsmDialect };

// Renders objdiff-wasm's instruction-level diff. objdiff colors each changed
// segment itself (replace / delete / insert), so unlike the old token-LCS differ
// we just paint what the engine tells us — relocations, branch targets and all.

// Distinct hues for objdiff's "rotating" color — used so each branch's pair of
// arrows (source + target) shares a colour you can trace, and adjacent branches
// stay easy to tell apart. The hues themselves (per-theme) live in the palette.
const ROT = [
  "text-rot-0", // yellow / amber
  "text-rot-1", // cyan / teal
  "text-rot-2", // pink
  "text-rot-3", // purple
  "text-rot-4", // green
  "text-rot-5", // orange
  "text-rot-6", // blue
  "text-rot-7", // red
];

function tokClass(tok: string): string {
  switch (tok) {
    case "mnemonic":
      return "text-syntax-mnemonic";
    case "num":
      return "text-syntax-num";
    case "symbol":
      return "text-syntax-str";
    case "branch":
      return "text-syntax-reg";
    case "addr":
      return "text-content-ghost";
    default:
      return "text-content";
  }
}

function segClass(s: Seg): string {
  switch (s.color) {
    // "replace" highlights the specific token that differs within an otherwise
    // matching line — box it so the eye lands on it. In light, gold-on-gold goes
    // muddy, so the token text flips to near-black on a clearer amber box.
    case "replace":
      return "rounded-[3px] bg-warn/20 text-warn ring-1 ring-warn/30 theme-light:bg-warn/[0.15] theme-light:text-content-bright theme-light:ring-warn/50";
    // Whole-line add/remove: solid colour, no box (the row tint + −/+ mark carry it).
    case "delete":
      return "text-bad";
    case "insert":
      return "text-accent";
    case "dim":
      return "text-content-faint";
    case "data-flow":
      return "text-syntax-num/80";
    case "rotating":
      return ROT[(s.rot ?? 0) % ROT.length];
    default:
      return tokClass(s.tok); // normal / bright
  }
}

// ---- Instruction glossary: hover an instruction to see what it does, with the
// {rA}/{rD}/{simm} placeholders filled in from the hovered line's own operands ----

interface InsnDoc {
  name: string;
  descriptiveName: string;
  usage: string;
  description: string;
}
type RawEntry = { Name: string; DescriptiveName: string; Usage: string; Description: string };

const glossaryMaps: Record<AsmDialect, Map<string, InsnDoc> | null> = {
  ppc: null,
  "arm:thumb": null,
};
const glossaryPromises: Record<AsmDialect, Promise<Map<string, InsnDoc>> | null> = {
  ppc: null,
  "arm:thumb": null,
};

function loadGlossary(dialect: AsmDialect): Promise<Map<string, InsnDoc>> {
  let promise = glossaryPromises[dialect];
  if (!promise) {
    const data =
      dialect === "arm:thumb"
        ? import("@/lib/asm/thumb-instructions.json")
        : import("@/lib/asm/ppc-instructions.json");
    promise = data.then((m) => {
      const map = new Map<string, InsnDoc>();
      for (const e of m.default as RawEntry[]) {
        map.set(e.Name, {
          name: e.Name,
          descriptiveName: e.DescriptiveName,
          usage: e.Usage,
          description: e.Description,
        });
      }
      glossaryMaps[dialect] = map;
      return map;
    });
    glossaryPromises[dialect] = promise;
  }
  return promise;
}

/** Warm the instruction glossary ahead of the first hover. */
export function preloadGlossary(dialect: AsmDialect): void {
  void loadGlossary(dialect);
}

// Resolve a printed mnemonic to a glossary entry, tolerating the suffixes objdiff
// prints: branch-prediction (+/-), record (.), overflow (o), and simplified branch
// forms (bl/bla/ba -> b).
function lookupInsn(
  map: Map<string, InsnDoc>,
  mnemonic: string,
  dialect: AsmDialect,
): InsnDoc | null {
  const direct = map.get(mnemonic);
  if (direct) return direct;
  if (dialect === "arm:thumb") {
    // objdiff prints Thumb mnemonics verbatim — condition branches and the .word/
    // .hword data tokens are their own entries — so only tolerate a flag-setting
    // "s" suffix that some disassemblers add (e.g. adds -> add, lsls -> lsl).
    return mnemonic.endsWith("s") ? map.get(mnemonic.slice(0, -1)) ?? null : null;
  }
  let s = mnemonic.replace(/[+-]$/, "");
  if (s.endsWith(".")) s = s.slice(0, -1);
  if (s.endsWith("o")) s = s.slice(0, -1);
  const stripped = map.get(s);
  if (stripped) return stripped;
  if (mnemonic.startsWith("b")) {
    const b = mnemonic.replace(/(la|l|a)$/, "");
    const branch = map.get(b);
    if (branch) return branch;
  }
  return null;
}

// Operand names from the Usage template, e.g. "add rD, rA, rB" -> ["rD","rA","rB"].
function usagePlaceholders(usage: string): string[] {
  const sp = usage.indexOf(" ");
  if (sp < 0) return [];
  return usage.slice(sp + 1).split(",").map((p) => p.trim()).filter(Boolean);
}

// The hovered instruction's actual operands, e.g. segs for "add r3, r3, r4" -> ["r3","r3","r4"].
function instructionOperands(segs: Seg[]): string[] {
  const mi = segs.findIndex((s) => s.tok === "mnemonic");
  if (mi < 0) return [];
  const after = segs
    .slice(mi + 1)
    .map((s) => s.text)
    .join("")
    .replace(/~>/g, "")
    .trim();
  return after ? after.split(",").map((p) => p.trim()).filter(Boolean) : [];
}

// Substitute {placeholder} tokens in the description with this instruction's
// operands (positionally, per the Usage template). Also splits displacement forms
// like "d(rA)" <-> "8(r4)". Unmatched placeholders fall back to their bare name.
function fillDescription(doc: InsnDoc, operands: string[]): string {
  const ph = usagePlaceholders(doc.usage);
  const subs: Record<string, string> = {};
  // Compares (and similar) print a simplified form that omits the leading CR-field
  // operand, which then defaults to cr0 — so shift the mapping by one.
  let offset = 0;
  if (ph.length === operands.length + 1 && /^crf?[DS]/.test(ph[0])) {
    subs[ph[0]] = "cr0";
    offset = 1;
  }
  for (let i = 0; i < operands.length && i + offset < ph.length; i++) {
    const p = ph[i + offset];
    const o = operands[i];
    const pm = p.match(/^(\w+)\((\w+)\)$/);
    const om = o.match(/^(-?[\w@.+-]+)\((\w+)\)$/);
    if (pm && om) {
      subs[pm[1]] = om[1];
      subs[pm[2]] = om[2];
    } else {
      subs[p] = o;
    }
  }
  // Placeholders may carry a subfield, e.g. {crfS[LT]}: substitute the base name
  // and keep the suffix ("crfS" -> "cr0" gives "cr0[LT]").
  return doc.description.replace(/\{([^}]+)\}/g, (_, name) => {
    const br = name.indexOf("[");
    if (br >= 0) return (subs[name.slice(0, br)] ?? name.slice(0, br)) + name.slice(br);
    return subs[name] ?? name;
  });
}

interface InsnTipState {
  x: number;
  y: number;
  doc: InsnDoc;
  description: string;
}
const InsnTipContext = createContext<{
  show: (mnemonic: string, operands: string[], x: number, y: number) => void;
  hide: () => void;
} | null>(null);

/** Wraps instruction lines so hovering one shows its meaning. */
function InsnTipLayer({ dialect = "ppc", children }: { dialect?: AsmDialect; children: ReactNode }) {
  const [map, setMap] = useState<Map<string, InsnDoc> | null>(glossaryMaps[dialect]);
  useEffect(() => {
    let alive = true;
    loadGlossary(dialect).then((m) => alive && setMap(m)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [dialect]);
  const [tip, setTip] = useState<InsnTipState | null>(null);
  const show = useCallback(
    (mnemonic: string, operands: string[], x: number, y: number) => {
      const doc = map ? lookupInsn(map, mnemonic, dialect) : null;
      setTip(doc ? { x, y, doc, description: fillDescription(doc, operands) } : null);
    },
    [map, dialect],
  );
  const hide = useCallback(() => setTip(null), []);
  const ctx = useMemo(() => ({ show, hide }), [show, hide]);
  return (
    <InsnTipContext.Provider value={ctx}>
      {children}
      {tip && <InsnDocTooltip tip={tip} />}
    </InsnTipContext.Provider>
  );
}

function InsnDocTooltip({ tip }: { tip: InsnTipState }) {
  return (
    <div
      className="pointer-events-none fixed z-50 max-w-sm rounded-md border border-line bg-bg-inset/95 px-3 py-2 shadow-lg backdrop-blur-sm"
      style={{ left: tip.x + 14, top: tip.y + 16 }}
    >
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm font-semibold text-syntax-mnemonic">{tip.doc.name}</span>
        <span className="text-xs text-content-secondary">{tip.doc.descriptiveName}</span>
      </div>
      {tip.doc.usage && (
        <div className="mt-0.5 font-mono text-2xs text-content-faint">{tip.doc.usage}</div>
      )}
      <div className="mt-1 text-xs leading-relaxed text-content-muted">{tip.description}</div>
    </div>
  );
}

function Line({ segs }: { segs: Seg[] | null }) {
  const tip = useContext(InsnTipContext);
  if (!segs) return <span className="select-none text-line-strong">·</span>;
  const mnemonic = segs.find((s) => s.tok === "mnemonic")?.text.trim();
  const hover =
    mnemonic && tip
      ? {
          onMouseEnter: (e: { clientX: number; clientY: number }) =>
            tip.show(mnemonic, instructionOperands(segs), e.clientX, e.clientY),
          onMouseMove: (e: { clientX: number; clientY: number }) =>
            tip.show(mnemonic, instructionOperands(segs), e.clientX, e.clientY),
          onMouseLeave: tip.hide,
        }
      : undefined;

  return (
    <span className={mnemonic ? "cursor-help whitespace-pre" : "whitespace-pre"} {...hover}>
      {segs.map((s, i) => (
        <span key={i} className={segClass(s)}>
          {s.text}
        </span>
      ))}
    </span>
  );
}

// The faint row tints need a touch more alpha in light to read on white.
const ROW_META: Record<RowKind, { bg: string; mark: string; markColor: string; label: string }> = {
  none: { bg: "", mark: "", markColor: "", label: "matches" },
  replace: { bg: "bg-warn/[0.07] theme-light:bg-amber-50", mark: "≠", markColor: "text-warn", label: "differs" },
  "op-mismatch": { bg: "bg-warn/[0.07] theme-light:bg-amber-50", mark: "≠", markColor: "text-warn", label: "opcode differs" },
  "arg-mismatch": { bg: "bg-warn/[0.07] theme-light:bg-amber-50", mark: "≠", markColor: "text-warn", label: "operand differs" },
  delete: { bg: "bg-bad/[0.07] theme-light:bg-red-50", mark: "−", markColor: "text-bad", label: "missing from your code" },
  insert: { bg: "bg-accent/[0.07] theme-light:bg-emerald-50", mark: "+", markColor: "text-accent", label: "extra in your code" },
};

export function ObjDiff({ rows, dialect = "ppc" }: { rows: DiffRowVM[]; dialect?: AsmDialect }) {
  return (
    <InsnTipLayer dialect={dialect}>
      {/* Side-by-side once there's room; stacked Target/Current panes on phones. */}
      <div className="hidden sm:block">
        <SideBySideDiff rows={rows} />
      </div>
      <div className="sm:hidden">
        <StackedDiff rows={rows} />
      </div>
    </InsnTipLayer>
  );
}

function SideBySideDiff({ rows }: { rows: DiffRowVM[] }) {
  return (
    <div className="overflow-auto font-mono text-asm">
      <div className="grid min-w-[620px] grid-cols-[2.6rem_1fr_1fr]">
        <div className="sticky top-0 z-10 border-b border-line bg-bg-soft px-2 py-1.5 text-2xs font-semibold uppercase tracking-wider text-content-faint">
          #
        </div>
        <div className="sticky top-0 z-10 border-b border-r border-line bg-bg-soft px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-content-muted">
          Target
        </div>
        <div className="sticky top-0 z-10 border-b border-line bg-bg-soft px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-content-muted">
          Your output
        </div>
        {rows.map((r, i) => {
          const meta = ROW_META[r.kind];
          const stagger = i < 16 ? { animationDelay: `${i * 16}ms` } : undefined;
          return (
            <div
              key={i}
              className="contents motion-safe:animate-row-settle"
              style={stagger}
              role="row"
              aria-label={r.kind === "none" ? undefined : `Line ${i + 1} ${meta.label}`}
            >
              <div
                className={`${meta.bg} flex select-none items-center justify-center gap-1 ${meta.markColor} text-2xs`}
              >
                <span className="tabular-nums text-content-ghost">{i + 1}</span>
                <span aria-hidden="true">{meta.mark}</span>
              </div>
              <div className={`${meta.bg} border-r border-line/50 px-3 py-px`}>
                <Line segs={r.target} />
              </div>
              <div className={`${meta.bg} px-3 py-px`}>
                <Line segs={r.user} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Phones: two stacked panes — Target asm on top, Current asm below — instead of
// a unified column, so each side reads like the desktop split. The panes are
// equal height (flex-1) and their scroll is linked (vertical keeps the rows
// aligned; horizontal too), so comparing line-for-line stays effortless.
function StackedDiff({ rows }: { rows: DiffRowVM[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);

  // The mobile page root is `min-h-screen` (not a fixed height), so flex/`h-full`
  // can't bound these panes — a long diff would just grow the page and the panes
  // would lose their independent, synced scroll. Pin the container to the space
  // from our top down to the bottom of the *visible* viewport (visualViewport
  // tracks the mobile address bar) so the two panes stay equal and each scrolls.
  const [height, setHeight] = useState<number>();
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      // `offsetParent` is null while the result pane is hidden (display:none) —
      // its rect would read top:0 and we'd mis-size to the full viewport. The
      // ResizeObserver re-fires once the pane is shown, when the rect is real.
      if (el.offsetParent === null) return;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      setHeight(Math.max(220, Math.floor(vh - el.getBoundingClientRect().top)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, []);

  // Setting one pane's scroll fires its own scroll event, which would echo back
  // and fight the user; a one-frame lock breaks that feedback loop.
  const lock = useRef(false);
  const link = (src: HTMLDivElement | null, dst: HTMLDivElement | null) => {
    if (!src || !dst || lock.current) return;
    lock.current = true;
    dst.scrollTop = src.scrollTop;
    dst.scrollLeft = src.scrollLeft;
    requestAnimationFrame(() => {
      lock.current = false;
    });
  };
  return (
    <div
      ref={rootRef}
      style={{ height }}
      // Fallback height (≈ chrome above the diff) until the effect measures exactly.
      className="flex h-[calc(100dvh-11rem)] min-h-0 flex-col font-mono text-asm"
    >
      <StackPane
        label="Target asm"
        rows={rows}
        side="target"
        scrollRef={topRef}
        onScroll={() => link(topRef.current, botRef.current)}
      />
      <StackPane
        label="Current asm"
        rows={rows}
        side="user"
        scrollRef={botRef}
        onScroll={() => link(botRef.current, topRef.current)}
        className="border-t-2 border-line"
      />
    </div>
  );
}

function StackPane({
  label,
  rows,
  side,
  scrollRef,
  onScroll,
  className = "",
}: {
  label: string;
  rows: DiffRowVM[];
  side: "target" | "user";
  scrollRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  className?: string;
}) {
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className="shrink-0 border-b border-line bg-bg-soft px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-content-muted">
        {label}
      </div>
      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-auto py-1">
        {rows.map((r, i) => {
          const meta = ROW_META[r.kind];
          // Render every row on both sides (a null side shows "·" via Line) so the
          // two panes have identical row counts/heights and the scroll stays synced.
          const segs = side === "target" ? r.target : r.user;
          return (
            <div key={i} className={`flex whitespace-pre px-2 ${meta.bg}`}>
              <span className="mr-2 w-6 shrink-0 select-none text-right tabular-nums text-content-ghost">
                {i + 1}
              </span>
              <Line segs={segs} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Object overview: the two-column section/symbol navigator ----

function pctTone(v: number): string {
  return v >= 100 ? "text-good theme-light:text-good-soft" : v >= 50 ? "text-warn" : "text-bad";
}

function Pct({ v }: { v: number }) {
  return <span className={`tabular-nums ${pctTone(v)}`}>({Math.round(v)}%)</span>;
}

type TipState = { x: number; y: number; sym: OverviewSymbol } | null;

function SymRow({
  sym,
  selected,
  onSelect,
  setTip,
}: {
  sym: OverviewSymbol;
  selected: boolean;
  onSelect: (name: string) => void;
  setTip: (t: TipState) => void;
}) {
  const clickable = !sym.isData;
  return (
    <div
      onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, sym })}
      onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY, sym })}
      onMouseLeave={() => setTip(null)}
      onClick={clickable ? () => onSelect(sym.name) : undefined}
      className={`flex items-center gap-2 whitespace-nowrap py-px pl-6 pr-2 ${
        clickable ? "cursor-pointer hover:bg-bg-softer/70" : "cursor-default"
      } ${selected ? "bg-accent/10 ring-1 ring-inset ring-accent/30" : ""}`}
    >
      <span className="select-none text-2xs text-content-ghost">[{sym.flags || "?"}]</span>
      {sym.matchPercent != null && <Pct v={sym.matchPercent} />}
      <span className="truncate text-content">{sym.demangled || sym.name}</span>
    </div>
  );
}

function Section({
  sec,
  selected,
  onSelect,
  setTip,
}: {
  sec: OverviewSection;
  selected: string;
  onSelect: (name: string) => void;
  setTip: (t: TipState) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 whitespace-nowrap px-2 py-0.5 text-left hover:bg-bg-softer/40"
      >
        <span className="select-none text-content-faint">{open ? "▾" : "▸"}</span>
        <span className="font-semibold text-content-secondary">{sec.name}</span>
        <span className="text-content-faint">({sec.sizeHex})</span>
        {sec.matchPercent != null && <Pct v={sec.matchPercent} />}
      </button>
      {open &&
        sec.symbols.map((s, i) => (
          <SymRow
            key={i}
            sym={s}
            selected={selected === s.name && !s.isData}
            onSelect={onSelect}
            setTip={setTip}
          />
        ))}
    </div>
  );
}

function ObjColumn({
  title,
  sections,
  selected,
  onSelect,
  setTip,
}: {
  title: string;
  sections: OverviewSection[];
  selected: string;
  onSelect: (name: string) => void;
  setTip: (t: TipState) => void;
}) {
  return (
    <div className="min-w-0 overflow-x-auto bg-bg-inset/40">
      <div className="sticky top-0 z-10 border-b border-line bg-bg-soft px-2 py-1.5 text-2xs font-semibold uppercase tracking-wider text-content-muted">
        {title}
      </div>
      {sections.length ? (
        sections.map((sec, i) => (
          <Section key={i} sec={sec} selected={selected} onSelect={onSelect} setTip={setTip} />
        ))
      ) : (
        <div className="px-3 py-4 text-xs text-content-faint">No object yet.</div>
      )}
    </div>
  );
}

function SymTooltip({ tip }: { tip: NonNullable<TipState> }) {
  return (
    <div
      className="pointer-events-none fixed z-50 max-w-md rounded-md border border-line bg-bg-inset/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm"
      style={{ left: tip.x + 14, top: tip.y + 16 }}
    >
      {tip.sym.hover.map((h, i) => (
        <div key={i} className="flex gap-2 leading-relaxed">
          <span className="shrink-0 text-accent">{h.label}:</span>
          <span className="break-all text-content-secondary">{h.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * The objdiff object navigator: Target vs Base, each a tree of sections and
 * symbols with match %. Click a code symbol to diff it; hover for metadata.
 */
export function ObjOverview({
  overview,
  selected,
  onSelect,
}: {
  overview: Overview;
  selected: string;
  onSelect: (name: string) => void;
}) {
  const [tip, setTip] = useState<TipState>(null);
  return (
    <div className="h-full font-mono text-asm">
      <div className="grid grid-cols-2 gap-px bg-line/50">
        <ObjColumn title="Target object" sections={overview.target} selected={selected} onSelect={onSelect} setTip={setTip} />
        <ObjColumn title="Base object" sections={overview.base} selected={selected} onSelect={onSelect} setTip={setTip} />
      </div>
      {tip && tip.sym.hover.length > 0 && <SymTooltip tip={tip} />}
    </div>
  );
}

/** Plain single-column listing of one side's instructions (Target / Your asm tabs). */
export function AsmList({ rows, dialect = "ppc" }: { rows: Seg[][]; dialect?: AsmDialect }) {
  return (
    <InsnTipLayer dialect={dialect}>
      <div className="overflow-auto px-3 py-2 font-mono text-asm">
        {rows.map((segs, i) => (
          <div key={i} className="flex">
            <span className="w-8 select-none text-right text-content-ghost">{i}</span>
            <span className="whitespace-pre pl-4">
              <Line segs={segs} />
            </span>
          </div>
        ))}
      </div>
    </InsnTipLayer>
  );
}
