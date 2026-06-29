"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/dashboard/icon";
import { OptionButton, type OptionVisualState } from "./option-button";
import { MathText } from "./math-text";
import { BookmarkButton } from "./bookmark-button";
import {
  startPractice,
  answerPractice,
  finishPractice,
  type PracticeGrade,
} from "@/app/(dashboard)/quiz-actions";
import type { PracticeScreenData } from "@/lib/queries/practice";
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

  const endHref = `/subjects/${subjectSlug}`;
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
          className="inline-flex items-center gap-1 border-2 border-black bg-white px-4 py-2 font-headline text-xs font-bold uppercase tracking-widest text-black hover:bg-brand-fixed"
        >
          <Icon name="arrow_back" className="text-base" /> Back to chapters
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
      {/* Slim header: logo · moving counter · end */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b-2 border-black bg-white px-4 md:px-6">
        <span className="font-headline text-base font-bold tracking-tighter text-black">
          Taleem ka Safar
        </span>
        <div className="mx-4 flex flex-1 items-center gap-3">
          <div className="h-2.5 w-full max-w-md border-2 border-black bg-surface-high">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="shrink-0 font-headline text-xs font-bold uppercase tracking-tight text-on-surface-variant tabular-nums">
            {index + 1}/{questions.length}
          </span>
        </div>
        <button
          type="button"
          onClick={handleEnd}
          className="flex items-center gap-1 border-2 border-black bg-white px-3 py-1.5 font-headline text-xs font-bold uppercase tracking-tight text-black transition-colors hover:bg-danger hover:text-white"
        >
          <Icon name="close" className="text-base" /> End
        </button>
      </header>

      {/* Body: statement (left) + options (right) */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-2 md:gap-8 md:p-8">
          {/* Statement panel */}
          <section className="flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-headline text-xs font-bold uppercase tracking-widest text-brand">
                {data.subjectName} · Q{index + 1}
              </span>
              <BookmarkButton questionId={current.id} />
            </div>
            <div className="flex-1 border-2 border-black bg-white p-6 shadow-hard">
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
              <div className="mt-1 border-2 border-black bg-white">
                <div
                  className={cn(
                    "flex items-center gap-2 p-3 text-white",
                    currentGrade.isCorrect ? "bg-[#16a34a]" : "bg-danger",
                  )}
                >
                  <Icon
                    name={currentGrade.isCorrect ? "check_circle" : "cancel"}
                    className="text-xl"
                  />
                  <span className="font-headline text-sm font-bold uppercase tracking-tight">
                    {currentGrade.isCorrect ? "Correct!" : "Not quite"}
                  </span>
                </div>
                <div className="p-4">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
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
      <footer className="flex h-16 shrink-0 items-center justify-between gap-3 border-t-2 border-black bg-white px-4 md:px-8">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className="flex items-center gap-2 border-2 border-black bg-white px-4 py-2.5 font-headline text-sm font-bold uppercase tracking-tight transition-colors hover:bg-brand-fixed disabled:opacity-40 active:translate-x-[2px] active:translate-y-[2px]"
        >
          <Icon name="arrow_back" className="text-lg" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <button
          type="button"
          onClick={() => setShowExplanation((s) => !s)}
          disabled={!currentGrade}
          className="flex items-center gap-2 border-2 border-black bg-white px-4 py-2.5 font-headline text-sm font-bold uppercase tracking-tight transition-colors hover:bg-brand-fixed disabled:opacity-40"
        >
          <Icon name="lightbulb" className="text-lg" />
          <span className="hidden sm:inline">
            {showExplanation ? "Hide" : "Explanation"}
          </span>
        </button>

        {!isLast ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            className="flex items-center gap-2 border-2 border-black bg-black px-5 py-2.5 font-headline text-sm font-bold uppercase tracking-tight text-white shadow-hard transition-colors hover:bg-brand active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <span className="hidden sm:inline">Next</span>
            <Icon name="arrow_forward" className="text-lg" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleEnd}
            className="flex items-center gap-2 border-2 border-black bg-black px-5 py-2.5 font-headline text-sm font-bold uppercase tracking-tight text-white shadow-hard transition-colors hover:bg-brand active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <span className="hidden sm:inline">Finish</span>
            <Icon name="flag" className="text-lg" />
          </button>
        )}
      </footer>
    </div>
  );
}
