"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowLeft, IconArrowRight, IconHelpCircle } from "@tabler/icons-react";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { lessonPath } from "@/lib/seo";
import type { LessonDTO } from "./types";

type Props = { lesson: LessonDTO };

export function LessonTopBar({ lesson }: Props) {
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

        <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-content-primary">
          {lesson.title}
        </h1>

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
