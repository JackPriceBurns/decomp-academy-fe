import { ComponentType } from "react";
import { IconLoader2 } from "@tabler/icons-react";

type Variant = 'success' | 'warning' | 'danger' | 'accent';

type Props = {
  text: string;
  icon?: ComponentType<{ size?: number }>;
  loading?: boolean;
  variant: Variant;
}

const variantClasses: Record<Variant, string> = {
  accent: "bg-accent/10 text-accent",
  danger: "bg-bad/15 text-bad",
  success: "bg-good/15 theme-light:bg-good-soft/15 text-good theme-light:text-good-soft",
  warning: "bg-warn/15 theme-light:bg-amber-50 text-warn theme-light:text-amber-500",
}

export function Pill({ text, icon: Icon, loading = false, variant }: Props) {
  const base = 'flex justify-center items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold transition-colors duration-500';

  return (
    <span className={`${base} ${variantClasses[variant]}`}>
      {loading && <IconLoader2 size={14} className="animate-spin" />}
      {Icon && !loading && <Icon size={14}/>}
      {text}
    </span>
  );
}
