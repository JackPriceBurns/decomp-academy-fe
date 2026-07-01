"use client";

function pctTone(v: number): string {
  return v >= 100 ? "text-good theme-light:text-good-soft" : v >= 50 ? "text-warn" : "text-bad";
}

type Props = { v: number };

export function AsmDiffPct({ v }: Props) {
  return <span className={`tabular-nums ${pctTone(v)}`}>({Math.round(v)}%)</span>;
}
