/**
 * Pure merit-aggregate calculation. Mirrors the PDF formulas exactly:
 *   aggregate = Σ (obtained / total × weightPercent)
 * Full precision is kept internally; round only for display via `formatScore`.
 */
import type {
  ComponentKey,
  InputMode,
  MeritFormula,
  ReviewFlag,
} from "./types";
import {
  validateMeritInput,
  type FieldError,
  type MeritInput,
} from "./validate";

/** Shown alongside every result. */
export const MERIT_DISCLAIMER =
  "These are estimates. Always verify with the official university admission notification.";

/** The PDF does not specify rounding; 2 decimals is our display choice. */
export const DISPLAY_DECIMALS = 2;

export type QualifyingCheck = {
  label: string;
  minimumPercent: number;
  met: boolean;
  sourcePages: number[];
};

export type ComponentBreakdown = {
  key: ComponentKey;
  label: string;
  inputMode: InputMode;
  weightPercent: number;
  obtained: number;
  total: number;
  /** obtained / total × 100 (0-100), full precision. */
  percentage: number;
  /** obtained / total × weightPercent — this component's share of the aggregate. */
  contribution: number;
  /** PDF-stated mandatory minimums for this component (empty if none). */
  qualifyingChecks: QualifyingCheck[];
};

export type MeritResult = {
  formulaId: string;
  universityId: string;
  formulaLabel: string;
  formulaText: string;
  components: ComponentBreakdown[];
  /** Aggregate out of 100, full precision. */
  aggregate: number;
  sourcePages: number[];
  needsReview: boolean;
  reviewFlags: ReviewFlag[];
  disclaimer: string;
};

export type CalculateOutcome =
  | { ok: true; result: MeritResult }
  | { ok: false; errors: FieldError[] };

/** Validates `input` and, if valid, computes the aggregate for `formula`. */
export function calculateMerit(
  formula: MeritFormula,
  input: MeritInput,
): CalculateOutcome {
  const validation = validateMeritInput(formula, input);
  if (!validation.ok) return { ok: false, errors: validation.errors };

  const components: ComponentBreakdown[] = formula.components.map((c) => {
    // Validation guarantees a value for every formula component.
    const { obtained, total } = validation.values[c.key]!;
    const ratio = obtained / total;
    return {
      key: c.key,
      label: c.label,
      inputMode: c.inputMode,
      weightPercent: c.weightPercent,
      obtained,
      total,
      percentage: ratio * 100,
      contribution: ratio * c.weightPercent,
      qualifyingChecks: (c.qualifyingMinimums ?? []).map((m) => ({
        label: m.label,
        minimumPercent: m.minimumPercent,
        // Cross-multiplied to avoid float error at the exact threshold.
        met: obtained * 100 >= m.minimumPercent * total,
        sourcePages: m.sourcePages,
      })),
    };
  });

  return {
    ok: true,
    result: {
      formulaId: formula.id,
      universityId: formula.universityId,
      formulaLabel: formula.label,
      formulaText: formula.formulaText,
      components,
      aggregate: components.reduce((sum, c) => sum + c.contribution, 0),
      sourcePages: formula.sourcePages,
      needsReview: formula.needsReview,
      reviewFlags: formula.reviewFlags,
      disclaimer: MERIT_DISCLAIMER,
    },
  };
}

/** Half-up rounding that survives binary float artefacts (1.005 -> 1.01). */
export function roundTo(value: number, decimals: number = DISPLAY_DECIMALS): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor * (1 + Number.EPSILON)) / factor;
}

/** Display string with a fixed number of decimals, e.g. 81.5 -> "81.50". */
export function formatScore(value: number, decimals: number = DISPLAY_DECIMALS): string {
  return roundTo(value, decimals).toFixed(decimals);
}
