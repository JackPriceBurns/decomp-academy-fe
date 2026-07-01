type Props = {
  icon: React.ReactNode;
  label: string;
  touched: number;
  completed: number;
};

export function ProgressMergeSide({ icon, label, touched, completed }: Props) {
  return (
    <div className="flex-1 rounded-lg border border-line bg-bg-inset px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-content-secondary">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-sm text-content-primary">
        <span className="font-semibold text-content-bright">{touched}</span> lesson
        {touched === 1 ? "" : "s"} in progress
      </div>
      <div className="text-xs text-content-muted">{completed} completed</div>
    </div>
  );
}
