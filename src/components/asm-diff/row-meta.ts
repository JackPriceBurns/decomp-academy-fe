import type { RowKind } from "@/lib/objdiff/client";

export const ROW_META: Record<
  RowKind,
  { bg: string; mark: string; markColor: string; label: string }
> = {
  none: { bg: "", mark: "", markColor: "", label: "matches" },
  replace: {
    bg: "bg-warn/[0.07] theme-light:bg-amber-500/[0.07]",
    mark: "≠",
    markColor: "text-warn theme-light:text-amber-500",
    label: "differs",
  },
  "op-mismatch": {
    bg: "bg-warn/[0.07] theme-light:bg-amber-500/[0.07]",
    mark: "≠",
    markColor: "text-warn theme-light:text-amber-500",
    label: "opcode differs",
  },
  "arg-mismatch": {
    bg: "bg-warn/[0.07] theme-light:bg-amber-500/[0.07]",
    mark: "≠",
    markColor: "text-warn theme-light:text-amber-500",
    label: "operand differs",
  },
  delete: {
    bg: "bg-bad/[0.07] theme-light:bg-red-50",
    mark: "−",
    markColor: "text-bad",
    label: "missing from your code",
  },
  insert: {
    bg: "bg-accent/[0.07] theme-light:bg-emerald-50",
    mark: "+",
    markColor: "text-accent",
    label: "extra in your code",
  },
};
