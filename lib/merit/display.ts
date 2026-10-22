/**
 * Pure display helpers for the merit-calculator pages (no React, no data
 * imports), so the same wording is used on cards, metadata and results.
 */
import type { ComponentKey, MeritFormula, University } from "./types";

/** Short chip label per component, e.g. "Test 75%". */
export const COMPONENT_SHORT_LABEL: Record<ComponentKey, string> = {
  entryTest: "Test",
  intermediate: "Inter",
  matric: "Matric",
  academics: "Academics",
};

export type WeightChip = { key: ComponentKey; label: string; weightPercent: number };

/** Weight chips in formula order, e.g. Test 75 · Inter 15 · Matric 10. */
export function weightChips(formula: MeritFormula): WeightChip[] {
  return formula.components.map((c) => ({
    key: c.key,
    label: COMPONENT_SHORT_LABEL[c.key],
    weightPercent: c.weightPercent,
  }));
}

/** "Test 75% · Inter 15% · Matric 10%" */
export function weightSummary(formula: MeritFormula): string {
  return weightChips(formula)
    .map((chip) => `${chip.label} ${chip.weightPercent}%`)
    .join(" · ");
}

/** Unique entry-test names across a university's formulas, in order. */
export function entryTestNames(university: University): string[] {
  const names = university.formulas
    .map((f) => f.entryTestName)
    .filter((n): n is string => Boolean(n));
  return [...new Set(names)];
}

/** "p. 3" / "p. 1, 3, 5" — sorted, de-duplicated PDF page refs. */
export function formatPages(pages: readonly number[]): string {
  const unique = [...new Set(pages)].sort((a, b) => a - b);
  return `p. ${unique.join(", ")}`;
}

/** Source line shown under formulas and results. */
export function sourceLine(pages: readonly number[]): string {
  return `Source: merit criteria guide, ${formatPages(pages)}`;
}

/** True when the source gives no admission year for this formula. */
export function isYearNotStated(formula: MeritFormula): boolean {
  return (
    formula.applicableYear === null ||
    formula.reviewFlags.some((f) => f.code === "year-not-stated")
  );
}

/**
 * Admission-year notice derived from the data (never hardcoded), so a future
 * dated formula can't be contradicted by the page copy.
 * - every formula undated → "doesn't state which admission year …"
 * - every formula dated   → "applies to the 2026 admission year …"
 * - mixed                 → names the undated formulas
 */
export function admissionYearNotice(formulas: readonly MeritFormula[]): string | null {
  if (formulas.length === 0) return null;
  const many = formulas.length > 1;
  const undated = formulas.filter(isYearNotStated);
  const confirm = "Confirm it in the current admission notification.";
  if (undated.length === formulas.length) {
    return `The source guide doesn't state which admission year ${
      many ? "these formulas apply" : "this formula applies"
    } to. ${confirm}`;
  }
  if (undated.length === 0) {
    const years = [...new Set(formulas.map((f) => f.applicableYear as string))];
    return `Per the source guide, ${many ? "these formulas apply" : "this formula applies"} to the ${years.join(", ")} admission ${
      years.length > 1 ? "years" : "year"
    }. ${confirm}`;
  }
  return `The source guide doesn't state the admission year for: ${undated
    .map((f) => f.label)
    .join(", ")}. ${confirm}`;
}

/**
 * Meta description for /merit-calculator/[university], naming the test(s)
 * and weights, e.g. "Estimate your NUST aggregate with the NET formula:
 * Test 75%, Inter 15%, Matric 10%. ..."
 */
export function universityMetaDescription(university: University): string {
  const parts = university.formulas.map((f) => {
    const weights = weightChips(f)
      .map((c) => `${c.label} ${c.weightPercent}%`)
      .join(", ");
    return `${f.entryTestName ?? f.label} (${weights})`;
  });
  return `Estimate your ${university.shortName} merit aggregate: ${parts.join("; ")}. Free calculator with a step-by-step breakdown. Estimates only.`;
}
