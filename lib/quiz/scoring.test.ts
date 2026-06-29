import { describe, it, expect } from "vitest";
import { scoreMock, isAnswerCorrect, type GradedAnswer } from "./scoring";

function ans(
  subject: string,
  selected: string | null,
  correct: string,
): GradedAnswer {
  return {
    questionId: `${subject}-${Math.random()}`,
    subject,
    selectedOptionId: selected,
    correctOptionId: correct,
  };
}

describe("scoreMock", () => {
  it("scores a mixed set with per-subject breakdown", () => {
    const answers: GradedAnswer[] = [
      ans("maths", "a", "a"), // correct
      ans("maths", "b", "a"), // wrong
      ans("maths", null, "a"), // skipped
      ans("physics", "c", "c"), // correct
      ans("english", "d", "a"), // wrong
    ];
    const r = scoreMock(answers);
    expect(r.totalQuestions).toBe(5);
    expect(r.attemptedCount).toBe(4);
    expect(r.correctCount).toBe(2);
    expect(r.incorrectCount).toBe(2);
    expect(r.skippedCount).toBe(1);
    expect(r.scorePercent).toBe(40); // 2/5
    expect(r.perSubject.maths).toEqual({ correct: 1, total: 3 });
    expect(r.perSubject.physics).toEqual({ correct: 1, total: 1 });
    expect(r.perSubject.english).toEqual({ correct: 0, total: 1 });
  });

  it("handles all-correct", () => {
    const answers = [ans("maths", "a", "a"), ans("physics", "b", "b")];
    const r = scoreMock(answers);
    expect(r.correctCount).toBe(2);
    expect(r.scorePercent).toBe(100);
    expect(r.skippedCount).toBe(0);
  });

  it("handles all-skipped", () => {
    const answers = [ans("maths", null, "a"), ans("physics", null, "b")];
    const r = scoreMock(answers);
    expect(r.attemptedCount).toBe(0);
    expect(r.correctCount).toBe(0);
    expect(r.skippedCount).toBe(2);
    expect(r.scorePercent).toBe(0);
  });

  it("handles an empty set without dividing by zero", () => {
    const r = scoreMock([]);
    expect(r.totalQuestions).toBe(0);
    expect(r.scorePercent).toBe(0);
    expect(r.perSubject).toEqual({});
  });

  it("rounds score percent to 2 decimals", () => {
    // 1 correct of 3 = 33.333... → 33.33
    const answers = [
      ans("maths", "a", "a"),
      ans("maths", "x", "a"),
      ans("maths", "y", "a"),
    ];
    expect(scoreMock(answers).scorePercent).toBe(33.33);
  });
});

describe("isAnswerCorrect", () => {
  it("is false for a skipped answer", () => {
    expect(isAnswerCorrect(null, "a")).toBe(false);
  });
  it("is true only on an exact match", () => {
    expect(isAnswerCorrect("a", "a")).toBe(true);
    expect(isAnswerCorrect("b", "a")).toBe(false);
  });
});
