"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconAlertTriangle,
  IconBinaryTree,
  IconTerminal2,
} from "@tabler/icons-react";
import { preloadGlossary } from "@/components/asm-diff/glossary";
import {
  analyze,
  preloadObjdiff,
  type Analysis,
  type Overview,
  type Seg,
} from "@/lib/objdiff/client";
import { AccountMenu } from "@/components/AccountMenu";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { createScratch } from "@/lib/playground/decompme";
import { EXAMPLES, type PlaygroundExample } from "@/lib/playground/examples";
import type { Status, Tab, ScratchState } from "./types";
import { PlaygroundExampleSelect } from "./PlaygroundExampleSelect";
import { PlaygroundCreateScratchButton } from "./PlaygroundCreateScratchButton";
import { PlaygroundConsole } from "./PlaygroundConsole";
import { PlaygroundAsmTab } from "./PlaygroundAsmTab";
import { LazyCodeEditor } from "@/components/LazyCodeEditor";
import { WorkspaceTabButton } from "@/components/workspace/WorkspaceTabButton";
import { WorkspaceResetButton } from "@/components/workspace/WorkspaceResetButton";
import { WorkspaceRunButton } from "@/components/workspace/WorkspaceRunButton";

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
  const userB64Ref = useRef<string | null>(null);
  const diffsRef = useRef<Analysis["diffs"]>({});
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

  useEffect(() => {
    preloadObjdiff();
    preloadGlossary("ppc");
    let initial = DEFAULT_CODE;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim()) initial = saved;
    } catch {}
    setCode(initial);
    codeRef.current = initial;
    runRef.current();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {}
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
    setSelected(ex.symbol);
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
        <section className="flex min-h-[48vh] flex-col border-b border-line lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 border-b border-line bg-bg-soft/60 px-4 py-2">
            <PlaygroundExampleSelect value={exampleId} onPick={onPickExample} />
            <span className="hidden items-center gap-1 rounded bg-bg-softer px-1.5 py-0.5 font-mono text-2xs text-content-faint md:inline-flex">
              mwcceppc.exe -O4,p
            </span>
            <div className="ml-auto flex items-center gap-2">
              <WorkspaceResetButton onClick={reset} />
              <WorkspaceRunButton
                running={status === "running"}
                disabled={status === "running"}
                onClick={() => run()}
              >
                Compile
                <kbd className="ml-1 rounded bg-black/20 px-1 text-2xs">⌘↵</kbd>
              </WorkspaceRunButton>
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
            <LazyCodeEditor value={code} onChange={setCode} onRun={() => run()} />
          </div>
        </section>

        <section className="flex min-h-[40vh] flex-col bg-bg-inset/60 lg:min-h-0">
          <div className="flex items-center gap-1 border-b border-line bg-bg-soft/50 px-2">
            <WorkspaceTabButton
              active={tab === "asm"}
              onClick={() => setTab("asm")}
              icon={IconBinaryTree}
              text="Disassembly"
            />

            <WorkspaceTabButton
              active={tab === "console"}
              onClick={() => setTab("console")}
              icon={IconTerminal2}
              text="Console"
            />

            <div className="ml-auto pr-1.5">
              <PlaygroundCreateScratchButton
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
              <PlaygroundAsmTab status={status} rows={rows} />
            ) : (
              <PlaygroundConsole status={status} message={message} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
