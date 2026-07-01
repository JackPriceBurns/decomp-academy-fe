"use client";

type Props = {
  children: React.ReactNode;
};

export function PlaygroundCentered({ children }: Props) {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-xs text-content-faint">
      {children}
    </div>
  );
}
