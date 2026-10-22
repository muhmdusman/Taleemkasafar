/**
 * Field-level validation for merit-calculator input. Never throws: returns
 * machine-readable codes + human messages so the UI can render them inline.
 */
import type { ComponentKey, MeritComponent, MeritFormula } from "./types";

/**
 * Sanity cap for any "total marks" value. Not from the PDF: the largest
 * denominator in the PDF is 1100, so 5000 only rejects obvious typos.
 */
export const MAX_TOTAL_MARKS = 5000;

/** Raw form values: numbers, numeric strings, or empty. */
export type RawNumber = number | string | null | undefined;

export type ComponentInput = {
  obtained?: RawNumber;
  /**
   * Total marks. Optional when the PDF states a default (e.g. 1100): omit it
   * (undefined/null) to use the default. An empty string means the user
   * cleared the field and is reported as `total-required`.
   * Ignored for `percentage` components (total is always 100).
   */
  total?: RawNumber;
};

/** Input keyed by component key. Keys not used by the formula are ignored. */
export type MeritInput = Partial<Record<ComponentKey, ComponentInput>>;

export type FieldErrorCode =
  | "required"
  | "not-a-number"
  | "negative"
  | "exceeds-total"
  | "total-required"
  | "total-not-a-number"
  | "total-not-positive"
  | "total-too-large";

export type FieldPart = "obtained" | "total";

export type FieldError = {
  /** e.g. "entryTest.obtained" — stable key for the UI to attach the error to. */
  field: `${ComponentKey}.${FieldPart}`;
  component: ComponentKey;
  part: FieldPart;
  code: FieldErrorCode;
  message: string;
};

export type ValidComponentValue = { obtained: number; total: number };

export type ValidationResult =
  | { ok: true; values: Partial<Record<ComponentKey, ValidComponentValue>> }
  | { ok: false; errors: FieldError[] };

type Parsed =
  | { kind: "missing" }
  | { kind: "invalid" }
  | { kind: "ok"; value: number };

/** Plain decimal only (no hex, no exponent) so typos aren't silently accepted. */
const DECIMAL_RE = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

function parseNumber(raw: RawNumber): Parsed {
  if (raw === null || raw === undefined) return { kind: "missing" };
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed === "") return { kind: "missing" };
    if (!DECIMAL_RE.test(trimmed)) return { kind: "invalid" };
    return { kind: "ok", value: Number(trimmed) };
  }
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return { kind: "invalid" };
  }
  return { kind: "ok", value: raw };
}

function fieldError(
  component: MeritComponent,
  part: FieldPart,
  code: FieldErrorCode,
  message: string,
): FieldError {
  return {
    field: `${component.key}.${part}`,
    component: component.key,
    part,
    code,
    message,
  };
}

/** Resolves the total for a component, or returns the error it produced. */
function resolveTotal(
  component: MeritComponent,
  input: ComponentInput | undefined,
): { total: number } | { error: FieldError } {
  if (component.inputMode === "percentage") return { total: 100 };

  const { label } = component;
  const raw = input?.total;
  // An explicitly emptied field ("" / whitespace) is NOT "use the default":
  // the user cleared what they saw, so the maths must not silently use a
  // number the form no longer shows. Only an omitted total (undefined/null)
  // falls back to the PDF default.
  if (typeof raw === "string" && raw.trim() === "") {
    return {
      error: fieldError(component, "total", "total-required", `Enter the total marks for ${label}.`),
    };
  }
  const parsed = parseNumber(raw);

  if (parsed.kind === "missing") {
    if (component.defaultTotalMarks !== undefined) {
      return { total: component.defaultTotalMarks };
    }
    return {
      error: fieldError(component, "total", "total-required", `Enter the total marks for ${label}.`),
    };
  }
  if (parsed.kind === "invalid") {
    return {
      error: fieldError(component, "total", "total-not-a-number", `Total marks for ${label} must be a number.`),
    };
  }
  if (parsed.value <= 0) {
    return {
      error: fieldError(component, "total", "total-not-positive", `Total marks for ${label} must be greater than 0.`),
    };
  }
  if (parsed.value > MAX_TOTAL_MARKS) {
    return {
      error: fieldError(
        component,
        "total",
        "total-too-large",
        `Total marks for ${label} can't be more than ${MAX_TOTAL_MARKS}.`,
      ),
    };
  }
  return { total: parsed.value };
}

/** Validates every component of `formula` against `input`. */
export function validateMeritInput(
  formula: MeritFormula,
  input: MeritInput,
): ValidationResult {
  const errors: FieldError[] = [];
  const values: Partial<Record<ComponentKey, ValidComponentValue>> = {};

  for (const component of formula.components) {
    const componentInput = input[component.key];
    const { label } = component;
    const isPercentage = component.inputMode === "percentage";

    const totalResult = resolveTotal(component, componentInput);
    if ("error" in totalResult) errors.push(totalResult.error);

    const parsed = parseNumber(componentInput?.obtained);
    if (parsed.kind === "missing") {
      errors.push(fieldError(component, "obtained", "required", `Enter your ${label}.`));
      continue;
    }
    if (parsed.kind === "invalid") {
      errors.push(fieldError(component, "obtained", "not-a-number", `${label} must be a number.`));
      continue;
    }
    if (parsed.value < 0) {
      errors.push(fieldError(component, "obtained", "negative", `${label} can't be negative.`));
      continue;
    }
    if (!("total" in totalResult)) continue;

    const { total } = totalResult;
    if (parsed.value > total) {
      errors.push(
        fieldError(
          component,
          "obtained",
          "exceeds-total",
          isPercentage
            ? `${label} can't be more than 100%.`
            : `${label} can't be more than the total marks (${total}).`,
        ),
      );
      continue;
    }
    values[component.key] = { obtained: parsed.value, total };
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, values };
}
