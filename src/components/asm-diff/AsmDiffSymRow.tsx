import type { OverviewSymbol } from "@/lib/objdiff/client";
import { AsmDiffPct } from "./AsmDiffPct";
import type { TipState } from "./tip-state";

type Props = {
  sym: OverviewSymbol;
  selected: boolean;
  onSelect: (name: string) => void;
  setTip: (t: TipState) => void;
};

export function AsmDiffSymRow({ sym, selected, onSelect, setTip }: Props) {
  const clickable = !sym.isData;
  return (
    <div
      onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, sym })}
      onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY, sym })}
      onMouseLeave={() => setTip(null)}
      onClick={clickable ? () => onSelect(sym.name) : undefined}
      className={`flex items-center gap-2 whitespace-nowrap py-px pl-6 pr-2 ${
        clickable ? "cursor-pointer hover:bg-bg-softer/70" : "cursor-default"
      } ${selected ? "bg-accent/10 ring-1 ring-inset ring-accent/30" : ""}`}
    >
      <span className="select-none text-2xs text-content-ghost">[{sym.flags || "?"}]</span>
      {sym.matchPercent != null && <AsmDiffPct v={sym.matchPercent} />}
      <span className="truncate text-content">{sym.demangled || sym.name}</span>
    </div>
  );
}
