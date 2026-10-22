"use client";

import { useId, useState } from "react";
import { AlertCircle, Calculator, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { ComponentKey, MeritComponent, MeritFormula } from "@/lib/merit/types";
import type { FieldPart } from "@/lib/merit/validate";
import {
  calculateMerit,
  formatScore,
  roundTo,
  type MeritResult,
} from "@/lib/merit/calculate";
import { sourceLine } from "@/lib/merit/display";
import {
  buildMeritInput,
  clearFormulaValues,
  formFieldValue,
  formStateKey,
  type MeritFormValues,
} from "@/lib/merit/form-state";
import { marketingButton } from "@/components/marketing/button-link";
import { cn } from "@/lib/utils";

type Props = {
  /** Plain data from data/merit-formulas.ts (serialised by the server page). */
  formulas: MeritFormula[];
  universityShortName: string;
};

type FieldKey = `${ComponentKey}.${FieldPart}`;

const inputClass =
  "h-12 w-full rounded-xl border border-outline bg-surface-lowest px-4 text-base text-on-surface placeholder:text-on-surface-variant transition-colors focus-visible:border-brand-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container aria-[invalid=true]:border-danger";

/** Plain number for display: 990 -> "990", 82.456 -> "82.46". */
function formatNumber(value: number): string {
  return String(roundTo(value, 2));
}

/**
 * Merit calculator for one university (client island). All maths and
 * validation come from lib/merit (pure, unit-tested); this file only holds
 * form state and renders. Formula choice is a native radio group.
 */
export function MeritCalculatorForm({ formulas, universityShortName }: Props) {
  const baseId = useId();
  const [formulaId, setFormulaId] = useState(formulas[0].id);
  // Raw input (see lib/merit/form-state.ts): obtained marks are shared across
  // routes, totals are per formula and show the PDF default until edited.
  const [values, setValues] = useState<MeritFormValues>({});
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [result, setResult] = useState<MeritResult | null>(null);
  const [status, setStatus] = useState("");

  const formula = formulas.find((f) => f.id === formulaId) ?? formulas[0];
  const hasNetScoreFlag = formula.reviewFlags.some((f) => f.code === "net-score-required");

  const fieldId = (key: ComponentKey, part: FieldPart) =>
    `${baseId}-${formula.slug}-${key}-${part}`;

  const valueOf = (component: MeritComponent, part: FieldPart) =>
    formFieldValue(values, formula, component, part);

  function update(component: MeritComponent, part: FieldPart, next: string) {
    setValues((v) => ({ ...v, [formStateKey(formula, component, part)]: next }));
    const field: FieldKey = `${component.key}.${part}`;
    if (errors[field]) {
      setErrors((e) => {
        const copy = { ...e };
        delete copy[field];
        return copy;
      });
    }
    if (result) {
      setResult(null);
      setStatus("Marks changed. Press Calculate to update your aggregate.");
    }
  }

  function selectFormula(id: string) {
    setFormulaId(id);
    setErrors({});
    setResult(null);
    setStatus("");
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const outcome = calculateMerit(formula, buildMeritInput(values, formula));
    if (!outcome.ok) {
      const next: Partial<Record<FieldKey, string>> = {};
      for (const err of outcome.errors) next[err.field] ??= err.message;
      setErrors(next);
      setResult(null);
      const count = Object.keys(next).length;
      setStatus(`Please fix ${count} ${count === 1 ? "field" : "fields"} to calculate.`);
      // Focus the first invalid field in DOM order (obtained before total).
      const first = formula.components
        .flatMap((c) => (["obtained", "total"] as const).map((p) => ({ c, p })))
        .find(({ c, p }) => next[`${c.key}.${p}`]);
      if (first) document.getElementById(fieldId(first.c.key, first.p))?.focus();
      return;
    }
    setErrors({});
    setResult(outcome.result);
    setStatus(
      `Your estimated ${universityShortName} aggregate is ${formatScore(outcome.result.aggregate)} percent.`,
    );
  }

  function onReset() {
    setValues((v) => clearFormulaValues(v, formula));
    setErrors({});
    setResult(null);
    setStatus("Form cleared.");
  }

  return (
    <div className="flex flex-col gap-8">
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
        {formulas.length > 1 ? (
          <fieldset>
            <legend className="font-headline text-base font-semibold text-on-surface">
              Choose your admission route
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {formulas.map((f) => (
                <label
                  key={f.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-outline-variant bg-surface-lowest p-4 transition-colors focus-within:ring-2 focus-within:ring-brand-container hover:border-outline has-[:checked]:border-brand has-[:checked]:bg-brand-fixed"
                >
                  <input
                    type="radio"
                    name={`${baseId}-formula`}
                    value={f.id}
                    checked={f.id === formula.id}
                    onChange={() => selectFormula(f.id)}
                    className="mt-1 size-4 accent-brand focus-visible:outline-none"
                  />
                  <span>
                    <span className="block font-headline font-semibold text-on-surface">
                      {f.label}
                    </span>
                    <span className="mt-1 block text-sm text-on-surface-variant">
                      {f.components.map((c) => `${c.label} ${c.weightPercent}%`).join(" · ")}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {formula.components.map((component) => (
          <ComponentFields
            key={`${formula.id}-${component.key}`}
            component={component}
            netScoreHint={hasNetScoreFlag && component.key === "entryTest"}
            fieldId={(part) => fieldId(component.key, part)}
            value={(part) => valueOf(component, part)}
            error={(part) => errors[`${component.key}.${part}`]}
            onChange={(part, next) => update(component, part, next)}
          />
        ))}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" className={marketingButton({ variant: "primary", size: "lg" })}>
            <Calculator aria-hidden="true" />
            Calculate aggregate
          </button>
          <button
            type="button"
            onClick={onReset}
            className={marketingButton({ variant: "secondary", size: "lg" })}
          >
            <RotateCcw aria-hidden="true" />
            Clear
          </button>
        </div>
      </form>

      {/* Short status for screen readers; the full breakdown is below. */}
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {result ? <ResultPanel result={result} universityShortName={universityShortName} /> : null}
    </div>
  );
}

type ComponentFieldsProps = {
  component: MeritComponent;
  netScoreHint: boolean;
  fieldId: (part: FieldPart) => string;
  value: (part: FieldPart) => string;
  error: (part: FieldPart) => string | undefined;
  onChange: (part: FieldPart, next: string) => void;
};

function ComponentFields({
  component,
  netScoreHint,
  fieldId,
  value,
  error,
  onChange,
}: ComponentFieldsProps) {
  const isPercentage = component.inputMode === "percentage";
  const hintsId = `${fieldId("obtained")}-notes`;
  const hints: string[] = [];
  if (netScoreHint) hints.push("Enter your score after negative marking.");
  hints.push(...(component.notes ?? []));

  return (
    <fieldset className="rounded-2xl border border-outline-variant bg-surface-low p-5">
      <legend className="sr-only">
        {component.label}, weight {component.weightPercent} percent
      </legend>
      <div aria-hidden="true" className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-headline text-base font-semibold text-on-surface">{component.label}</p>
        <p className="rounded-full bg-surface-lowest px-3 py-0.5 font-headline text-sm font-semibold text-on-surface">
          Weight {component.weightPercent}%
        </p>
      </div>
      {hints.length > 0 ? (
        <ul id={hintsId} className="mt-2 flex flex-col gap-1 text-sm text-on-surface-variant">
          {hints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      ) : null}
      <div className={cn("mt-4 grid gap-4", !isPercentage && "sm:grid-cols-2")}>
        <Field
          id={fieldId("obtained")}
          label={isPercentage ? "Percentage (0 to 100)" : "Marks obtained"}
          value={value("obtained")}
          error={error("obtained")}
          onChange={(next) => onChange("obtained", next)}
          placeholder={isPercentage ? "e.g. 82.5" : undefined}
          // Hints like "Enter your score after negative marking." change what
          // the student types, so they are announced on this input.
          describedBy={hints.length > 0 ? hintsId : undefined}
        />
        {isPercentage ? null : (
          <Field
            id={fieldId("total")}
            label="Total marks"
            value={value("total")}
            error={error("total")}
            onChange={(next) => onChange("total", next)}
            hint={
              component.defaultTotalMarks !== undefined
                ? `Pre-filled from the guide (${component.defaultTotalMarks}). Change it if yours differs.`
                : "The guide doesn't state this total. Enter it from your result card."
            }
          />
        )}
      </div>
    </fieldset>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  /** Extra description ids (e.g. the component's hint list). */
  describedBy?: string;
  onChange: (next: string) => void;
};

function Field({ id, label, value, error, hint, placeholder, describedBy: extra, onChange }: FieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null, extra ?? null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-on-surface">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={inputClass}
      />
      {error ? (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="text-xs leading-relaxed text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ResultPanel({
  result,
  universityShortName,
}: {
  result: MeritResult;
  universityShortName: string;
}) {
  // "year-not-stated" is shown once per page, not repeated per result.
  const flags = result.reviewFlags.filter((f) => f.code !== "year-not-stated");
  const checks = result.components.flatMap((c) =>
    c.qualifyingChecks.map((q) => ({ ...q, component: c.label })),
  );

  return (
    <section
      aria-labelledby="merit-result-heading"
      className="rounded-2xl border-2 border-ink bg-surface-lowest p-6 shadow-hard sm:p-8"
    >
      <h2
        id="merit-result-heading"
        className="font-headline text-sm font-semibold uppercase tracking-widest text-brand-container"
      >
        Your estimated {universityShortName} aggregate
      </h2>
      <p className="mt-2 font-headline text-5xl font-bold tracking-tight text-on-surface sm:text-6xl">
        {formatScore(result.aggregate)}
        <span className="ml-1 text-2xl font-semibold text-on-surface-variant">%</span>
      </p>
      <p className="mt-1 text-sm text-on-surface-variant">{result.formulaLabel} formula</p>

      <h3 className="mt-8 font-headline text-base font-semibold text-on-surface">Breakdown</h3>
      <ul className="mt-4 flex flex-col gap-5">
        {result.components.map((c) => (
          <li key={c.key}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold text-on-surface">{c.label}</span>
              <span className="text-on-surface-variant">
                <span className="font-semibold text-on-surface">
                  {formatScore(c.contribution)}
                </span>{" "}
                of {c.weightPercent} points
              </span>
            </div>
            <div
              className="mt-2 h-2.5 rounded-full bg-surface-high"
              role="img"
              aria-label={`${c.label}: ${formatScore(c.percentage)} percent achieved`}
            >
              <div
                className="h-2.5 rounded-full bg-brand"
                style={{ width: `${Math.min(100, Math.max(0, c.percentage))}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-on-surface-variant">
              {c.inputMode === "percentage"
                ? `${formatNumber(c.obtained)}%`
                : `${formatNumber(c.obtained)} / ${formatNumber(c.total)}`}{" "}
              = {formatScore(c.percentage)}% achieved × {c.weightPercent}% weight
            </p>
          </li>
        ))}
      </ul>

      {checks.length > 0 ? (
        <>
          <h3 className="mt-8 font-headline text-base font-semibold text-on-surface">
            Qualifying minimums
          </h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {checks.map((q) => (
              <li key={`${q.component}-${q.label}`} className="flex items-start gap-2">
                {q.met ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
                )}
                <span className="text-on-surface">
                  <span className="font-semibold">{q.met ? "Met" : "Not met"}:</span> {q.label}{" "}
                  needs at least {q.minimumPercent}% in {q.component}.{" "}
                  <span className="text-on-surface-variant">({sourceLine(q.sourcePages)})</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h3 className="mt-8 font-headline text-base font-semibold text-on-surface">Formula used</h3>
      <p className="mt-2 rounded-xl bg-surface-low px-4 py-3 font-mono text-sm leading-relaxed text-on-surface">
        {result.formulaText}
      </p>
      <p className="mt-2 text-xs text-on-surface-variant">{sourceLine(result.sourcePages)}</p>

      {flags.length > 0 ? (
        <div className="mt-6 rounded-xl border border-outline-variant bg-surface-low p-4">
          <p className="text-sm font-semibold text-on-surface">Notes on this formula</p>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-on-surface-variant">
            {flags.map((f) => (
              <li key={f.code}>{f.note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
