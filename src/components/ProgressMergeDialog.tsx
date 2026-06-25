"use client";

import { useState } from "react";
import { IconArrowMerge, IconCloud, IconDeviceLaptop } from "@tabler/icons-react";
import { Button, Logo, ProgressBar } from "@/components/ui";
import {
  useReconcile,
  type LessonProgress,
  type MergeStrategy,
} from "@/lib/progress";

type Lessons = Record<string, LessonProgress>;

function summarize(ls: Lessons) {
  let touched = 0;
  let completed = 0;
  for (const l of Object.values(ls)) {
    const has = (l.bestPercent ?? 0) > 0 || (l.code != null && l.code !== "");
    if (!has) continue;
    touched += 1;
    if ((l.bestPercent ?? 0) >= 100) completed += 1;
  }
  return { touched, completed };
}

function Side({
  icon,
  label,
  touched,
  completed,
}: {
  icon: React.ReactNode;
  label: string;
  touched: number;
  completed: number;
}) {
  return (
    <div className="flex-1 rounded-lg border border-line bg-bg-inset px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-content-secondary">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-sm text-content-primary">
        <span className="font-semibold text-content-bright">{touched}</span> lesson
        {touched === 1 ? "" : "s"} in progress
      </div>
      <div className="text-xs text-content-muted">{completed} completed</div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="merge-title"
    >
      <div className="animate-slide-up-fade w-full max-w-md rounded-2xl border border-line bg-bg-soft px-6 py-7 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export function ProgressMergeDialog() {
  const { reconcile, sync, resolve } = useReconcile();
  // Latch the choice so a double-click (or a second button) can't resolve twice
  // or fire a second upload before the dialog flips to the syncing view.
  const [chosen, setChosen] = useState(false);

  // Once a choice is made the store keeps us mounted (pending stays set) and
  // reports the sequential upload via `sync`; show the progress bar then.
  if (sync) {
    const pct = sync.total > 0 ? Math.round((sync.done / sync.total) * 100) : 0;
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo size={36} />
          <h1 id="merge-title" className="text-lg font-bold text-content-bright">
            Syncing your progress…
          </h1>
          <p className="text-sm text-content-muted">
            Saving one lesson at a time so we don&apos;t overload the server.
          </p>
        </div>
        <div className="mt-6">
          <ProgressBar pct={pct} barClassName="bg-accent" height="h-2" />
          <div className="mt-2 text-center text-xs text-content-muted">
            {sync.done} of {sync.total} lessons
          </div>
        </div>
      </Shell>
    );
  }

  if (!reconcile) return null;

  const local = summarize(reconcile.local);
  const server = summarize(reconcile.server);

  const choose = (s: MergeStrategy) => {
    if (chosen) return;
    setChosen(true);
    resolve(s);
  };

  return (
    <Shell>
      <div className="mb-5 flex flex-col items-center gap-3 text-center">
        <Logo size={36} />
        <div>
          <h1 id="merge-title" className="text-lg font-bold text-content-bright">
            You have progress in two places
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            We found progress saved on this device and on your account. How would
            you like to combine them?
          </p>
        </div>
      </div>

      <div className="mb-5 flex gap-3">
        <Side
          icon={<IconDeviceLaptop size={14} />}
          label="This device"
          touched={local.touched}
          completed={local.completed}
        />
        <Side
          icon={<IconCloud size={14} />}
          label="Your account"
          touched={server.touched}
          completed={server.completed}
        />
      </div>

      <div className="space-y-2">
        <Button
          onClick={() => choose("merge")}
          disabled={chosen}
          className="w-full"
        >
          <IconArrowMerge size={15} /> Merge — keep the best of both
        </Button>
        <Button
          variant="ghost"
          onClick={() => choose("local")}
          disabled={chosen}
          className="w-full"
        >
          <IconDeviceLaptop size={15} /> Keep this device&apos;s progress
        </Button>
        <Button
          variant="ghost"
          onClick={() => choose("server")}
          disabled={chosen}
          className="w-full"
        >
          <IconCloud size={15} /> Use my account&apos;s progress
        </Button>
      </div>

      <p className="mt-4 text-center text-xs text-content-faint">
        Merge keeps your highest score on every lesson and prefers the code you
        last wrote on this device.
      </p>
    </Shell>
  );
}
