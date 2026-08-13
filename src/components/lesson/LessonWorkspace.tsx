"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { preloadGlossary } from "@/components/asm-diff/glossary";
import { GlossaryProse } from "@/components/glossary/GlossaryProse";
import {
  analyze,
  preloadObjdiff,
  type Analysis,
  type Overview,
  type Seg,
} from "@/lib/objdiff/client";
import { Difficulty } from "@/components/Difficulty";
import { GRADERS } from "@/lib/lessons/graders";
import {
  loadCode,
  recordResult,
  saveCode,
  solvedWithoutHints,
  totalSolved,
  useProgress,
} from "@/lib/progress";
import { lessonPath } from "@/lib/seo";
import type { CheckState, LessonDTO, Tab } from "./types";
import { LessonConceptView } from "./LessonConceptView";
import { LessonTopBar } from "./LessonTopBar";
import { LessonHints } from "./LessonHints";
import { LessonSolutionBox } from "./LessonSolutionBox";
import { LessonSourceTab } from "./LessonSourceTab";
import { LessonResultPanel } from "./LessonResultPanel";
import { LazyCodeEditor } from "@/components/LazyCodeEditor";
import { WorkspaceResetButton } from "@/components/workspace/WorkspaceResetButton";
import { WorkspaceRunButton } from "@/components/workspace/WorkspaceRunButton";
import { SplitHandle } from "@/components/workspace/SplitHandle";
import { useSplitPane } from "@/components/workspace/useSplitPane";

const PANE_LABEL: Record<"brief" | "code" | "result", string> = {
  brief: "Brief",
  code: "Code",
  result: "Assembly",
};

export function LessonWorkspace({ lesson }: { lesson: LessonDTO }) {
  const [code, setCode] = useState(lesson.starter);
  const [check, setCheck] = useState<CheckState>({ status: "idle" });
  const [targetRows, setTargetRows] = useState<Seg[][] | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState(lesson.symbol);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [tab, setTab] = useState<Tab>("diff");
  const [editorTab, setEditorTab] = useState<"code" | "context">("code");
  const [mobilePane, setMobilePane] = useState<"brief" | "code" | "result">("brief");
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const codeRef = useRef(code);
  codeRef.current = code;
  const checkedCodeRef = useRef<string | null>(null);
  const targetB64Ref = useRef<string | null>(null);
  const userB64Ref = useRef<string | null>(null);
  const diffsRef = useRef<Analysis["diffs"]>({});
  const loadIdRef = useRef(0);
  const seededRef = useRef(code);
  const { ready: progressReady } = useProgress();
  const router = useRouter();

  const briefSplit = useSplitPane({
    storageKey: "lesson-brief",
    layout: "horizontal",
    cssVar: "--brief-w",
    defaultRatio: 0.3,
    minFirstPx: 352,
    minSecondPx: 576,
    label: "Resize the lesson brief",
  });

  const editorSplit = useSplitPane({
    storageKey: "lesson-editor",
    layout: "vertical",
    cssVar: "--editor-h",
    defaultRatio: 0.55,
    minFirstPx: 176,
    minSecondPx: 208,
    label: "Resize the code editor",
  });

  const grader = GRADERS[lesson.grader];
  const asmDialect = grader.dialect;

  const run = useCallback(
    async (opts?: { initial?: boolean }) => {
      const initial = opts?.initial ?? false;
      const myRun = loadIdRef.current;
      const codeAtRun = codeRef.current;
      setBannerDismissed(false);
      setCheck((c) => ({ status: "running", matchPercent: c.matchPercent }));
      if (!initial) {
        setTab("diff");
        setMobilePane("result");
      }
      saveCode(lesson.course, lesson.slug, codeRef.current);
      try {
        const d = await grader.compile({
          course: lesson.course,
          lesson: lesson.slug,
          code: codeAtRun,
          context: lesson.context,
        });
        if (loadIdRef.current !== myRun) return;
        if (!d.ok) {
          if (d.compileError) {
            setCheck({ status: "compileError", message: d.compileError });
          } else {
            setCheck({ status: "error", message: d.error || "Something went wrong." });
          }
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
        setSelectedSymbol(lesson.symbol);
        const vm = analysis.diffs[lesson.symbol];
        setTargetRows(vm?.targetRows ?? null);
        const exact = vm?.exact ?? false;
        const pct = vm?.matchPercent ?? 0;
        const firstEver = exact && totalSolved() === 0;
        const sessionNoHints = exact && hintsShown === 0 && !showSolution;
        if (!initial) {
          recordResult(lesson.course, lesson.slug, exact ? 100 : pct, { noHints: sessionNoHints });
        } else if (exact) {
          recordResult(lesson.course, lesson.slug, 100);
        }
        const noHints = exact && solvedWithoutHints(lesson.course, lesson.slug);
        setCheck({ status: exact ? "match" : "close", matchPercent: pct, vm, firstEver, noHints });
        setTab("diff");
      } catch {
        if (loadIdRef.current !== myRun) return;
        setCheck({ status: "error", message: "Network error talking to the compiler." });
        if (!initial) setTab("console");
      }
    },
    [lesson.slug, lesson.course, lesson.symbol, grader, lesson.context, hintsShown, showSolution],
  );
  const runRef = useRef(run);
  runRef.current = run;

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

  useEffect(() => {
    const myLoad = ++loadIdRef.current;
    const saved = loadCode(lesson.course, lesson.slug);
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
      lesson: lesson.slug,
      solution: lesson.solution,
      context: lesson.context,
    });

    loadTarget.then(async (targetB64) => {
      if (loadIdRef.current !== myLoad || !targetB64) return;
      targetB64Ref.current = targetB64;
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
    lesson.slug,
    lesson.course,
    lesson.starter,
    lesson.symbol,
    lesson.concept,
    grader,
    asmDialect,
    lesson.solution,
    lesson.context,
  ]);

  useEffect(() => {
    if (lesson.concept || !progressReady) return;
    const saved = loadCode(lesson.course, lesson.slug);
    if (!saved || saved === codeRef.current || codeRef.current !== seededRef.current) return;
    setCode(saved);
    codeRef.current = saved;
    seededRef.current = saved;
    void runRef.current({ initial: true });
  }, [progressReady, lesson.slug, lesson.course, lesson.concept]);

  const reset = () => {
    setCode(lesson.starter);
    codeRef.current = lesson.starter;
    seededRef.current = lesson.starter;
    saveCode(lesson.course, lesson.slug, lesson.starter);
    setSelectedSymbol(lesson.symbol);
    setTab("diff");
    void runRef.current({ initial: true });
  };

  if (lesson.concept) {
    return <LessonConceptView lesson={lesson} />;
  }

  const hasResult = check.status !== "idle";
  const solved =
    check.status === "match" && selectedSymbol === lesson.symbol && code === checkedCodeRef.current;
  const nextHref = lesson.next ? lessonPath(lesson.course, lesson.next.slug) : "/";
  const onRun = () => (solved ? router.push(nextHref) : run());

  // On lg the workspace is one viewport, so every level of it clips: Monaco
  // sizes its own DOM off a ResizeObserver and so trails a divider drag by a
  // frame, which would otherwise grow the document and flash its scrollbars.
  return (
    <div className="flex min-h-screen flex-col bg-bg lg:h-screen lg:overflow-hidden">
      <LessonTopBar lesson={lesson} />

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
              {PANE_LABEL[p]}
              {p === "result" && hasResult && mobilePane !== "result" && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </span>
          </button>
        ))}
      </div>

      <div
        ref={briefSplit.containerRef}
        style={briefSplit.containerStyle}
        className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[var(--brief-w)_auto_minmax(0,1fr)] lg:overflow-hidden"
      >
        <aside
          className={`min-h-0 min-w-0 flex-col border-r border-line bg-bg-soft/40 lg:flex lg:border-r-0 ${
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

            <LessonHints
              hints={lesson.hints}
              shown={hintsShown}
              onReveal={() => setHintsShown((n) => n + 1)}
              onHide={() => setHintsShown(0)}
            />

            <LessonSolutionBox
              solution={lesson.solution}
              shown={showSolution}
              onToggle={() => setShowSolution((s) => !s)}
              onUse={() => {
                setCode(lesson.solution);
                saveCode(lesson.course, lesson.slug, lesson.solution);
              }}
            />
          </div>
        </aside>

        <SplitHandle split={briefSplit} />

        <section
          className={`min-h-[70vh] min-w-0 flex-col lg:flex lg:min-h-0 lg:overflow-hidden ${
            mobilePane === "brief" ? "hidden" : "flex"
          }`}
        >
          <div className="flex items-center gap-2 border-b border-line bg-bg-soft/60 px-4 py-2">
            <span className="font-mono text-xs text-content-muted">
              match <span className="text-accent">{lesson.symbol}</span>
            </span>

            <span className="hidden items-center gap-1 rounded bg-bg-softer px-1.5 py-0.5 font-mono text-2xs text-content-faint sm:inline-flex">
              {grader.compilerLabel(lesson.opt)}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <WorkspaceResetButton onClick={reset} />

              {solved ? (
                <Link
                  href={nextHref}
                  className="inline-flex items-center gap-1.5 rounded-md bg-good theme-light:bg-good-soft px-3.5 py-1.5 text-xs font-semibold text-bg transition hover:bg-good-soft active:scale-[0.97]"
                >
                  <IconCheck size={14} />
                  {lesson.next ? "Next lesson" : "Finish"}
                  <kbd className="ml-1 hidden rounded bg-black/20 px-1 text-2xs sm:inline-block">
                    ⌘↵
                  </kbd>
                </Link>
              ) : (
                <WorkspaceRunButton
                  running={check.status === "running"}
                  disabled={check.status === "running"}
                  onClick={() => run()}
                >
                  Compile<span className="hidden sm:inline">&nbsp;&amp; Check</span>
                  <kbd className="ml-1 hidden rounded bg-black/20 px-1 text-2xs sm:inline-block">
                    ⌘↵
                  </kbd>
                </WorkspaceRunButton>
              )}
            </div>
          </div>

          <div
            ref={editorSplit.containerRef}
            style={editorSplit.containerStyle}
            className="grid min-h-0 flex-1 grid-cols-1 lg:grid-rows-[var(--editor-h)_auto_minmax(0,1fr)] lg:overflow-hidden"
          >
            <div
              className={`min-h-[340px] min-w-0 flex-col border-b border-line lg:flex lg:min-h-0 lg:overflow-hidden lg:border-b-0 ${
                mobilePane === "result" ? "hidden" : "flex"
              }`}
            >
              {lesson.context && (
                <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-bg-soft/30 px-3 py-1.5">
                  <span className="mr-1 font-mono text-2xs uppercase tracking-wider text-content-faint">
                    src
                  </span>

                  <LessonSourceTab
                    active={editorTab === "code"}
                    onClick={() => setEditorTab("code")}
                    text={`${lesson.symbol}.c`}
                  />

                  <LessonSourceTab
                    active={editorTab === "context"}
                    onClick={() => setEditorTab("context")}
                    text="context"
                  />
                </div>
              )}

              <div
                className={`min-h-0 min-w-0 flex-1 overflow-hidden ${
                  editorTab === "code" ? "" : "hidden"
                }`}
              >
                <LazyCodeEditor value={code} onChange={setCode} onRun={onRun} />
              </div>

              {editorTab === "context" && lesson.context && (
                <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                  <LazyCodeEditor value={lesson.context} readOnly />
                </div>
              )}
            </div>

            <SplitHandle split={editorSplit} />

            <LessonResultPanel
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
          </div>
        </section>
      </div>
    </div>
  );
}
