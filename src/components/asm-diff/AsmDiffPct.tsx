function pctTone(v: number): string {
  return v >= 100
    ? "text-good theme-light:text-good-soft"
    : v >= 50
      ? "text-warn theme-light:text-amber-500"
      : "text-bad";
}

type Props = { v: number };

export function AsmDiffPct({ v }: Props) {
  return <span className={`tabular-nums ${pctTone(v)}`}>({Math.round(v)}%)</span>;
}
