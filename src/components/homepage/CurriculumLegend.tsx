import { IconBook2, IconCircleCheckFilled, IconCircleDashed } from "@tabler/icons-react";
import { Difficulty } from "@/components/Difficulty";

export function CurriculumLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-bg-soft/50 px-4 py-2.5 text-2xs text-content-muted">
      <span className="inline-flex items-center gap-1.5">
        <IconCircleCheckFilled size={14} className="text-good theme-light:text-good-soft" /> Solved
      </span>
      <span className="inline-flex items-center gap-1.5">
        <IconCircleDashed size={14} className="text-warn" /> Attempted
      </span>
      <span className="inline-flex items-center gap-1.5">
        <IconCircleDashed size={14} className="text-content-ghost" /> Not started
      </span>
      <span className="inline-flex items-center gap-1.5">
        <IconBook2 size={14} className="text-content-faint" /> Concept (reading)
      </span>
      <span className="ml-auto inline-flex items-center gap-1.5">
        <Difficulty level={3} /> Difficulty 1–5
      </span>
    </div>
  );
}
