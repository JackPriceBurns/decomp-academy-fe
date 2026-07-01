"use client";

import {
  IconChevronDown,
  IconCircleCheckFilled,
  IconClock,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { useProgress } from "@/lib/progress";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { ChapterLite, LessonLite } from "./types";
import { CurriculumLessonRow } from "./CurriculumLessonRow";

function estMinutes(l: LessonLite) {
  return l.concept ? 3 : 3 + l.difficulty * 2;
}
function chapterMinutes(c: ChapterLite) {
  return c.lessons.reduce((s, l) => s + estMinutes(l), 0);
}

type Props = {
  courseId: string;
  chapter: ChapterLite;
  number: number;
  isOpen: boolean;
  hasResume: boolean;
  resumeLessonId?: string;
  onToggle: () => void;
};

export function CurriculumChapter({
  courseId,
  chapter,
  number,
  isOpen,
  hasResume,
  resumeLessonId,
  onToggle,
}: Props) {
  const { isSolved } = useProgress();
  const solved = chapter.lessons.filter((l) => isSolved(courseId, l.id)).length;
  const done = solved === chapter.lessons.length;
  return (
    <div
      className={`overflow-hidden rounded-xl transition-colors ${
        hasResume ? "bg-accent/[0.07] theme-light:bg-bg-soft/60" : "bg-bg-soft/60"
      }`}
    >
      <button
        onClick={onToggle}
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
          {done ? <IconCircleCheckFilled size={18} /> : number}
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
          <ProgressBar pct={(solved / chapter.lessons.length) * 100} className="w-20" />
        </div>
        <IconChevronDown
          size={18}
          className={`shrink-0 text-content-muted transition duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out-quint ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-line theme-light:border-line-faint">
            {chapter.lessons.map((l) => (
              <CurriculumLessonRow
                key={l.id}
                courseId={courseId}
                lesson={l}
                isResume={l.id === resumeLessonId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
