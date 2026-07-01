"use client";

type Props = {
  icon: React.ReactNode;
  value: string;
  label: string;
};

export function MatchLogStat({ icon, value, label }: Props) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <div className="font-semibold leading-none tabular-nums text-content-primary">{value}</div>
        <div className="mt-1 text-2xs text-content-muted">{label}</div>
      </div>
    </div>
  );
}
