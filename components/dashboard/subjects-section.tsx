import Link from "next/link";
import { Icon } from "./icon";
import { SectionHeading } from "./section-heading";
import { card, cardInteractive } from "./styles";
import type { SubjectOverview } from "@/lib/queries/dashboard";
import { cardIndex } from "@/lib/queries/dashboard-helpers";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
      {heading && <SectionHeading>Subjects</SectionHeading>}
      {subjects.length === 0 ? (
        <div className={cn(card, "p-8")}>
          <p className="font-body text-on-surface-variant">
            No subjects available for this test yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {subjects.map((s, i) => {
            const m = meta(s.subject_slug ?? "");
            return (
              <Link
                key={s.subject_id ?? i}
                href={routes.subject(s.subject_slug ?? "")}
                className={cn(cardInteractive, "group flex flex-col gap-6 p-6")}
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-brand-fixed text-brand-container">
                    <Icon name={m.icon} className="text-2xl" />
                  </span>
                  <span className="font-headline text-sm font-semibold tabular-nums text-on-surface-variant">
                    {cardIndex(i)}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                    {s.subject_name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {m.tagline}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-4">
                  <span className="text-sm font-medium text-on-surface-variant">
                    {s.chapter_count ?? 0} Chapters · {s.question_count ?? 0} MCQs
                  </span>
                  <Icon
                    name="arrow_forward"
                    className="text-on-surface transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
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
