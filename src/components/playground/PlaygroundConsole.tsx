import { IconLoader2 } from "@tabler/icons-react";
import type { Status } from "./types";
import { WorkspaceConsolePre } from "@/components/workspace/WorkspaceConsolePre";

type Props = {
  status: Status;
  message: string;
};

export function PlaygroundConsole({ status, message }: Props) {
  if (status === "running") {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-xs text-content-faint">
        <IconLoader2 size={14} className="animate-spin text-accent" /> Compiling…
      </div>
    );
  }

  return (
    <WorkspaceConsolePre
      isErr={status === "compileError" || status === "error"}
      text={message || (status === "ok" ? "Compiled cleanly." : "No compiler output yet.")}
    />
  );
}
