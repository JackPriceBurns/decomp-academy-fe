"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { cx } from "./cx";

// Centered, dismissable dialog shell: backdrop, Esc-to-close, and click-outside.
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
