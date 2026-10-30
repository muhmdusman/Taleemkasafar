import Link from "next/link";
import { Icon } from "@/components/dashboard/icon";
import { LinkPendingIndicator } from "@/components/dashboard/link-pending";
import { appButton, card, focusRing } from "@/components/dashboard/styles";
import { toneClasses } from "@/components/dashboard/tone";
import type { MockResultDetail } from "@/lib/queries/mock";
import { routes } from "@/lib/routes";
import { subjectTone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";

/** Below this subject score the result offers "Practise <subject>". */
const PRACTISE_BELOW = 70;

/**
 * Post-submission mock result: overall score + per-subject breakdown in each
 * subject's tone, with a direct link to practise any weaker subject.
 */
export function MockResult({ result }: { result: MockResultDetail }) {
  const score = Math.round(result.scorePercent);
  return (
    <div className="flex flex-col gap-8">
      {/* Headline score */}
      <section className={cn(card, "p-6 md:p-10")}>
        <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          Your Score
        </div>
        <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
          <span className="font-headline text-6xl font-bold leading-none tracking-tight text-brand tabular-nums md:text-7xl">
            {score}%
          </span>
          <span className="mb-1 font-headline text-lg text-on-surface-variant">
            {result.correctCount} / {result.totalQuestions} correct
          </span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 font-headline">
          <Stat label="Correct" value={result.correctCount} tone="success" />
          <Stat label="Incorrect" value={result.incorrectCount} tone="danger" />
          <Stat label="Skipped" value={result.skippedCount} tone="neutral" />
        </div>
      </section>

      {/* Per-subject breakdown */}
      <section>
        <h3 className="mb-4 font-headline text-xl font-bold tracking-tight text-on-surface md:text-2xl">
          By Subject
        </h3>
        <div className="flex flex-col gap-3">
          {Object.entries(result.perSubject).map(([subject, b]) => {
            const pct = b.total === 0 ? 0 : (b.correct / b.total) * 100;
            const tone = toneClasses[subjectTone(subject)];
            // Keys are subject slugs; show them as words ("pu-maths" -> "maths").
            const name = subject.replace(/^pu-/, "").replace(/-/g, " ");
            return (
              <div key={subject} className={cn(card, "border-l-4 p-5", tone.border)}>
                <div className="mb-3 flex items-center justify-between gap-3 font-headline text-sm font-semibold tracking-tight">
                  <span className="capitalize text-on-surface">{name}</span>
                  <span className="tabular-nums text-on-surface-variant">
                    {b.correct} / {b.total} ·{" "}
                    <span className={tone.text}>{Math.round(pct)}%</span>
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-high">
                  <div
                    className={cn("h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none", tone.bar)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {b.total > 0 && pct < PRACTISE_BELOW ? (
                  <Link
                    href={routes.subject(subject)}
                    className={cn(
                      "mt-3 inline-flex items-center gap-1 rounded font-headline text-sm font-semibold underline-offset-4 hover:underline",
                      tone.text,
                      focusRing,
                    )}
                  >
                    <span className="capitalize">Practise {name}</span>
                    <LinkPendingIndicator>
                      <Icon name="arrow_forward" className="text-base" />
                    </LinkPendingIndicator>
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href={routes.mocks} className={appButton()}>
          <Icon name="replay" className="text-lg" /> Take Another
        </Link>
        <Link href={routes.performance} className={appButton({ variant: "secondary" })}>
          <Icon name="insights" className="text-lg" /> View progress
        </Link>
        <Link href={routes.dashboard} className={appButton({ variant: "ghost" })}>
          <Icon name="home" className="text-lg" /> Home
        </Link>
      </div>
    </div>
  );
}

const STAT_TONE = {
  success: "bg-success-fixed text-success",
  danger: "bg-danger-fixed text-danger",
  neutral: "bg-surface-low text-on-surface-variant",
} as const;

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: keyof typeof STAT_TONE;
}) {
  return (
    <div className={cn("rounded-xl px-3 py-3 sm:px-4", STAT_TONE[tone])}>
      <div className="text-2xl font-bold tabular-nums md:text-3xl">{value}</div>
      <div className="text-xs font-semibold">{label}</div>
    </div>
  );
}
