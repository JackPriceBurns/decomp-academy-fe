"use client";

import { cx } from "@/components/ui/cx";

type Props = {
  emoji: string;
  label: string;
  active: boolean;
  onClick: () => void;
};

export function FeedbackSentimentButton({ emoji, label, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition",
        active
          ? "border-accent bg-accent/10 text-content-primary"
          : "border-line bg-bg-inset text-content-muted hover:border-line-strong hover:text-content-secondary",
      )}
    >
      <span className="text-xl leading-none">{emoji}</span>
      {label}
    </button>
  );
}
