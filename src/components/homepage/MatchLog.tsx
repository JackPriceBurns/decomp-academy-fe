"use client";

import { useMemo } from "react";
import { IconFlame, IconTrophy, IconGitMerge } from "@tabler/icons-react";
import { useProgress } from "@/lib/progress";
import { MatchLogStat } from "./MatchLogStat";
import { MatchLogCell } from "./MatchLogCell";

export interface HeatLesson {
  id: string;
  title: string;
  difficulty: number;
  concept?: boolean;
}

type Props = {
  lessons: HeatLesson[];
  courseId: string;
};

export function MatchLog({ lessons, courseId }: Props) {
  const { bestPercent } = useProgress();

  const { solved, attempted, xp } = useMemo(() => {
    let solved = 0;
    let attempted = 0;
    let xp = 0;
    for (const l of lessons) {
      const pct = bestPercent(courseId, l.id);
      if (pct >= 100) {
        solved++;
        xp += l.concept ? 5 : l.difficulty * 10;
      } else if (pct > 0) attempted++;
    }
    return { solved, attempted, xp };
  }, [lessons, bestPercent]);

  const total = lessons.length;
  const milestones = [
    { at: 0.1, label: "Initiate" },
    { at: 0.25, label: "Apprentice" },
    { at: 0.5, label: "Journeyman" },
    { at: 0.75, label: "Adept" },
    { at: 1, label: "Master" },
  ];
  const frac = total ? solved / total : 0;
  const rank = [...milestones].reverse().find((m) => frac >= m.at)?.label ?? "Recruit";

  return (
    <div className="rounded-xl bg-bg-soft/60 p-5">
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <IconGitMerge size={18} className="text-good theme-light:text-good-soft" />
          <div>
            <div className="font-semibold leading-none text-content-primary">
              <span className="tabular-nums">{solved}</span>
              <span className="text-content-muted"> / {total}</span> matched
            </div>
            <div className="mt-1 text-2xs text-content-muted">functions reconstructed</div>
          </div>
        </div>
        <MatchLogStat
          icon={<IconFlame size={16} className="text-warn" />}
          value={attempted.toString()}
          label="in progress"
        />
        <MatchLogStat
          icon={<IconTrophy size={16} className="text-accent" />}
          value={xp.toLocaleString()}
          label="XP"
        />
        <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
          {rank}
        </div>
      </div>

      <div
        className="flex flex-wrap gap-[3px]"
        role="img"
        aria-label={`${solved} of ${total} lessons matched`}
      >
        {lessons.map((l) => (
          <MatchLogCell
            key={l.id}
            courseId={courseId}
            lesson={l}
            pct={bestPercent(courseId, l.id)}
          />
        ))}
      </div>
    </div>
  );
}
