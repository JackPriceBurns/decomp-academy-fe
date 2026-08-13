"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

const STORAGE_PREFIX = "decomp-split-";
const KEY_STEP_PX = 24;
const KEY_SHIFT_MULTIPLIER = 4;

/** Divider thickness. Its track is `auto`, so the handle's own size defines it. */
export const SPLIT_HANDLE_PX = 5;

/** How the two panes sit: side by side (drag on x) or stacked (drag on y). */
export type SplitLayout = "horizontal" | "vertical";

// Shared by every split: a pane reflowing mid-drag can flash a scrollbar, which
// resizes the *other* split's container. Without this the two would re-measure
// and re-render each other in a loop for as long as the drag lasts.
let activeDrags = 0;

export type SplitPane = {
  /** Attach to the element wrapping [first pane, handle, second pane]. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Put on that same element: seeds the first pane's size before measuring. */
  containerStyle: CSSProperties;
  layout: SplitLayout;
  /** First pane's share of the container, 0..1. */
  ratio: number;
  dragging: boolean;
  label: string;
  startDrag: (e: React.PointerEvent<HTMLElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  reset: () => void;
};

type Options = {
  /** Key this split persists its ratio under, minus the shared prefix. */
  storageKey: string;
  layout: SplitLayout;
  /** Custom property the container's grid-template / flex-basis reads. */
  cssVar: string;
  defaultRatio: number;
  /** Smallest useful size of each pane, divider excluded. */
  minFirstPx: number;
  minSecondPx: number;
  /** Accessible name for the separator. */
  label: string;
};

function readRatio(storageKey: string): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + storageKey);
    const n = raw === null ? NaN : Number.parseFloat(raw);
    return n > 0 && n < 1 ? n : null;
  } catch {
    return null;
  }
}

function writeRatio(storageKey: string, ratio: number) {
  try {
    localStorage.setItem(STORAGE_PREFIX + storageKey, ratio.toFixed(4));
  } catch {
    /* private mode / storage disabled — the split still works this session */
  }
}

// Drives a draggable divider between two panes. The ratio is what's persisted,
// but the pane is sized in px off the measured container, so the minimums hold
// on a window resize as well as on a drag. The size is written to the DOM
// imperatively: the pane contents (Monaco, the diff table) are expensive to
// re-render, so React state only updates on release, and an unrelated re-render
// landing mid-drag must not put the stale ratio back.
export function useSplitPane({
  storageKey,
  layout,
  cssVar,
  defaultRatio,
  minFirstPx,
  minSecondPx,
  label,
}: Options): SplitPane {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(defaultRatio);
  const [span, setSpan] = useState(0);
  const [dragging, setDragging] = useState(false);
  const ratioRef = useRef(ratio);
  ratioRef.current = ratio;
  const draggingRef = useRef(false);

  const horizontal = layout === "horizontal";

  // Pre-paint, so a remembered ratio never flashes at the default size.
  useLayoutEffect(() => {
    const saved = readRatio(storageKey);
    if (saved !== null) setRatio(saved);
  }, [storageKey]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      if (activeDrags > 0) return;
      const rect = el.getBoundingClientRect();
      setSpan(horizontal ? rect.width : rect.height);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [horizontal]);

  const clamp = useCallback(
    (next: number, within: number) => {
      const lo = minFirstPx / within;
      const hi = (within - SPLIT_HANDLE_PX - minSecondPx) / within;
      if (lo >= hi) return (lo + hi) / 2;
      return Math.min(Math.max(next, lo), hi);
    },
    [minFirstPx, minSecondPx],
  );

  /** Percentage until the container has been measured, px from then on. */
  const size = useCallback(
    (next: number, within: number) =>
      within > 0 ? `${Math.round(clamp(next, within) * within)}px` : `${(next * 100).toFixed(2)}%`,
    [clamp],
  );

  const apply = useCallback(
    (next: number, within: number) => {
      containerRef.current?.style.setProperty(cssVar, size(next, within));
    },
    [cssVar, size],
  );

  // Every non-drag update: restored ratio, keyboard steps, reset, and
  // re-clamping after a resize.
  useLayoutEffect(() => {
    if (!draggingRef.current) apply(ratio, span);
  }, [apply, ratio, span]);

  const commit = useCallback(
    (next: number) => {
      ratioRef.current = next;
      setRatio(next);
      writeRatio(storageKey, next);
    },
    [storageKey],
  );

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const el = containerRef.current;
      if (!el || e.button !== 0) return;
      const rect = el.getBoundingClientRect();
      const within = horizontal ? rect.width : rect.height;
      if (within <= 0) return;

      e.preventDefault();
      const handle = e.currentTarget;
      handle.setPointerCapture(e.pointerId);

      const restoreCursor = document.body.style.cursor;
      const restoreSelect = document.body.style.userSelect;
      document.body.style.cursor = horizontal ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
      draggingRef.current = true;
      activeDrags += 1;
      setDragging(true);

      const abort = new AbortController();
      let live = ratioRef.current;

      handle.addEventListener(
        "pointermove",
        (ev: PointerEvent) => {
          const offset = horizontal ? ev.clientX - rect.left : ev.clientY - rect.top;
          live = clamp(offset / within, within);
          ratioRef.current = live;
          apply(live, within);
        },
        { signal: abort.signal },
      );

      const end = () => {
        if (abort.signal.aborted) return;
        abort.abort();
        document.body.style.cursor = restoreCursor;
        document.body.style.userSelect = restoreSelect;
        draggingRef.current = false;
        activeDrags = Math.max(0, activeDrags - 1);
        setDragging(false);
        setSpan(within);
        commit(live);
      };
      handle.addEventListener("pointerup", end, { signal: abort.signal });
      handle.addEventListener("pointercancel", end, { signal: abort.signal });
      // Losing the capture any other way would leave the drag state, the body
      // cursor and the selection lock stuck on.
      handle.addEventListener("lostpointercapture", end, { signal: abort.signal });
    },
    [apply, clamp, commit, horizontal],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (span <= 0) return;
      const step = (KEY_STEP_PX * (e.shiftKey ? KEY_SHIFT_MULTIPLIER : 1)) / span;

      let next: number | null = null;
      if (e.key === (horizontal ? "ArrowLeft" : "ArrowUp")) next = ratioRef.current - step;
      else if (e.key === (horizontal ? "ArrowRight" : "ArrowDown")) next = ratioRef.current + step;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = 1;
      else if (e.key === "Enter" || e.key === " ") next = defaultRatio;
      if (next === null) return;

      e.preventDefault();
      commit(clamp(next, span));
    },
    [clamp, commit, defaultRatio, horizontal, span],
  );

  const reset = useCallback(() => commit(defaultRatio), [commit, defaultRatio]);

  // Not tied to `ratio`: this only seeds the first paint, and staying constant
  // is what keeps React from writing over a drag in progress.
  const containerStyle = useMemo(
    () => ({ [cssVar]: `${(defaultRatio * 100).toFixed(2)}%` }) as CSSProperties,
    [cssVar, defaultRatio],
  );

  return {
    containerRef,
    containerStyle,
    layout,
    ratio,
    dragging,
    label,
    startDrag,
    onKeyDown,
    reset,
  };
}
