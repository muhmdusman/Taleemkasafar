"use client";

import { focusRing } from "@/components/dashboard/styles";
import { paletteStatus, type PaletteStatus, type AnswerState } from "@/lib/quiz/session";
import { cn } from "@/lib/utils";

const STYLES: Record<PaletteStatus, string> = {
  current: "border-brand bg-brand text-on-brand",
  saved: "border-success/40 bg-success-fixed text-success",
  selected: "border-brand/40 bg-brand-fixed text-brand-container",
  review: "border-tone-amber/50 bg-tone-amber-soft text-tone-amber",
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

/**
 * Grid of question chips (mock question map) for questions [start, end):
 * one section at a time keeps a 200-question paper scannable. Review chips
 * also carry a dot, so the state isn't colour-only.
 */
export function QuestionPalette({
  start = 0,
  end,
  currentIndex,
  states,
  onNavigate,
}: {
  start?: number;
  end: number;
  currentIndex: number;
  states: AnswerState[];
  onNavigate: (index: number) => void;
}) {
  const indexes = Array.from({ length: Math.max(0, end - start) }, (_, k) => start + k);
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-2">
      {indexes.map((i) => {
        const status = paletteStatus(i, currentIndex, states[i] ?? {});
        const flagged = states[i]?.review === true;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onNavigate(i)}
            aria-label={`Question ${i + 1}, ${STATUS_LABEL[status]}${flagged && status === "current" ? ", marked for review" : ""}`}
            aria-current={status === "current" ? "step" : undefined}
            className={cn(
              "relative flex h-10 items-center justify-center rounded-lg border font-headline text-xs font-semibold tabular-nums transition-[background-color,border-color,transform] duration-150 active:translate-y-px motion-reduce:transition-none",
              focusRing,
              STYLES[status],
            )}
          >
            {i + 1}
            {flagged ? (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 size-1.5 rounded-full bg-tone-amber"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Key for the chip colours. */
export function PaletteLegend() {
  const items = [
    { label: "Answered", className: "border-success/40 bg-success-fixed" },
    { label: "For review", className: "border-tone-amber/50 bg-tone-amber-soft" },
    { label: "Not answered", className: "border-outline-variant bg-surface-lowest" },
    { label: "Current", className: "border-brand bg-brand" },
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-on-surface-variant">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={cn("size-3.5 rounded border", it.className)} />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
