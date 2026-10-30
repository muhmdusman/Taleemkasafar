import Link from "next/link";
import { Icon } from "@/components/dashboard/icon";
import { appButton, card } from "@/components/dashboard/styles";
import type { MockResultDetail } from "@/lib/queries/mock";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Post-submission mock result: overall score + per-subject breakdown. */
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
            return (
              <div key={subject} className={cn(card, "p-5")}>
                <div className="mb-3 flex items-center justify-between font-headline text-sm font-semibold tracking-tight">
                  <span className="capitalize text-on-surface">{subject}</span>
                  <span className="tabular-nums text-on-surface-variant">
                    {b.correct} / {b.total} · {Math.round(pct)}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-high">
                  <div
                    className="h-full rounded-full bg-brand transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: `${pct}%` }}
                  />
                </div>
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
          <Icon name="insights" className="text-lg" /> View Performance
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
