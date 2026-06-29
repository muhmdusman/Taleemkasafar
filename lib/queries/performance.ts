import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listMockResults, type MockResultSummary } from "./mock";

export type PracticeAccuracy = {
  answered: number;
  correct: number;
  accuracyPercent: number;
};

export type PerformanceData = {
  mockResults: MockResultSummary[];
  practice: PracticeAccuracy;
  bestScore: number | null;
  averageScore: number | null;
};

/**
 * Aggregate the user's performance: mock history + a basic practice accuracy
 * summary derived from graded practice answers. All reads are owner-scoped via
 * RLS (cookie client).
 */
export async function getPerformance(): Promise<PerformanceData | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return null;

  const mockResults = await listMockResults(50);

  // Practice accuracy: graded practice answers across the user's practice
  // attempts. is_correct is set by the grading RPC at answer time.
  const { data: practiceAttempts } = await supabase
    .from("attempts")
    .select("id")
    .eq("user_id", userId)
    .eq("mode", "practice");
  const attemptIds = (practiceAttempts ?? []).map((a) => a.id);

  let answered = 0;
  let correct = 0;
  if (attemptIds.length > 0) {
    const { data: answers } = await supabase
      .from("attempt_answers")
      .select("is_correct")
      .in("attempt_id", attemptIds)
      .not("selected_option_id", "is", null);
    for (const a of answers ?? []) {
      answered += 1;
      if (a.is_correct) correct += 1;
    }
  }

  const scores = mockResults.map((r) => r.scorePercent);
  const bestScore = scores.length ? Math.max(...scores) : null;
  const averageScore = scores.length
    ? Math.round((scores.reduce((s, n) => s + n, 0) / scores.length) * 100) / 100
    : null;

  return {
    mockResults,
    practice: {
      answered,
      correct,
      accuracyPercent:
        answered === 0 ? 0 : Math.round((correct / answered) * 10000) / 100,
    },
    bestScore,
    averageScore,
  };
}
