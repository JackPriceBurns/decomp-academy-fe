"use client";

type Props = {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export function PlaygroundTabButton({ active, onClick, icon, children }: Props) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition ${
        active
          ? "border-accent text-content-primary"
          : "border-transparent text-content-muted hover:text-content-secondary"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
