import type { MeritFormula } from "@/lib/merit/types";

/**
 * Server-rendered so the formula is in the HTML for search engines (the
 * calculator is a client island). One table says it all: each component,
 * its total and its weight.
 */
export function FormulaCard({ formula, title }: { formula: MeritFormula; title: string }) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft">
      <h2 className="font-headline text-lg font-bold tracking-tight text-on-surface">{title}</h2>
      <table className="mt-4 w-full text-left text-sm">
        <caption className="sr-only">{title}</caption>
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
              <th scope="row" className="py-2.5 pr-2 font-medium">
                {c.label}
              </th>
              <td className="py-2.5 text-right tabular-nums">
                {c.inputMode === "percentage" ? "100%" : (c.defaultTotalMarks ?? "Not stated")}
              </td>
              <td className="py-2.5 text-right font-semibold tabular-nums">{c.weightPercent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
