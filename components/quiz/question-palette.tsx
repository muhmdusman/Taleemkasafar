"use client";

import { paletteStatus, type PaletteStatus, type AnswerState } from "@/lib/quiz/session";
import { cn } from "@/lib/utils";

const STYLES: Record<PaletteStatus, string> = {
  current: "bg-brand text-white border-black",
  saved: "bg-[#16a34a] text-white border-black",
  selected: "bg-brand-fixed text-black border-black",
  review: "bg-white text-danger border-danger ring-2 ring-danger",
  unattempted: "bg-white text-black border-black",
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
            className={cn(
              "flex h-9 w-9 items-center justify-center border-2 font-headline text-xs font-bold transition-transform active:translate-x-[1px] active:translate-y-[1px]",
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
