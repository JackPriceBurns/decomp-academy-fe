import { IconLoader2, IconPlayerPlayFilled } from "@tabler/icons-react";

type Props = {
  running: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

export function WorkspaceRunButton({ running, onClick, disabled, children }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-on transition hover:bg-accent-hover active:scale-[0.97] disabled:opacity-60"
    >
      {running ? (
        <IconLoader2 size={14} className="animate-spin" />
      ) : (
        <IconPlayerPlayFilled size={13} />
      )}
      {children}
    </button>
  );
}
