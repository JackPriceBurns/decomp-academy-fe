"use client";

import { BrandMark } from "@/components/BrandMark";
import { cx } from "./cx";

// The {dA} brand mark. `size` is the rendered height; width follows the aspect ratio.
export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return <BrandMark height={size} className={cx("block w-auto text-content-bright", className)} />;
}
