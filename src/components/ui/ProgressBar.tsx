"use client";

import { useEffect, useState } from "react";
import { cx } from "./cx";

// Fills from 0 → pct on mount so progress visibly grows (respects reduced-motion).
export function ProgressBar({
  pct,
  className,
  barClassName = "bg-good theme-light:bg-good-soft",
  height = "h-1.5",
}: {
  pct: number;
  className?: string;
  barClassName?: string;
  height?: string;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setW(pct);
      return;
    }
    const t = requestAnimationFrame(() => setW(pct));
    return () => cancelAnimationFrame(t);
  }, [pct]);
  return (
    <div className={cx("overflow-hidden rounded-full bg-bg-inset", height, className)}>
      <div
        className={cx(
          "h-full rounded-full transition-[width] duration-700 ease-out-quint",
          barClassName,
        )}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}
