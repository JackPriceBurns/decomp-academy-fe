"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { LESSONS } from "@/lib/lessons/registry.client";
import { totalSolved, useProgress } from "@/lib/progress";
import { lessonPath } from "@/lib/seo";
import {
  FEEDBACK_PROMPT_AT,
  SIGNUP_PROMPT_AT,
  markPromptSeen,
  type PromptKind,
  wasPromptSeen,
} from "@/lib/engagement";
import { FeedbackDialog } from "./FeedbackDialog";
import { ReadingSignaturesPrompt } from "./ReadingSignaturesPrompt";
import { SignUpPrompt } from "./SignUpPrompt";

const SUPPRESS_ON = ["/login", "/register", "/confirm", "/forgot-password", "/admin"];
const SIGNATURE_COURSE = "gamecube-c";
const SIGNATURE_CHAPTER = "reading-signatures";

const signatureLessons = LESSONS.filter(
  (lesson) => lesson.course === SIGNATURE_COURSE && lesson.chapter === SIGNATURE_CHAPTER,
);
const courseLessons = LESSONS.filter((lesson) => lesson.course === SIGNATURE_COURSE);
const lastSignatureIndex = courseLessons.findLastIndex(
  (lesson) => lesson.chapter === SIGNATURE_CHAPTER,
);
const laterLessons = lastSignatureIndex < 0 ? [] : courseLessons.slice(lastSignatureIndex + 1);
const signaturePaths = new Set(
  signatureLessons.map((lesson) => lessonPath(lesson.course, lesson.slug)),
);

export function EngagementPrompts() {
  const { status } = useAuth();
  const { ready: progressReady, isSolved, bestPercent } = useProgress();
  const pathname = usePathname();
  const [active, setActive] = useState<PromptKind | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (status === "loading" || active || firedRef.current) return;
    if (SUPPRESS_ON.some((p) => pathname?.startsWith(p))) return;

    const pick = (): PromptKind | null => {
      const needsSignatureChapter =
        progressReady &&
        signatureLessons.length > 0 &&
        !signaturePaths.has(pathname) &&
        signatureLessons.some((lesson) => !isSolved(lesson.course, lesson.id)) &&
        laterLessons.some((lesson) => bestPercent(lesson.course, lesson.id) > 0);
      if (needsSignatureChapter && !wasPromptSeen("reading-signatures")) {
        return "reading-signatures";
      }

      const solved = totalSolved();
      if (status === "anon" && solved >= SIGNUP_PROMPT_AT && !wasPromptSeen("signup")) {
        return "signup";
      }
      if (solved >= FEEDBACK_PROMPT_AT && !wasPromptSeen("feedback")) {
        return "feedback";
      }
      return null;
    };

    const evaluate = () => {
      if (firedRef.current || timerRef.current) return;
      const kind = pick();
      if (!kind) return;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (firedRef.current || wasPromptSeen(kind)) return;
        firedRef.current = true;
        markPromptSeen(kind);
        setActive(kind);
      }, 1100);
    };

    evaluate();
    window.addEventListener("decomp-progress", evaluate);
    return () => {
      window.removeEventListener("decomp-progress", evaluate);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, progressReady, isSolved, bestPercent, pathname, active]);

  if (active === "reading-signatures" && signatureLessons[0]) {
    return (
      <ReadingSignaturesPrompt
        course={signatureLessons[0].course}
        firstLesson={signatureLessons[0].slug}
        onClose={() => setActive(null)}
      />
    );
  }
  if (active === "signup") return <SignUpPrompt onClose={() => setActive(null)} />;
  if (active === "feedback") {
    return (
      <FeedbackDialog
        open
        onClose={() => setActive(null)}
        source="prompt"
        heading="How's it going so far?"
        subheading="You've completed a few lessons — we'd love a quick note on how the course is working for you."
      />
    );
  }
  return null;
}
