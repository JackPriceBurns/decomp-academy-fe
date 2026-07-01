"use client";

import { useEffect, useState } from "react";
import { IconCheck } from "@tabler/icons-react";

export function HeroMatchPreview() {
  const [matched, setMatched] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      return;
    }

    setMatched(false);

    const t = setTimeout(() => setMatched(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const rows: [string, string, boolean][] = [
    ["lwz       r0, 0x0(r3)", "lwz       r0, 0x0(r3)", true],
    ["lfs       f1, 0x4(r3)", "lfs       f1, 0x4(r3)", true],
    ["fmuls     f0, f0, f1", "fmadds    f0, f0, f1, f2", false],
    ["fadds     f0, f0, f2", "fadds     f0, f0, f2", false],
    ["stfs      f0, 0x0(r4)", "stfs      f0, 0x0(r4)", true],
    ["blr", "blr", true],
  ];

  return (
    <div className="animate-slide-up-fade overflow-hidden rounded-xl theme-light:bg-white bg-bg-inset/90 theme-light:shadow-lg shadow-2xl ring-1 ring-white/5 backdrop-blur lg:translate-y-0">
      <div className="flex items-center gap-2 border-b border-line bg-bg-soft/80 px-3.5 py-2">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-good/70 theme-light:bg-good-soft/70" />
        </span>

        <span className="ml-1 font-mono text-2xs text-content-muted">match Vec_Normalize</span>

        <span
          className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold transition-colors duration-500 ${
            matched
              ? "bg-good/15 theme-light:bg-good-soft/15 text-good theme-light:text-good-soft"
              : "bg-warn/15 theme-light:bg-amber-50 text-warn theme-light:text-amber-500"
          }`}
        >
          {matched ? (
            <>
              <IconCheck size={11} /> 100% byte-match
            </>
          ) : (
            <>87.5% — 2 instrs left</>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 font-mono text-[11px] leading-none">
        <div className="border-r border-line/60 px-3 py-1.5 text-2xs uppercase tracking-wider text-content-faint">
          Target
        </div>

        <div className="px-3 py-1.5 text-2xs uppercase tracking-wider text-content-faint">
          Your output
        </div>

        {rows.map(([t, y, ok], i) => {
          const isMatch = ok || matched;
          return (
            <div key={i} className="contents">
              <div
                className={`border-t border-line/40 px-3 py-1.5 transition-colors duration-500 ${
                  isMatch ? "" : "bg-warn/[0.07]"
                } text-content-secondary`}
              >
                {t}
              </div>

              <div
                className={`border-t border-line/40 px-3 py-1.5 transition-colors duration-500 ${
                  isMatch ? "text-good theme-light:text-good-soft" : "bg-bad/10 text-bad"
                }`}
              >
                {matched ? t : y}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
