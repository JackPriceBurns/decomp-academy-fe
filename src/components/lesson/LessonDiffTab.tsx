"use client";

import { ObjDiff } from "@/components/asm-diff/ObjDiff";
import type { AsmDialect } from "@/lib/asm";
import type { DiffRowVM, Seg } from "@/lib/objdiff/client";
import type { CheckState } from "./types";
import { LessonDiffSkeleton } from "./LessonDiffSkeleton";
import { LessonMatchBanner } from "./LessonMatchBanner";

type Props = {
  check: CheckState;
  targetRows: Seg[][] | null;
  selectedSymbol: string;
  lessonSymbol: string;
  bannerDismissed: boolean;
  dialect: AsmDialect;
  onDismissBanner: () => void;
};

export function LessonDiffTab({
  check,
  targetRows,
  selectedSymbol,
  lessonSymbol,
  bannerDismissed,
  dialect,
  onDismissBanner,
}: Props) {
  if (check.status === "running" && !check.vm) {
    return <LessonDiffSkeleton label="Compiling…" />;
  }

  if (check.status === "match" && selectedSymbol === lessonSymbol && !bannerDismissed) {
    return (
      <LessonMatchBanner
        percent={100}
        firstEver={check.firstEver}
        noHints={check.noHints}
        onViewDiff={onDismissBanner}
      />
    );
  }

  if (check.vm) {
    return (
      <>
        {selectedSymbol !== lessonSymbol && (
          <div className="border-b border-line bg-bg-soft/60 px-3 py-1.5 font-mono text-2xs text-content-muted">
            viewing <span className="text-accent">{selectedSymbol}</span> · Compile &amp; Check
            returns to <span className="text-content-secondary">{lessonSymbol}</span>
          </div>
        )}
        <ObjDiff rows={check.vm.rows} dialect={dialect} />
      </>
    );
  }

  if (targetRows) {
    const targetOnly: DiffRowVM[] = targetRows.map((segs) => ({
      kind: "delete" as const,
      target: segs,
      user: null,
    }));

    return <ObjDiff rows={targetOnly} dialect={dialect} />;
  }

  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-content-faint">
      Hit “Compile &amp; Check” to diff your code against the target.
    </div>
  );
}
