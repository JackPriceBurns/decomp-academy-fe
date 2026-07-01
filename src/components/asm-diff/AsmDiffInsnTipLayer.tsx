"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AsmDialect } from "@/lib/asm";
import { InsnTipContext, type InsnTipState } from "./context";
import { fillDescription, glossaryMaps, loadGlossary, lookupInsn, type InsnDoc } from "./glossary";
import { AsmDiffInsnDocTooltip } from "./AsmDiffInsnDocTooltip";

type Props = {
  dialect?: AsmDialect;
  children: ReactNode;
};

export function AsmDiffInsnTipLayer({ dialect = "ppc", children }: Props) {
  const [map, setMap] = useState<Map<string, InsnDoc> | null>(glossaryMaps[dialect]);
  useEffect(() => {
    let alive = true;
    loadGlossary(dialect)
      .then((m) => alive && setMap(m))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [dialect]);
  const [tip, setTip] = useState<InsnTipState | null>(null);
  const show = useCallback(
    (mnemonic: string, operands: string[], x: number, y: number) => {
      const doc = map ? lookupInsn(map, mnemonic, dialect) : null;
      setTip(doc ? { x, y, doc, description: fillDescription(doc, operands) } : null);
    },
    [map, dialect],
  );
  const hide = useCallback(() => setTip(null), []);
  const ctx = useMemo(() => ({ show, hide }), [show, hide]);
  return (
    <InsnTipContext.Provider value={ctx}>
      {children}
      {tip && <AsmDiffInsnDocTooltip tip={tip} />}
    </InsnTipContext.Provider>
  );
}
