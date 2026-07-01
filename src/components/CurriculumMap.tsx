"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconChevronDown,
  IconCircleCheckFilled,
  IconCircleDashed,
  IconBook2,
  IconClock,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { useProgress } from "@/lib/progress";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { lessonPath } from "@/lib/seo";

interface LessonLite {
  id: string;
  title: string;
  order: number;
  difficulty: number;
  concepts: string[];
  concept?: boolean;
}
interface ChapterLite {
  id: string;
  title: string;
  blurb: string;
  order: number;
  /** id of the parent tier — drives the curriculum-map grouping. */
  tier: string;
  lessons: LessonLite[];
}
// The "acts" of the map. Defined by src/curriculum/<NN>-<id>/_tier.md, so
// grouping and order come from the folder tree — there is no range to keep in
// sync when chapters are added or renumbered.
interface TierLite {
  id: string;
  title: string;
  blurb: string;
  order: number;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const toRoman = (n: number) => ROMAN[n - 1] ?? String(n);

// Rough time-to-complete so a chapter reads as a commitment, not a void.
function estMinutes(l: LessonLite) {
  return l.concept ? 3 : 3 + l.difficulty * 2;
}
function chapterMinutes(c: ChapterLite) {
  return c.lessons.reduce((s, l) => s + estMinutes(l), 0);
}

export function CurriculumMap({
  chapters,
  tiers,
  courseId,
}: {
  chapters: ChapterLite[];
  tiers: TierLite[];
  /** Course these chapters belong to — scopes the lesson links. */
  courseId: string;
}) {
  const { isSolved, bestPercent } = useProgress();

  // A chapter id is only unique within its tier (e.g. two "finale" chapters), so
  // expand-state and the resume highlight are keyed by tier+id, not bare id —
  // otherwise toggling one "finale" would toggle the other.
  const ckey = (c: { tier: string; id: string }) => `${c.tier}/${c.id}`;

  // The single lesson the learner should do next: first not-yet-solved, in order.
  const ordered = useMemo(
    () => chapters.flatMap((c) => c.lessons.map((l) => ({ chapterKey: ckey(c), lessonId: l.id }))),
    [chapters],
  );
  const resume = ordered.find((x) => bestPercent(courseId, x.lessonId) < 100) ?? ordered[0];

  // Start with nothing forced open (matches SSR, before localStorage progress
  // loads). Until the learner manually toggles a chapter, keep exactly the first
  // not-fully-complete chapter open — completed chapters stay collapsed. `resume`
  // updates once progress loads and as lessons get solved, and this follows it.
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const userToggled = useRef(false);
  useEffect(() => {
    if (userToggled.current || !resume) return;
    setOpen({ [resume.chapterKey]: true });
  }, [resume]);

  return (
    <div className="space-y-8">
      <Legend />
      {tiers.map((tier) => {
        const tierChapters = chapters.filter((c) => c.tier === tier.id);
        if (!tierChapters.length) return null;
        const tierLessons = tierChapters.flatMap((c) => c.lessons);
        const tierSolved = tierLessons.filter((l) => isSolved(courseId, l.id)).length;
        const tierDone = tierLessons.length > 0 && tierSolved === tierLessons.length;
        return (
          <section key={tier.id}>
            <div className="mb-3 flex items-center gap-3">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs font-bold ${
                  tierDone
                    ? "bg-good/15 theme-light:bg-good-soft/15 text-good theme-light:text-good-soft"
                    : "bg-accent/10 text-accent"
                }`}
              >
                {toRoman(tier.order)}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold uppercase tracking-wide text-content-secondary">
                  {tier.title}
                </div>
                <div className="text-xs text-content-muted">{tier.blurb}</div>
              </div>
              <span className="text-xs tabular-nums text-content-muted">
                {tierSolved}/{tierLessons.length}
              </span>
            </div>
            <div className="space-y-3 border-l border-line/60 pl-4">
              {tierChapters.map((chapter, ci) => {
                const globalIdx = chapters.indexOf(chapter);
                const key = ckey(chapter);
                const solved = chapter.lessons.filter((l) => isSolved(courseId, l.id)).length;
                const done = solved === chapter.lessons.length;
                const isOpen = open[key];
                const hasResume = key === resume?.chapterKey;
                return (
                  <div
                    key={key}
                    className={`overflow-hidden rounded-xl transition-colors ${
                      // In light mode the active chapter drops its accent tint and
                      // matches the inactive surface (the "Continue here" pill still marks it).
                      hasResume ? "bg-accent/[0.07] theme-light:bg-bg-soft/60" : "bg-bg-soft/60"
                    }`}
                  >
                    <button
                      onClick={() => {
                        userToggled.current = true;
                        setOpen((o) => ({ ...o, [key]: !o[key] }));
                      }}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-bg-softer/50"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                          done
                            ? "bg-good/15 theme-light:bg-good-soft/15 text-good theme-light:text-good-soft"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {done ? <IconCircleCheckFilled size={18} /> : globalIdx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 font-semibold text-content-primary">
                          {chapter.title}
                          {hasResume && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-2xs font-semibold text-accent">
                              <IconPlayerPlayFilled size={9} /> Continue here
                            </span>
                          )}
                        </div>
                        <div className="truncate text-sm text-content-muted">{chapter.blurb}</div>
                      </div>
                      <div className="hidden items-center gap-3 sm:flex">
                        <span className="inline-flex items-center gap-1 text-2xs text-content-faint">
                          <IconClock size={12} /> ~{chapterMinutes(chapter)}m
                        </span>
                        <span className="text-xs tabular-nums text-content-muted">
                          {solved}/{chapter.lessons.length}
                        </span>
                        <ProgressBar
                          pct={(solved / chapter.lessons.length) * 100}
                          className="w-20"
                        />
                      </div>
                      <IconChevronDown
                        size={18}
                        className={`shrink-0 text-content-muted transition duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {/* grid-rows trick gives a real animated height collapse. */}
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out-quint ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-line theme-light:border-line-faint">
                          {chapter.lessons.map((l) => {
                            const pct = bestPercent(courseId, l.id);
                            const ok = pct >= 100;
                            const isResume = l.id === resume?.lessonId;
                            return (
                              <Link
                                key={l.id}
                                href={lessonPath(courseId, l.id)}
                                className="group flex items-center gap-3 border-b border-line/50 px-5 py-3 last:border-0 transition hover:bg-bg-softer/40"
                              >
                                {ok ? (
                                  <IconCircleCheckFilled
                                    size={18}
                                    className="shrink-0 text-good-soft"
                                  />
                                ) : l.concept ? (
                                  <IconBook2 size={18} className="shrink-0 text-content-faint" />
                                ) : pct > 0 ? (
                                  <IconCircleDashed
                                    size={18}
                                    className="shrink-0 text-warn theme-light:text-amber-500"
                                  />
                                ) : (
                                  <IconCircleDashed
                                    size={18}
                                    className="shrink-0 text-content-ghost"
                                  />
                                )}
                                <span className="flex-1 text-sm text-content transition group-hover:translate-x-0.5 group-hover:text-content-primary">
                                  {l.title}
                                </span>
                                {isResume && (
                                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-2xs font-semibold text-accent">
                                    Resume
                                  </span>
                                )}
                                {l.concept ? (
                                  <span className="text-2xs uppercase tracking-wide text-content-faint">
                                    Concept
                                  </span>
                                ) : (
                                  <Difficulty level={l.difficulty} />
                                )}
                                {pct > 0 && !ok && (
                                  <span className="text-xs tabular-nums text-warn">{pct}%</span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-bg-soft/50 px-4 py-2.5 text-2xs text-content-muted">
      <span className="inline-flex items-center gap-1.5">
        <IconCircleCheckFilled size={14} className="text-good theme-light:text-good-soft" /> Solved
      </span>
      <span className="inline-flex items-center gap-1.5">
        <IconCircleDashed size={14} className="text-warn" /> Attempted
      </span>
      <span className="inline-flex items-center gap-1.5">
        <IconCircleDashed size={14} className="text-content-ghost" /> Not started
      </span>
      <span className="inline-flex items-center gap-1.5">
        <IconBook2 size={14} className="text-content-faint" /> Concept (reading)
      </span>
      <span className="ml-auto inline-flex items-center gap-1.5">
        <Difficulty level={3} /> Difficulty 1–5
      </span>
    </div>
  );
}

export function Difficulty({ level }: { level: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      title={`Difficulty ${level}/5`}
      role="img"
      aria-label={`Difficulty ${level} of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i <= level ? "bg-accent/80" : "bg-line-strong theme-light:bg-line-faint"}`}
        />
      ))}
    </span>
  );
}
