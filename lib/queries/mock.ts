import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { mockSecondsLeft } from "./dashboard-helpers";
import { getActiveEntryTest, getUserTestContext } from "./entry-test";
import type { QuizQuestion } from "./practice";

export type MockBlueprintSummary = {
  id: string;
  name: string;
  description: string | null;
  durationSeconds: number;
  totalQuestions: number;
};

export type MockResultSummary = {
  attemptId: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  submittedAt: string | null;
};

export type MockLandingData = {
  entryTestName: string;
  blueprint: MockBlueprintSummary | null;
  recentResults: MockResultSummary[];
};

/** The active entry test's mock blueprint (first active one), or null. */
export const getActiveBlueprint = cache(
  async (): Promise<MockBlueprintSummary | null> => {
    const entryTest = await getActiveEntryTest();
    if (!entryTest) return null;
    const supabase = await createClient();

    const { data: bp } = await supabase
      .from("mock_test_blueprints")
      .select("id, name, description, duration_seconds, total_questions")
      .eq("entry_test_id", entryTest.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    return bp
      ? {
          id: bp.id,
          name: bp.name,
          description: bp.description,
          durationSeconds: bp.duration_seconds,
          totalQuestions: bp.total_questions,
        }
      : null;
  },
);

/** Mock landing: the active test's blueprint + the user's recent results. */
export async function getMockLanding(): Promise<MockLandingData | null> {
  const entryTest = await getActiveEntryTest();
  if (!entryTest) return null;

  const [blueprint, recentResults] = await Promise.all([
    getActiveBlueprint(),
    listMockResults(8),
  ]);

  return {
    entryTestName: entryTest.name,
    blueprint,
    recentResults,
  };
}

/**
 * The user's submitted mock results for the ACTIVE entry test, most recent
 * first (results follow the test picked in the header, like everything else).
 */
export async function listMockResults(limit = 20): Promise<MockResultSummary[]> {
  const ctx = await getUserTestContext();
  if (!ctx) return [];
  const { supabase, userId, entryTest } = ctx;

  // mock_results -> attempt (owned by user). RLS already scopes to the owner.
  const { data } = await supabase
    .from("mock_results")
    .select(
      "attempt_id, score_percent, correct_count, total_questions, attempts!inner(submitted_at, user_id, entry_test_id)",
    )
    .eq("attempts.user_id", userId)
    .eq("attempts.entry_test_id", entryTest.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => ({
    attemptId: r.attempt_id,
    scorePercent: Number(r.score_percent),
    correctCount: r.correct_count,
    totalQuestions: r.total_questions,
    submittedAt:
      (r.attempts as { submitted_at: string | null } | null)?.submitted_at ??
      null,
  }));
}

export type MockAttemptData = {
  attemptId: string;
  status: string;
  /** Blueprint name, e.g. "NET Engineering Full Mock". */
  title: string;
  expiresAt: string | null;
  /** Set while the mock is paused: the frozen time left, in seconds. */
  pausedSecondsLeft: number | null;
  questions: QuizQuestion[];
  /** Per-question section label (subject name), aligned to `questions`. */
  sectionLabels: string[];
  /** Per-question subject slug (for the section's colour), aligned to `questions`. */
  sectionSlugs: string[];
  /** Per-question marked-for-review flag, aligned to `questions`. */
  reviewFlags: boolean[];
};

/**
 * Load an in-progress mock attempt: the frozen, ordered, answer-free question
 * set plus the user's saved selections and review flags. RLS ensures only the
 * owner can read it.
 */
export async function getMockAttempt(
  attemptId: string,
): Promise<MockAttemptData | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return null;

  // `*` so this works before the mcq_15 migration adds `paused_at`.
  const { data: attempt } = await supabase
    .from("attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .eq("mode", "mock")
    .maybeSingle();
  if (!attempt) return null;

  // Frozen ordered rows + the paper's name.
  const [{ data: frozen }, { data: blueprint }] = await Promise.all([
    supabase
      .from("attempt_answers")
      .select("question_id, selected_option_id, marked_for_review, display_order")
      .eq("attempt_id", attemptId)
      .order("display_order", { ascending: true }),
    attempt.blueprint_id
      ? supabase
          .from("mock_test_blueprints")
          .select("name")
          .eq("id", attempt.blueprint_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const rows = frozen ?? [];
  const questionIds = rows.map((r) => r.question_id);

  // Question content + subject (for sections), and options (answer-free).
  const [{ data: questionRows }, { data: optionRows }] = await Promise.all([
    supabase
      .from("questions")
      .select("id, statement, subjects!inner(name, slug)")
      .in("id", questionIds),
    supabase
      .from("question_options")
      .select("id, question_id, option_label, content")
      .in("question_id", questionIds)
      .order("display_order", { ascending: true }),
  ]);
  type QuestionMeta = { statement: string; subject: string; subjectSlug: string };
  const qById = new Map<string, QuestionMeta>();
  for (const q of questionRows ?? []) {
    const subject = q.subjects as { name: string; slug: string } | null;
    qById.set(q.id, {
      statement: q.statement,
      subject: subject?.name ?? "",
      subjectSlug: subject?.slug ?? "",
    });
  }

  const optionsByQuestion = new Map<
    string,
    { id: string; label: string; content: string }[]
  >();
  for (const o of optionRows ?? []) {
    const arr = optionsByQuestion.get(o.question_id) ?? [];
    arr.push({ id: o.id, label: o.option_label, content: o.content });
    optionsByQuestion.set(o.question_id, arr);
  }

  const questions: QuizQuestion[] = [];
  const sectionLabels: string[] = [];
  const sectionSlugs: string[] = [];
  const reviewFlags: boolean[] = [];
  for (const r of rows) {
    const meta = qById.get(r.question_id);
    questions.push({
      id: r.question_id,
      statement: meta?.statement ?? "",
      options: optionsByQuestion.get(r.question_id) ?? [],
      savedOptionId: r.selected_option_id,
    });
    sectionLabels.push(meta?.subject ?? "");
    sectionSlugs.push(meta?.subjectSlug ?? "");
    reviewFlags.push(r.marked_for_review);
  }

  const pausedAt = (attempt as { paused_at?: string | null }).paused_at ?? null;

  return {
    attemptId: attempt.id,
    status: attempt.status,
    title: blueprint?.name ?? "Mock test",
    expiresAt: attempt.expires_at,
    // No "now" needed while paused: the time left is frozen.
    pausedSecondsLeft: pausedAt
      ? mockSecondsLeft({ expires_at: attempt.expires_at, paused_at: pausedAt }, 0)
      : null,
    questions,
    sectionLabels,
    sectionSlugs,
    reviewFlags,
  };
}

export type MockResultDetail = {
  attemptId: string;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  scorePercent: number;
  perSubject: Record<string, { correct: number; total: number }>;
  submittedAt: string | null;
};

/** Load a submitted mock's result detail (owner-only via RLS). */
export async function getMockResult(
  attemptId: string,
): Promise<MockResultDetail | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return null;

  const { data } = await supabase
    .from("mock_results")
    .select(
      "attempt_id, total_questions, attempted_count, correct_count, incorrect_count, skipped_count, score_percent, per_subject, attempts!inner(submitted_at, user_id)",
    )
    .eq("attempt_id", attemptId)
    .eq("attempts.user_id", userId)
    .maybeSingle();
  if (!data) return null;

  return {
    attemptId: data.attempt_id,
    totalQuestions: data.total_questions,
    attemptedCount: data.attempted_count,
    correctCount: data.correct_count,
    incorrectCount: data.incorrect_count,
    skippedCount: data.skipped_count,
    scorePercent: Number(data.score_percent),
    perSubject:
      (data.per_subject as Record<
        string,
        { correct: number; total: number }
      >) ?? {},
    submittedAt:
      (data.attempts as { submitted_at: string | null } | null)
        ?.submitted_at ?? null,
  };
}

