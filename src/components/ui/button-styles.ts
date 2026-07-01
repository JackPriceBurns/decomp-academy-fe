import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "ghost" | "dashed" | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

export const BTN_BASE =
  "inline-flex items-center justify-center gap-1.5 font-medium transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60";

export const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-on font-semibold shadow-lg shadow-accent/20 hover:bg-accent-hover hover:-translate-y-px active:translate-y-0",
  ghost: "bg-bg-softer/70 text-content-secondary hover:bg-bg-softer hover:text-content-primary",
  dashed: "bg-bg-softer/50 text-content-muted hover:bg-bg-softer hover:text-content",
  subtle: "bg-accent/10 text-accent hover:bg-accent/20",
};

export const BTN_SIZE: Record<ButtonSize, string> = {
  sm: "rounded-md px-2.5 py-1.5 text-xs",
  md: "rounded-md px-3.5 py-2 text-sm",
  lg: "rounded-lg px-5 py-3 text-base",
};

export interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}
