import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { University } from "@/lib/merit/types";
import { entryTestNames } from "@/lib/merit/display";
import { routes } from "@/lib/routes";
import { WeightChips } from "@/components/marketing/merit/weight-chips";

/** One card per university on /merit-calculator (server component). */
export function UniversityCard({ university }: { university: University }) {
  const tests = entryTestNames(university);
  const multiple = university.formulas.length > 1;
  return (
    <li className="flex flex-col rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-soft-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <p className="font-headline text-sm font-semibold uppercase tracking-widest text-brand-container">
        {university.shortName}
      </p>
      <h3 className="mt-2 font-headline text-lg font-bold leading-snug tracking-tight text-on-surface">
        {university.name}
      </h3>
      {university.city ? (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-on-surface-variant">
          <MapPin className="size-4" aria-hidden="true" />
          {university.city}
        </p>
      ) : null}
      <p className="mt-4 text-sm text-on-surface-variant">
        <span className="font-semibold text-on-surface">Entry test:</span> {tests.join(", ")}
      </p>
      <div className="mt-4 flex flex-1 flex-col gap-3">
        {university.formulas.map((formula) => (
          <div key={formula.id}>
            {multiple ? (
              <p className="mb-2 text-sm font-medium text-on-surface">{formula.label}</p>
            ) : null}
            <WeightChips formula={formula} />
          </div>
        ))}
      </div>
      <Link
        href={routes.meritUniversity(university.slug)}
        className="mt-6 inline-flex items-center gap-2 self-start rounded-lg font-headline text-base font-semibold text-brand-container underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface-lowest"
      >
        Calculate {university.shortName} merit
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </li>
  );
}
