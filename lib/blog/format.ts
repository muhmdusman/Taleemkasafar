/** Presentation helpers for blog dates and reading time (pure, no I/O). */

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-10-22" → "22 October 2026" (fixed UTC, so server output is stable). */
export function formatPostDate(isoDate: string): string {
  return DATE_FORMAT.format(new Date(`${isoDate}T00:00:00Z`));
}

/** 5 → "5 min read" */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
