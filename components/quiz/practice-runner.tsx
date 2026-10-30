"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/dashboard/icon";
import { appButton, card } from "@/components/dashboard/styles";
import { OptionButton, type OptionVisualState } from "./option-button";
import { MathText } from "./math-text";
import { BookmarkButton } from "./bookmark-button";
import { CheckingOverlay } from "./ts-ring-loader";
import {
  startPractice,
  answerPractice,
  finishPractice,
  type PracticeGrade,
} from "@/app/dashboard/quiz-actions";
import type { PracticeScreenData } from "@/lib/queries/practice";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Graded = {
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionId: string | null;
  explanation: string | null;
};

/**
 * Focused practice / past-paper screen (no dashboard sidebar). Layout:
 *  - slim top header: logo (left) + moving progress counter (center) + End (right)
 *  - body: statement panel (left) + options panel (right), compact within the
 *    viewport; explanation revealed via a button at the bottom
 *  - bottom bar: Prev / Next + Explanation toggle
 * Instant server-graded feedback (green correct / red wrong); the clicked
 * option shows a "TS" loader while grading.
 */
export function PracticeRunner({ data }: { data: PracticeScreenData }) {
  const router = useRouter();
  const { questions, subjectSlug } = data;
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [index, setIndex] = useState(data.resumeIndex);
  const [graded, setGraded] = useState<Record<string, Graded>>({});
  const [pendingOption, setPendingOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const questionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    let active = true;
    startPractice(data.entryTestSlug, data.topicId, data.usage).then((id) => {
      if (active) setAttemptId(id);
    });
    return () => {
      active = false;
    };
  }, [data.entryTestSlug, data.topicId, data.usage]);

  useEffect(() => {
    questionStartRef.current = Date.now();
    setShowExplanation(false);
  }, [index]);

  const current = questions[index];
  const currentGrade = current ? graded[current.id] : undefined;

  const handleSelect = useCallback(
    async (optionId: string) => {
      if (!current || !attemptId || currentGrade || pendingOption) return;
      setPendingOption(optionId);
      const timeTaken = Date.now() - questionStartRef.current;
      const result: PracticeGrade = await answerPractice(
        attemptId,
        current.id,
        optionId,
        timeTaken,
      );
      if (result.ok) {
        setGraded((g) => ({
          ...g,
          [current.id]: {
            selectedOptionId: optionId,
            isCorrect: result.isCorrect ?? false,
            correctOptionId: result.correctOptionId ?? null,
            explanation: result.explanation ?? null,
          },
        }));
        setShowExplanation(true);
      }
      setPendingOption(null);
    },
    [current, attemptId, currentGrade, pendingOption],
  );

  const endHref = routes.subject(subjectSlug);
  const handleEnd = useCallback(() => {
    if (attemptId) finishPractice(attemptId);
    router.push(endHref);
  }, [attemptId, endHref, router]);

  if (questions.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <p className="font-body text-on-surface-variant">
          No questions available for this chapter yet.
        </p>
        <button
          type="button"
          onClick={() => router.push(endHref)}
          className={appButton({ variant: "secondary" })}
        >
          <Icon name="arrow_back" className="text-lg" /> Back to chapters
        </button>
      </div>
    );
  }

  function optionState(optionId: string): OptionVisualState {
    if (!currentGrade) return "idle";
    if (optionId === currentGrade.correctOptionId) {
      return currentGrade.isCorrect ? "correct" : "muted-correct";
    }
    if (optionId === currentGrade.selectedOptionId) return "wrong";
    return "idle";
  }

  const answeredCount = Object.keys(graded).length;
  const progressPct = (answeredCount / questions.length) * 100;
  const isLast = index === questions.length - 1;
  const isFirst = index === 0;

  return (
    <div className="flex h-full flex-col">
      <CheckingOverlay active={pendingOption !== null} />

      {/* Slim header: logo · moving counter · end */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-outline-variant bg-surface-lowest px-4 md:px-6">
        <span className="font-headline text-base font-bold tracking-tight text-on-surface">
          Taleem ka Safar
        </span>
        <div className="mx-4 flex flex-1 items-center gap-3">
          <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-surface-high">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="shrink-0 font-headline text-xs font-semibold tracking-tight text-on-surface-variant tabular-nums">
            {index + 1}/{questions.length}
          </span>
        </div>
        <button
          type="button"
          onClick={handleEnd}
          className={cn(
            appButton({ variant: "secondary", size: "sm" }),
            "hover:border-danger/40 hover:bg-danger-fixed hover:text-danger",
          )}
        >
          <Icon name="close" className="text-lg" /> End
        </button>
      </header>

      {/* Body: statement (left) + options (right) */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-2 md:gap-8 md:p-8">
          {/* Statement panel */}
          <section className="flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-headline text-xs font-semibold uppercase tracking-widest text-brand">
                {data.subjectName} · Q{index + 1}
              </span>
              <BookmarkButton questionId={current.id} />
            </div>
            <div className={cn(card, "flex-1 p-6 md:p-8")}>
              <p className="font-body text-xl leading-relaxed text-on-surface">
                <MathText>{current.statement}</MathText>
              </p>
            </div>
          </section>

          {/* Options panel */}
          <section className="flex flex-col gap-3">
            {current.options.map((o) => (
              <OptionButton
                key={o.id}
                label={o.label}
                content={o.content}
                state={optionState(o.id)}
                disabled={!!currentGrade || pendingOption !== null}
                loading={pendingOption === o.id}
                onClick={() => handleSelect(o.id)}
              />
            ))}

            {/* Explanation (toggle) */}
            {currentGrade && showExplanation && (
              <div
                className={cn(
                  "mt-1 overflow-hidden rounded-2xl border bg-surface-lowest shadow-soft",
                  currentGrade.isCorrect ? "border-success/40" : "border-danger/40",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-3",
                    currentGrade.isCorrect
                      ? "bg-success-fixed text-success"
                      : "bg-danger-fixed text-danger",
                  )}
                >
                  <Icon
                    name={currentGrade.isCorrect ? "check_circle" : "cancel"}
                    filled
                    className="text-xl"
                  />
                  <span className="font-headline text-sm font-bold tracking-tight">
                    {currentGrade.isCorrect ? "Correct!" : "Not quite"}
                  </span>
                </div>
                <div className="p-4">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                    Explanation
                  </div>
                  <p className="font-body text-sm leading-relaxed text-on-surface">
                    {currentGrade.explanation ? (
                      <MathText>{currentGrade.explanation}</MathText>
                    ) : (
                      "No explanation available for this question."
                    )}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Bottom bar: Prev · Explanation · Next */}
      <footer className="flex h-16 shrink-0 items-center justify-between gap-3 border-t border-outline-variant bg-surface-lowest px-4 md:px-8">
        {/* Labels are screen-reader-only on small screens, so icon-only buttons keep a name. */}
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className={appButton({ variant: "secondary" })}
        >
          <Icon name="arrow_back" className="text-lg" />
          <span className="sr-only sm:not-sr-only">Prev</span>
        </button>

        <button
          type="button"
          onClick={() => setShowExplanation((s) => !s)}
          disabled={!currentGrade}
          aria-pressed={showExplanation}
          className={appButton({ variant: "secondary" })}
        >
          <Icon name="lightbulb" className="text-lg" />
          <span className="sr-only sm:not-sr-only">
            {showExplanation ? "Hide" : "Explanation"}
          </span>
        </button>

        {!isLast ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            className={appButton()}
          >
            <span className="sr-only sm:not-sr-only">Next</span>
            <Icon name="arrow_forward" className="text-lg" />
          </button>
        ) : (
          <button type="button" onClick={handleEnd} className={appButton()}>
            <span className="sr-only sm:not-sr-only">Finish</span>
            <Icon name="flag" className="text-lg" />
          </button>
        )}
      </footer>
    </div>
  );
}
