import type { AsmDialect } from "@/lib/asm";
import type { Seg } from "@/lib/objdiff/client";
import { AsmDiffInsnTipLayer } from "./AsmDiffInsnTipLayer";
import { AsmDiffLine } from "./AsmDiffLine";

type Props = { rows: Seg[][]; dialect?: AsmDialect };

export function AsmList({ rows, dialect = "ppc" }: Props) {
  return (
    <AsmDiffInsnTipLayer dialect={dialect}>
      <div className="overflow-auto px-3 py-2 font-mono text-asm">
        {rows.map((segs, i) => (
          <div key={i} className="flex">
            <span className="w-8 select-none text-right text-content-ghost">{i}</span>
            <span className="whitespace-pre pl-4">
              <AsmDiffLine segs={segs} />
            </span>
          </div>
        ))}
      </div>
    </AsmDiffInsnTipLayer>
  );
}
