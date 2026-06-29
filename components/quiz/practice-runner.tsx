"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@/components/dashboard/icon";
import { QuestionCard } from "./question-card";
import { OptionButton, type OptionVisualState } from "./option-button";
import { ExplanationPanel } from "./explanation-panel";
import { BookmarkButton } from "./bookmark-button";
import {
  startPractice,
  answerPractice,
  finishPractice,
  type PracticeGrade,
} from "@/app/(dashboard)/quiz-actions";
import type { PracticeScreenData } from "@/lib/queries/practice";

type Graded = {
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionId: string | null;
  explanation: string | null;
};

/**
 * Practice / past-paper loop. One question at a time, instant server-graded
 * feedback (green correct / red wrong) + explanation, Next/Prev, Save bookmark,
 * Finish. Resumes at the server-provided index. Business logic (grading) is on
 * the server; this component only orchestrates interaction.
 */
export function PracticeRunner({ data }: { data: PracticeScreenData }) {
  const { questions, subjectSlug } = data;
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [index, setIndex] = useState(data.resumeIndex);
  const [graded, setGraded] = useState<Record<string, Graded>>({});
  const [pending, setPending] = useState(false);
  const questionStartRef = useRef<number>(Date.now());

  // Create/resume the attempt once on mount.
  useEffect(() => {
    let active = true;
    startPractice(data.entryTestSlug, data.topicId, data.usage).then((id) => {
      if (active) setAttemptId(id);
    });
    return () => {
      active = false;
    };
  }, [data.entryTestSlug, data.topicId, data.usage]);

  // Reset the per-question timer whenever we move to a new question.
  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [index]);

  const current = questions[index];
  const currentGrade = current ? graded[current.id] : undefined;

  const handleSelect = useCallback(
    async (optionId: string) => {
      if (!current || !attemptId || currentGrade || pending) return;
      setPending(true);
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
      }
      setPending(false);
    },
    [current, attemptId, currentGrade, pending],
  );

  if (questions.length === 0) {
    return (
      <div className="border-2 border-black bg-white p-8 shadow-hard">
        <p className="font-body text-on-surface-variant">
          No questions available for this chapter yet.
        </p>
        <Link
          href={`/subjects/${subjectSlug}`}
          className="mt-4 inline-flex items-center gap-1 font-headline text-xs font-bold uppercase tracking-widest text-brand"
        >
          <Icon name="arrow_back" className="text-base" /> Back to chapters
        </Link>
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
  const isLast = index === questions.length - 1;

  return (
    <div>
      {/* progress bar */}
      <div className="mb-6">
        <div className="mb-1 flex justify-between font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          <span>
            {answeredCount} / {questions.length} answered
          </span>
        </div>
        <div className="h-3 w-full border-2 border-black bg-surface-high">
          <div
            className="h-full bg-brand transition-all"
            style={{
              width: `${(answeredCount / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <QuestionCard
        index={index}
        total={questions.length}
        sectionLabel={data.subjectName}
        statusSlot={
          <BookmarkButton questionId={current.id} />
        }
        statement={current.statement}
      >
        <div className="flex flex-col gap-3">
          {current.options.map((o) => (
            <OptionButton
              key={o.id}
              label={o.label}
              content={o.content}
              state={optionState(o.id)}
              disabled={!!currentGrade || pending}
              onClick={() => handleSelect(o.id)}
            />
          ))}
        </div>

        {currentGrade && (
          <ExplanationPanel
            isCorrect={currentGrade.isCorrect}
            explanation={currentGrade.explanation}
          />
        )}
      </QuestionCard>

      {/* navigation */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="flex items-center gap-2 border-2 border-black bg-white px-5 py-3 font-headline text-sm font-bold uppercase tracking-tight transition-colors hover:bg-brand-fixed disabled:opacity-40 active:translate-x-[2px] active:translate-y-[2px]"
        >
          <Icon name="arrow_back" className="text-lg" /> Prev
        </button>

        {!isLast ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            className="flex items-center gap-2 border-2 border-black bg-black px-5 py-3 font-headline text-sm font-bold uppercase tracking-tight text-white shadow-hard transition-colors hover:bg-brand active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Next <Icon name="arrow_forward" className="text-lg" />
          </button>
        ) : (
          <Link
            href={`/subjects/${subjectSlug}`}
            onClick={() => {
              if (attemptId) finishPractice(attemptId);
            }}
            className="flex items-center gap-2 border-2 border-black bg-black px-5 py-3 font-headline text-sm font-bold uppercase tracking-tight text-white shadow-hard transition-colors hover:bg-brand active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Finish <Icon name="flag" className="text-lg" />
          </Link>
        )}
      </div>
    </div>
  );
}
