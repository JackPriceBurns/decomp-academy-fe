"use client";

import Link from "next/link";
import { IconBook2, IconCircleCheckFilled, IconCircleDashed } from "@tabler/icons-react";
import { useProgress } from "@/lib/progress";
import { lessonPath } from "@/lib/seo";
import { Difficulty } from "@/components/Difficulty";
import type { LessonLite } from "./types";

type Props = {
  courseId: string;
  lesson: LessonLite;
  isResume: boolean;
};

export function CurriculumLessonRow({ courseId, lesson, isResume }: Props) {
  const { bestPercent } = useProgress();
  const pct = bestPercent(courseId, lesson.id);
  const ok = pct >= 100;
  return (
    <Link
      href={lessonPath(courseId, lesson.id)}
      className="group flex items-center gap-3 border-b border-line/50 px-5 py-3 last:border-0 transition hover:bg-bg-softer/40"
    >
      {ok ? (
        <IconCircleCheckFilled size={18} className="shrink-0 text-good-soft" />
      ) : lesson.concept ? (
        <IconBook2 size={18} className="shrink-0 text-content-faint" />
      ) : pct > 0 ? (
        <IconCircleDashed size={18} className="shrink-0 text-warn theme-light:text-amber-500" />
      ) : (
        <IconCircleDashed size={18} className="shrink-0 text-content-ghost" />
      )}
      <span className="flex-1 text-sm text-content transition group-hover:translate-x-0.5 group-hover:text-content-primary">
        {lesson.title}
      </span>
      {isResume && (
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-2xs font-semibold text-accent">
          Resume
        </span>
      )}
      {lesson.concept ? (
        <span className="text-2xs uppercase tracking-wide text-content-faint">Concept</span>
      ) : (
        <Difficulty level={lesson.difficulty} />
      )}
      {pct > 0 && !ok && <span className="text-xs tabular-nums text-warn">{pct}%</span>}
    </Link>
  );
}
