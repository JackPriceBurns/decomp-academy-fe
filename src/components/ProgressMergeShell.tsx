type Props = { children: React.ReactNode };

export function ProgressMergeShell({ children }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="merge-title"
    >
      <div className="animate-slide-up-fade w-full max-w-md rounded-2xl border border-line bg-bg-soft px-6 py-7 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
