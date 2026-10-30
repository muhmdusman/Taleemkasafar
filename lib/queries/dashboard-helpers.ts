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

/**
 * From in-progress mock attempts sorted newest first, the first whose timer
 * has not run out (no expiry counts as running). Null if none.
 */
export function pickLiveMock<T extends { expires_at: string | null }>(
  mocks: T[],
  nowMs: number,
): T | null {
  return (
    mocks.find((m) => m.expires_at === null || Date.parse(m.expires_at) > nowMs) ??
    null
  );
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
