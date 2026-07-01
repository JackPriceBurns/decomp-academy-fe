"use client";

import Link from "next/link";
import { useMemo } from "react";
import { IconFlame, IconTrophy, IconGitMerge } from "@tabler/icons-react";
import { useProgress } from "@/lib/progress";
import { lessonPath } from "@/lib/seo";

export interface HeatLesson {
  id: string;
  title: string;
  difficulty: number;
  concept?: boolean;
}

// Contribution-style grid of every lesson — instantly familiar to the
// GitHub-native decomp audience, and turns "0/306" into a fillable canvas.
export function MatchLog({ lessons, courseId }: { lessons: HeatLesson[]; courseId: string }) {
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
        <Stat
          icon={<IconFlame size={16} className="text-warn" />}
          value={attempted.toString()}
          label="in progress"
        />
        <Stat
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
        {lessons.map((l) => {
          const pct = bestPercent(courseId, l.id);
          const cls =
            pct >= 100
              ? "bg-good theme-light:bg-good-soft hover:ring-good"
              : pct > 0
                ? "bg-warn/70 theme-light:bg-amber-400 hover:ring-warn"
                : // Empty pip: a lighter gray in light mode.
                  "bg-line-strong/70 theme-light:bg-line-faint hover:ring-accent";
          return (
            <Link
              key={l.id}
              href={lessonPath(courseId, l.id)}
              title={`${l.title}${pct >= 100 ? " — matched" : pct > 0 ? ` — ${pct}%` : ""}`}
              className={`h-2.5 w-2.5 rounded-[2px] ring-offset-1 ring-offset-bg-soft transition hover:ring-1 ${cls}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <div className="font-semibold leading-none tabular-nums text-content-primary">{value}</div>
        <div className="mt-1 text-2xs text-content-muted">{label}</div>
      </div>
    </div>
  );
}
