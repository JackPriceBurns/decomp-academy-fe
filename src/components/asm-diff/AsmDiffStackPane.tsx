"use client";

import type { RefObject } from "react";
import type { DiffRowVM } from "@/lib/objdiff/client";
import { AsmDiffLine } from "./AsmDiffLine";
import { ROW_META } from "./row-meta";

type Props = {
  label: string;
  rows: DiffRowVM[];
  side: "target" | "user";
  scrollRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  className?: string;
};

export function AsmDiffStackPane({
  label,
  rows,
  side,
  scrollRef,
  onScroll,
  className = "",
}: Props) {
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className="shrink-0 border-b border-line bg-bg-soft px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-content-muted">
        {label}
      </div>
      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-auto py-1">
        {rows.map((r, i) => {
          const meta = ROW_META[r.kind];
          const segs = side === "target" ? r.target : r.user;
          return (
            <div key={i} className={`flex whitespace-pre px-2 ${meta.bg}`}>
              <span className="mr-2 w-6 shrink-0 select-none text-right tabular-nums text-content-ghost">
                {i + 1}
              </span>
              <AsmDiffLine segs={segs} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
