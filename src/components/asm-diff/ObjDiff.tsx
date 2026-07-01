import type { AsmDialect } from "@/lib/asm";
import type { DiffRowVM } from "@/lib/objdiff/client";
import { AsmDiffInsnTipLayer } from "./AsmDiffInsnTipLayer";
import { AsmDiffSideBySideDiff } from "./AsmDiffSideBySideDiff";
import { AsmDiffStackedDiff } from "./AsmDiffStackedDiff";

type Props = { rows: DiffRowVM[]; dialect?: AsmDialect };

export function ObjDiff({ rows, dialect = "ppc" }: Props) {
  return (
    <AsmDiffInsnTipLayer dialect={dialect}>
      <div className="hidden sm:block">
        <AsmDiffSideBySideDiff rows={rows} />
      </div>
      <div className="sm:hidden">
        <AsmDiffStackedDiff rows={rows} />
      </div>
    </AsmDiffInsnTipLayer>
  );
}
