import type { ComponentProps } from "react";
import { cx } from "./cx";
import { BTN_BASE, BTN_SIZE, BTN_VARIANT, type ButtonBaseProps } from "./button-styles";

type Props = ButtonBaseProps & Omit<ComponentProps<"button">, "className" | "children">;

export function Button({ variant = "primary", size = "md", className, children, ...rest }: Props) {
  return (
    <button className={cx(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], className)} {...rest}>
      {children}
    </button>
  );
}
