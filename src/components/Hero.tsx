"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  IconArrowRight,
  IconBolt,
  IconGitMerge,
  IconCheck,
  IconBrandGithub,
} from "@tabler/icons-react";
import { useProgress } from "@/lib/progress";
import { LESSONS } from "@/lib/lessons/registry.client";
import { ProgressBar } from "@/components/ui";
import { lessonPath } from "@/lib/seo";

export function Hero({
  total,
  firstLesson,
}: {
  total: number;
  firstLesson?: { id: string; course: string };
}) {
  const { bestPercent } = useProgress();
  const solvedCount = LESSONS.filter((l) => bestPercent(l.course, l.id) >= 100).length;
  const pct = total ? Math.round((solvedCount / total) * 100) : 0;

  // Resume at the first unsolved lesson if we have progress, else the first lesson.
  const resume = LESSONS.find((l) => bestPercent(l.course, l.id) < 100) ?? firstLesson;
  const resumeHref = resume ? lessonPath(resume.course, resume.id) : "#";

  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="grid-dots absolute inset-0 opacity-40" />
      {/* GameCube-indigo glows for a richer, less-flat backdrop. */}
      <div className="absolute -top-32 left-1/3 h-72 w-[34rem] -translate-x-1/2 rounded-full theme-light:bg-accent/10 bg-accent/20 blur-[120px]" />
      <div className="absolute -top-24 right-0 h-64 w-[28rem] rounded-full theme-light:bg-[#4f3d8c]/15 bg-[#4f3d8c]/25 blur-[130px]" />

      <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-20">
        <div>
          <h1 className="max-w-xl text-2xl font-bold leading-snug tracking-tight text-content-bright sm:text-3xl">
            Decompile retro-game assembly into{" "}
            <span className="bg-gradient-to-r from-accent to-accent-grad bg-clip-text font-mono text-transparent">
              byte-matching C.
            </span>
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-content-secondary">
            Go from never having read a register to matching real functions from{" "}
            <span className="text-content">GameCube and Game Boy Advance</span> games —
            instruction for instruction. You write C, the{" "}
            <span className="text-content">original compiler</span> grades it live.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={resumeHref}
              className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-accent-on shadow-lg shadow-accent/20 transition hover:-translate-y-px hover:bg-accent-hover active:translate-y-0 active:scale-[0.98]"
            >
              {solvedCount > 0 ? "Resume training" : "Start from zero"}
              <IconArrowRight size={18} className="transition group-hover:translate-x-0.5" />
            </Link>
            <div className="flex items-center gap-5 rounded-lg bg-bg-soft/70 px-5 py-3 text-sm backdrop-blur">
              <Stat icon={<IconBolt size={16} className="text-warn" />} label="Lessons" value={`${total}`} />
              <div className="h-8 w-px bg-line" />
              <Stat icon={<IconGitMerge size={16} className="text-good theme-light:text-good-soft" />} label="Solved" value={`${solvedCount}`} />
              <div className="h-8 w-px bg-line" />
              <div className="min-w-[7rem]">
                <div className="mb-1 flex justify-between text-xs text-content-muted">
                  <span>Mastery</span>
                  <span>{pct}%</span>
                </div>
                <ProgressBar
                  pct={pct}
                  barClassName="bg-gradient-to-r from-good to-accent"
                  className="w-full bg-line/70"
                />
              </div>
            </div>
          </div>

          {/* Trust strip — pull the real credibility out of the footer. */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-content-faint">
            <span className="inline-flex items-center gap-1.5">
              <IconCheck size={13} className="text-good theme-light:text-good-soft" /> Graded by the
              original compilers
            </span>
            <a
              href="https://decomp.dev"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-content-muted"
            >
              <IconBrandGithub size={13} /> Functions from real open-source decomps
            </a>
          </div>
        </div>

        <MatchPreview />
      </div>
    </header>
  );
}

// A self-contained mock of the core loop: target asm vs. your output, animating
// from "almost" to a clean byte-match. This is the product in one glance.
function MatchPreview() {
  const [matched, setMatched] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // show the resolved end-state statically
    setMatched(false);
    const t = setTimeout(() => setMatched(true), 1400);
    return () => clearTimeout(t);
  }, []);

  // [target, your-output, matchesWhenResolved]
  const rows: [string, string, boolean][] = [
    ["lwz       r0, 0x0(r3)", "lwz       r0, 0x0(r3)", true],
    ["lfs       f1, 0x4(r3)", "lfs       f1, 0x4(r3)", true],
    ["fmuls     f0, f0, f1", "fmadds    f0, f0, f1, f2", false],
    ["fadds     f0, f0, f2", "fadds     f0, f0, f2", false],
    ["stfs      f0, 0x0(r4)", "stfs      f0, 0x0(r4)", true],
    ["blr", "blr", true],
  ];

  return (
    <div className="animate-slide-up-fade overflow-hidden rounded-xl theme-light:bg-white bg-bg-inset/90 theme-light:shadow-lg shadow-2xl ring-1 ring-white/5 backdrop-blur lg:translate-y-0">
      <div className="flex items-center gap-2 border-b border-line bg-bg-soft/80 px-3.5 py-2">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-good/70 theme-light:bg-good-soft/70" />
        </span>
        <span className="ml-1 font-mono text-2xs text-content-muted">match Vec_Normalize</span>
        <span
          className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold transition-colors duration-500 ${
            matched ? "bg-good/15 theme-light:bg-good-soft/15 text-good theme-light:text-good-soft" : "bg-warn/15 theme-light:bg-amber-50 text-warn theme-light:text-amber-500"
          }`}
        >
          {matched ? (
            <>
              <IconCheck size={11} /> 100% byte-match
            </>
          ) : (
            <>87.5% — 2 instrs left</>
          )}
        </span>
      </div>
      <div className="grid grid-cols-2 font-mono text-[11px] leading-none">
        <div className="border-r border-line/60 px-3 py-1.5 text-2xs uppercase tracking-wider text-content-faint">
          Target
        </div>
        <div className="px-3 py-1.5 text-2xs uppercase tracking-wider text-content-faint">
          Your output
        </div>
        {rows.map(([t, y, ok], i) => {
          const isMatch = ok || matched;
          return (
            <div key={i} className="contents">
              <div
                className={`border-t border-line/40 px-3 py-1.5 transition-colors duration-500 ${
                  isMatch ? "" : "bg-warn/[0.07]"
                } text-content-secondary`}
              >
                {t}
              </div>
              <div
                className={`border-t border-line/40 px-3 py-1.5 transition-colors duration-500 ${
                  isMatch ? "text-good theme-light:text-good-soft" : "bg-bad/10 text-bad"
                }`}
              >
                {matched ? t : y}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <div className="font-bold leading-none text-content-primary">{value}</div>
        <div className="text-xs text-content-muted">{label}</div>
      </div>
    </div>
  );
}
