"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/dashboard/icon";
import { MathText } from "./math-text";

export type OptionVisualState =
  | "idle"
  | "selected"
  | "correct"
  | "wrong"
  | "muted-correct";

/**
 * A single MCQ option in Soft Brutalism. Feedback colors (green correct / red
 * wrong) are used ONLY after grading. Before grading, options are idle or
 * selected. `muted-correct` highlights the right answer when the user picked
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
  const base =
    "flex w-full items-center gap-4 border-2 border-black p-4 text-left font-body transition-all";
  const byState: Record<OptionVisualState, string> = {
    idle: "bg-white hover:bg-brand-fixed active:translate-x-[2px] active:translate-y-[2px]",
    selected: "bg-brand-fixed shadow-hard",
    correct: "bg-[#16a34a] text-white shadow-hard",
    wrong: "bg-danger text-white shadow-hard",
    "muted-correct": "bg-[#dcfce7] border-[#16a34a]",
  };

  const badge: Record<OptionVisualState, string> = {
    idle: "bg-black text-white",
    selected: "bg-black text-white",
    correct: "bg-white text-[#16a34a]",
    wrong: "bg-white text-danger",
    "muted-correct": "bg-[#16a34a] text-white",
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
          "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden font-headline text-base font-bold uppercase",
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
