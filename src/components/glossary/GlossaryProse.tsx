"use client";

import { useCallback, useState } from "react";
import { GlossaryTooltip } from "./GlossaryTooltip";

export interface GlossTip {
  x: number;
  y: number;
  term: string;
  full: string;
  desc: string;
}

type Props = { html: string; className?: string };

export function GlossaryProse({ html, className }: Props) {
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
