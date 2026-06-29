import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPerformance } from "@/lib/queries/performance";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { DashboardHeader } from "@/components/dashboard/header";
import { Icon } from "@/components/dashboard/icon";

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
            <div className="border-2 border-black bg-white p-10 text-center shadow-hard">
              <Icon name="insights" className="text-5xl text-brand" />
              <h2 className="mt-4 font-headline text-2xl font-bold uppercase tracking-tight">
                No activity yet
              </h2>
              <p className="mx-auto mt-2 max-w-md font-body text-on-surface-variant">
                Take a mock test or practice some chapters to start tracking your
                progress.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/mock"
                  className="border-2 border-black bg-black px-5 py-3 font-headline text-sm font-bold uppercase tracking-tight text-white shadow-hard transition-colors hover:bg-brand"
                >
                  Start a Mock
                </Link>
                <Link
                  href="/subjects"
                  className="border-2 border-black bg-white px-5 py-3 font-headline text-sm font-bold uppercase tracking-tight transition-colors hover:bg-brand-fixed"
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
                <h3 className="mb-4 font-headline text-2xl font-bold uppercase tracking-tight">
                  Mock History
                </h3>
                {data!.mockResults.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {data!.mockResults.map((r) => (
                      <Link
                        key={r.attemptId}
                        href={`/mock/${r.attemptId}/result`}
                        className="flex items-center justify-between border-2 border-black bg-white p-5 transition-colors hover:bg-brand-fixed"
                      >
                        <div className="flex items-center gap-4">
                          <div className="font-headline text-3xl font-bold text-brand">
                            {Math.round(r.scorePercent)}%
                          </div>
                          <div>
                            <div className="font-headline text-sm font-bold uppercase tracking-tight">
                              {r.correctCount} / {r.totalQuestions} correct
                            </div>
                            <div className="text-xs text-on-surface-variant">
                              {r.submittedAt
                                ? new Date(r.submittedAt).toLocaleString()
                                : "—"}
                            </div>
                          </div>
                        </div>
                        <Icon name="chevron_right" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-black bg-white p-6 shadow-hard">
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
    <div className="border-2 border-black bg-white p-5 shadow-hard">
      <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </div>
      <div className="mt-1 font-headline text-4xl font-bold text-black">
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-on-surface-variant">{sub}</div>}
    </div>
  );
}

function PerfSkeleton() {
  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-30 h-20 border-b-2 border-black bg-white md:left-64" />
      <main className="px-4 pb-24 pt-28 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse border-2 border-black bg-surface-high"
              />
            ))}
          </div>
          <div className="h-40 w-full animate-pulse border-2 border-black bg-surface-container" />
        </div>
      </main>
    </>
  );
}
