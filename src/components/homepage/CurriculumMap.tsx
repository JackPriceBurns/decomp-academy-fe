"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useProgress } from "@/lib/progress";
import { CurriculumLegend } from "./CurriculumLegend";
import type { ChapterLite, TierLite } from "./curriculum-map/types";
import { chapterKey } from "./curriculum-map/types";
import { CurriculumTier } from "./curriculum-map/CurriculumTier";

type Props = {
  chapters: ChapterLite[];
  tiers: TierLite[];
  courseId: string;
};

export function CurriculumMap({ chapters, tiers, courseId }: Props) {
  const { bestPercent } = useProgress();

  const ordered = useMemo(
    () =>
      chapters.flatMap((c) =>
        c.lessons.map((l) => ({ chapterKey: chapterKey(c), lessonId: l.id })),
      ),
    [chapters],
  );
  const resume = ordered.find((x) => bestPercent(courseId, x.lessonId) < 100) ?? ordered[0];

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const userToggled = useRef(false);
  useEffect(() => {
    if (userToggled.current || !resume) return;
    setOpen({ [resume.chapterKey]: true });
  }, [resume]);

  const toggle = (key: string) => {
    userToggled.current = true;
    setOpen((o) => ({ ...o, [key]: !o[key] }));
  };

  return (
    <div className="space-y-8">
      <CurriculumLegend />
      {tiers.map((tier) => (
        <CurriculumTier
          key={tier.id}
          tier={tier}
          chapters={chapters}
          courseId={courseId}
          open={open}
          resumeChapterKey={resume?.chapterKey}
          resumeLessonId={resume?.lessonId}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}
