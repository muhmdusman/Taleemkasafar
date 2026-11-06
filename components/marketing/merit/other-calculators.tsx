import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { University } from "@/lib/merit/types";
import { routes } from "@/lib/routes";

/** Links to the other universities' calculators (server component). */
export function OtherCalculators({ universities }: { universities: readonly University[] }) {
  if (universities.length === 0) return null;

  return (
    <nav aria-labelledby="other-calculators-heading">
      <h2
        id="other-calculators-heading"
        className="font-headline text-lg font-bold tracking-tight text-on-surface"
      >
        Other merit calculators
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {universities.map((u) => (
          <li key={u.slug}>
            <Link
              href={routes.meritUniversity(u.slug)}
              className="flex h-full items-center justify-between gap-2 rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 text-sm font-medium text-on-surface transition-colors hover:border-outline hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container motion-reduce:transition-none"
            >
              {u.shortName}
              <ChevronRight className="size-4 shrink-0 text-on-surface-variant" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
