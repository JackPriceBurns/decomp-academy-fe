"use client";

import { ObjOverview } from "@/components/asm-diff/ObjOverview";
import type { Overview } from "@/lib/objdiff/client";
import { LessonDiffSkeleton } from "./LessonDiffSkeleton";

type Props = {
  overview: Overview | null;
  selectedSymbol: string;
  onSelectSymbol: (name: string) => void;
};

export function LessonObjectsTab({ overview, selectedSymbol, onSelectSymbol }: Props) {
  if (!overview) return <LessonDiffSkeleton />;
  return <ObjOverview overview={overview} selected={selectedSymbol} onSelect={onSelectSymbol} />;
}
