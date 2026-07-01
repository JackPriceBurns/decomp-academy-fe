"use client";

type Props = {
  children: React.ReactNode;
};

export function PlaygroundEmpty({ children }: Props) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-content-faint">
      {children}
    </div>
  );
}
