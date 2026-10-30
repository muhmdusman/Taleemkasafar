import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPerformance } from "@/lib/queries/performance";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { Icon } from "@/components/dashboard/icon";
import { appButton, card, cardInteractive, skeleton } from "@/components/dashboard/styles";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export default function PerformancePage() {
  return (
    <Suspense fallback={<PerfSkeleton />}>
      <PerformanceView />
    </Suspense>
  );
}

async function PerformanceView() {
  const [data, entryTest, tests, displayName] = await Promise.all([
    getPerformance(),
    getActiveEntryTest(),
    getEntryTestsCached(),
    getDisplayName(),
  ]);

  if (!entryTest) redirect("/auth/login");

  const hasActivity =
    !!data &&
    (data.mockResults.length > 0 || data.practice.answered > 0);

  return (
    <>
      <DashboardHeader
        title="Performance"
        badge={entryTest.name}
        displayName={displayName}
        tests={tests}
        activeTestId={entryTest.id}
      />
      <main className="px-4 pb-24 pt-28 md:px-12 md:pb-20">
        <div className="mx-auto max-w-4xl">
          {!hasActivity ? (
            <div className={cn(card, "p-10 text-center")}>
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-fixed text-brand-container">
                <Icon name="insights" className="text-3xl" />
              </span>
              <h2 className="mt-4 font-headline text-2xl font-bold tracking-tight text-on-surface">
                No activity yet
              </h2>
              <p className="mx-auto mt-2 max-w-md font-body text-on-surface-variant">
                Take a mock test or practice some chapters to start tracking your
                progress.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href={routes.mocks} className={appButton()}>
                  Start a Mock
                </Link>
                <Link
                  href={routes.subjects}
                  className={appButton({ variant: "secondary" })}
                >
                  Practice
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                  label="Best Mock"
                  value={
                    data!.bestScore !== null
                      ? `${Math.round(data!.bestScore)}%`
                      : "—"
                  }
                />
                <SummaryCard
                  label="Average Mock"
                  value={
                    data!.averageScore !== null
                      ? `${Math.round(data!.averageScore)}%`
                      : "—"
                  }
                />
                <SummaryCard
                  label="Practice Accuracy"
                  value={
                    data!.practice.answered > 0
                      ? `${Math.round(data!.practice.accuracyPercent)}%`
                      : "—"
                  }
                  sub={
                    data!.practice.answered > 0
                      ? `${data!.practice.correct}/${data!.practice.answered} correct`
                      : undefined
                  }
                />
              </section>

              {/* Mock history */}
              <section>
                <h3 className="mb-4 font-headline text-xl font-bold tracking-tight text-on-surface md:text-2xl">
                  Mock History
                </h3>
                {data!.mockResults.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {data!.mockResults.map((r) => (
                      <Link
                        key={r.attemptId}
                        href={routes.mockResult(r.attemptId)}
                        className={cn(cardInteractive, "flex items-center justify-between gap-4 p-4 md:p-5")}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-fixed font-headline text-xl font-bold tabular-nums text-brand-container">
                            {Math.round(r.scorePercent)}%
                          </div>
                          <div>
                            <div className="font-headline text-sm font-semibold tracking-tight text-on-surface">
                              {r.correctCount} / {r.totalQuestions} correct
                            </div>
                            <div className="mt-0.5 text-xs text-on-surface-variant">
                              {r.submittedAt
                                ? new Date(r.submittedAt).toLocaleString()
                                : "—"}
                            </div>
                          </div>
                        </div>
                        <Icon name="chevron_right" className="text-on-surface-variant" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className={cn(card, "p-6")}>
                    <p className="font-body text-on-surface-variant">
                      No mock attempts yet — but your practice is being tracked
                      above.
                    </p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className={cn(card, "p-5")}>
      <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
        {label}
      </div>
      <div className="mt-2 font-headline text-4xl font-bold tabular-nums tracking-tight text-on-surface">
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-on-surface-variant">{sub}</div>}
    </div>
  );
}

function PerfSkeleton() {
  return (
    <>
      <DashboardHeaderFallback />
      <main className="px-4 pb-24 pt-28 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn(skeleton, "h-28")} />
            ))}
          </div>
          <div className={cn(skeleton, "h-40 w-full")} />
        </div>
      </main>
    </>
  );
}
