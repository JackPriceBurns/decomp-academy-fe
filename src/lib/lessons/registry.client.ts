// Client-safe, slim view of the lesson list. Carries only the metadata the
// browser needs for navigation and progress — no briefs, solutions, or any
// server-only imports. The slim list is compiled from the Markdown tree by
// scripts/build-curriculum.mjs and is already in canonical order.
import slim from "@/curriculum/generated/lessons.client.json";
import { CHAPTERS } from "@/curriculum/chapters";
import { COURSES, DEFAULT_COURSE } from "@/curriculum/courses";

export interface LessonMeta {
  id: string;
  /** Stable backend/storage key (UUIDv5); see LessonSource.progressId. */
  progressId: string;
  /** id of the enclosing course. */
  course: string;
  title: string;
  chapter: string;
  order: number;
  difficulty: number;
  concepts: string[];
  concept?: boolean;
}

export const LESSONS = slim as unknown as LessonMeta[];

export { CHAPTERS, COURSES, DEFAULT_COURSE };
