"use client";

import { useState } from "react";
import { IconArrowMerge, IconCloud, IconDeviceLaptop } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useReconcile, type LessonProgress, type MergeStrategy } from "@/lib/progress";
import { ProgressMergeSide } from "./ProgressMergeSide";
import { ProgressMergeShell } from "./ProgressMergeShell";

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

export function ProgressMergeDialog() {
  const { reconcile, sync, resolve } = useReconcile();
  const [chosen, setChosen] = useState(false);

  if (sync) {
    const pct = sync.total > 0 ? Math.round((sync.done / sync.total) * 100) : 0;
    return (
      <ProgressMergeShell>
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
      </ProgressMergeShell>
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
    <ProgressMergeShell>
      <div className="mb-5 flex flex-col items-center gap-3 text-center">
        <Logo size={36} />
        <div>
          <h1 id="merge-title" className="text-lg font-bold text-content-bright">
            You have progress in two places
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            We found progress saved on this device and on your account. How would you like to
            combine them?
          </p>
        </div>
      </div>

      <div className="mb-5 flex gap-3">
        <ProgressMergeSide
          icon={<IconDeviceLaptop size={14} />}
          label="This device"
          touched={local.touched}
          completed={local.completed}
        />
        <ProgressMergeSide
          icon={<IconCloud size={14} />}
          label="Your account"
          touched={server.touched}
          completed={server.completed}
        />
      </div>

      <div className="space-y-2">
        <Button onClick={() => choose("merge")} disabled={chosen} className="w-full">
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
        Merge keeps your highest score on every lesson and prefers the code you last wrote on this
        device.
      </p>
    </ProgressMergeShell>
  );
}
