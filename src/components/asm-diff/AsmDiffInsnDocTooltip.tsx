"use client";

import type { InsnTipState } from "./context";

type Props = { tip: InsnTipState };

export function AsmDiffInsnDocTooltip({ tip }: Props) {
  return (
    <div
      className="pointer-events-none fixed z-50 max-w-sm rounded-md border border-line bg-bg-inset/95 px-3 py-2 shadow-lg backdrop-blur-sm"
      style={{ left: tip.x + 14, top: tip.y + 16 }}
    >
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm font-semibold text-syntax-mnemonic">{tip.doc.name}</span>
        <span className="text-xs text-content-secondary">{tip.doc.descriptiveName}</span>
      </div>
      {tip.doc.usage && (
        <div className="mt-0.5 font-mono text-2xs text-content-faint">{tip.doc.usage}</div>
      )}
      <div className="mt-1 text-xs leading-relaxed text-content-muted">{tip.description}</div>
    </div>
  );
}
