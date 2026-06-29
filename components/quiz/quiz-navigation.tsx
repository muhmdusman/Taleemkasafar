"use client";

import { Icon } from "@/components/dashboard/icon";
import { cn } from "@/lib/utils";

const btn =
  "flex items-center gap-2 border-2 border-black px-4 py-2.5 font-headline text-xs font-bold uppercase tracking-tight transition-transform active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-40";

/** Mock navigation controls: Save, Prev/Next, Mark Review, section jumps. */
export function QuizNavigation({
  onPrev,
  onNext,
  onPrevSection,
  onNextSection,
  onToggleReview,
  isFirst,
  isLast,
  canPrevSection,
  canNextSection,
  isMarkedForReview,
}: {
  onPrev: () => void;
  onNext: () => void;
  onPrevSection: () => void;
  onNextSection: () => void;
  onToggleReview: () => void;
  isFirst: boolean;
  isLast: boolean;
  canPrevSection: boolean;
  canNextSection: boolean;
  isMarkedForReview: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onPrev} disabled={isFirst} className={cn(btn, "bg-white hover:bg-brand-fixed")}>
        <Icon name="arrow_back" className="text-base" /> Prev
      </button>
      <button type="button" onClick={onNext} disabled={isLast} className={cn(btn, "bg-white hover:bg-brand-fixed")}>
        Next <Icon name="arrow_forward" className="text-base" />
      </button>
      <button
        type="button"
        onClick={onToggleReview}
        className={cn(
          btn,
          isMarkedForReview ? "bg-danger text-white" : "bg-white hover:bg-brand-fixed",
        )}
      >
        <Icon name="flag" className="text-base" />
        {isMarkedForReview ? "Unmark" : "Review"}
      </button>
      <button type="button" onClick={onPrevSection} disabled={!canPrevSection} className={cn(btn, "bg-white hover:bg-brand-fixed")}>
        <Icon name="first_page" className="text-base" /> Prev Section
      </button>
      <button type="button" onClick={onNextSection} disabled={!canNextSection} className={cn(btn, "bg-white hover:bg-brand-fixed")}>
        Next Section <Icon name="last_page" className="text-base" />
      </button>
    </div>
  );
}
