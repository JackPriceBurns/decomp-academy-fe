"use client";

import type { ReactNode } from "react";
import { cx } from "./cx";

type BadgeTone = "accent" | "muted" | "good" | "warn" | "bad";

const BADGE_TONE: Record<BadgeTone, string> = {
  accent: "bg-accent/10 text-accent",
  muted: "bg-bg-softer text-content-muted",
  good: "bg-good/15 theme-light:bg-good-soft/15 text-good theme-light:text-good-soft",
  warn: "bg-warn/15 text-warn",
  bad: "bg-bad/15 text-bad",
};

export function Badge({
  tone = "muted",
  mono = false,
  className,
  children,
}: {
  tone?: BadgeTone;
  mono?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-2xs font-medium",
        mono && "font-mono",
        BADGE_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
