"use client";

import { IconAlertTriangle, IconCheck } from "@tabler/icons-react";
import { useCountUp } from "./useCountUp";
import type { CheckState } from "./types";
import { Pill } from "@/components/ui/Pill";

type Props = { check: CheckState };

export function LessonMatchMeter({ check }: Props) {
  const pct = check.matchPercent ?? 0;
  const shown = useCountUp(pct);
  const diffs = check.vm?.rows.filter((r) => r.kind !== "none").length ?? 0;

  if (check.status === "running") {
    return (
      <Pill text="compiling" loading={true} variant="accent"/>
    );
  }

  if (check.status === "match") {
    return (
      <Pill text="100% match" icon={IconCheck} variant="success"/>
    );
  }

  if (check.status === "compileError") {
    return (
      <Pill text="compile error" icon={IconAlertTriangle} variant="danger"/>
    );
  }

  if (check.status === "error") {
    return (
      <Pill text="error" icon={IconAlertTriangle} variant="danger"/>
    );
  }

  if (check.status === "close" && check.matchPercent !== undefined) {
    const variant = pct >= 90 ? "success" : pct >= 60 ? "warning" : "danger";

    return (
      <Pill text={`${shown.toFixed(1)}% - ${diffs} ${diffs === 1 ? "instr" : "instrs"} left`} variant={variant} />
    );
  }

  return null;
}
