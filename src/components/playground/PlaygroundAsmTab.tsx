import { IconLoader2 } from "@tabler/icons-react";
import { AsmList } from "@/components/asm-diff/AsmList";
import type { Seg } from "@/lib/objdiff/client";
import type { Status } from "./types";

type Props = {
  status: Status;
  rows: Seg[][];
};

export function PlaygroundAsmTab({ status, rows }: Props) {
  if (status === "running") {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-xs text-content-faint">
        <IconLoader2 size={14} className="animate-spin text-accent" /> Compiling with mwcceppc.exe…
      </div>
    );
  }

  if (status === "compileError" || status === "error") {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-content-faint">
        Your code didn’t compile — see the Console tab.
      </div>
    );
  }

  if (rows.length) {
    return <AsmList rows={rows} />;
  }

  if (status === "ok") {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-content-faint">
        No functions in the output. Define a function to see its assembly.
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-content-faint">
      Hit “Compile” to see the assembly.
    </div>
  );
}
