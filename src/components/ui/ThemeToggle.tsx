"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "@/lib/theme-context";
import { cx } from "./cx";

type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const base =
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-content-secondary transition hover:bg-bg-softer hover:text-content-primary";

  if (!mounted) {
    return <span className={cx(base, className)} aria-hidden="true" />;
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className={cx(base, className)}
    >
      {theme === "dark" ? <IconSun size={17} /> : <IconMoon size={17} />}
    </button>
  );
}
