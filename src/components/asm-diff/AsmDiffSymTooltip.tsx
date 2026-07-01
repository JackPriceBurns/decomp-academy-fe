import type { TipState } from "./tip-state";

type Props = { tip: NonNullable<TipState> };

export function AsmDiffSymTooltip({ tip }: Props) {
  return (
    <div
      className="pointer-events-none fixed z-50 max-w-md rounded-md border border-line bg-bg-inset/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm"
      style={{ left: tip.x + 14, top: tip.y + 16 }}
    >
      {tip.sym.hover.map((h, i) => (
        <div key={i} className="flex gap-2 leading-relaxed">
          <span className="shrink-0 text-accent">{h.label}:</span>
          <span className="break-all text-content-secondary">{h.value}</span>
        </div>
      ))}
    </div>
  );
}
