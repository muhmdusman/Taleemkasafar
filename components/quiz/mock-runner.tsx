"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/dashboard/icon";
import { QuestionCard } from "./question-card";
import { OptionButton } from "./option-button";
import { QuizTimer } from "./quiz-timer";
import { QuizNavigation } from "./quiz-navigation";
import { QuestionPalette } from "./question-palette";
import { SectionProgress } from "./section-progress";
import {
  saveMockAnswer,
  toggleReview,
  submitMock,
} from "@/app/(dashboard)/quiz-actions";
import {
  buildSections,
  nextSectionStart,
  prevSectionStart,
  type AnswerState,
} from "@/lib/quiz/session";
import type { MockAttemptData } from "@/lib/queries/mock";

/**
 * Timed mock orchestrator. No per-question feedback. Saves each selection to
 * the server, tracks review flags, supports section navigation + palette, and
 * auto-submits on timer expiry. Grading happens server-side in submit_mock.
 */
export function MockRunner({ data }: { data: MockAttemptData }) {
  const router = useRouter();
  const { attemptId, questions, sectionLabels } = data;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.savedOptionId) init[q.id] = q.savedOptionId;
    });
    return init;
  });
  const [review, setReview] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    questions.forEach((q, i) => {
      if (data.reviewFlags[i]) init[q.id] = true;
    });
    return init;
  });
  const [submitting, setSubmitting] = useState(false);
  const questionStartRef = useRef<number>(Date.now());

  const sections = useMemo(() => buildSections(sectionLabels), [sectionLabels]);

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [index]);

  const current = questions[index];

  const handleSelect = useCallback(
    (optionId: string) => {
      if (!current) return;
      setSelected((s) => ({ ...s, [current.id]: optionId }));
      const timeTaken = Date.now() - questionStartRef.current;
      // Persist immediately (fire-and-forget; server is source of truth at submit).
      void saveMockAnswer(attemptId, current.id, optionId, timeTaken);
    },
    [current, attemptId],
  );

  const handleToggleReview = useCallback(() => {
    if (!current) return;
    const next = !review[current.id];
    setReview((r) => ({ ...r, [current.id]: next }));
    void toggleReview(attemptId, current.id, next);
  }, [current, review, attemptId]);

  const doSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const answers = questions.map((q) => ({
      question_id: q.id,
      selected_option_id: selected[q.id] ?? null,
      time_taken_ms: null,
    }));
    const id = await submitMock(attemptId, answers);
    if (id) router.push(`/mock/${id}/result`);
    else setSubmitting(false);
  }, [submitting, questions, selected, attemptId, router]);

  const states: AnswerState[] = questions.map((q) => ({
    saved: selected[q.id] !== undefined,
    review: review[q.id] === true,
  }));
  const savedFlags = questions.map((q) => selected[q.id] !== undefined);

  if (questions.length === 0) {
    return (
      <div className="border-2 border-black bg-white p-8 shadow-hard">
        <p className="font-body text-on-surface-variant">
          This mock has no questions.
        </p>
      </div>
    );
  }

  const answeredCount = savedFlags.filter(Boolean).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main column */}
      <div>
        {/* Top bar: timer + submit */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <QuizTimer expiresAt={data.expiresAt ?? new Date().toISOString()} onExpire={doSubmit} />
          <button
            type="button"
            onClick={doSubmit}
            disabled={submitting}
            className="flex items-center gap-2 border-2 border-black bg-black px-5 py-3 font-headline text-sm font-bold uppercase tracking-tight text-white shadow-hard transition-colors hover:bg-brand active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Test"}
            <Icon name="done_all" className="text-lg" />
          </button>
        </div>

        <QuestionCard
          index={index}
          total={questions.length}
          sectionLabel={sectionLabels[index] ?? ""}
          statusSlot={
            review[current.id] ? (
              <span className="flex items-center gap-1 border-2 border-danger bg-white px-2 py-1 text-xs font-bold uppercase text-danger">
                <Icon name="flag" className="text-sm" /> Review
              </span>
            ) : selected[current.id] ? (
              <span className="border-2 border-black bg-[#16a34a] px-2 py-1 text-xs font-bold uppercase text-white">
                Answered
              </span>
            ) : (
              <span className="border-2 border-black bg-surface-high px-2 py-1 text-xs font-bold uppercase text-on-surface-variant">
                Not answered
              </span>
            )
          }
          statement={current.statement}
        >
          <div className="flex flex-col gap-3">
            {current.options.map((o) => (
              <OptionButton
                key={o.id}
                label={o.label}
                content={o.content}
                state={selected[current.id] === o.id ? "selected" : "idle"}
                onClick={() => handleSelect(o.id)}
              />
            ))}
          </div>
        </QuestionCard>

        <div className="mt-6">
          <QuizNavigation
            onPrev={() => setIndex((i) => Math.max(0, i - 1))}
            onNext={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            onPrevSection={() => {
              const s = prevSectionStart(sections, index);
              if (s !== null) setIndex(s);
            }}
            onNextSection={() => {
              const s = nextSectionStart(sections, index);
              if (s !== null) setIndex(s);
            }}
            onToggleReview={handleToggleReview}
            isFirst={index === 0}
            isLast={index === questions.length - 1}
            canPrevSection={prevSectionStart(sections, index) !== null}
            canNextSection={nextSectionStart(sections, index) !== null}
            isMarkedForReview={review[current.id] === true}
          />
        </div>
      </div>

      {/* Sidebar: progress + palette */}
      <aside className="flex flex-col gap-6">
        <div className="border-2 border-black bg-white p-5 shadow-hard">
          <div className="mb-3 font-headline text-sm font-bold uppercase tracking-tight">
            Progress · {answeredCount}/{questions.length}
          </div>
          <SectionProgress sections={sections} savedFlags={savedFlags} />
        </div>
        <div className="border-2 border-black bg-white p-5 shadow-hard">
          <div className="mb-3 font-headline text-sm font-bold uppercase tracking-tight">
            Questions
          </div>
          <QuestionPalette
            count={questions.length}
            currentIndex={index}
            states={states}
            onNavigate={setIndex}
          />
        </div>
      </aside>
    </div>
  );
}
