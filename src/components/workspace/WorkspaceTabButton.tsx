import { ComponentType } from "react";

type Props = {
  active: boolean;
  onClick: () => void;
  icon: ComponentType<{ size: number }>;
  text: string;
  className?: string;
};

export function WorkspaceTabButton({ active, onClick, icon: Icon, text, className = "" }: Props) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition ${className} ${
        active
          ? "border-accent text-content-primary"
          : "border-transparent text-content-muted hover:text-content-secondary"
      }`}
    >
      <Icon size={14} />
      {text}
    </button>
  );
}
