"use client";

import { IconLoader2 } from "@tabler/icons-react";
import type { Status } from "./types";
import { PlaygroundCentered } from "./PlaygroundCentered";

type Props = {
  status: Status;
  message: string;
};

export function PlaygroundConsole({ status, message }: Props) {
  if (status === "running") {
    return (
      <PlaygroundCentered>
        <IconLoader2 size={14} className="animate-spin text-accent" /> Compiling…
      </PlaygroundCentered>
    );
  }
  const isErr = status === "compileError" || status === "error";
  return (
    <pre
      className={`h-full whitespace-pre-wrap px-4 py-3 font-mono text-xs leading-relaxed ${
        isErr ? "text-bad-text" : "text-content-muted"
      }`}
    >
      {message || (status === "ok" ? "Compiled cleanly." : "No compiler output yet.")}
    </pre>
  );
}
