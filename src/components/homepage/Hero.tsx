"use client";

import Link from "next/link";
import {
  IconArrowRight,
  IconBolt,
  IconGitMerge,
  IconCheck,
  IconBrandGithub,
} from "@tabler/icons-react";
import { useProgress } from "@/lib/progress";
import { LESSONS } from "@/lib/lessons/registry.client";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { lessonPath } from "@/lib/seo";
import { HeroMatchPreview } from "./HeroMatchPreview";
import { HeroStat } from "./HeroStat";

type Props = {
  total: number;
  firstLesson?: { id: string; course: string };
};

export function Hero({ total, firstLesson }: Props) {
  const { bestPercent } = useProgress();
  const solvedCount = LESSONS.filter((l) => bestPercent(l.course, l.id) >= 100).length;
  const pct = total ? Math.round((solvedCount / total) * 100) : 0;

  const resume = LESSONS.find((l) => bestPercent(l.course, l.id) < 100) ?? firstLesson;
  const resumeHref = resume ? lessonPath(resume.course, resume.id) : "#";

  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="grid-dots absolute inset-0 opacity-40" />
      <div className="absolute -top-32 left-1/3 h-72 w-[34rem] -translate-x-1/2 rounded-full theme-light:bg-accent/10 bg-accent/20 blur-[120px]" />
      <div className="absolute -top-24 right-0 h-64 w-[28rem] rounded-full theme-light:bg-[#4f3d8c]/15 bg-[#4f3d8c]/25 blur-[130px]" />

      <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-5 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-20">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-content-bright sm:text-3xl">
            Decompile retro-game assembly into{" "}
            <span className="text-accent font-mono">byte-matching C.</span>
          </h1>

          <p className="max-w-xl leading-relaxed text-content-secondary">
            Go from never having read a register to matching real functions from GameCube and Game
            Boy Advance games — instruction for instruction. You write C, the original compiler
            grades it live.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={resumeHref}
              className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-accent-on shadow-lg shadow-accent/20 transition hover:-translate-y-px hover:bg-accent-hover active:translate-y-0 active:scale-[0.98]"
            >
              {solvedCount > 0 ? "Resume training" : "Start from zero"}
              <IconArrowRight size={18} className="transition group-hover:translate-x-0.5" />
            </Link>

            <div className="flex items-center gap-5 rounded-lg bg-bg-soft/70 px-5 py-3 text-sm backdrop-blur">
              <HeroStat
                icon={<IconBolt size={16} className="text-warn" />}
                label="Lessons"
                value={`${total}`}
              />

              <div className="h-8 w-px bg-line" />

              <HeroStat
                icon={<IconGitMerge size={16} className="text-good theme-light:text-good-soft" />}
                label="Solved"
                value={`${solvedCount}`}
              />

              <div className="h-8 w-px bg-line" />

              <div className="min-w-[7rem]">
                <div className="mb-1 flex justify-between text-xs text-content-muted">
                  <span>Mastery</span>
                  <span>{pct}%</span>
                </div>

                <ProgressBar
                  pct={pct}
                  barClassName="bg-gradient-to-r from-good to-accent"
                  className="w-full bg-line/70"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-content-faint">
            <span className="inline-flex items-center gap-1.5">
              <IconCheck size={13} className="text-good theme-light:text-good-soft" />
              Graded by the original compilers
            </span>

            <a
              href="https://decomp.dev"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-content-muted"
            >
              <IconBrandGithub size={13} />
              Functions from real open-source decomps
            </a>
          </div>
        </div>

        <div className="lg:block hidden">
          <HeroMatchPreview />
        </div>
      </div>
    </header>
  );
}
