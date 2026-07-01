"use client";

import Link from "next/link";
import { IconArrowRight, IconBook2, IconCheck } from "@tabler/icons-react";
import { GlossaryProse } from "@/components/glossary/GlossaryProse";
import { recordResult } from "@/lib/progress";
import { lessonPath } from "@/lib/seo";
import type { LessonDTO } from "./types";
import { LessonTopBar } from "./LessonTopBar";

type Props = { lesson: LessonDTO };

export function LessonConceptView({ lesson }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-bg lg:h-screen">
      <LessonTopBar lesson={lesson} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="mb-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
              <IconBook2 size={14} /> {lesson.chapterTitle}
            </span>
            <span className="text-xs text-content-muted">Concept · no code to write</span>
          </div>
          <GlossaryProse
            className="prose-lesson animate-slide-up-fade rounded-2xl border border-line bg-bg-soft/40 px-6 py-7 sm:px-9 sm:py-9"
            html={lesson.briefHtml}
          />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <span className="text-sm text-content-muted">Got it? Lock it in and move on.</span>
            {lesson.next ? (
              <Link
                href={lessonPath(lesson.course, lesson.next.id)}
                onClick={() => recordResult(lesson.course, lesson.id, 100)}
                className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-on transition hover:bg-accent-hover active:scale-[0.98]"
              >
                <IconCheck size={17} /> Mark read &amp; continue
                <IconArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <Link
                href="/"
                onClick={() => recordResult(lesson.course, lesson.id, 100)}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-on transition hover:bg-accent-hover active:scale-[0.98]"
              >
                <IconCheck size={17} /> Finish
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
