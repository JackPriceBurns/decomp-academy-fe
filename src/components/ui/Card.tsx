"use client";

import type { ReactNode } from "react";
import { cx } from "./cx";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx("overflow-hidden rounded-xl bg-bg-soft/70", className)}>{children}</div>
  );
}
