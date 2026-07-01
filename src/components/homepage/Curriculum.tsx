"use client";

import Link from "next/link";
import { useState } from "react";
import { CurriculumMap } from "./CurriculumMap";
import { MatchLog, HeatLesson } from "./MatchLog";
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
  tier: string;
  lessons: LessonLite[];
}
interface TierLite {
  id: string;
  title: string;
  blurb: string;
  order: number;
}

export interface CourseView {
  id: string;
  title: string;
  blurb: string;
  firstLessonId?: string;
  tiers: TierLite[];
  chapters: ChapterLite[];
  heatLessons: HeatLesson[];
}

type Props = { courses: CourseView[] };

export function Curriculum({ courses }: Props) {
  const [selectedId, setSelectedId] = useState(courses[0]?.id);
  const course = courses.find((c) => c.id === selectedId) ?? courses[0];
  if (!course) return null;

  return (
    <section id="curriculum" className="mx-auto max-w-5xl scroll-mt-16 px-5 pb-24 pt-14">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h2 className="text-xl font-bold text-content-bright">The Curriculum</h2>
          <p className="mt-1 text-sm text-content-muted">
            Read the asm · write the source · the compiler grades it byte-for-byte.
          </p>
        </div>

        {course.firstLessonId && (
          <Link
            href={lessonPath(course.id, course.firstLessonId)}
            className="shrink-0 text-sm text-accent transition hover:text-accent-hover hover:underline"
          >
            Jump back in →
          </Link>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Course"
        className="mb-6 inline-flex flex-wrap gap-1.5 rounded-xl bg-bg-soft/60 p-1.5"
      >
        {courses.map((c) => {
          const active = c.id === course.id;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedId(c.id)}
              title={c.blurb}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                active
                  ? "bg-accent font-semibold text-accent-on shadow-sm"
                  : "font-medium text-content-secondary hover:bg-bg-softer/60 hover:text-content-primary"
              }`}
            >
              {c.title}
              <span
                className={`ml-2 text-2xs tabular-nums ${active ? "opacity-80" : "opacity-60"}`}
              >
                {c.heatLessons.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-8">
        <MatchLog key={course.id} lessons={course.heatLessons} courseId={course.id} />
      </div>

      <CurriculumMap
        key={course.id}
        chapters={course.chapters}
        tiers={course.tiers}
        courseId={course.id}
      />
    </section>
  );
}
