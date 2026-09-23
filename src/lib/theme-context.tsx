"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "theme";

// Runs before paint (injected in <head>) so the first frame already has the
// right theme — no flash. Stored choice wins, otherwise default to light.
// Mirrors the resolution in ThemeProvider/useState below; keep them in sync.
export const themeInitScript = `(function(){var t='light';try{var stored=localStorage.getItem('${STORAGE_KEY}');if(stored==='light'||stored==='dark'){t=stored;}}catch(e){}document.documentElement.dataset.theme=t;})();`;

function readTheme(): Theme {
  if (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark") {
    return "dark";
  }
  return "light";
}

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const Context = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The pre-paint script has already set documentElement.dataset.theme by the
  // time this hydrates on the client, so the initializer reads the real value.
  const [theme, setThemeState] = useState<Theme>(readTheme);

  const apply = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* private mode / storage disabled — the in-memory state still works */
    }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // Keep state in sync if the attribute was changed before hydration finished.
  useEffect(() => {
    const actual = readTheme();
    setThemeState((prev) => (prev === actual ? prev : actual));
  }, []);

  return <Context.Provider value={{ theme, toggle, setTheme: apply }}>{children}</Context.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
