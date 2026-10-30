import "server-only";
import { listMockResults, type MockResultSummary } from "./mock";
import { getProgress, type PracticeTotals } from "./progress";

export type PracticeAccuracy = PracticeTotals;

export type PerformanceData = {
  mockResults: MockResultSummary[];
  practice: PracticeAccuracy;
  bestScore: number | null;
  averageScore: number | null;
};

/**
 * The user's performance in the ACTIVE entry test: mock history + practice
 * accuracy (shared with the home page via `getProgress`, which counts in the
 * database instead of loading every answer). Owner-scoped via RLS.
 */
export async function getPerformance(): Promise<PerformanceData | null> {
  const [progress, mockResults] = await Promise.all([
    getProgress(),
    listMockResults(50),
  ]);
  if (!progress) return null;

  const scores = mockResults.map((r) => r.scorePercent);
  const bestScore = scores.length ? Math.max(...scores) : null;
  const averageScore = scores.length
    ? Math.round((scores.reduce((s, n) => s + n, 0) / scores.length) * 100) / 100
    : null;

  return {
    mockResults,
    practice: progress.practice,
    bestScore,
    averageScore,
  };
}
