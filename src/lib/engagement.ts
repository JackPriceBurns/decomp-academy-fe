"use client";

export const SIGNUP_PROMPT_AT = 5; // anon: "save your progress" after N solved
export const FEEDBACK_PROMPT_AT = 8; // everyone: "how's it going" after N solved

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
