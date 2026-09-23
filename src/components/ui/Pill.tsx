import { ComponentType } from "react";

type Variant = 'success' | 'warning' | 'danger';

type Props = {
  text: string;
  icon?: ComponentType<{ size?: number }>,
  variant: 'success' | 'warning' | 'danger';
}

const variantClasses: Record<Variant, string> = {
  danger: "",
  success: "bg-good/15 theme-light:bg-good-soft/15 text-good theme-light:text-good-soft",
  warning: "bg-warn/15 theme-light:bg-amber-50 text-warn theme-light:text-amber-500"
}

export function Pill({ text, icon: Icon, variant }: Props) {
  const base = 'flex justify-center items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold transition-colors duration-500';

  return (
    <span className={`${base} ${variantClasses[variant]}`}>
      {Icon && <Icon size={14} />}
      {text}
    </span>
  );
}
