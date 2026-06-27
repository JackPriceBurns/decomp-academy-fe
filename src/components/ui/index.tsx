// Shared UI primitives. Keeping the button/badge/card class strings in one
// place is what lets the design stay consistent and evolve from a single edit.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------- ProgressBar ------------------------------- */

// Fills from 0 → pct on mount so progress visibly *grows* (respects reduced-motion).
export function ProgressBar({
  pct,
  className,
  barClassName = "bg-good",
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
        className={cx("h-full rounded-full transition-[width] duration-700 ease-out-quint", barClassName)}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

/* ---------------------------------- Button --------------------------------- */

type ButtonVariant = "primary" | "ghost" | "dashed" | "subtle";
type ButtonSize = "sm" | "md" | "lg";

const BTN_BASE =
  "inline-flex items-center justify-center gap-1.5 font-medium transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60";

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-on font-semibold shadow-lg shadow-accent/20 hover:bg-accent-hover hover:-translate-y-px active:translate-y-0",
  ghost:
    "bg-bg-softer/70 text-content-secondary hover:bg-bg-softer hover:text-content-primary",
  dashed:
    "bg-bg-softer/50 text-content-muted hover:bg-bg-softer hover:text-content",
  subtle: "bg-accent/10 text-accent hover:bg-accent/20",
};

const BTN_SIZE: Record<ButtonSize, string> = {
  sm: "rounded-md px-2.5 py-1.5 text-xs",
  md: "rounded-md px-3.5 py-2 text-sm",
  lg: "rounded-lg px-5 py-3 text-base",
};

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonOwnProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={cx(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonOwnProps & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link className={cx(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], className)} {...rest}>
      {children}
    </Link>
  );
}

/* ---------------------------------- Badge ---------------------------------- */

type BadgeTone = "accent" | "muted" | "good" | "warn" | "bad";

const BADGE_TONE: Record<BadgeTone, string> = {
  accent: "bg-accent/10 text-accent",
  muted: "bg-bg-softer text-content-muted",
  good: "bg-good/15 text-good",
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

/* ----------------------------------- Card ---------------------------------- */

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("overflow-hidden rounded-xl bg-bg-soft/70", className)}>
      {children}
    </div>
  );
}

/* ----------------------------------- Modal --------------------------------- */

// Centered, dismissable dialog shell: backdrop, Esc-to-close, and click-outside.
// (ProgressMergeDialog keeps its own shell because it must force a choice and so
// is deliberately *not* dismissable.)
export function Modal({
  onClose,
  labelledBy,
  className,
  children,
}: {
  onClose: () => void;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={cx(
          "animate-slide-up-fade w-full max-w-md rounded-2xl border border-line bg-bg-soft px-6 py-7 shadow-2xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ----------------------------------- Logo ---------------------------------- */

// A terminal-prompt mark: chevron + blinking underscore. Mono-forward identity
// that says "real tool / real compiler" — not a generic SaaS glyph.
// The {dA} brand mark. `size` sets the rendered height; width follows the
// mark's aspect ratio. (See components/BrandMark for the generated SVG.)
export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return <BrandMark height={size} className={cx("block w-auto", className)} />;
}

export { cx };
