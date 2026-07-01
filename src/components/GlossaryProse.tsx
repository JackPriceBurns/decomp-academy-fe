"use client";

import { useCallback, useState } from "react";

interface GlossTip {
  x: number;
  y: number;
  term: string;
  full: string;
  desc: string;
}

// Renders pre-built lesson HTML and shows a tooltip when the pointer is over an
// <abbr data-glossary> that renderMarkdown injected for a known acronym. Uses
// event delegation so it costs nothing per term and survives re-renders.
export function GlossaryProse({ html, className }: { html: string; className?: string }) {
  const [tip, setTip] = useState<GlossTip | null>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-glossary]");
    if (!el) {
      setTip((t) => (t ? null : t));
      return;
    }
    setTip({
      x: e.clientX,
      y: e.clientY,
      term: el.dataset.glossary ?? "",
      full: el.dataset.full ?? "",
      desc: el.dataset.desc ?? "",
    });
  }, []);

  const onLeave = useCallback(() => setTip(null), []);

  return (
    <>
      <div
        className={className}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {tip && <GlossaryTooltip tip={tip} />}
    </>
  );
}

function GlossaryTooltip({ tip }: { tip: GlossTip }) {
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
