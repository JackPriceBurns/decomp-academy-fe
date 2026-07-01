import { IconBulb, IconGitCompare } from "@tabler/icons-react";

type Props = {
  percent: number;
  firstEver?: boolean;
  noHints?: boolean;
  onViewDiff: () => void;
};

export function LessonMatchBanner({ percent, firstEver, noHints, onViewDiff }: Props) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden p-6 text-center">
      <div className="pointer-events-none absolute inset-0 animate-success-sweep bg-gradient-to-r from-transparent theme-light:via-good/0 via-good/15 to-transparent" />

      <div className="animate-ring-burst flex h-14 w-14 items-center justify-center rounded-full theme-light:bg-good-soft/15 bg-good/15">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12.5l4.2 4.2L19 7"
            stroke="#3fb950"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="28"
            className="animate-draw-check"
          />
        </svg>
      </div>

      <div className="animate-count-pop text-lg font-bold theme-light:text-good-soft text-good">
        {firstEver ? "First match. You're decomping now." : `Perfect match — ${percent}%`}
      </div>

      <p className="max-w-sm text-sm text-content-muted">
        {firstEver
          ? "That's exactly how every function in a real decomp project gets checked in — byte for byte. You just did the real thing."
          : "Every instruction lines up with the compiler's output. This is exactly how a real decomp function gets checked in. Move on to the next lesson."}
      </p>

      {noHints && (
        <span className="inline-flex items-center gap-1.5 rounded-full border theme-light:border-amber-200 border-warn/30 theme-light:bg-amber-50 theme-light:text-amber-600 bg-warn/10 px-3 py-1 text-xs font-semibold text-warn">
          <IconBulb size={13} /> Solved with no hints
        </span>
      )}

      <button
        onClick={onViewDiff}
        className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-soft/60 px-3 py-1.5 text-xs text-content-secondary transition hover:bg-bg-softer hover:text-content-primary"
      >
        <IconGitCompare size={13} /> View diff
      </button>
    </div>
  );
}
