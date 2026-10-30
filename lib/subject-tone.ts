/**
 * Stable soft accent tone per subject (pure, no I/O). A subject keeps the same
 * tone on every screen (dashboard card, chapter list, practice, mock sections)
 * so students learn to recognise it at a glance. Class names for each tone
 * live in components/dashboard/tone.ts (Tailwind only scans components/ and
 * app/, so they can't be built here).
 */

export type Tone = "blue" | "violet" | "teal" | "amber" | "rose";

export const TONES: readonly Tone[] = ["blue", "violet", "teal", "amber", "rose"];

/** Known subjects, keyed by slug without the `pu-` namespace prefix. */
const KNOWN: Record<string, Tone> = {
  maths: "blue",
  mathematics: "blue",
  "quantitative-reasoning": "blue",
  quant: "blue",
  statistics: "blue",
  physics: "amber",
  english: "violet",
  "verbal-reasoning": "violet",
  verbal: "violet",
  chemistry: "teal",
  biology: "teal",
  "computer-science": "rose",
  "pakistan-studies": "teal",
};

/** Lowercase, hyphenated key from a slug or display name ("Computer Science"). */
function toKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^pu-/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Tone for a subject slug (or name). Known subjects use a fixed tone; others
 * get a deterministic one from a small string hash, so new subjects are
 * colourful without a code change.
 */
export function subjectTone(slugOrName: string | null | undefined): Tone {
  const key = toKey(slugOrName ?? "");
  if (!key) return "blue";
  const known = KNOWN[key];
  if (known) return known;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return TONES[hash % TONES.length];
}
