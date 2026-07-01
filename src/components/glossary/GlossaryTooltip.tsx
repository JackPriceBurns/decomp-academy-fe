import type { GlossTip } from "./GlossaryProse";

type Props = { tip: GlossTip };

export function GlossaryTooltip({ tip }: Props) {
  return (
    <div
      className="pointer-events-none fixed z-50 max-w-xs rounded-md border border-line bg-bg-inset/95 px-3 py-2 shadow-lg backdrop-blur-sm"
      style={{ left: tip.x + 14, top: tip.y + 16 }}
    >
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm font-semibold text-accent">{tip.term}</span>
        <span className="text-xs text-content-secondary">{tip.full}</span>
      </div>
      {tip.desc && (
        <div className="mt-1 text-xs leading-relaxed text-content-muted">{tip.desc}</div>
      )}
    </div>
  );
}
