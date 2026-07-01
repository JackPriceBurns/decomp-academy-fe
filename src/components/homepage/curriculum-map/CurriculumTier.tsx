"use client";

import { useProgress } from "@/lib/progress";
import type { ChapterLite, TierLite } from "./types";
import { chapterKey } from "./types";
import { CurriculumChapter } from "./CurriculumChapter";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const toRoman = (n: number) => ROMAN[n - 1] ?? String(n);

type Props = {
  tier: TierLite;
  chapters: ChapterLite[];
  courseId: string;
  open: Record<string, boolean>;
  resumeChapterKey?: string;
  resumeLessonId?: string;
  onToggle: (key: string) => void;
};

export function CurriculumTier({
  tier,
  chapters,
  courseId,
  open,
  resumeChapterKey,
  resumeLessonId,
  onToggle,
}: Props) {
  const { isSolved } = useProgress();
  const tierChapters = chapters.filter((c) => c.tier === tier.id);
  if (!tierChapters.length) return null;
  const tierLessons = tierChapters.flatMap((c) => c.lessons);
  const tierSolved = tierLessons.filter((l) => isSolved(courseId, l.id)).length;
  const tierDone = tierLessons.length > 0 && tierSolved === tierLessons.length;
  return (
    <section>
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
        {tierChapters.map((chapter) => {
          const key = chapterKey(chapter);
          return (
            <CurriculumChapter
              key={key}
              courseId={courseId}
              chapter={chapter}
              number={chapters.indexOf(chapter) + 1}
              isOpen={!!open[key]}
              hasResume={key === resumeChapterKey}
              resumeLessonId={resumeLessonId}
              onToggle={() => onToggle(key)}
            />
          );
        })}
      </div>
    </section>
  );
}
