import type { University } from "@/lib/merit/types";

/** Eligibility, negative marking and test structure, as stated in the guide. */
export function AdmissionCriteria({ university }: { university: University }) {
  const rows = [
    { term: "Eligibility", lines: university.eligibility ? [university.eligibility] : [] },
    {
      term: "Negative marking",
      lines: university.negativeMarking ? [university.negativeMarking] : [],
    },
    { term: "Test structure", lines: university.testStructure ?? [] },
  ].filter((row) => row.lines.length > 0);

  if (rows.length === 0) return null;

  return (
    <section
      aria-labelledby="criteria-heading"
      className="rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft"
    >
      <h2
        id="criteria-heading"
        className="font-headline text-lg font-bold tracking-tight text-on-surface"
      >
        {university.shortName} admission criteria
      </h2>
      <dl className="mt-4 divide-y divide-outline-variant text-sm">
        {rows.map((row) => (
          <div key={row.term} className="py-3 first:pt-0 last:pb-0">
            <dt className="font-medium text-on-surface-variant">{row.term}</dt>
            {row.lines.map((line) => (
              <dd key={line} className="mt-1 leading-relaxed text-on-surface">
                {line}
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </section>
  );
}
