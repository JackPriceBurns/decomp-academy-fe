"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBulb,
  IconCheck,
  IconPlayerPlayFilled,
  IconRefresh,
  IconLoader2,
  IconAlertTriangle,
  IconEye,
  IconGitCompare,
  IconTerminal2,
  IconBook2,
  IconStack2,
  IconHelpCircle,
} from "@tabler/icons-react";
import { ObjDiff, ObjOverview, preloadGlossary, type AsmDialect } from "./AsmDiff";
import { GlossaryProse } from "./GlossaryProse";
import {
  analyze,
  preloadObjdiff,
  type Analysis,
  type DiffRowVM,
  type ObjDiffVM,
  type Overview,
  type Seg,
} from "@/lib/objdiff/client";
import { Difficulty } from "./CurriculumMap";
import { GRADERS } from "@/lib/lessons/graders";
import type { GraderKind } from "@/lib/lessons/types";
import {
  loadCode,
  recordResult,
  saveCode,
  solvedWithoutHints,
  totalSolved,
  useProgress,
} from "@/lib/progress";
import { FeedbackDialog } from "./FeedbackDialog";
import { lessonPath } from "@/lib/seo";

const CodeEditor = dynamic(() => import("./CodeEditor").then((m) => m.CodeEditor), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-content-faint">
      <IconLoader2 className="mr-2 animate-spin" size={16} /> Loading editor…
    </div>
  ),
});

export interface LessonDTO {
  id: string;
  /** id of the enclosing course — drives the lesson/prev/next URLs. */
  course: string;
  title: string;
  chapterId: string;
  chapterTitle: string;
  difficulty: number;
  concepts: string[];
  briefHtml: string;
  concept: boolean;
  symbol: string;
  starter: string;
  solution: string;
  /** Struct/type preamble: shown read-only in a tab, and (for the in-browser
   *  agbcc grader) prepended to the learner's code at compile time. Absent when
   *  the lesson has no context, or deliberately hides it. */
  context?: string;
  hints: string[];
  /** How this lesson grades: "remote" (MWCC service) or "wasm-agbcc" (in-browser). */
  grader: GraderKind;
  prev: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
}

type Status = "idle" | "running" | "match" | "close" | "compileError" | "error";

interface CheckState {
  status: Status;
  matchPercent?: number;
  vm?: ObjDiffVM;
  message?: string;
  firstEver?: boolean;
  noHints?: boolean;
}

type Tab = "diff" | "objects" | "console";

// Tween a number up to `value` (respecting reduced-motion).
function useCountUp(value: number, ms = 550) {
  const [n, setN] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    if (reduce || from === value) {
      setN(value);
      fromRef.current = value;
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return n;
}

export function LessonWorkspace({ lesson }: { lesson: LessonDTO }) {
  const [code, setCode] = useState(lesson.starter);
  const [check, setCheck] = useState<CheckState>({ status: "idle" });
  const [targetRows, setTargetRows] = useState<Seg[][] | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState(lesson.symbol);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [tab, setTab] = useState<Tab>("diff");
  // Which source the editor column shows: the learner's editable code, or the
  // read-only context preamble. Only relevant when the lesson has context.
  const [editorTab, setEditorTab] = useState<"code" | "context">("code");
  const [mobilePane, setMobilePane] = useState<"brief" | "code" | "result">("brief");
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const codeRef = useRef(code);
  codeRef.current = code;
  // The code that produced the current check result. Once the editor diverges
  // from it, a stale "match" no longer reflects what's on screen, so the
  // Next-lesson button reverts to Compile & Check.
  const checkedCodeRef = useRef<string | null>(null);
  // Latest object files (base64), read without re-creating callbacks.
  const targetB64Ref = useRef<string | null>(null);
  const userB64Ref = useRef<string | null>(null);
  // Per-symbol diffs from the latest analyze() pass — selectSymbol reads these
  // without recompiling/re-parsing.
  const diffsRef = useRef<Analysis["diffs"]>({});
  // Monotonic token bumped on every lesson open; async work checks it before
  // committing state so a stale in-flight compile can't clobber a newer lesson.
  const loadIdRef = useRef(0);
  // The last code we seeded programmatically (starter or saved). If the editor
  // still equals it, the learner hasn't typed, so a late server hydrate is free
  // to replace it with their saved code.
  const seededRef = useRef(code);
  const { ready: progressReady } = useProgress();
  const router = useRouter();

  // All per-platform behavior (compiler, target, asm dialect, header label)
  // lives in the grader profile, so the workspace never branches on grader kind.
  const grader = GRADERS[lesson.grader];
  const asmDialect = grader.dialect;

  const run = useCallback(
    async (opts?: { initial?: boolean }) => {
      const initial = opts?.initial ?? false;
      const myRun = loadIdRef.current;
      const codeAtRun = codeRef.current;
      // A fresh check shows the celebration again if it matches.
      setBannerDismissed(false);
      // Drop the previous vm so the diff shows a skeleton while recompiling rather
      // than a stale result the learner could misread as their new edit.
      setCheck((c) => ({ status: "running", matchPercent: c.matchPercent }));
      if (!initial) {
        setTab("diff");
        setMobilePane("result");
      }
      saveCode(lesson.course, lesson.id, codeRef.current);
      try {
        const d = await grader.compile({
          course: lesson.course,
          lesson: lesson.id,
          code: codeAtRun,
          context: lesson.context,
        });
        if (loadIdRef.current !== myRun) return; // lesson changed mid-flight
        if (!d.ok) {
          if (d.compileError) {
            setCheck({ status: "compileError", message: d.compileError });
          } else {
            setCheck({ status: "error", message: d.error || "Something went wrong." });
          }
          // On the initial auto-compile, keep the diff tab (it falls back to the
          // target listing) rather than yanking the learner to the console.
          if (!initial) setTab("console");
          return;
        }
        if (!d.objBase64) {
          setCheck({ status: "error", message: "The compiler returned no object file." });
          if (!initial) setTab("console");
          return;
        }
        userB64Ref.current = d.objBase64;

        let analysis: Analysis;
        try {
          // One objdiff pass yields the overview + every symbol's diff.
          analysis = await analyze(targetB64Ref.current, d.objBase64, lesson.symbol);
        } catch (e) {
          console.error("objdiff analysis failed", e);
          if (loadIdRef.current !== myRun) return;
          setCheck({ status: "error", message: "Couldn't analyze the compiled output." });
          if (!initial) setTab("console");
          return;
        }
        if (loadIdRef.current !== myRun) return;

        diffsRef.current = analysis.diffs;
        checkedCodeRef.current = codeAtRun;
        setOverview(analysis.overview);
        // A Compile & Check always re-centers on the lesson's own function.
        setSelectedSymbol(lesson.symbol);
        const vm = analysis.diffs[lesson.symbol];
        setTargetRows(vm?.targetRows ?? null);
        const exact = vm?.exact ?? false;
        const pct = vm?.matchPercent ?? 0;
        // Capture "first ever solve" before we record (recordResult bumps the count).
        const firstEver = exact && totalSolved() === 0;
        const sessionNoHints = exact && hintsShown === 0 && !showSolution;
        // Pre-compiling the starter on open is not a solve attempt — don't record it.
        if (!initial) recordResult(lesson.course, lesson.id, exact ? 100 : pct, { noHints: sessionNoHints });
        // Show the badge from the persisted truth, not the live counter, so a
        // re-run after refresh (hintsShown reset to 0) can't resurrect it.
        const noHints = exact && solvedWithoutHints(lesson.course, lesson.id);
        setCheck({ status: exact ? "match" : "close", matchPercent: pct, vm, firstEver, noHints });
        setTab("diff");
      } catch {
        if (loadIdRef.current !== myRun) return;
        setCheck({ status: "error", message: "Network error talking to the compiler." });
        if (!initial) setTab("console");
      }
    },
    [lesson.id, lesson.symbol, grader, lesson.context, hintsShown, showSolution],
  );
  const runRef = useRef(run);
  runRef.current = run;

  // Browse a different symbol from the object overview: a pure lookup into the
  // last analyze() result (no recompile, no re-parse). Only the lesson's own
  // symbol counts as solving, and this never re-fires the solve celebration.
  const selectSymbol = useCallback(
    (name: string) => {
      const vm = diffsRef.current[name];
      if (!vm) return;
      setSelectedSymbol(name);
      setTab("diff");
      setMobilePane("result");
      setCheck({
        status: name === lesson.symbol && vm.exact ? "match" : "close",
        matchPercent: vm.matchPercent,
        vm,
      });
    },
    [lesson.symbol],
  );

  // On lesson open: reset, fetch the cached target object, then pre-compile the
  // learner's starting code once so a diff is visible immediately (no blank state).
  useEffect(() => {
    const myLoad = ++loadIdRef.current;
    const saved = loadCode(lesson.course, lesson.id);
    const initialCode = saved ?? lesson.starter;
    setCode(initialCode);
    codeRef.current = initialCode;
    seededRef.current = initialCode;
    setCheck({ status: "idle" });
    setTargetRows(null);
    setOverview(null);
    setSelectedSymbol(lesson.symbol);
    setBannerDismissed(false);
    targetB64Ref.current = null;
    userB64Ref.current = null;
    diffsRef.current = {};
    checkedCodeRef.current = null;
    setHintsShown(0);
    setShowSolution(false);
    setTab("diff");
    setEditorTab("code");
    setMobilePane("brief");
    if (lesson.concept) return;
    preloadObjdiff();
    preloadGlossary(asmDialect);
    grader.preload();

    const loadTarget = grader.loadTarget({
      course: lesson.course,
      lesson: lesson.id,
      solution: lesson.solution,
      context: lesson.context,
    });

    loadTarget.then(async (targetB64) => {
      if (loadIdRef.current !== myLoad || !targetB64) return;
      targetB64Ref.current = targetB64;
      // Seed the Target asm tab + overview from the target alone, so they're
      // visible during the brief compile of the learner's starter.
      try {
        const a = await analyze(targetB64, null, lesson.symbol);
        if (loadIdRef.current === myLoad) {
          diffsRef.current = a.diffs;
          setOverview(a.overview);
          setTargetRows(a.diffs[lesson.symbol]?.targetRows ?? null);
        }
      } catch (e) {
        console.error("objdiff target analysis failed", e);
      }
      if (loadIdRef.current === myLoad) runRef.current({ initial: true });
    });
  }, [
    lesson.id,
    lesson.starter,
    lesson.symbol,
    lesson.concept,
    grader,
    lesson.solution,
    lesson.context,
  ]);

  // When the progress store finishes hydrating after open (e.g. server progress
  // arrives on an authed hard-load), restore the saved code — but only if the
  // learner hasn't touched what we last seeded.
  useEffect(() => {
    if (lesson.concept || !progressReady) return;
    const saved = loadCode(lesson.course, lesson.id);
    if (!saved || saved === codeRef.current || codeRef.current !== seededRef.current) return;
    setCode(saved);
    codeRef.current = saved;
    seededRef.current = saved;
    void runRef.current({ initial: true });
  }, [progressReady, lesson.id, lesson.concept]);

  const reset = () => {
    setCode(lesson.starter);
    // Update the ref synchronously so the re-run below reads the starter, not the
    // pre-reset code (setCode only updates codeRef on the next render).
    codeRef.current = lesson.starter;
    seededRef.current = lesson.starter;
    saveCode(lesson.course, lesson.id, lesson.starter);
    setSelectedSymbol(lesson.symbol);
    setTab("diff");
    // Re-diff the reset starter, exactly like the on-open auto-compile, so the
    // view reflects the starter instead of falling back to a target-only diff.
    void runRef.current({ initial: true });
  };

  if (lesson.concept) return <ConceptView lesson={lesson} />;

  const hasResult = check.status !== "idle";
  // The current on-screen code is the verified match, so the primary action is
  // "Next lesson" rather than recompiling. ⌘↵ follows the button: advance instead
  // of re-running an already-solved exercise.
  const solved =
    check.status === "match" &&
    selectedSymbol === lesson.symbol &&
    code === checkedCodeRef.current;
  const nextHref = lesson.next ? lessonPath(lesson.course, lesson.next.id) : "/";
  const onRun = () => (solved ? router.push(nextHref) : run());

  return (
    <div className="flex min-h-screen flex-col bg-bg lg:h-screen">
      <TopBar lesson={lesson} />
      {/* Mobile pane switcher — each surface gets the full screen on a phone. */}
      <div className="flex border-b border-line bg-bg-soft lg:hidden">
        {(["brief", "result", "code"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setMobilePane(p)}
            className={`relative flex-1 py-2.5 text-xs font-medium transition ${
              mobilePane === p
                ? "border-b-2 border-accent text-content-primary"
                : "border-b-2 border-transparent text-content-muted"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {p === "brief" ? "Brief" : p === "code" ? "Code" : "Assembly"}
              {p === "result" && hasResult && mobilePane !== "result" && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </span>
          </button>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(20rem,440px)_minmax(0,1fr)]">
        {/* Brief column */}
        <aside
          className={`min-h-0 flex-col border-r border-line bg-bg-soft/40 lg:flex ${
            mobilePane === "brief" ? "flex" : "hidden"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              {lesson.chapterTitle}
            </span>
            <Difficulty level={lesson.difficulty} />
            <div className="ml-auto flex gap-1.5">
              {lesson.concepts.slice(0, 3).map((c) => (
                <span
                  key={c}
                  className="rounded bg-bg-softer px-1.5 py-0.5 text-2xs text-content-muted"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 px-5 py-5 lg:min-h-0 lg:overflow-y-auto">
            <GlossaryProse className="prose-lesson" html={lesson.briefHtml} />
            <Hints
              hints={lesson.hints}
              shown={hintsShown}
              onReveal={() => setHintsShown((n) => n + 1)}
              onHide={() => setHintsShown(0)}
            />
            <SolutionBox
              solution={lesson.solution}
              shown={showSolution}
              onToggle={() => setShowSolution((s) => !s)}
              onUse={() => {
                setCode(lesson.solution);
                saveCode(lesson.course, lesson.id, lesson.solution);
              }}
            />
          </div>
        </aside>

        {/* Editor + console column */}
        <section
          className={`min-h-[70vh] flex-col lg:flex lg:min-h-0 ${
            mobilePane === "brief" ? "hidden" : "flex"
          }`}
        >
          <div className="flex items-center gap-2 border-b border-line bg-bg-soft/60 px-4 py-2">
            <span className="font-mono text-xs text-content-muted">
              match <span className="text-accent">{lesson.symbol}</span>
            </span>

            <span className="hidden items-center gap-1 rounded bg-bg-softer px-1.5 py-0.5 font-mono text-2xs text-content-faint sm:inline-flex">
              {grader.compilerLabel}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs text-content-secondary transition hover:bg-bg-softer hover:text-content-primary"
              >
                <IconRefresh size={14} /> Reset
              </button>
              {solved ? (
                <Link
                  href={nextHref}
                  className="inline-flex items-center gap-1.5 rounded-md bg-good theme-light:bg-good-soft px-3.5 py-1.5 text-xs font-semibold text-bg transition hover:bg-good-soft active:scale-[0.97]"
                >
                  <IconCheck size={14} />
                  {lesson.next ? "Next lesson" : "Finish"}
                  <kbd className="ml-1 hidden rounded bg-black/20 px-1 text-2xs sm:inline-block">⌘↵</kbd>
                </Link>
              ) : (
                <button
                  onClick={() => run()}
                  disabled={check.status === "running"}
                  className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-on transition hover:bg-accent-hover active:scale-[0.97] disabled:opacity-60"
                >
                  {check.status === "running" ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <IconPlayerPlayFilled size={13} />
                  )}
                  Compile<span className="hidden sm:inline">&nbsp;&amp; Check</span>
                  <kbd className="ml-1 hidden rounded bg-black/20 px-1 text-2xs sm:inline-block">⌘↵</kbd>
                </button>
              )}
            </div>
          </div>

          <div
            className={`min-h-[340px] flex-[1.2] flex-col border-b border-line lg:flex lg:min-h-0 ${
              mobilePane === "result" ? "hidden" : "flex"
            }`}
          >
            {/* Source switcher — only when the lesson ships a context preamble.
                Lets the learner read the struct/type definitions their code is
                compiled against without cluttering the editor. */}
            {lesson.context && (
              <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-bg-soft/30 px-3 py-1.5">
                <span className="mr-1 font-mono text-2xs uppercase tracking-wider text-content-faint">
                  src
                </span>
                <SourceTab active={editorTab === "code"} onClick={() => setEditorTab("code")}>
                  {lesson.symbol}.c
                </SourceTab>
                <SourceTab active={editorTab === "context"} onClick={() => setEditorTab("context")}>
                  context
                </SourceTab>
              </div>
            )}
            {/* The editable buffer stays mounted (just hidden) when context is
                showing, so the learner's edits, cursor and undo history survive
                a peek at the definitions. */}
            <div className={`min-h-0 flex-1 ${editorTab === "code" ? "" : "hidden"}`}>
              <CodeEditor value={code} onChange={setCode} onRun={onRun} />
            </div>
            {editorTab === "context" && lesson.context && (
              <div className="min-h-0 flex-1">
                <CodeEditor value={lesson.context} readOnly />
              </div>
            )}
          </div>

          <ResultPanel
            tab={tab}
            setTab={setTab}
            check={check}
            targetRows={targetRows}
            overview={overview}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={selectSymbol}
            lessonSymbol={lesson.symbol}
            bannerDismissed={bannerDismissed}
            onDismissBanner={() => setBannerDismissed(true)}
            dialect={asmDialect}
            className={mobilePane === "code" ? "hidden lg:flex" : "flex"}
          />
        </section>
      </div>
    </div>
  );
}

function ConceptView({ lesson }: { lesson: LessonDTO }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg lg:h-screen">
      <TopBar lesson={lesson} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="mb-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
              <IconBook2 size={14} /> {lesson.chapterTitle}
            </span>
            <span className="text-xs text-content-muted">Concept · no code to write</span>
          </div>
          <GlossaryProse
            className="prose-lesson animate-slide-up-fade rounded-2xl border border-line bg-bg-soft/40 px-6 py-7 sm:px-9 sm:py-9"
            html={lesson.briefHtml}
          />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <span className="text-sm text-content-muted">Got it? Lock it in and move on.</span>
            {lesson.next ? (
              <Link
                href={lessonPath(lesson.course, lesson.next.id)}
                onClick={() => recordResult(lesson.course, lesson.id, 100)}
                className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-on transition hover:bg-accent-hover active:scale-[0.98]"
              >
                <IconCheck size={17} /> Mark read &amp; continue
                <IconArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <Link
                href="/"
                onClick={() => recordResult(lesson.course, lesson.id, 100)}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-on transition hover:bg-accent-hover active:scale-[0.98]"
              >
                <IconCheck size={17} /> Finish
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBar({ lesson }: { lesson: LessonDTO }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  return (
    <>
      <header className="flex items-center gap-3 border-b border-line bg-bg-soft px-4 py-2.5">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm text-content-secondary transition hover:bg-bg-softer hover:text-content-primary"
        >
          <IconArrowLeft size={16} />
          <span className="hidden sm:inline">Curriculum</span>
        </Link>
        <div className="mx-1 h-5 w-px bg-line" />
        <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-content-primary">{lesson.title}</h1>
        <div className="flex shrink-0 items-center gap-1.5">
          {lesson.prev ? (
            <Link
              href={lessonPath(lesson.course, lesson.prev.id)}
              className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-xs text-content-secondary transition hover:bg-bg-softer"
              title={lesson.prev.title}
            >
              <IconArrowLeft size={14} /> Prev
            </Link>
          ) : null}
          {lesson.next ? (
            <Link
              href={lessonPath(lesson.course, lesson.next.id)}
              className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-xs text-content-secondary transition hover:bg-bg-softer"
              title={lesson.next.title}
            >
              Next <IconArrowRight size={14} />
            </Link>
          ) : null}
          <button
            onClick={() => setFeedbackOpen(true)}
            title="Feedback on this lesson"
            aria-label="Feedback on this lesson"
            className="inline-flex items-center justify-center rounded-md border border-line px-2 py-1.5 text-content-secondary transition hover:bg-bg-softer hover:text-content-primary"
          >
            <IconHelpCircle size={16} />
          </button>
        </div>
      </header>
      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        source="lesson"
        course={lesson.course}
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        heading="Lesson feedback"
      />
    </>
  );
}

function Hints({
  hints,
  shown,
  onReveal,
  onHide,
}: {
  hints: string[];
  shown: number;
  onReveal: () => void;
  onHide: () => void;
}) {
  if (!hints.length) return null;
  return (
    <div className="mt-6 border-t border-line pt-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-content-muted">
        <IconBulb size={14} className="text-warn" /> Hints
        {shown > 0 && (
          <button
            onClick={onHide}
            className="ml-auto text-2xs font-medium normal-case tracking-normal text-content-faint transition hover:text-content-muted"
          >
            Hide
          </button>
        )}
      </div>
      <div className="space-y-2">
        {hints.slice(0, shown).map((h, i) => (
          <div
            key={i}
            className="animate-slide-up-fade rounded-lg border border-line bg-bg-softer/50 px-3 py-2 text-sm text-content-secondary"
          >
            <span className="mr-1.5 font-semibold text-warn">{i + 1}.</span>
            {h}
          </div>
        ))}
      </div>
      {shown < hints.length && (
        <button
          onClick={onReveal}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-bg-softer/60 px-3 py-1.5 text-xs text-content-muted transition hover:bg-bg-softer hover:text-warn"
        >
          <IconBulb size={13} /> Reveal hint {shown + 1} of {hints.length}
        </button>
      )}
    </div>
  );
}

function SolutionBox({
  solution,
  shown,
  onToggle,
  onUse,
}: {
  solution: string;
  shown: boolean;
  onToggle: () => void;
  onUse: () => void;
}) {
  // Friction so the answer isn't the path of least resistance.
  const [confirming, setConfirming] = useState(false);

  if (shown) {
    return (
      <div className="mt-4">
        <button
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 rounded-md bg-bg-softer/60 px-3 py-1.5 text-xs text-content-muted transition hover:bg-bg-softer hover:text-content"
        >
          <IconEye size={13} /> Hide reference solution
        </button>
        <div className="animate-slide-up-fade mt-2">
          <pre className="overflow-x-auto rounded-lg border border-line bg-bg-inset px-3 py-2.5 font-mono text-xs leading-relaxed text-content">
            {solution.trim()}
          </pre>
          <button
            onClick={onUse}
            className="mt-2 text-xs text-accent transition hover:text-accent-hover hover:underline"
          >
            Load into editor →
          </button>
        </div>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="animate-slide-up-fade mt-4 rounded-lg bg-warn/[0.09] px-3 py-2.5">
        <p className="text-xs text-content-secondary">
          This reveals the full answer. Try the hints first — you&apos;ll learn far more
          by matching it yourself.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => {
              onToggle();
              setConfirming(false);
            }}
            className="rounded-md border border-warn/40 px-2.5 py-1 text-2xs font-semibold text-warn transition hover:bg-warn/10"
          >
            Reveal anyway
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-2xs text-content-muted transition hover:text-content"
          >
            Keep trying
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-bg-softer/60 px-3 py-1.5 text-xs text-content-muted transition hover:bg-bg-softer hover:text-content"
      >
        <IconEye size={13} /> Show reference solution
      </button>
    </div>
  );
}

function ResultPanel({
  tab,
  setTab,
  check,
  targetRows,
  overview,
  selectedSymbol,
  onSelectSymbol,
  lessonSymbol,
  bannerDismissed,
  onDismissBanner,
  dialect,
  className = "",
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  check: CheckState;
  targetRows: Seg[][] | null;
  overview: Overview | null;
  selectedSymbol: string;
  onSelectSymbol: (name: string) => void;
  lessonSymbol: string;
  bannerDismissed: boolean;
  onDismissBanner: () => void;
  dialect: AsmDialect;
  className?: string;
}) {
  const isErr = check.status === "compileError" || check.status === "error";
  // Only the lesson's own function gets the celebratory match banner; browsing
  // another symbol from the overview just shows its diff. Once dismissed, the
  // diff (all matching) is shown instead.
  const showBanner =
    check.status === "match" && selectedSymbol === lessonSymbol && !bannerDismissed;
  // When there's no live diff yet (initial load / compile error), fall back to
  // showing the target as an all-"missing" diff so the goal is always visible.
  const targetOnly: DiffRowVM[] | null = targetRows
    ? targetRows.map((segs) => ({ kind: "delete" as const, target: segs, user: null }))
    : null;
  return (
    <div className={`min-h-[260px] flex-[1] flex-col theme-light:bg-white/50 bg-bg-inset/60 lg:min-h-0 ${className}`}>
      <div className="flex items-center gap-1 border-b border-line bg-bg-soft/50 px-2">
        <TabButton active={tab === "diff"} onClick={() => setTab("diff")} icon={<IconGitCompare size={14} />}>
          Diff
        </TabButton>
        <TabButton
          active={tab === "objects"}
          onClick={() => setTab("objects")}
          icon={<IconStack2 size={14} />}
          className="hidden sm:inline-flex"
        >
          Objects
        </TabButton>
        <TabButton active={tab === "console"} onClick={() => setTab("console")} icon={<IconTerminal2 size={14} />}>
          Console
        </TabButton>
        <div className="ml-auto pr-2">
          <MatchMeter check={check} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {tab === "diff" &&
          (check.status === "running" && !check.vm ? (
            <DiffSkeleton label="Compiling…" />
          ) : showBanner ? (
            <MatchBanner
              percent={100}
              firstEver={check.firstEver}
              noHints={check.noHints}
              onViewDiff={onDismissBanner}
            />
          ) : check.vm ? (
            <>
              {selectedSymbol !== lessonSymbol && (
                <div className="border-b border-line bg-bg-soft/60 px-3 py-1.5 font-mono text-2xs text-content-muted">
                  viewing <span className="text-accent">{selectedSymbol}</span> · Compile &amp; Check returns to{" "}
                  <span className="text-content-secondary">{lessonSymbol}</span>
                </div>
              )}
              <ObjDiff rows={check.vm.rows} dialect={dialect} />
            </>
          ) : targetOnly ? (
            <ObjDiff rows={targetOnly} dialect={dialect} />
          ) : (
            <Empty>Hit “Compile &amp; Check” to diff your code against the target.</Empty>
          ))}
        {tab === "objects" &&
          (overview ? (
            <ObjOverview overview={overview} selected={selectedSymbol} onSelect={onSelectSymbol} />
          ) : (
            <DiffSkeleton />
          ))}
        {tab === "console" && <Console check={check} isErr={isErr} />}
      </div>
    </div>
  );
}

// Parse the first human-meaningful line out of MWCC's raw stderr. The compiler
// prints a caret-art block (`Error: ^` then the description on the next line),
// so we skip caret/location noise and surface the actual prose message.
function summarizeError(msg?: string): string | null {
  if (!msg) return null;
  const lines = msg.split("\n").map((l) => l.trim()).filter(Boolean);
  const idx = lines.findIndex((l) => /error|warning/i.test(l));
  if (idx < 0) return null;
  for (const c of lines.slice(idx, idx + 3)) {
    const cleaned = c
      .replace(/\^/g, "")
      .replace(/^\d+:\s*/, "")
      .replace(/^(Error|Warning):\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
    if (/[a-z]{3,}/i.test(cleaned)) return cleaned.slice(0, 140);
  }
  return null;
}

function Console({ check, isErr }: { check: CheckState; isErr: boolean }) {
  const summary = isErr ? summarizeError(check.message) : null;
  if (check.status === "running")
    return (
      <div className="flex h-full items-center justify-center gap-2 text-xs text-content-faint">
        <IconLoader2 size={14} className="animate-spin text-accent" />
        Compiling…
      </div>
    );
  return (
    <div className="flex h-full flex-col">
      {summary && (
        <div className="flex items-start gap-2 border-b border-bad/20 bg-bad/[0.07] px-4 py-2.5 text-xs text-bad">
          <IconAlertTriangle size={14} className="mt-px shrink-0" />
          <span className="font-medium text-content">{summary}</span>
        </div>
      )}
      <pre
        className={`flex-1 whitespace-pre-wrap px-4 py-3 font-mono text-xs leading-relaxed ${
          isErr ? "text-bad-text" : "text-content-muted"
        }`}
      >
        {check.message ||
          (check.status === "match"
            ? "Compiled cleanly — perfect match."
            : "No compiler output yet.")}
      </pre>
    </div>
  );
}

function DiffSkeleton({ label }: { label?: string }) {
  return (
    <div className="px-4 py-3">
      {label && (
        <div className="mb-3 flex items-center gap-2 text-xs text-content-faint">
          <IconLoader2 size={14} className="animate-spin text-accent" />
          <span>{label}</span>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-3.5 rounded"
            style={{ width: `${85 - (i % 4) * 16}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function MatchBanner({
  percent,
  firstEver,
  noHints,
  onViewDiff,
}: {
  percent: number;
  firstEver?: boolean;
  noHints?: boolean;
  onViewDiff: () => void;
}) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden p-6 text-center">
      <div className="pointer-events-none absolute inset-0 animate-success-sweep bg-gradient-to-r from-transparent theme-light:via-good/0 via-good/15 to-transparent" />
      <div className="animate-ring-burst flex h-14 w-14 items-center justify-center rounded-full theme-light:bg-good-soft/15 bg-good/15">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12.5l4.2 4.2L19 7"
            stroke="#3fb950"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="28"
            className="animate-draw-check"
          />
        </svg>
      </div>
      <div className="animate-count-pop text-lg font-bold theme-light:text-good-soft text-good">
        {firstEver ? "First match. You're decomping now." : `Perfect match — ${percent}%`}
      </div>
      <p className="max-w-sm text-sm text-content-muted">
        {firstEver
          ? "That's exactly how every function in a real decomp project gets checked in — byte for byte. You just did the real thing."
          : "Every instruction lines up with the compiler's output. This is exactly how a real decomp function gets checked in. Move on to the next lesson."}
      </p>
      {noHints && (
        <span className="inline-flex items-center gap-1.5 rounded-full border theme-light:border-amber-200 border-warn/30 theme-light:bg-amber-50 theme-light:text-amber-600 bg-warn/10 px-3 py-1 text-xs font-semibold text-warn">
          <IconBulb size={13} /> Solved with no hints
        </span>
      )}
      <button
        onClick={onViewDiff}
        className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-soft/60 px-3 py-1.5 text-xs text-content-secondary transition hover:bg-bg-softer hover:text-content-primary"
      >
        <IconGitCompare size={13} /> View diff
      </button>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition ${className} ${
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

// Pill toggle for the editor's source switcher (code ⇄ context). Same look as
// the playground's function selector.
function SourceTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-0.5 font-mono text-2xs transition ${
        active
          ? "bg-accent/15 text-accent ring-1 ring-inset ring-accent/30"
          : "text-content-muted hover:bg-bg-softer hover:text-content-primary"
      }`}
    >
      {children}
    </button>
  );
}

// Prominent, animated match metric — the dopamine surface of the whole app.
function MatchMeter({ check }: { check: CheckState }) {
  const pct = check.matchPercent ?? 0;
  const shown = useCountUp(pct);
  const diffs = check.vm?.rows.filter((r) => r.kind !== "none").length ?? 0;

  if (check.status === "running")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
        <IconLoader2 size={13} className="animate-spin" /> compiling…
      </span>
    );
  if (check.status === "match")
    return (
      <span className="inline-flex animate-count-pop items-center gap-1 rounded-full bg-good/15 theme-light:bg-good-soft/15 px-2.5 py-1 text-xs font-semibold text-good theme-light:text-good-soft">
        <IconCheck size={13} /> 100% match
      </span>
    );
  if (check.status === "compileError")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-bad/15 px-2.5 py-1 text-xs font-semibold text-bad">
        <IconAlertTriangle size={13} /> compile error
      </span>
    );
  if (check.status === "error")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-bad/15 px-2.5 py-1 text-xs font-semibold text-bad">
        <IconAlertTriangle size={13} /> error
      </span>
    );
  if (check.status === "close" && check.matchPercent !== undefined) {
    const tone = pct >= 90 ? "text-good theme-light:text-good-soft" : pct >= 60 ? "text-warn theme-light:text-amber-400" : "text-bad theme-light:text-amber-600";
    return (
      <span className="inline-flex items-baseline gap-1.5 tabular-nums">
        <span className={`text-base font-bold ${tone}`}>{shown.toFixed(1)}%</span>
        <span className="text-2xs text-content-muted">
          {diffs} {diffs === 1 ? "instr" : "instrs"} left
        </span>
      </span>
    );
  }
  return null;
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-content-faint">
      {children}
    </div>
  );
}
