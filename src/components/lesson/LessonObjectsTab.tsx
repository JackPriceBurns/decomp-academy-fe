import type { Overview } from "@/lib/objdiff/client";
import { LessonDiffSkeleton } from "./LessonDiffSkeleton";
import { AsmDiffObjColumn } from "@/components/asm-diff/AsmDiffObjColumn";
import { AsmDiffSymTooltip } from "@/components/asm-diff/AsmDiffSymTooltip";
import { useState } from "react";
import type { TipState } from "@/components/asm-diff/tip-state";

type Props = {
  overview: Overview | null;
  selectedSymbol: string;
  onSelectSymbol: (name: string) => void;
};

export function LessonObjectsTab({ overview, selectedSymbol, onSelectSymbol }: Props) {
  const [tip, setTip] = useState<TipState>(null);

  if (!overview) {
    return <LessonDiffSkeleton />;
  }

  return (
    <div className="h-full font-mono text-asm">
      <div className="grid grid-cols-2 gap-px bg-line/50">
        <AsmDiffObjColumn
          title="Target object"
          sections={overview.target}
          selected={selectedSymbol}
          onSelect={onSelectSymbol}
          setTip={setTip}
        />

        <AsmDiffObjColumn
          title="Base object"
          sections={overview.base}
          selected={selectedSymbol}
          onSelect={onSelectSymbol}
          setTip={setTip}
        />
      </div>

      {tip && tip.sym.hover.length > 0 && <AsmDiffSymTooltip tip={tip} />}
    </div>
  );
}
