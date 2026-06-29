/**
 * Pure session/navigation logic for the quiz runners (no DB, no React) —
 * resume index, section boundaries, and per-question palette state.
 */

export type AnswerState = {
  /** Selected but not necessarily saved (mock "Not Saved" state). */
  selected?: boolean;
  /** Persisted answer exists. */
  saved?: boolean;
  /** Marked for review (mock). */
  review?: boolean;
};

export type PaletteStatus =
  | "current"
  | "saved"
  | "selected"
  | "review"
  | "unattempted";

/**
 * Resume index = the first question with no saved answer. If all are answered,
 * resume at the last question. Empty set → 0.
 */
export function resumeIndex(savedFlags: boolean[]): number {
  if (savedFlags.length === 0) return 0;
  const firstUnanswered = savedFlags.findIndex((s) => !s);
  return firstUnanswered === -1 ? savedFlags.length - 1 : firstUnanswered;
}

/**
 * Compute palette status for one question. `review` takes visual precedence in
 * the UI (ring), but for the base chip color we resolve in this order:
 * current > review > saved > selected > unattempted.
 */
export function paletteStatus(
  index: number,
  currentIndex: number,
  state: AnswerState,
): PaletteStatus {
  if (index === currentIndex) return "current";
  if (state.review) return "review";
  if (state.saved) return "saved";
  if (state.selected) return "selected";
  return "unattempted";
}

export type Section = {
  /** Section label, e.g. subject name. */
  label: string;
  /** Index of the first question in this section (inclusive). */
  start: number;
  /** Index just past the last question in this section (exclusive). */
  end: number;
};

/**
 * Build contiguous sections from an ordered list of per-question section labels.
 * Assumes questions are grouped by section in order (as the mock generator
 * freezes them: Maths → Physics → English).
 */
export function buildSections(sectionLabels: string[]): Section[] {
  const sections: Section[] = [];
  for (let i = 0; i < sectionLabels.length; i++) {
    const label = sectionLabels[i];
    const last = sections[sections.length - 1];
    if (last && last.label === label) {
      last.end = i + 1;
    } else {
      sections.push({ label, start: i, end: i + 1 });
    }
  }
  return sections;
}

/** Index of the section containing `questionIndex`, or -1. */
export function sectionIndexOf(sections: Section[], questionIndex: number): number {
  return sections.findIndex(
    (s) => questionIndex >= s.start && questionIndex < s.end,
  );
}

/** First question index of the next section, or null if already in the last. */
export function nextSectionStart(
  sections: Section[],
  questionIndex: number,
): number | null {
  const i = sectionIndexOf(sections, questionIndex);
  if (i === -1 || i >= sections.length - 1) return null;
  return sections[i + 1].start;
}

/** First question index of the previous section, or null if already in the first. */
export function prevSectionStart(
  sections: Section[],
  questionIndex: number,
): number | null {
  const i = sectionIndexOf(sections, questionIndex);
  if (i <= 0) return null;
  return sections[i - 1].start;
}

/** Count of saved answers within a section. */
export function sectionAnsweredCount(
  section: Section,
  savedFlags: boolean[],
): number {
  let n = 0;
  for (let i = section.start; i < section.end; i++) {
    if (savedFlags[i]) n += 1;
  }
  return n;
}
