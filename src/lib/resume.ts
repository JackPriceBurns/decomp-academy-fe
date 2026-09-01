"use client";

// Where to drop the learner back in. Everything that points "back at the
// curriculum" — the home page's course tabs, the hero's resume button, a
// lesson's back link — goes through here, so none of them assume the first
// course.

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_COURSE, LESSONS, type LessonMeta } from "@/lib/lessons/registry.client";
import { lastLesson, useProgress, type LastLesson } from "@/lib/progress";

// The lesson to resume *within* a course. The learner's last lesson wins while
// it's still unmatched — they may well have skipped ahead of the first gap —
// and once it's matched we walk forward to the next thing they haven't matched.
export function resumeLesson(
  course: string,
  bestPercent: (course: string, slug: string) => number,
  last?: LastLesson | null,
): LessonMeta | undefined {
  const inCourse = LESSONS.filter((l) => l.course === course);
  const unmatched = (l: LessonMeta) => bestPercent(l.course, l.slug) < 100;

  if (last?.course === course) {
    const i = inCourse.findIndex((l) => l.slug === last.slug);
    if (i >= 0) {
      const next = inCourse.slice(i).find(unmatched);
      if (next) return next;
    }
  }
  // Nothing to go on (or the course is finished): first gap, else its last lesson.
  return inCourse.find(unmatched) ?? inCourse[inCourse.length - 1];
}

// Reads only after mount — the signal lives in localStorage and in the progress
// map, neither of which exists during SSR — and refreshes when progress
// hydrates, since signing in can reveal newer work than this device has seen.
function useLastLesson(): LastLesson | null {
  const [last, setLast] = useState<LastLesson | null>(null);
  useEffect(() => {
    const read = () => setLast(lastLesson());
    read();
    window.addEventListener("decomp-progress", read);
    return () => window.removeEventListener("decomp-progress", read);
  }, []);
  return last;
}

// `course` omitted → the learner's own course (the default one until we know
// better). Pass a course id to ask "where would they resume in *this* course".
export function useResume(course?: string) {
  const { bestPercent } = useProgress();
  const last = useLastLesson();
  const courseId = course ?? last?.course ?? DEFAULT_COURSE.id;
  const lesson = useMemo(
    () => resumeLesson(courseId, bestPercent, last),
    [courseId, bestPercent, last],
  );
  return { course: courseId, lesson, last };
}
