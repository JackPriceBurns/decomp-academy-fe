"use client";

type Props = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export function LessonSourceTab({ active, onClick, children }: Props) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-0.5 font-mono text-2xs transition ${
        active
          ? "bg-accent/15 text-accent ring-1 ring-inset ring-accent/30"
          : "text-content-muted hover:bg-bg-softer hover:text-content-primary"
      }`}
    >
      {children}
    </button>
  );
}
