"use client";

import { focusRing } from "@/components/dashboard/styles";
import { paletteStatus, type PaletteStatus, type AnswerState } from "@/lib/quiz/session";
import { cn } from "@/lib/utils";

const STYLES: Record<PaletteStatus, string> = {
  current: "border-brand bg-brand text-on-brand",
  saved: "border-success/40 bg-success-fixed text-success",
  selected: "border-brand/40 bg-brand-fixed text-brand-container",
  review: "border-danger bg-danger-fixed text-danger",
  unattempted: "border-outline-variant bg-surface-lowest text-on-surface hover:border-outline",
};

/** Spoken status, so the palette doesn't rely on color alone. */
const STATUS_LABEL: Record<PaletteStatus, string> = {
  current: "current",
  saved: "answered",
  selected: "selected",
  review: "marked for review",
  unattempted: "not answered",
};

/** Grid of question chips reflecting each question's state (mock palette). */
export function QuestionPalette({
  count,
  currentIndex,
  states,
  onNavigate,
}: {
  count: number;
  currentIndex: number;
  states: AnswerState[];
  onNavigate: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: count }, (_, i) => {
        const status = paletteStatus(i, currentIndex, states[i] ?? {});
        return (
          <button
            key={i}
            type="button"
            onClick={() => onNavigate(i)}
            aria-label={`Question ${i + 1}, ${STATUS_LABEL[status]}`}
            aria-current={status === "current" ? "step" : undefined}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg border font-headline text-xs font-semibold tabular-nums transition-[background-color,border-color,transform] duration-150 active:translate-y-px motion-reduce:transition-none",
              focusRing,
              STYLES[status],
            )}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
