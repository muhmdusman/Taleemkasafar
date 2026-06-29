import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getActiveEntryTest } from "./entry-test";
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

/** Mock landing: the active test's blueprint + the user's recent results. */
export async function getMockLanding(): Promise<MockLandingData | null> {
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

  const blueprint: MockBlueprintSummary | null = bp
    ? {
        id: bp.id,
        name: bp.name,
        description: bp.description,
        durationSeconds: bp.duration_seconds,
        totalQuestions: bp.total_questions,
      }
    : null;

  const recentResults = await listMockResults(8);

  return {
    entryTestName: entryTest.name,
    blueprint,
    recentResults,
  };
}

/** The user's submitted mock results, most recent first. */
export async function listMockResults(limit = 20): Promise<MockResultSummary[]> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return [];

  // mock_results -> attempt (owned by user). RLS already scopes to the owner.
  const { data } = await supabase
    .from("mock_results")
    .select(
      "attempt_id, score_percent, correct_count, total_questions, attempts!inner(submitted_at, user_id)",
    )
    .eq("attempts.user_id", userId)
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
  expiresAt: string | null;
  questions: QuizQuestion[];
  /** Per-question section label (subject name), aligned to `questions`. */
  sectionLabels: string[];
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

  const { data: attempt } = await supabase
    .from("attempts")
    .select("id, status, expires_at, user_id, mode")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .eq("mode", "mock")
    .maybeSingle();
  if (!attempt) return null;

  // Frozen ordered rows.
  const { data: frozen } = await supabase
    .from("attempt_answers")
    .select("question_id, selected_option_id, marked_for_review, display_order")
    .eq("attempt_id", attemptId)
    .order("display_order", { ascending: true });

  const rows = frozen ?? [];
  const questionIds = rows.map((r) => r.question_id);

  // Question content + subject (for sections).
  const { data: questionRows } = await supabase
    .from("questions")
    .select("id, statement, subjects!inner(name)")
    .in("id", questionIds);
  const qById = new Map(
    (questionRows ?? []).map((q) => [
      q.id,
      {
        statement: q.statement,
        subject: (q.subjects as { name: string } | null)?.name ?? "",
      },
    ]),
  );

  // Options (answer-free).
  const { data: optionRows } = await supabase
    .from("question_options")
    .select("id, question_id, option_label, content")
    .in("question_id", questionIds)
    .order("display_order", { ascending: true });
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
    reviewFlags.push(r.marked_for_review);
  }

  return {
    attemptId: attempt.id,
    status: attempt.status,
    expiresAt: attempt.expires_at,
    questions,
    sectionLabels,
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
