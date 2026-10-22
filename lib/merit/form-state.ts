/**
 * Pure form-state helpers for the merit calculator island
 * (components/marketing/merit/merit-calculator-form.tsx). No React.
 *
 * State shape: one flat record of raw strings.
 * - Marks OBTAINED are keyed by component (key + label, not formula), so they
 *   survive a route switch (e.g. FAST-NUCES NU Test ↔ NTS): the student's
 *   F.Sc marks are the same whichever route they pick.
 * - TOTALS are keyed per formula ("fast-nuces-nts:entryTest.total") because
 *   each formula can state a different total for the same component.
 * - A key that is absent means "untouched": totals then show the PDF default.
 *   An empty string means the user cleared the field (see validate.ts).
 */
import type { MeritComponent, MeritFormula } from "./types";
import type { FieldPart, MeritInput } from "./validate";

export type MeritFormValues = Record<string, string>;

/**
 * State key for one field of one component under `formula`. A component is
 * "shared" across formulas when its key AND label match (FAST's "F.Sc Marks"
 * on both routes); "NU Test Score" vs "NTS Score" share the `entryTest` key
 * but are different tests, so they keep separate marks.
 */
export function formStateKey(
  formula: MeritFormula,
  component: Pick<MeritComponent, "key" | "label">,
  part: FieldPart,
): string {
  return part === "total"
    ? `${formula.id}:${component.key}.total`
    : `${component.key}|${component.label}.obtained`;
}

/** What the input shows: the raw value, else the PDF default total, else "". */
export function formFieldValue(
  values: MeritFormValues,
  formula: MeritFormula,
  component: MeritComponent,
  part: FieldPart,
): string {
  const raw = values[formStateKey(formula, component, part)];
  if (raw !== undefined) return raw;
  if (part === "total" && component.defaultTotalMarks !== undefined) {
    return String(component.defaultTotalMarks);
  }
  return "";
}

/** Validation/calculation input from exactly what the form shows. */
export function buildMeritInput(values: MeritFormValues, formula: MeritFormula): MeritInput {
  const input: MeritInput = {};
  for (const c of formula.components) {
    input[c.key] = {
      obtained: formFieldValue(values, formula, c, "obtained"),
      total: c.inputMode === "percentage" ? undefined : formFieldValue(values, formula, c, "total"),
    };
  }
  return input;
}

/** "Clear": drops the current formula's fields (its obtained marks + totals). */
export function clearFormulaValues(
  values: MeritFormValues,
  formula: MeritFormula,
): MeritFormValues {
  const drop = new Set(
    formula.components.flatMap((c) => [
      formStateKey(formula, c, "obtained"),
      formStateKey(formula, c, "total"),
    ]),
  );
  return Object.fromEntries(Object.entries(values).filter(([k]) => !drop.has(k)));
}
