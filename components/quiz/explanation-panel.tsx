import { Icon } from "@/components/dashboard/icon";

/**
 * Shown after a practice/past-paper answer is graded: a result banner plus the
 * question explanation. Soft Brutalism, with the gamified correct/wrong accent.
 */
export function ExplanationPanel({
  isCorrect,
  explanation,
}: {
  isCorrect: boolean;
  explanation: string | null;
}) {
  return (
    <div className="mt-6 border-2 border-black bg-white shadow-hard">
      <div
        className={
          isCorrect
            ? "flex items-center gap-3 bg-[#16a34a] p-4 text-white"
            : "flex items-center gap-3 bg-danger p-4 text-white"
        }
      >
        <Icon name={isCorrect ? "check_circle" : "cancel"} className="text-2xl" />
        <span className="font-headline text-lg font-bold uppercase tracking-tight">
          {isCorrect ? "Correct!" : "Not quite"}
        </span>
      </div>
      {explanation ? (
        <div className="p-5">
          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Explanation
          </div>
          <p className="font-body text-base leading-relaxed text-on-surface">
            {explanation}
          </p>
        </div>
      ) : (
        <div className="p-5 font-body text-sm text-on-surface-variant">
          No explanation available for this question.
        </div>
      )}
    </div>
  );
}
