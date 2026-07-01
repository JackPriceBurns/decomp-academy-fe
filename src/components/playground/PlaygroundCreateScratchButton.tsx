import { IconExternalLink, IconLoader2 } from "@tabler/icons-react";
import type { ScratchState } from "./types";

type Props = {
  scratch: ScratchState;
  disabled: boolean;
  onClick: () => void;
};

export function PlaygroundCreateScratchButton({ scratch, disabled, onClick }: Props) {
  if (scratch.state === "done") {
    return (
      <a
        href={scratch.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md bg-good/15 theme-light:bg-good-soft/15 px-2.5 py-1 text-xs font-semibold text-good theme-light:text-good-soft transition hover:bg-good/25 theme-light:hover:bg-good-soft/25"
      >
        <IconExternalLink size={13} /> Open on decomp.me
      </a>
    );
  }
  const busy = scratch.state === "creating";
  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      title="Create a shareable scratch on decomp.me from this code"
      className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs text-content-secondary transition hover:bg-bg-softer hover:text-content-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? <IconLoader2 size={13} className="animate-spin" /> : <IconExternalLink size={13} />}
      {busy ? "Creating…" : "Create scratch"}
    </button>
  );
}
