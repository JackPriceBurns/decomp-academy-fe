"use client";

import type { DiffRowVM } from "@/lib/objdiff/client";
import { AsmDiffLine } from "./AsmDiffLine";
import { ROW_META } from "./row-meta";

type Props = { rows: DiffRowVM[] };

export function AsmDiffSideBySideDiff({ rows }: Props) {
  return (
    <div className="overflow-auto font-mono text-asm">
      <div className="grid min-w-[620px] grid-cols-[2.6rem_1fr_1fr]">
        <div className="sticky top-0 z-10 border-b border-line bg-bg-soft px-2 py-1.5 text-2xs font-semibold uppercase tracking-wider text-content-faint">
          #
        </div>
        <div className="sticky top-0 z-10 border-b border-r border-line bg-bg-soft px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-content-muted">
          Target
        </div>
        <div className="sticky top-0 z-10 border-b border-line bg-bg-soft px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-content-muted">
          Your output
        </div>
        {rows.map((r, i) => {
          const meta = ROW_META[r.kind];
          const stagger = i < 16 ? { animationDelay: `${i * 16}ms` } : undefined;
          return (
            <div
              key={i}
              className="contents motion-safe:animate-row-settle"
              style={stagger}
              role="row"
              aria-label={r.kind === "none" ? undefined : `Line ${i + 1} ${meta.label}`}
            >
              <div
                className={`${meta.bg} flex select-none items-center justify-center gap-1 ${meta.markColor} text-2xs`}
              >
                <span className="tabular-nums text-content-ghost">{i + 1}</span>
                <span aria-hidden="true">{meta.mark}</span>
              </div>
              <div className={`${meta.bg} border-r border-line/50 px-3 py-px`}>
                <AsmDiffLine segs={r.target} />
              </div>
              <div className={`${meta.bg} px-3 py-px`}>
                <AsmDiffLine segs={r.user} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
