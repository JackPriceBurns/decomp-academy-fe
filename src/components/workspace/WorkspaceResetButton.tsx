import { IconRefresh } from "@tabler/icons-react";

type Props = {
  onClick: () => void;
};

export function WorkspaceResetButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs text-content-secondary transition hover:bg-bg-softer hover:text-content-primary"
    >
      <IconRefresh size={14} /> Reset
    </button>
  );
}
