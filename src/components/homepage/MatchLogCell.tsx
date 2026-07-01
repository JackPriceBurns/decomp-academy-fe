import Link from "next/link";
import { lessonPath } from "@/lib/seo";
import type { HeatLesson } from "./MatchLog";

type Props = {
  courseId: string;
  lesson: HeatLesson;
  pct: number;
};

export function MatchLogCell({ courseId, lesson, pct }: Props) {
  const cls =
    pct >= 100
      ? "bg-good theme-light:bg-good-soft hover:ring-good"
      : pct > 0
        ? "bg-warn/70 theme-light:bg-amber-400 hover:ring-warn"
        : "bg-line-strong/70 theme-light:bg-line-faint hover:ring-accent";
  return (
    <Link
      href={lessonPath(courseId, lesson.id)}
      title={`${lesson.title}${pct >= 100 ? " — matched" : pct > 0 ? ` — ${pct}%` : ""}`}
      className={`h-2.5 w-2.5 rounded-[2px] ring-offset-1 ring-offset-bg-soft transition hover:ring-1 ${cls}`}
    />
  );
}
