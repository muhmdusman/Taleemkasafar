import { FileText } from "lucide-react";
import type { MeritFormula } from "@/lib/merit/types";
import { sourceLine } from "@/lib/merit/display";
import { WeightChips } from "@/components/marketing/merit/weight-chips";

/**
 * Static, server-rendered formula card so the formula is in the HTML for
 * search engines (the calculator itself is a client island).
 * The @esuiss Code Block was considered here and not used: a formula reads
 * better as styled text, and its client-side shiki highlighting would add
 * JS to every university page for no benefit.
 */
export function FormulaCard({ formula, title }: { formula: MeritFormula; title: string }) {
  // "year-not-stated" is shown once per page, not per formula.
  const flags = formula.reviewFlags.filter((f) => f.code !== "year-not-stated");
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-fixed text-brand-container">
          <FileText className="size-5" aria-hidden="true" />
        </span>
        <h2 className="font-headline text-lg font-bold tracking-tight text-on-surface">{title}</h2>
      </div>
      <WeightChips formula={formula} className="mt-5" />
      <p className="mt-5 rounded-xl bg-surface-low px-4 py-3 font-mono text-sm leading-relaxed text-on-surface">
        {formula.formulaText}
      </p>
      <table className="mt-5 w-full text-left text-sm">
        <caption className="sr-only">Components of the {formula.label} formula</caption>
        <thead>
          <tr className="text-on-surface-variant">
            <th scope="col" className="pb-2 font-medium">
              Component
            </th>
            <th scope="col" className="pb-2 text-right font-medium">
              Out of
            </th>
            <th scope="col" className="pb-2 text-right font-medium">
              Weight
            </th>
          </tr>
        </thead>
        <tbody className="text-on-surface">
          {formula.components.map((c) => (
            <tr key={c.key} className="border-t border-outline-variant">
              <th scope="row" className="py-2 pr-2 font-medium">
                {c.label}
              </th>
              <td className="py-2 text-right">
                {c.inputMode === "percentage" ? "100%" : (c.defaultTotalMarks ?? "Not stated")}
              </td>
              <td className="py-2 text-right font-semibold">{c.weightPercent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-on-surface-variant">{sourceLine(formula.sourcePages)}</p>
      {flags.length > 0 || (formula.notes?.length ?? 0) > 0 ? (
        <details className="group mt-4 rounded-xl border border-outline-variant bg-surface-low">
          <summary className="cursor-pointer list-none rounded-xl px-4 py-3 text-sm font-semibold text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container [&::-webkit-details-marker]:hidden">
            Notes on this formula ({flags.length + (formula.notes?.length ?? 0)})
            <span className="ml-1 font-normal text-on-surface-variant group-open:hidden">
              (show)
            </span>
          </summary>
          <ul className="flex list-disc flex-col gap-1.5 px-4 pb-4 pl-9 text-sm leading-relaxed text-on-surface-variant">
            {flags.map((f) => (
              <li key={f.code}>{f.note}</li>
            ))}
            {formula.notes?.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </article>
  );
}
