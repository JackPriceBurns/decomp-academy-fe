"use client";

import { IconBulb } from "@tabler/icons-react";

type Props = {
  hints: string[];
  shown: number;
  onReveal: () => void;
  onHide: () => void;
};

export function LessonHints({ hints, shown, onReveal, onHide }: Props) {
  if (!hints.length) return null;
  return (
    <div className="mt-6 border-t border-line pt-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-content-muted">
        <IconBulb size={14} className="text-warn" /> Hints
        {shown > 0 && (
          <button
            onClick={onHide}
            className="ml-auto text-2xs font-medium normal-case tracking-normal text-content-faint transition hover:text-content-muted"
          >
            Hide
          </button>
        )}
      </div>
      <div className="space-y-2">
        {hints.slice(0, shown).map((h, i) => (
          <div
            key={i}
            className="animate-slide-up-fade rounded-lg border border-line bg-bg-softer/50 px-3 py-2 text-sm text-content-secondary"
          >
            <span className="mr-1.5 font-semibold text-warn">{i + 1}.</span>
            {h}
          </div>
        ))}
      </div>
      {shown < hints.length && (
        <button
          onClick={onReveal}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-bg-softer/60 px-3 py-1.5 text-xs text-content-muted transition hover:bg-bg-softer hover:text-warn"
        >
          <IconBulb size={13} /> Reveal hint {shown + 1} of {hints.length}
        </button>
      )}
    </div>
  );
}
