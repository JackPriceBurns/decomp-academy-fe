"use client";

import { BrandMark } from "@/components/BrandMark";
import { cx } from "./cx";

type Props = {
  size?: number;
  className?: string;
};

export function Logo({ size = 28, className }: Props) {
  return <BrandMark height={size} className={cx("block w-auto text-content-bright", className)} />;
}
