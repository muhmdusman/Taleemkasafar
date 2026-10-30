"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/dashboard/icon";
import { focusRing } from "@/components/dashboard/styles";
import { MathText } from "./math-text";

export type OptionVisualState =
  | "idle"
  | "selected"
  | "correct"
  | "wrong"
  | "muted-correct";

/**
 * A single MCQ option. Feedback colors (green correct / red wrong) are used
 * ONLY after grading, as light tints with a solid icon badge (never color
 * alone: the badge shows a check or a cross). Before grading, options are idle
 * or selected. `muted-correct` outlines the right answer when the user picked
 * wrong. Option text is rendered with proper math typography.
 */
export function OptionButton({
  label,
  content,
  state,
  disabled,
  loading = false,
  onClick,
}: {
  label: string;
  content: string;
  state: OptionVisualState;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}) {
  // `border` + a 1px ring of the same color reads as a 2px edge for the
  // active states without shifting the layout.
  const base = cn(
    "flex w-full items-center gap-4 rounded-xl border p-4 text-left font-body text-on-surface transition-[background-color,border-color,box-shadow] duration-150 motion-reduce:transition-none",
    focusRing,
  );
  const byState: Record<OptionVisualState, string> = {
    idle: "border-outline bg-surface-lowest hover:bg-surface-low",
    selected: "border-brand bg-brand-fixed ring-1 ring-brand",
    correct: "border-success bg-success-fixed ring-1 ring-success",
    wrong: "border-danger bg-danger-fixed ring-1 ring-danger",
    "muted-correct": "border-success bg-surface-lowest ring-1 ring-success",
  };

  const badge: Record<OptionVisualState, string> = {
    idle: "bg-surface-container text-on-surface",
    selected: "bg-brand text-on-brand",
    correct: "bg-success text-on-brand",
    wrong: "bg-danger text-on-brand",
    "muted-correct": "bg-success text-on-brand",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(base, byState[state], disabled && "cursor-default")}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg font-headline text-base font-bold uppercase",
          badge[state],
        )}
      >
        {loading ? (
          <span className="relative flex h-full w-full items-center justify-center">
            <span className="absolute inset-0 -translate-x-full animate-[loaderSweep_0.8s_linear_infinite] bg-brand/40" />
            <span className="relative text-[11px] tracking-tighter">TS</span>
          </span>
        ) : state === "correct" || state === "muted-correct" ? (
          <Icon name="check" className="text-xl" />
        ) : state === "wrong" ? (
          <Icon name="close" className="text-xl" />
        ) : (
          label.toUpperCase()
        )}
      </span>
      <span className="text-base font-medium">
        <MathText>{content}</MathText>
      </span>
    </button>
  );
}
