export interface LessonLite {
  id: string;
  title: string;
  order: number;
  difficulty: number;
  concepts: string[];
  concept?: boolean;
}

export interface ChapterLite {
  id: string;
  title: string;
  blurb: string;
  order: number;
  tier: string;
  lessons: LessonLite[];
}

export interface TierLite {
  id: string;
  title: string;
  blurb: string;
  order: number;
}

export const chapterKey = (c: { tier: string; id: string }) => `${c.tier}/${c.id}`;
