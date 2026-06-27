"use client";

// One-time engagement prompts gated on how many lessons a learner has completed.
// Anonymous learners get nudged to save their progress first (lower threshold);
// everyone gets asked for feedback a little later. Each prompt is shown at most
// once per device, tracked by a localStorage flag.

export const SIGNUP_PROMPT_AT = 3; // anon: "save your progress" after N solved
export const FEEDBACK_PROMPT_AT = 5; // everyone: "how's it going" after N solved

export type PromptKind = "signup" | "feedback";

const FLAG: Record<PromptKind, string> = {
  signup: "decomp-prompt-signup-v1",
  feedback: "decomp-prompt-feedback-v1",
};

export function wasPromptSeen(kind: PromptKind): boolean {
  try {
    return localStorage.getItem(FLAG[kind]) === "1";
  } catch {
    return false;
  }
}

export function markPromptSeen(kind: PromptKind): void {
  try {
    localStorage.setItem(FLAG[kind], "1");
  } catch {
    /* ignore quota / unavailable storage */
  }
}
