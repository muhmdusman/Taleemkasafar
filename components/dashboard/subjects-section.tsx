import Link from "next/link";
import { Icon } from "./icon";
import type { SubjectOverview } from "@/lib/queries/dashboard";
import { cardIndex } from "@/lib/queries/dashboard-helpers";

// Map known subjects to an icon + tagline. Falls back gracefully for new ones.
const SUBJECT_META: Record<string, { icon: string; tagline: string }> = {
  english: { icon: "menu_book", tagline: "Grammar, vocabulary & comprehension" },
  maths: { icon: "calculate", tagline: "Algebra, calculus & more" },
  physics: { icon: "bolt", tagline: "Mechanics, waves & modern physics" },
};

function meta(slug: string) {
  return SUBJECT_META[slug] ?? { icon: "school", tagline: "Practice & past papers" };
}

export function SubjectsSection({
  subjects,
  heading = true,
}: {
  subjects: SubjectOverview[];
  heading?: boolean;
}) {
  return (
    <div>
      {heading && (
        <div className="mb-8 flex items-center gap-4">
          <h2 className="font-headline text-4xl font-bold uppercase tracking-tight">
            Subjects
          </h2>
          <div className="h-1 flex-grow bg-black" />
        </div>
      )}
      {subjects.length === 0 ? (
        <div className="border-2 border-black bg-white p-8 shadow-hard">
          <p className="font-body text-on-surface-variant">
            No subjects available for this test yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {subjects.map((s, i) => {
            const m = meta(s.subject_slug ?? "");
            return (
              <Link
                key={s.subject_id ?? i}
                href={`/subjects/${s.subject_slug}`}
                className="group flex cursor-pointer flex-col gap-6 border-[3px] border-black bg-white p-6 transition-colors hover:bg-brand-fixed"
              >
                <div className="flex items-start justify-between">
                  <Icon name={m.icon} className="text-4xl" />
                  <span className="font-headline text-xl font-bold">
                    {cardIndex(i)}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline text-3xl font-bold uppercase">
                    {s.subject_name}
                  </h3>
                  <p className="mt-2 font-bold opacity-70">{m.tagline}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t-2 border-black pt-4">
                  <span className="font-headline text-sm font-bold uppercase">
                    {s.chapter_count ?? 0} Chapters · {s.question_count ?? 0} MCQs
                  </span>
                  <Icon
                    name="arrow_forward"
                    className="transition-transform group-hover:translate-x-2"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
