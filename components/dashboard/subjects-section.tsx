import Link from "next/link";
import type { SubjectOverview } from "@/lib/queries/dashboard";
import { cardIndex } from "@/lib/queries/dashboard-helpers";
import type { SubjectPractice } from "@/lib/queries/progress";
import { routes } from "@/lib/routes";
import { subjectTone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { LinkPendingIndicator } from "./link-pending";
import { SectionHeading } from "./section-heading";
import { card, cardInteractive } from "./styles";
import { areaTone, toneClasses } from "./tone";

// Known subjects (slug without the `pu-` prefix) → icon + tagline.
const SUBJECT_META: Record<string, { icon: string; tagline: string }> = {
  english: { icon: "menu_book", tagline: "Grammar, vocabulary & comprehension" },
  maths: { icon: "calculate", tagline: "Algebra, calculus & more" },
  physics: { icon: "bolt", tagline: "Mechanics, waves & modern physics" },
  chemistry: { icon: "science", tagline: "Reactions, bonding & organic chemistry" },
  biology: { icon: "biotech", tagline: "Cells, genetics & human physiology" },
  "computer-science": { icon: "terminal", tagline: "Programming, logic & computing basics" },
  "verbal-reasoning": { icon: "spellcheck", tagline: "Analogies, sentences & word sense" },
  "quantitative-reasoning": { icon: "functions", tagline: "Numbers, patterns & problem solving" },
};

export function subjectMeta(slug: string) {
  return (
    SUBJECT_META[slug.replace(/^pu-/, "")] ?? {
      icon: "school",
      tagline: "Practice & past papers",
    }
  );
}

/**
 * Subject cards in each subject's soft tone. With `progress`, each card shows
 * how much of the subject's question bank the student has covered and their
 * accuracy; `null` (no per-subject data) hides the bar instead of showing 0%.
 */
export function SubjectsSection({
  subjects,
  progress = null,
  heading = true,
}: {
  subjects: SubjectOverview[];
  progress?: Record<string, SubjectPractice> | null;
  heading?: boolean;
}) {
  return (
    <div>
      {heading && (
        <SectionHeading icon="menu_book" tone={areaTone.subjects}>
          Subjects
        </SectionHeading>
      )}
      {subjects.length === 0 ? (
        <div className={cn(card, "p-8")}>
          <p className="font-body text-on-surface-variant">
            No subjects available for this test yet.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s, i) => (
            <li key={s.subject_id ?? i} className="flex">
              <SubjectCard
                subject={s}
                index={i}
                progress={progress && s.subject_id ? (progress[s.subject_id] ?? null) : undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SubjectCard({
  subject: s,
  index,
  progress,
}: {
  subject: SubjectOverview;
  index: number;
  /** undefined = no per-subject data at all; null = not started yet. */
  progress: SubjectPractice | null | undefined;
}) {
  const slug = s.subject_slug ?? "";
  const m = subjectMeta(slug);
  const tone = toneClasses[subjectTone(slug)];
  const total = s.question_count ?? 0;
  const covered = progress ? Math.min(100, Math.round((progress.questionsSeen / Math.max(total, 1)) * 100)) : 0;

  return (
    <Link
      href={routes.subject(slug)}
      className={cn(cardInteractive, "group flex w-full flex-col gap-5 border-t-4 p-6", tone.topBorder, tone.hoverBorder)}
    >
      <div className="flex items-start justify-between">
        <span className={cn("flex size-12 items-center justify-center rounded-xl", tone.tile)}>
          <Icon name={m.icon} className="text-2xl" />
        </span>
        <span className="font-headline text-sm font-semibold tabular-nums text-on-surface-variant">
          {cardIndex(index)}
        </span>
      </div>

      <div>
        <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
          {s.subject_name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">{m.tagline}</p>
      </div>

      {progress !== undefined ? (
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-on-surface">
              {progress ? `${covered}% covered` : "Not started yet"}
            </span>
            {progress ? (
              <span className={cn("font-semibold tabular-nums", tone.text)}>
                {progress.accuracyPercent}% correct
              </span>
            ) : null}
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-surface-high"
            role="img"
            aria-label={
              progress
                ? `${progress.questionsSeen} of ${total} questions practised`
                : "No questions practised yet"
            }
          >
            <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${covered}%` }} />
          </div>
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-4">
        <span className="text-sm font-medium text-on-surface-variant">
          {s.chapter_count ?? 0} Chapters · {total} MCQs
        </span>
        <span className={cn("flex size-8 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none", tone.tile)}>
          <LinkPendingIndicator>
            <Icon name="arrow_forward" className="text-lg" />
          </LinkPendingIndicator>
        </span>
      </div>
    </Link>
  );
}
