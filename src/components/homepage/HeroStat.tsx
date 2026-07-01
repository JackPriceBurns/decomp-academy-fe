type Props = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

export function HeroStat({ icon, label, value }: Props) {
  return (
    <div className="flex items-center gap-2">
      {icon}

      <div>
        <div className="font-bold leading-none text-content-primary">{value}</div>
        <div className="text-xs text-content-muted">{label}</div>
      </div>
    </div>
  );
}
