"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { totalSolved } from "@/lib/progress";
import {
  FEEDBACK_PROMPT_AT,
  SIGNUP_PROMPT_AT,
  markPromptSeen,
  wasPromptSeen,
} from "@/lib/engagement";
import { FeedbackDialog } from "./FeedbackDialog";
import { SignUpPrompt } from "./SignUpPrompt";

// Routes where an interrupting popup would be unwelcome (auth flows, admin).
const SUPPRESS_ON = ["/login", "/register", "/confirm", "/forgot-password", "/admin"];

// Drives the one-time engagement popups. Mounted once near the root so it can
// watch progress across the whole app: anonymous learners are nudged to save
// their progress (sign up) at SIGNUP_PROMPT_AT; everyone is asked for feedback
// at FEEDBACK_PROMPT_AT. Each kind shows at most once per device, and at most
// one prompt fires per session so they never stack up.
export function EngagementPrompts() {
  const { status } = useAuth();
  const pathname = usePathname();
  const [active, setActive] = useState<null | "signup" | "feedback">(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (status === "loading" || active || firedRef.current) return;
    if (SUPPRESS_ON.some((p) => pathname?.startsWith(p))) return;

    const pick = (): "signup" | "feedback" | null => {
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
      // Small delay so a prompt triggered by *completing* a lesson lands just
      // after the match celebration rather than on top of it.
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
  }, [status, pathname, active]);

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
