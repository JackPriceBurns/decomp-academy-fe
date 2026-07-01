"use client";

import { useState } from "react";
import { IconEye } from "@tabler/icons-react";

type Props = {
  solution: string;
  shown: boolean;
  onToggle: () => void;
  onUse: () => void;
};

export function LessonSolutionBox({ solution, shown, onToggle, onUse }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (shown) {
    return (
      <div className="mt-4">
        <button
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 rounded-md bg-bg-softer/60 px-3 py-1.5 text-xs text-content-muted transition hover:bg-bg-softer hover:text-content"
        >
          <IconEye size={13} /> Hide reference solution
        </button>
        <div className="animate-slide-up-fade mt-2">
          <pre className="overflow-x-auto rounded-lg border border-line bg-bg-inset px-3 py-2.5 font-mono text-xs leading-relaxed text-content">
            {solution.trim()}
          </pre>
          <button
            onClick={onUse}
            className="mt-2 text-xs text-accent transition hover:text-accent-hover hover:underline"
          >
            Load into editor →
          </button>
        </div>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="animate-slide-up-fade mt-4 rounded-lg bg-warn/[0.09] px-3 py-2.5">
        <p className="text-xs text-content-secondary">
          This reveals the full answer. Try the hints first — you&apos;ll learn far more by matching
          it yourself.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => {
              onToggle();
              setConfirming(false);
            }}
            className="rounded-md border border-warn/40 px-2.5 py-1 text-2xs font-semibold text-warn transition hover:bg-warn/10"
          >
            Reveal anyway
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-2xs text-content-muted transition hover:text-content"
          >
            Keep trying
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-bg-softer/60 px-3 py-1.5 text-xs text-content-muted transition hover:bg-bg-softer hover:text-content"
      >
        <IconEye size={13} /> Show reference solution
      </button>
    </div>
  );
}
