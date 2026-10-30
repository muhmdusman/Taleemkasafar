"use client";

import { Icon } from "@/components/dashboard/icon";
import { appButton } from "@/components/dashboard/styles";
import { cn } from "@/lib/utils";

const btn = appButton({ variant: "secondary", size: "sm" });

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
      <button type="button" onClick={onPrev} disabled={isFirst} className={btn}>
        <Icon name="arrow_back" className="text-lg" /> Prev
      </button>
      <button type="button" onClick={onNext} disabled={isLast} className={btn}>
        Next <Icon name="arrow_forward" className="text-lg" />
      </button>
      <button
        type="button"
        onClick={onToggleReview}
        aria-pressed={isMarkedForReview}
        className={cn(
          btn,
          isMarkedForReview &&
            "border-danger/40 bg-danger-fixed text-danger hover:border-danger/60 hover:bg-danger-fixed",
        )}
      >
        <Icon name="flag" filled={isMarkedForReview} className="text-lg" />
        {isMarkedForReview ? "Unmark" : "Review"}
      </button>
      <button type="button" onClick={onPrevSection} disabled={!canPrevSection} className={btn}>
        <Icon name="first_page" className="text-lg" /> Prev Section
      </button>
      <button type="button" onClick={onNextSection} disabled={!canNextSection} className={btn}>
        Next Section <Icon name="last_page" className="text-lg" />
      </button>
    </div>
  );
}
