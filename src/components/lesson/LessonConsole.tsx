"use client";

import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
import type { CheckState } from "./types";

function summarizeError(msg?: string): string | null {
  if (!msg) return null;
  const lines = msg
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const idx = lines.findIndex((l) => /error|warning/i.test(l));
  if (idx < 0) return null;
  for (const c of lines.slice(idx, idx + 3)) {
    const cleaned = c
      .replace(/\^/g, "")
      .replace(/^\d+:\s*/, "")
      .replace(/^(Error|Warning):\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
    if (/[a-z]{3,}/i.test(cleaned)) return cleaned.slice(0, 140);
  }
  return null;
}

type Props = { check: CheckState; isErr: boolean };

export function LessonConsole({ check, isErr }: Props) {
  const summary = isErr ? summarizeError(check.message) : null;
  if (check.status === "running")
    return (
      <div className="flex h-full items-center justify-center gap-2 text-xs text-content-faint">
        <IconLoader2 size={14} className="animate-spin text-accent" />
        Compiling…
      </div>
    );
  return (
    <div className="flex h-full flex-col">
      {summary && (
        <div className="flex items-start gap-2 border-b border-bad/20 bg-bad/[0.07] px-4 py-2.5 text-xs text-bad">
          <IconAlertTriangle size={14} className="mt-px shrink-0" />
          <span className="font-medium text-content">{summary}</span>
        </div>
      )}
      <pre
        className={`flex-1 whitespace-pre-wrap px-4 py-3 font-mono text-xs leading-relaxed ${
          isErr ? "text-bad-text" : "text-content-muted"
        }`}
      >
        {check.message ||
          (check.status === "match"
            ? "Compiled cleanly — perfect match."
            : "No compiler output yet.")}
      </pre>
    </div>
  );
}
