"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "./cx";
import { BTN_BASE, BTN_SIZE, BTN_VARIANT, type ButtonBaseProps } from "./button-styles";

type Props = ButtonBaseProps & Omit<ComponentProps<typeof Link>, "className" | "children">;

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: Props) {
  return (
    <Link className={cx(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], className)} {...rest}>
      {children}
    </Link>
  );
}
