"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/dashboard/icon";

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
 * wrong.
 */
export function OptionButton({
  label,
  content,
  state,
  disabled,
  onClick,
}: {
  label: string;
  content: string;
  state: OptionVisualState;
  disabled?: boolean;
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
          "flex h-9 w-9 shrink-0 items-center justify-center font-headline text-base font-bold uppercase",
          badge[state],
        )}
      >
        {state === "correct" || state === "muted-correct" ? (
          <Icon name="check" className="text-xl" />
        ) : state === "wrong" ? (
          <Icon name="close" className="text-xl" />
        ) : (
          label.toUpperCase()
        )}
      </span>
      <span className="text-base font-medium">{content}</span>
    </button>
  );
}
