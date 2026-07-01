"use client";

import { useState } from "react";
import type { OverviewSection } from "@/lib/objdiff/client";
import { AsmDiffPct } from "./AsmDiffPct";
import { AsmDiffSymRow } from "./AsmDiffSymRow";
import type { TipState } from "./tip-state";

type Props = {
  sec: OverviewSection;
  selected: string;
  onSelect: (name: string) => void;
  setTip: (t: TipState) => void;
};

export function AsmDiffSection({ sec, selected, onSelect, setTip }: Props) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 whitespace-nowrap px-2 py-0.5 text-left hover:bg-bg-softer/40"
      >
        <span className="select-none text-content-faint">{open ? "▾" : "▸"}</span>
        <span className="font-semibold text-content-secondary">{sec.name}</span>
        <span className="text-content-faint">({sec.sizeHex})</span>
        {sec.matchPercent != null && <AsmDiffPct v={sec.matchPercent} />}
      </button>
      {open &&
        sec.symbols.map((s, i) => (
          <AsmDiffSymRow
            key={i}
            sym={s}
            selected={selected === s.name && !s.isData}
            onSelect={onSelect}
            setTip={setTip}
          />
        ))}
    </div>
  );
}
