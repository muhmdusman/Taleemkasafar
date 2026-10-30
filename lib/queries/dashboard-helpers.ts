/**
 * Pure helpers for the dashboard data layer (no I/O), kept separate so they are
 * trivially unit-testable.
 */

/** Resolve a friendly display name from profile name + email, with a fallback. */
export function resolveDisplayName(
  profileName: string | null | undefined,
  email: string | null | undefined,
): string {
  if (profileName && profileName.trim()) return profileName.trim();
  if (email && email.includes("@")) return email.split("@")[0];
  return "there";
}

/** The avatar initial: first letter of the display name, uppercased. */
export function avatarInitial(displayName: string): string {
  return displayName.trim().charAt(0).toUpperCase() || "U";
}

/** Two-digit display index used on subject cards (1 -> "01"). */
export function cardIndex(zeroBased: number): string {
  return String(zeroBased + 1).padStart(2, "0");
}

/** Sum of approved-question counts across chapters (nulls treated as 0). */
export function sumQuestionCounts(
  chapters: { question_count: number | null }[],
): number {
  return chapters.reduce((sum, c) => sum + (c.question_count ?? 0), 0);
}

/** Label for a chapter row: includes topic count only when there are subtopics. */
export function chapterMetaLabel(
  subtopicCount: number | null,
  questionCount: number | null,
): string {
  const q = questionCount ?? 0;
  const t = subtopicCount ?? 0;
  return t > 0 ? `${t} Topics · ${q} MCQs` : `${q} MCQs`;
}

export type OpenMockState = "running" | "paused" | "timeUp";

/** How long after expiry an unsubmitted mock is still offered for scoring. */
export const TIME_UP_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

type MockTimes = { expires_at: string | null; paused_at?: string | null };

/**
 * The mock to surface, from in-progress mock attempts sorted newest first:
 * the first paused or still-running one; else, if the NEWEST ran out of time
 * within the last week without being submitted, that one as "timeUp" (so the
 * student can still see a score). Null if none.
 */
export function pickOpenMock<T extends MockTimes>(
  mocks: T[],
  nowMs: number,
): { attempt: T; state: OpenMockState } | null {
  for (const m of mocks) {
    if (m.paused_at) return { attempt: m, state: "paused" };
    if (m.expires_at === null || Date.parse(m.expires_at) > nowMs) {
      return { attempt: m, state: "running" };
    }
  }
  const newest = mocks[0];
  if (newest?.expires_at && nowMs - Date.parse(newest.expires_at) <= TIME_UP_WINDOW_MS) {
    return { attempt: newest, state: "timeUp" };
  }
  return null;
}

/**
 * Seconds left on a mock: frozen at (expiry - pause time) while paused,
 * counting down to expiry while running, 0 once time is up. Null when the
 * mock has no time limit.
 */
export function mockSecondsLeft(mock: MockTimes, nowMs: number): number | null {
  if (!mock.expires_at) return null;
  const end = Date.parse(mock.expires_at);
  const from = mock.paused_at ? Date.parse(mock.paused_at) : nowMs;
  return Math.max(0, Math.round((end - from) / 1000));
}

/** Below this accuracy (percent) a subject is suggested as a focus area. */
export const FOCUS_BELOW_PERCENT = 70;
/** Practice answers needed before practice accuracy counts as a signal. */
export const FOCUS_MIN_ANSWERS = 10;

export type FocusSuggestion = {
  slug: string;
  name: string;
  /** mock = weakest in the latest mock; practice = low practice accuracy; new = not started. */
  reason: "mock" | "practice" | "new";
  percent: number | null;
};

/**
 * One subject to suggest next, in this order:
 *  1. weakest subject in the latest mock, if under FOCUS_BELOW_PERCENT;
 *  2. lowest practice accuracy (with ≥ FOCUS_MIN_ANSWERS answers) under it;
 *  3. a subject not practised yet, once at least one other subject has been.
 * Null when nothing stands out (or there is no activity yet).
 */
export function pickFocusSubject(
  subjects: { id: string; slug: string; name: string }[],
  latestMockBySlug: Record<string, { correct: number; total: number }> | null,
  practiceById: Record<string, { answered: number; correct: number }>,
): FocusSuggestion | null {
  const pct = (correct: number, total: number) => Math.round((correct / total) * 100);

  if (latestMockBySlug) {
    let worst: FocusSuggestion | null = null;
    for (const s of subjects) {
      const b = latestMockBySlug[s.slug];
      if (!b || b.total === 0) continue;
      const p = pct(b.correct, b.total);
      if (p < FOCUS_BELOW_PERCENT && (worst === null || p < (worst.percent ?? 101))) {
        worst = { slug: s.slug, name: s.name, reason: "mock", percent: p };
      }
    }
    if (worst) return worst;
  }

  let weakest: FocusSuggestion | null = null;
  for (const s of subjects) {
    const p = practiceById[s.id];
    if (!p || p.answered < FOCUS_MIN_ANSWERS) continue;
    const accuracy = pct(p.correct, p.answered);
    if (accuracy < FOCUS_BELOW_PERCENT && (weakest === null || accuracy < (weakest.percent ?? 101))) {
      weakest = { slug: s.slug, name: s.name, reason: "practice", percent: accuracy };
    }
  }
  if (weakest) return weakest;

  const started = subjects.some((s) => (practiceById[s.id]?.answered ?? 0) > 0);
  const untouched = subjects.find((s) => (practiceById[s.id]?.answered ?? 0) === 0);
  if (started && untouched) {
    return { slug: untouched.slug, name: untouched.name, reason: "new", percent: null };
  }
  return null;
}

/** An unfinished practice / past-paper sitting tied to a chapter. */
export type OpenPractice = {
  attemptId: string;
  topicId: string;
  usage: "practice" | "past_paper";
};

/**
 * Read the sitting behind the user's latest practice answer (the embedded
 * `attempts` row; PostgREST may return it as an object or a one-item array).
 * Only an `in_progress` sitting with a chapter can be resumed; a finished one
 * means the user already closed it, so there is nothing to offer.
 */
export function openPracticeFrom(
  attemptId: string,
  embedded: unknown,
): OpenPractice | null {
  const row = (Array.isArray(embedded) ? embedded[0] : embedded) as
    | { topic_id?: string | null; usage?: string | null; status?: string | null }
    | null
    | undefined;
  if (!row || row.status !== "in_progress" || !row.topic_id) return null;
  return {
    attemptId,
    topicId: row.topic_id,
    usage: row.usage === "past_paper" ? "past_paper" : "practice",
  };
}

/**
 * The next chapter (in display order) after `currentSlug` that has questions,
 * so a finished practice session can offer "Next chapter". Null at the end of
 * the subject or when the current chapter isn't in the list.
 */
export function nextChapterAfter(
  chapters: {
    chapter_slug: string | null;
    chapter_title: string | null;
    question_count: number | null;
  }[],
  currentSlug: string,
): { slug: string; title: string } | null {
  const i = chapters.findIndex((c) => c.chapter_slug === currentSlug);
  if (i === -1) return null;
  for (const c of chapters.slice(i + 1)) {
    if (c.chapter_slug && (c.question_count ?? 0) > 0) {
      return { slug: c.chapter_slug, title: c.chapter_title ?? c.chapter_slug };
    }
  }
  return null;
}
