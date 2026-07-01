"use client";

import { API_URL } from "@/lib/api-url";
import { LESSONS } from "@/lib/lessons/registry.client";

export type Sentiment = "good" | "confusing" | "bug";

// Where the feedback was given: the per-lesson help symbol, or a global prompt.
export type FeedbackSource = "lesson" | "prompt";

// Progress is keyed by progressId everywhere it's stored (see lib/progress.ts);
// resolve the human slug the UI passes us so admin feedback joins the same key.
// A slug is only unique within its course, so the map is keyed by "<course>/<slug>"
// — keying by bare slug would collapse same-slug lessons from different courses
// onto one progressId and misattribute their feedback.
const SLUG_TO_PID = new Map(LESSONS.map((l) => [`${l.course}/${l.id}`, l.progressId]));

export interface FeedbackPayload {
  /** id of the lesson's course (paired with lessonId to resolve the progressId). */
  course?: string;
  /** Human slug of the lesson (omitted for general feedback). */
  lessonId?: string;
  lessonTitle?: string;
  sentiment?: Sentiment;
  message?: string;
  email?: string;
  source: FeedbackSource;
}

// Submit feedback to the unauthenticated /feedback endpoint — anonymous learners
// give feedback too, so this mirrors recordCompile's same-origin-free POST rather
// than the authed `api()` helper. Throws on a non-2xx so the dialog can surface it.
export async function submitFeedback(p: FeedbackPayload): Promise<void> {
  const lessonId =
    p.lessonId && p.course
      ? (SLUG_TO_PID.get(`${p.course}/${p.lessonId}`) ?? p.lessonId)
      : p.lessonId;

  const res = await fetch(`${API_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lessonId,
      lessonTitle: p.lessonTitle,
      sentiment: p.sentiment,
      message: p.message?.trim() || undefined,
      email: p.email?.trim() || undefined,
      source: p.source,
    }),
  });

  if (!res.ok) {
    let message = "Couldn't send your feedback. Please try again.";
    try {
      const body = await res.json();
      message = body.error?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }
}
