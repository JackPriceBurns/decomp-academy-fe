import { ALL_LESSON_SOURCES } from "@/curriculum";
import { CHAPTERS, CHAPTER_BY_ID } from "@/curriculum/chapters";
import { TIERS, TIER_BY_ID } from "@/curriculum/tiers";
import { LessonSource } from "./types";

const chapterOrder = new Map(CHAPTERS.map((c) => [c.id, c.order]));

// Canonical, fully-ordered lesson list (chapter order, then in-chapter order).
export const LESSONS: LessonSource[] = [...ALL_LESSON_SOURCES].sort((a, b) => {
  const ca = chapterOrder.get(a.chapter) ?? 999;
  const cb = chapterOrder.get(b.chapter) ?? 999;
  if (ca !== cb) return ca - cb;
  return a.order - b.order;
});

const byId = new Map(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: string): LessonSource | undefined {
  return byId.get(id);
}

export function lessonIndex(id: string): number {
  return LESSONS.findIndex((l) => l.id === id);
}

export function adjacentLessons(id: string): {
  prev?: LessonSource;
  next?: LessonSource;
} {
  const i = lessonIndex(id);
  return {
    prev: i > 0 ? LESSONS[i - 1] : undefined,
    next: i >= 0 && i < LESSONS.length - 1 ? LESSONS[i + 1] : undefined,
  };
}

export interface ChapterWithLessons {
  id: string;
  title: string;
  blurb: string;
  order: number;
  tier: string;
  lessons: LessonSource[];
}

export function chaptersWithLessons(): ChapterWithLessons[] {
  return CHAPTERS.map((c) => ({
    ...c,
    lessons: LESSONS.filter((l) => l.chapter === c.id),
  }));
}

export { CHAPTERS, CHAPTER_BY_ID, TIERS, TIER_BY_ID };
