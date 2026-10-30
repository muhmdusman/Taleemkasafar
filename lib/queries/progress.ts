import "server-only";
import { cache } from "react";
import { getUserTestContext } from "./entry-test";

export type PracticeTotals = {
  answered: number;
  correct: number;
  /** Whole-number percent of answered questions that were correct. */
  accuracyPercent: number;
};

export type SubjectPractice = PracticeTotals & {
  /** Distinct questions answered at least once (for "x of N covered"). */
  questionsSeen: number;
};

export type MockSnapshot = {
  attemptId: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  submittedAt: string | null;
  /** Keyed by subject slug (from submit_mock). */
  perSubject: Record<string, { correct: number; total: number }>;
};

export type Progress = {
  practice: PracticeTotals;
  /** Keyed by subject id. Empty when the mcq_15 migration isn't applied yet. */
  bySubject: Record<string, SubjectPractice>;
  /** False when per-subject numbers are unavailable (see bySubject). */
  hasSubjectBreakdown: boolean;
  mocks: {
    taken: number;
    best: number | null;
    latest: MockSnapshot | null;
    previous: MockSnapshot | null;
  };
};

const percent = (correct: number, answered: number) =>
  answered === 0 ? 0 : Math.round((correct / answered) * 100);

/**
 * The signed-in user's progress in the ACTIVE entry test: practice totals,
 * practice per subject, and submitted mocks. Request-memoized so the home
 * page's progress, subjects and mock regions share one set of reads.
 *
 * Practice per subject comes from the `practice_progress` RPC (mcq_15, one
 * grouped query). If that RPC isn't deployed yet, totals fall back to two
 * head counts and the per-subject breakdown is left empty.
 */
export const getProgress = cache(async (): Promise<Progress | null> => {
  const ctx = await getUserTestContext();
  if (!ctx) return null;
  const { supabase, userId, entryTest } = ctx;

  const [rpc, mockRes] = await Promise.all([
    supabase.rpc("practice_progress", { p_entry_test: entryTest.id }),
    supabase
      .from("mock_results")
      .select(
        "attempt_id, score_percent, correct_count, total_questions, per_subject, attempts!inner(user_id, entry_test_id, submitted_at)",
        { count: "exact" },
      )
      .eq("attempts.user_id", userId)
      .eq("attempts.entry_test_id", entryTest.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const bySubject: Record<string, SubjectPractice> = {};
  let answered = 0;
  let correct = 0;
  const hasSubjectBreakdown = !rpc.error;

  if (!rpc.error) {
    for (const row of rpc.data ?? []) {
      const a = Number(row.answered);
      const c = Number(row.correct);
      answered += a;
      correct += c;
      bySubject[row.subject_id] = {
        answered: a,
        correct: c,
        accuracyPercent: percent(c, a),
        questionsSeen: Number(row.questions_seen),
      };
    }
  } else {
    const base = () =>
      supabase
        .from("attempt_answers")
        .select("question_id, attempts!inner(user_id, entry_test_id, mode)", {
          count: "exact",
          head: true,
        })
        .eq("attempts.user_id", userId)
        .eq("attempts.entry_test_id", entryTest.id)
        .eq("attempts.mode", "practice")
        .not("selected_option_id", "is", null);
    const [answeredRes, correctRes] = await Promise.all([
      base(),
      base().eq("is_correct", true),
    ]);
    answered = answeredRes.count ?? 0;
    correct = correctRes.count ?? 0;
  }

  const mocks: MockSnapshot[] = (mockRes.data ?? []).map((r) => ({
    attemptId: r.attempt_id,
    scorePercent: Number(r.score_percent),
    correctCount: r.correct_count,
    totalQuestions: r.total_questions,
    submittedAt:
      (r.attempts as { submitted_at: string | null } | null)?.submitted_at ?? null,
    perSubject:
      (r.per_subject as Record<string, { correct: number; total: number }> | null) ?? {},
  }));

  return {
    practice: { answered, correct, accuracyPercent: percent(correct, answered) },
    bySubject,
    hasSubjectBreakdown,
    mocks: {
      taken: mockRes.count ?? mocks.length,
      best: mocks.length ? Math.max(...mocks.map((m) => m.scorePercent)) : null,
      latest: mocks[0] ?? null,
      previous: mocks[1] ?? null,
    },
  };
});
