"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconPlayerPlayFilled,
  IconLoader2,
  IconRefresh,
  IconAlertTriangle,
  IconBinaryTree,
  IconTerminal2,
  IconExternalLink,
} from "@tabler/icons-react";
import { AsmList, preloadGlossary } from "./AsmDiff";
import {
  analyze,
  preloadObjdiff,
  type Analysis,
  type Overview,
  type Seg,
} from "@/lib/objdiff/client";
import { AccountMenu } from "./AccountMenu";
import { Logo, ThemeToggle } from "./ui";
import { createScratch } from "@/lib/playground/decompme";
import { EXAMPLES, type ExampleCategory, type PlaygroundExample } from "@/lib/playground/examples";

// Category display order in the examples dropdown; only non-empty groups render.
const CATEGORY_ORDER: ExampleCategory[] = [
  "Math",
  "Vector",
  "Matrix",
  "Bits",
  "Random",
  "Game",
  "Sorting",
  "Memory",
];

const CodeEditor = dynamic(() => import("./CodeEditor").then((m) => m.CodeEditor), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-content-faint">
      <IconLoader2 className="mr-2 animate-spin" size={16} /> Loading editor…
    </div>
  ),
});

const STORAGE_KEY = "decomp-playground-code";

const DEFAULT_CODE = `// Write C and watch the real Metrowerks CodeWarrior GC/2.0
// compiler turn it into GameCube PowerPC assembly.
// Types like s32 / u8 / f32 are already in scope — no #include.
// (MWCC GC/2.0 is a C89 compiler: declare variables at the top.)

int sum_to(int n) {
    int total = 0;
    int i;
    for (i = 0; i < n; i++) {
        total += i;
    }
    return total;
}
`;

type Status = "idle" | "running" | "ok" | "compileError" | "error";
type Tab = "asm" | "console";
type ScratchState =
  | { state: "idle" }
  | { state: "creating" }
  | { state: "done"; url: string }
  | { state: "error"; message: string };

// The disassemblable (non-data) symbols of the just-compiled object, in object
// order. The playground compiles the user's object into objdiff's "target" slot
// (the proven target-only path), so we read overview.target.
function codeSymbols(overview: Overview): string[] {
  const names: string[] = [];
  for (const sec of overview.target) {
    for (const sym of sec.symbols) {
      if (!sym.isData) names.push(sym.name);
    }
  }
  return names;
}

export function PlaygroundWorkspace() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [symbols, setSymbols] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [tab, setTab] = useState<Tab>("asm");
  const [scratch, setScratch] = useState<ScratchState>({ state: "idle" });
  const [exampleId, setExampleId] = useState("");
  const [activeExample, setActiveExample] = useState<PlaygroundExample | null>(null);

  const codeRef = useRef(code);
  codeRef.current = code;
  // Latest compiled object (base64) — uploaded to decomp.me on "Create scratch".
  const userB64Ref = useRef<string | null>(null);
  // Per-symbol disassembly from the last analyze() pass; symbol switching is a
  // pure lookup here (no recompile).
  const diffsRef = useRef<Analysis["diffs"]>({});
  // Monotonic token: a stale in-flight compile must not clobber a newer one.
  const runIdRef = useRef(0);

  const run = useCallback(async () => {
    const myRun = ++runIdRef.current;
    const codeAtRun = codeRef.current;
    if (!codeAtRun.trim()) return;
    setStatus("running");
    setScratch({ state: "idle" });
    try {
      const res = await fetch("/api/playground/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeAtRun }),
      });
      const d = await res.json();
      if (runIdRef.current !== myRun) return;
      if (!d.ok) {
        userB64Ref.current = null;
        setMessage(d.compileError || d.error || "Something went wrong.");
        setStatus(d.compileError ? "compileError" : "error");
        setTab("console");
        return;
      }
      if (!d.objBase64) {
        userB64Ref.current = null;
        setStatus("error");
        setMessage("The compiler returned no object file.");
        setTab("console");
        return;
      }
      userB64Ref.current = d.objBase64;

      let analysis: Analysis;
      try {
        // User object into the "target" slot (target-only objdiff pass) — its
        // disassembly lands in diffs[name].targetRows + overview.target.
        analysis = await analyze(d.objBase64, null);
      } catch (e) {
        console.error("objdiff analysis failed", e);
        if (runIdRef.current !== myRun) return;
        setStatus("error");
        setMessage("Couldn't disassemble the compiled output.");
        setTab("console");
        return;
      }
      if (runIdRef.current !== myRun) return;

      diffsRef.current = analysis.diffs;
      const names = codeSymbols(analysis.overview);
      setSymbols(names);
      setSelected((prev) => (prev && analysis.diffs[prev] ? prev : (names[0] ?? "")));
      setStatus("ok");
      setTab("asm");
    } catch {
      if (runIdRef.current !== myRun) return;
      setStatus("error");
      setMessage("Network error talking to the compiler.");
      setTab("console");
    }
  }, []);
  const runRef = useRef(run);
  runRef.current = run;

  // On mount: warm objdiff + the glossary, restore the last edit, compile once so
  // the assembly is visible immediately.
  useEffect(() => {
    preloadObjdiff();
    // The playground compiles only GameCube PowerPC, so its glossary is the PPC one.
    preloadGlossary("ppc");
    let initial = DEFAULT_CODE;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim()) initial = saved;
    } catch {
      /* private mode / disabled storage */
    }
    setCode(initial);
    codeRef.current = initial;
    runRef.current();
  }, []);

  // Persist the editor across reloads (a convenience; durable sharing is the
  // "Create scratch" button). Namespaced so it never touches lesson progress.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, [code]);

  const reset = () => {
    setCode(DEFAULT_CODE);
    codeRef.current = DEFAULT_CODE;
    setActiveExample(null);
    setExampleId("");
    setSelected("");
    runRef.current();
  };

  const onPickExample = useCallback((id: string) => {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setExampleId(id);
    setActiveExample(ex);
    setSelected(ex.symbol); // headline function of the example
    setCode(ex.code);
    codeRef.current = ex.code;
    runRef.current();
  }, []);

  const onCreateScratch = useCallback(async () => {
    const obj = userB64Ref.current;
    if (!obj || !selected) return;
    setScratch({ state: "creating" });
    try {
      const { url } = await createScratch({
        code: codeRef.current,
        symbol: selected,
        objBase64: obj,
      });
      setScratch({ state: "done", url });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setScratch({
        state: "error",
        message: e instanceof Error ? e.message : "Couldn't create the scratch.",
      });
    }
  }, [selected]);

  const rows: Seg[][] = (selected && diffsRef.current[selected]?.targetRows) || [];
  const canScratch = status === "ok" && !!userB64Ref.current && !!selected;

  return (
    <div className="flex min-h-screen flex-col bg-bg lg:h-screen">
      <header className="flex items-center gap-3 border-b border-line bg-bg-soft px-4 py-2.5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-content-secondary transition hover:bg-bg-softer hover:text-content-primary"
        >
          <IconArrowLeft size={16} /> Curriculum
        </Link>
        <div className="mx-1 h-5 w-px bg-line" />
        <Logo size={22} />
        <h1 className="text-sm font-semibold text-content-primary">Playground</h1>
        <span className="hidden rounded bg-bg-softer px-1.5 py-0.5 font-mono text-2xs font-medium text-content-muted sm:inline">
          MWCC GC/2.0
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <AccountMenu />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        {/* Editor column */}
        <section className="flex min-h-[48vh] flex-col border-b border-line lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 border-b border-line bg-bg-soft/60 px-4 py-2">
            <ExampleSelect value={exampleId} onPick={onPickExample} />
            <span className="hidden items-center gap-1 rounded bg-bg-softer px-1.5 py-0.5 font-mono text-2xs text-content-faint md:inline-flex">
              mwcceppc.exe -O4,p
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs text-content-secondary transition hover:bg-bg-softer hover:text-content-primary"
              >
                <IconRefresh size={14} /> Reset
              </button>
              <button
                onClick={() => run()}
                disabled={status === "running"}
                className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-on transition hover:bg-accent-hover active:scale-[0.97] disabled:opacity-60"
              >
                {status === "running" ? (
                  <IconLoader2 size={14} className="animate-spin" />
                ) : (
                  <IconPlayerPlayFilled size={13} />
                )}
                Compile
                <kbd className="ml-1 rounded bg-black/20 px-1 text-2xs">⌘↵</kbd>
              </button>
            </div>
          </div>
          {activeExample && (
            <div className="flex items-start gap-2 border-b border-line bg-bg-soft/30 px-4 py-1.5">
              <span className="mt-px shrink-0 rounded bg-accent/10 px-1.5 py-0.5 font-mono text-2xs font-medium text-accent">
                {activeExample.game}
              </span>
              <p className="text-2xs leading-relaxed text-content-muted">
                <span className="font-semibold text-content-secondary">{activeExample.label}</span>{" "}
                — {activeExample.blurb}
              </p>
            </div>
          )}
          <div className="min-h-[320px] flex-1 lg:min-h-0">
            <CodeEditor value={code} onChange={setCode} onRun={() => run()} />
          </div>
        </section>

        {/* Output column */}
        <section className="flex min-h-[40vh] flex-col bg-bg-inset/60 lg:min-h-0">
          <div className="flex items-center gap-1 border-b border-line bg-bg-soft/50 px-2">
            <TabButton
              active={tab === "asm"}
              onClick={() => setTab("asm")}
              icon={<IconBinaryTree size={14} />}
            >
              Disassembly
            </TabButton>
            <TabButton
              active={tab === "console"}
              onClick={() => setTab("console")}
              icon={<IconTerminal2 size={14} />}
            >
              Console
            </TabButton>
            <div className="ml-auto pr-1.5">
              <CreateScratchButton
                scratch={scratch}
                disabled={!canScratch}
                onClick={onCreateScratch}
              />
            </div>
          </div>

          {scratch.state === "error" && (
            <div className="flex items-center gap-2 border-b border-bad/20 bg-bad/[0.07] px-3 py-1.5 text-2xs text-bad">
              <IconAlertTriangle size={12} className="shrink-0" /> decomp.me: {scratch.message}
            </div>
          )}

          {tab === "asm" && symbols.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-bg-soft/30 px-3 py-1.5">
              <span className="mr-1 font-mono text-2xs uppercase tracking-wider text-content-faint">
                fn
              </span>
              {symbols.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSelected(s);
                    setTab("asm");
                  }}
                  className={`rounded px-2 py-0.5 font-mono text-2xs transition ${
                    s === selected
                      ? "bg-accent/15 text-accent ring-1 ring-inset ring-accent/30"
                      : "text-content-muted hover:bg-bg-softer hover:text-content-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-auto">
            {tab === "asm" ? (
              status === "running" ? (
                <Centered>
                  <IconLoader2 size={14} className="animate-spin text-accent" /> Compiling with
                  mwcceppc.exe…
                </Centered>
              ) : status === "compileError" || status === "error" ? (
                <Empty>Your code didn’t compile — see the Console tab.</Empty>
              ) : rows.length ? (
                <AsmList rows={rows} />
              ) : status === "ok" ? (
                <Empty>No functions in the output. Define a function to see its assembly.</Empty>
              ) : (
                <Empty>Hit “Compile” to see the assembly.</Empty>
              )
            ) : (
              <Console status={status} message={message} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ExampleSelect({ value, onPick }: { value: string; onPick: (id: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onPick(e.target.value)}
      title="Load a real function from an open GameCube decomp project"
      className="max-w-[13rem] cursor-pointer rounded-md border border-line bg-bg-softer px-2 py-1.5 text-xs text-content-secondary transition hover:text-content-primary focus:outline-none focus:ring-1 focus:ring-accent"
    >
      <option value="">Load example…</option>
      {CATEGORY_ORDER.map((cat) => {
        const items = EXAMPLES.filter((e) => e.category === cat);
        if (!items.length) return null;
        return (
          <optgroup key={cat} label={cat}>
            {items.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label} · {e.game}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}

function CreateScratchButton({
  scratch,
  disabled,
  onClick,
}: {
  scratch: ScratchState;
  disabled: boolean;
  onClick: () => void;
}) {
  if (scratch.state === "done") {
    return (
      <a
        href={scratch.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md bg-good/15 theme-light:bg-good-soft/15 px-2.5 py-1 text-xs font-semibold text-good theme-light:text-good-soft transition hover:bg-good/25 theme-light:hover:bg-good-soft/25"
      >
        <IconExternalLink size={13} /> Open on decomp.me
      </a>
    );
  }
  const busy = scratch.state === "creating";
  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      title="Create a shareable scratch on decomp.me from this code"
      className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs text-content-secondary transition hover:bg-bg-softer hover:text-content-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? <IconLoader2 size={13} className="animate-spin" /> : <IconExternalLink size={13} />}
      {busy ? "Creating…" : "Create scratch"}
    </button>
  );
}

function Console({ status, message }: { status: Status; message: string }) {
  if (status === "running") {
    return (
      <Centered>
        <IconLoader2 size={14} className="animate-spin text-accent" /> Compiling…
      </Centered>
    );
  }
  const isErr = status === "compileError" || status === "error";
  return (
    <pre
      className={`h-full whitespace-pre-wrap px-4 py-3 font-mono text-xs leading-relaxed ${
        isErr ? "text-bad-text" : "text-content-muted"
      }`}
    >
      {message || (status === "ok" ? "Compiled cleanly." : "No compiler output yet.")}
    </pre>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition ${
        active
          ? "border-accent text-content-primary"
          : "border-transparent text-content-muted hover:text-content-secondary"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-xs text-content-faint">
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-content-faint">
      {children}
    </div>
  );
}
