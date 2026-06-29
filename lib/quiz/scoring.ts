/**
 * Pure scoring logic (no DB) — the oracle for both client-side display math and
 * the integration check that verifies the server-side SQL grader agrees.
 */

export type GradedAnswer = {
  questionId: string;
  subject: string;
  /** The option the learner selected, or null if skipped. */
  selectedOptionId: string | null;
  /** The correct option for this question. */
  correctOptionId: string;
};

export type SubjectBreakdown = {
  correct: number;
  total: number;
};

export type MockScore = {
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  scorePercent: number;
  perSubject: Record<string, SubjectBreakdown>;
};

/** Round to 2 decimals (matches the DB numeric(5,2) result column). */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Grade a full set of answers. Score percent is correct / totalQuestions
 * (skipped questions count against the score, as in a real exam).
 */
export function scoreMock(answers: GradedAnswer[]): MockScore {
  const perSubject: Record<string, SubjectBreakdown> = {};
  let correct = 0;
  let attempted = 0;

  for (const a of answers) {
    const bucket = (perSubject[a.subject] ??= { correct: 0, total: 0 });
    bucket.total += 1;

    if (a.selectedOptionId !== null) {
      attempted += 1;
      if (a.selectedOptionId === a.correctOptionId) {
        correct += 1;
        bucket.correct += 1;
      }
    }
  }

  const total = answers.length;
  const incorrect = attempted - correct;
  const skipped = total - attempted;

  return {
    totalQuestions: total,
    attemptedCount: attempted,
    correctCount: correct,
    incorrectCount: incorrect,
    skippedCount: skipped,
    scorePercent: total === 0 ? 0 : round2((correct / total) * 100),
    perSubject,
  };
}

/** Whether a single selection is correct (used for practice instant feedback). */
export function isAnswerCorrect(
  selectedOptionId: string | null,
  correctOptionId: string,
): boolean {
  return selectedOptionId !== null && selectedOptionId === correctOptionId;
}
