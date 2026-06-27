"use client";

import { api } from "@/lib/auth/api";
import { LESSONS } from "@/lib/lessons/registry.client";
import type { Sentiment } from "@/lib/feedback";

// Server stores feedback keyed by the lesson's progressId; resolve it back to a
// human title the same way the stats page does.
const TITLE_BY_PID = new Map(LESSONS.map((l) => [l.progressId, l.title]));

export interface FeedbackItem {
  id: string;
  lessonId?: string;
  lessonTitle?: string;
  sentiment?: Sentiment;
  message?: string;
  email?: string;
  source?: string;
  createdAt: string;
}

export interface FeedbackRow extends FeedbackItem {
  /** Display label for the lesson (stored title → registry title → "General"). */
  lesson: string;
}

export async function getFeedback(): Promise<FeedbackRow[]> {
  const { items } = await api<{ items: FeedbackItem[] }>("/feedback");
  return items.map((f) => ({
    ...f,
    lesson:
      f.lessonTitle ??
      (f.lessonId ? TITLE_BY_PID.get(f.lessonId) ?? f.lessonId : "General"),
  }));
}

export async function deleteFeedback(id: string): Promise<void> {
  await api(`/feedback/${encodeURIComponent(id)}`, { method: "DELETE" });
}
