import type { OverviewSection } from "@/lib/objdiff/client";
import { AsmDiffSection } from "./AsmDiffSection";
import type { TipState } from "./tip-state";

type Props = {
  title: string;
  sections: OverviewSection[];
  selected: string;
  onSelect: (name: string) => void;
  setTip: (t: TipState) => void;
};

export function AsmDiffObjColumn({ title, sections, selected, onSelect, setTip }: Props) {
  return (
    <div className="min-w-0 overflow-x-auto bg-bg-inset/40">
      <div className="sticky top-0 z-10 border-b border-line bg-bg-soft px-2 py-1.5 text-2xs font-semibold uppercase tracking-wider text-content-muted">
        {title}
      </div>
      {sections.length ? (
        sections.map((sec, i) => (
          <AsmDiffSection
            key={i}
            sec={sec}
            selected={selected}
            onSelect={onSelect}
            setTip={setTip}
          />
        ))
      ) : (
        <div className="px-3 py-4 text-xs text-content-faint">No object yet.</div>
      )}
    </div>
  );
}
