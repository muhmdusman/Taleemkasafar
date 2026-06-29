import Link from "next/link";
import { Icon } from "@/components/dashboard/icon";
import type { MockResultDetail } from "@/lib/queries/mock";

/** Post-submission mock result: overall score + per-subject breakdown. */
export function MockResult({ result }: { result: MockResultDetail }) {
  const score = Math.round(result.scorePercent);
  return (
    <div className="flex flex-col gap-8">
      {/* Headline score */}
      <section className="border-2 border-black bg-black p-8 text-white shadow-hard-primary md:p-10">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-fixed">
          Your Score
        </div>
        <div className="flex items-end gap-4">
          <span className="font-headline text-7xl font-bold leading-none">
            {score}%
          </span>
          <span className="mb-2 font-headline text-lg text-white/70">
            {result.correctCount} / {result.totalQuestions} correct
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-6 font-headline">
          <Stat label="Correct" value={result.correctCount} tone="text-[#4ade80]" />
          <Stat label="Incorrect" value={result.incorrectCount} tone="text-[#f87171]" />
          <Stat label="Skipped" value={result.skippedCount} tone="text-white/60" />
        </div>
      </section>

      {/* Per-subject breakdown */}
      <section>
        <h3 className="mb-4 font-headline text-2xl font-bold uppercase tracking-tight">
          By Subject
        </h3>
        <div className="flex flex-col gap-4">
          {Object.entries(result.perSubject).map(([subject, b]) => {
            const pct = b.total === 0 ? 0 : (b.correct / b.total) * 100;
            return (
              <div
                key={subject}
                className="border-2 border-black bg-white p-5 shadow-hard"
              >
                <div className="mb-2 flex items-center justify-between font-headline text-sm font-bold uppercase tracking-tight">
                  <span className="capitalize">{subject}</span>
                  <span className="text-on-surface-variant">
                    {b.correct} / {b.total} · {Math.round(pct)}%
                  </span>
                </div>
                <div className="h-3 w-full border-2 border-black bg-surface-high">
                  <div
                    className="h-full bg-brand transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/mock"
          className="flex items-center gap-2 border-2 border-black bg-black px-5 py-3 font-headline text-sm font-bold uppercase tracking-tight text-white shadow-hard transition-colors hover:bg-brand active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <Icon name="replay" className="text-lg" /> Take Another
        </Link>
        <Link
          href="/performance"
          className="flex items-center gap-2 border-2 border-black bg-white px-5 py-3 font-headline text-sm font-bold uppercase tracking-tight transition-colors hover:bg-brand-fixed active:translate-x-[2px] active:translate-y-[2px]"
        >
          <Icon name="insights" className="text-lg" /> View Performance
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div>
      <div className={`text-3xl font-bold ${tone}`}>{value}</div>
      <div className="text-xs uppercase tracking-widest text-white/60">
        {label}
      </div>
    </div>
  );
}
