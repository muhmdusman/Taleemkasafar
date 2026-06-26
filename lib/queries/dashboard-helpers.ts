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
