"use client";

import { useEffect, useRef, useState } from "react";
import type { DiffRowVM } from "@/lib/objdiff/client";
import { AsmDiffStackPane } from "./AsmDiffStackPane";

type Props = { rows: DiffRowVM[] };

export function AsmDiffStackedDiff({ rows }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);

  const [height, setHeight] = useState<number>();
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      if (el.offsetParent === null) return;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      setHeight(Math.max(220, Math.floor(vh - el.getBoundingClientRect().top)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, []);

  const lock = useRef(false);
  const link = (src: HTMLDivElement | null, dst: HTMLDivElement | null) => {
    if (!src || !dst || lock.current) return;
    lock.current = true;
    dst.scrollTop = src.scrollTop;
    dst.scrollLeft = src.scrollLeft;
    requestAnimationFrame(() => {
      lock.current = false;
    });
  };
  return (
    <div
      ref={rootRef}
      style={{ height }}
      className="flex h-[calc(100dvh-11rem)] min-h-0 flex-col font-mono text-asm"
    >
      <AsmDiffStackPane
        label="Target asm"
        rows={rows}
        side="target"
        scrollRef={topRef}
        onScroll={() => link(topRef.current, botRef.current)}
      />
      <AsmDiffStackPane
        label="Current asm"
        rows={rows}
        side="user"
        scrollRef={botRef}
        onScroll={() => link(botRef.current, topRef.current)}
        className="border-t-2 border-line"
      />
    </div>
  );
}
