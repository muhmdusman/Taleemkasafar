"use client";

import { useId, useState } from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { ComponentKey, MeritComponent, MeritFormula } from "@/lib/merit/types";
import type { FieldPart } from "@/lib/merit/validate";
import { calculateMerit, formatScore, type MeritResult } from "@/lib/merit/calculate";
import { formulaSummary } from "@/lib/merit/display";
import {
  buildMeritInput,
  formFieldValue,
  formStateKey,
  type MeritFormValues,
} from "@/lib/merit/form-state";
import { marketingButton } from "@/components/marketing/button-link";
import { cn } from "@/lib/utils";

type FieldKey = `${ComponentKey}.${FieldPart}`;

const PARTS: readonly FieldPart[] = ["obtained", "total"];

const controlClass =
  "h-12 w-full min-w-0 rounded-xl border border-outline bg-surface-lowest px-4 text-base text-on-surface transition-colors focus-visible:border-brand-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container aria-[invalid=true]:border-danger motion-reduce:transition-none";

/** "MBBS needs at least 55% in MDCAT Score." Same wording before and after calculating. */
function minimumText(label: string, minimumPercent: number, component: string): string {
  return `${label} needs at least ${minimumPercent}% in ${component}.`;
}

/**
 * Merit calculator card for one university (client island, rendered on the
 * server too, so the default route's formula is in the HTML). All maths and
 * validation come from lib/merit (pure, unit-tested); this file only holds
 * form state and renders: route, marks, one button, result, and how the
 * result is calculated.
 */
export function MeritCalculatorForm({ formulas }: { formulas: MeritFormula[] }) {
  const baseId = useId();
  const [formulaId, setFormulaId] = useState(formulas[0].id);
  // Raw input (see lib/merit/form-state.ts): obtained marks are shared across
  // routes, totals are per formula and show the PDF default until edited.
  const [values, setValues] = useState<MeritFormValues>({});
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [result, setResult] = useState<MeritResult | null>(null);
  const [status, setStatus] = useState("");

  const formula = formulas.find((f) => f.id === formulaId) ?? formulas[0];
  const afterNegativeMarking = formula.reviewFlags.some((f) => f.code === "net-score-required");
  const routeId = `${baseId}-route`;

  const fieldId = (key: ComponentKey, part: FieldPart) =>
    `${baseId}-${formula.slug}-${key}-${part}`;

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
      setStatus("Marks changed. Press Calculate merit to update your aggregate.");
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
        .flatMap((c) => PARTS.map((p) => ({ c, p })))
        .find(({ c, p }) => next[`${c.key}.${p}`]);
      if (first) document.getElementById(fieldId(first.c.key, first.p))?.focus();
      return;
    }
    setErrors({});
    setResult(outcome.result);
    setStatus(`Estimated aggregate: ${formatScore(outcome.result.aggregate)} percent.`);
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-outline-variant bg-surface-lowest p-5 shadow-soft sm:p-8">
      <form
        noValidate
        onSubmit={onSubmit}
        aria-label="Merit calculator"
        className="flex flex-col gap-6"
      >
        {formulas.length > 1 ? (
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <label htmlFor={routeId} className="text-sm font-medium text-on-surface">
              Admission route
            </label>
            <select
              id={routeId}
              value={formula.id}
              onChange={(e) => selectFormula(e.target.value)}
              className={cn(controlClass, "cursor-pointer")}
            >
              {formulas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          {formula.components.map((component) => (
            <ComponentFields
              key={`${formula.id}-${component.key}`}
              component={component}
              afterNegativeMarking={afterNegativeMarking && component.key === "entryTest"}
              fieldId={(part) => fieldId(component.key, part)}
              value={(part) => formFieldValue(values, formula, component, part)}
              error={(part) => errors[`${component.key}.${part}`]}
              onChange={(part, next) => update(component, part, next)}
            />
          ))}
        </div>

        <button
          type="submit"
          className={cn(marketingButton({ variant: "primary", size: "lg" }), "w-full")}
        >
          Calculate merit
        </button>
      </form>

      {/* Short status for screen readers; the full result is below. */}
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {result ? <ResultPanel result={result} /> : null}

      <FormulaBreakdown formula={formula} />
    </div>
  );
}

type ComponentFieldsProps = {
  component: MeritComponent;
  afterNegativeMarking: boolean;
  fieldId: (part: FieldPart) => string;
  value: (part: FieldPart) => string;
  error: (part: FieldPart) => string | undefined;
  onChange: (part: FieldPart, next: string) => void;
};

/** One component: "[obtained] / [total]", or "[percentage %]". */
function ComponentFields({
  component,
  afterNegativeMarking,
  fieldId,
  value,
  error,
  onChange,
}: ComponentFieldsProps) {
  const percentage = component.inputMode === "percentage";
  const parts = percentage ? PARTS.slice(0, 1) : PARTS;
  const renderInput = (part: FieldPart, label: string, className?: string) => {
    const message = error(part);
    return (
      <input
        id={fieldId(part)}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        aria-label={label}
        value={value(part)}
        onChange={(e) => onChange(part, e.target.value)}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? `${fieldId(part)}-error` : undefined}
        className={cn(controlClass, "tabular-nums", className)}
      />
    );
  };

  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-medium text-on-surface">
        {component.label}
        {/* Changes what the student types, so it stays in the field name. */}
        {afterNegativeMarking ? " (after negative marking)" : null}
      </legend>
      {percentage ? (
        <div className="relative mt-2">
          {renderInput("obtained", "Percentage", "pr-10")}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-on-surface-variant"
          >
            %
          </span>
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {renderInput("obtained", "Marks obtained")}
          <span aria-hidden="true" className="text-lg text-on-surface-variant">
            /
          </span>
          {renderInput("total", "Total marks")}
        </div>
      )}
      {parts.map((part) => {
        const message = error(part);
        return message ? (
          <p
            key={part}
            id={`${fieldId(part)}-error`}
            className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {message}
          </p>
        ) : null;
      })}
    </fieldset>
  );
}

function ResultPanel({ result }: { result: MeritResult }) {
  const checks = result.components.flatMap((c) =>
    c.qualifyingChecks.map((q) => ({ ...q, component: c.label })),
  );

  return (
    <section
      aria-labelledby="merit-result-heading"
      className="rounded-xl border-2 border-brand/30 p-5 sm:p-6"
    >
      <h2
        id="merit-result-heading"
        className="font-headline text-base font-semibold text-on-surface-variant"
      >
        Estimated aggregate
      </h2>
      <p className="mt-1 font-headline text-5xl font-bold tabular-nums tracking-tight text-on-surface sm:text-6xl">
        {formatScore(result.aggregate)}
        <span className="ml-1 text-2xl font-semibold text-on-surface-variant">%</span>
      </p>

      {/* Each row is the component's share of the aggregate, out of its weight. */}
      <ul className="mt-6 flex flex-col gap-4">
        {result.components.map((c) => (
          <li key={c.key}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="font-medium text-on-surface">{c.label}</span>
              <span className="tabular-nums text-on-surface-variant">
                <span className="font-semibold text-on-surface">{formatScore(c.contribution)}</span>{" "}
                / {c.weightPercent}
              </span>
            </div>
            <div aria-hidden="true" className="mt-2 h-2 rounded-full bg-surface-high">
              <div
                className="h-2 rounded-full bg-brand"
                style={{ width: `${Math.min(100, Math.max(0, c.percentage))}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {checks.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-2 text-sm text-on-surface">
          {checks.map((q) => (
            <li key={`${q.component}-${q.label}`} className="flex items-start gap-2">
              {q.met ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
              )}
              <span>
                <span className="font-semibold">{q.met ? "Met" : "Not met"}:</span>{" "}
                {minimumText(q.label, q.minimumPercent, q.component)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs leading-relaxed text-on-surface-variant">{result.disclaimer}</p>
    </section>
  );
}

/** "How your result is calculated" for the selected route. */
function FormulaBreakdown({ formula }: { formula: MeritFormula }) {
  const minimums = formula.components.flatMap((c) =>
    (c.qualifyingMinimums ?? []).map((m) => ({ ...m, component: c.label })),
  );

  return (
    <section
      aria-labelledby="merit-formula-heading"
      className="border-t border-outline-variant pt-6"
    >
      <h2
        id="merit-formula-heading"
        className="font-headline text-base font-semibold text-on-surface"
      >
        How your result is calculated
      </h2>
      <p className="mt-2 font-headline font-semibold text-brand-container">
        {formulaSummary(formula)}
      </p>
      <dl className="mt-3 flex flex-col gap-2 text-sm">
        {formula.components.map((c) => (
          <div key={c.key} className="flex items-baseline justify-between gap-4">
            <dt className="text-on-surface-variant">{c.label}</dt>
            <dd className="font-semibold tabular-nums text-on-surface">{c.weightPercent}%</dd>
          </div>
        ))}
      </dl>
      {minimums.length > 0 ? (
        <ul className="mt-4 flex list-disc flex-col gap-1 pl-5 text-sm text-on-surface-variant">
          {minimums.map((m) => (
            <li key={`${m.component}-${m.label}`}>
              {minimumText(m.label, m.minimumPercent, m.component)}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
