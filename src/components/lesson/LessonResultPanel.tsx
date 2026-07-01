"use client";

import { IconGitCompare, IconStack2, IconTerminal2 } from "@tabler/icons-react";
import type { AsmDialect } from "@/lib/asm";
import type { Overview, Seg } from "@/lib/objdiff/client";
import type { CheckState, Tab } from "./types";
import { LessonTabButton } from "./LessonTabButton";
import { LessonMatchMeter } from "./LessonMatchMeter";
import { LessonConsole } from "./LessonConsole";
import { LessonDiffTab } from "./LessonDiffTab";
import { LessonObjectsTab } from "./LessonObjectsTab";

type Props = {
  tab: Tab;
  setTab: (t: Tab) => void;
  check: CheckState;
  targetRows: Seg[][] | null;
  overview: Overview | null;
  selectedSymbol: string;
  onSelectSymbol: (name: string) => void;
  lessonSymbol: string;
  bannerDismissed: boolean;
  onDismissBanner: () => void;
  dialect: AsmDialect;
  className?: string;
};

export function LessonResultPanel({
  tab,
  setTab,
  check,
  targetRows,
  overview,
  selectedSymbol,
  onSelectSymbol,
  lessonSymbol,
  bannerDismissed,
  onDismissBanner,
  dialect,
  className = "",
}: Props) {
  const isErr = check.status === "compileError" || check.status === "error";
  return (
    <div
      className={`min-h-[260px] flex-[1] flex-col theme-light:bg-white/50 bg-bg-inset/60 lg:min-h-0 ${className}`}
    >
      <div className="flex items-center gap-1 border-b border-line bg-bg-soft/50 px-2">
        <LessonTabButton
          active={tab === "diff"}
          onClick={() => setTab("diff")}
          icon={<IconGitCompare size={14} />}
        >
          Diff
        </LessonTabButton>
        <LessonTabButton
          active={tab === "objects"}
          onClick={() => setTab("objects")}
          icon={<IconStack2 size={14} />}
          className="hidden sm:inline-flex"
        >
          Objects
        </LessonTabButton>
        <LessonTabButton
          active={tab === "console"}
          onClick={() => setTab("console")}
          icon={<IconTerminal2 size={14} />}
        >
          Console
        </LessonTabButton>
        <div className="ml-auto pr-2">
          <LessonMatchMeter check={check} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {tab === "diff" && (
          <LessonDiffTab
            check={check}
            targetRows={targetRows}
            selectedSymbol={selectedSymbol}
            lessonSymbol={lessonSymbol}
            bannerDismissed={bannerDismissed}
            dialect={dialect}
            onDismissBanner={onDismissBanner}
          />
        )}
        {tab === "objects" && (
          <LessonObjectsTab
            overview={overview}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={onSelectSymbol}
          />
        )}
        {tab === "console" && <LessonConsole check={check} isErr={isErr} />}
      </div>
    </div>
  );
}
