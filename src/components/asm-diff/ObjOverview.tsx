"use client";

import { useState } from "react";
import type { Overview } from "@/lib/objdiff/client";
import { AsmDiffObjColumn } from "./AsmDiffObjColumn";
import { AsmDiffSymTooltip } from "./AsmDiffSymTooltip";
import type { TipState } from "./tip-state";

type Props = {
  overview: Overview;
  selected: string;
  onSelect: (name: string) => void;
};

export function ObjOverview({ overview, selected, onSelect }: Props) {
  const [tip, setTip] = useState<TipState>(null);
  return (
    <div className="h-full font-mono text-asm">
      <div className="grid grid-cols-2 gap-px bg-line/50">
        <AsmDiffObjColumn
          title="Target object"
          sections={overview.target}
          selected={selected}
          onSelect={onSelect}
          setTip={setTip}
        />
        <AsmDiffObjColumn
          title="Base object"
          sections={overview.base}
          selected={selected}
          onSelect={onSelect}
          setTip={setTip}
        />
      </div>
      {tip && tip.sym.hover.length > 0 && <AsmDiffSymTooltip tip={tip} />}
    </div>
  );
}
