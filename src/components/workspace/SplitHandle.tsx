import { cx } from "@/components/ui/cx";
import { SPLIT_HANDLE_PX, type SplitPane } from "./useSplitPane";

type Props = {
  split: SplitPane;
};

// Draggable divider between two workspace panes. Hidden below lg, where the panes
// are swapped through tabs instead of shown together.
export function SplitHandle({ split }: Props) {
  const horizontal = split.layout === "horizontal";

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-label={split.label}
      aria-valuenow={Math.round(split.ratio * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      title="Drag to resize · double-click to reset"
      onPointerDown={split.startDrag}
      onKeyDown={split.onKeyDown}
      onDoubleClick={split.reset}
      style={horizontal ? { width: SPLIT_HANDLE_PX } : { height: SPLIT_HANDLE_PX }}
      className={cx(
        "group relative z-10 hidden shrink-0 touch-none select-none transition-colors lg:block",
        horizontal ? "cursor-col-resize" : "cursor-row-resize",
        split.dragging ? "bg-accent/20" : "hover:bg-accent/10",
      )}
    >
      {/* Grab area, wider than the divider itself so it's easy to hit. */}
      <span
        aria-hidden
        className={cx("absolute", horizontal ? "-inset-x-1 inset-y-0" : "inset-x-0 -inset-y-1")}
      />

      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute transition-colors",
          horizontal
            ? "inset-y-0 left-1/2 w-px -translate-x-1/2"
            : "inset-x-0 top-1/2 h-px -translate-y-1/2",
          split.dragging ? "bg-accent" : "bg-line group-hover:bg-accent/70",
        )}
      />
    </div>
  );
}
