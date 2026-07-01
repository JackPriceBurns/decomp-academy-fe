import { IconGitCompare, IconStack2, IconTerminal2 } from "@tabler/icons-react";
import type { AsmDialect } from "@/lib/asm";
import type { Overview, Seg } from "@/lib/objdiff/client";
import type { CheckState, Tab } from "./types";
import { WorkspaceTabButton } from "@/components/workspace/WorkspaceTabButton";
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
  return (
    <div
      className={`min-h-[260px] flex-[1] flex-col theme-light:bg-white/50 bg-bg-inset/60 lg:min-h-0 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-line bg-bg-soft/50 px-2">
        <div className="space-x-2">
          <WorkspaceTabButton
            active={tab === "diff"}
            onClick={() => setTab("diff")}
            icon={IconGitCompare}
            text="Diff"
          />

          <WorkspaceTabButton
            active={tab === "objects"}
            onClick={() => setTab("objects")}
            icon={IconStack2}
            text="Objects"
            className="hidden sm:inline-flex"
          />

          <WorkspaceTabButton
            active={tab === "console"}
            onClick={() => setTab("console")}
            icon={IconTerminal2}
            text="Console"
          />
        </div>

        <LessonMatchMeter check={check} />
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

        {tab === "console" && (
          <LessonConsole
            check={check}
            isErr={check.status === "compileError" || check.status === "error"}
          />
        )}
      </div>
    </div>
  );
}
