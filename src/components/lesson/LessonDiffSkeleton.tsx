"use client";

import { IconLoader2 } from "@tabler/icons-react";

type Props = { label?: string };

export function LessonDiffSkeleton({ label }: Props) {
  return (
    <div className="px-4 py-3">
      {label && (
        <div className="mb-3 flex items-center gap-2 text-xs text-content-faint">
          <IconLoader2 size={14} className="animate-spin text-accent" />
          <span>{label}</span>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-3.5 rounded"
            style={{ width: `${85 - (i % 4) * 16}%` }}
          />
        ))}
      </div>
    </div>
  );
}
