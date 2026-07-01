"use client";

import { IconAlertTriangle, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { useCountUp } from "./useCountUp";
import type { CheckState } from "./types";

type Props = { check: CheckState };

export function LessonMatchMeter({ check }: Props) {
  const pct = check.matchPercent ?? 0;
  const shown = useCountUp(pct);
  const diffs = check.vm?.rows.filter((r) => r.kind !== "none").length ?? 0;

  if (check.status === "running")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
        <IconLoader2 size={13} className="animate-spin" /> compiling…
      </span>
    );
  if (check.status === "match")
    return (
      <span className="inline-flex animate-count-pop items-center gap-1 rounded-full bg-good/15 theme-light:bg-good-soft/15 px-2.5 py-1 text-xs font-semibold text-good theme-light:text-good-soft">
        <IconCheck size={13} /> 100% match
      </span>
    );
  if (check.status === "compileError")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-bad/15 px-2.5 py-1 text-xs font-semibold text-bad">
        <IconAlertTriangle size={13} /> compile error
      </span>
    );
  if (check.status === "error")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-bad/15 px-2.5 py-1 text-xs font-semibold text-bad">
        <IconAlertTriangle size={13} /> error
      </span>
    );
  if (check.status === "close" && check.matchPercent !== undefined) {
    const tone =
      pct >= 90
        ? "text-good theme-light:text-good-soft"
        : pct >= 60
          ? "text-warn theme-light:text-amber-400"
          : "text-bad theme-light:text-amber-600";
    return (
      <span className="inline-flex items-baseline gap-1.5 tabular-nums">
        <span className={`text-base font-bold ${tone}`}>{shown.toFixed(1)}%</span>
        <span className="text-2xs text-content-muted">
          {diffs} {diffs === 1 ? "instr" : "instrs"} left
        </span>
      </span>
    );
  }
  return null;
}
