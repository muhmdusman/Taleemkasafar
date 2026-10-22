import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMockLanding } from "@/lib/queries/mock";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { DashboardHeader } from "@/components/dashboard/header";
import { Icon } from "@/components/dashboard/icon";
import { StartMockButton } from "@/components/quiz/start-mock-button";
import { formatTime } from "@/lib/quiz/time";

export default function MockPage() {
  return (
    <Suspense fallback={<MockSkeleton />}>
      <MockLandingView />
    </Suspense>
  );
}

async function MockLandingView() {
  const [data, entryTest, tests, displayName] = await Promise.all([
    getMockLanding(),
    getActiveEntryTest(),
    getEntryTestsCached(),
    getDisplayName(),
  ]);

  if (!entryTest) redirect("/auth/login");

  return (
    <>
      <DashboardHeader
        title="Mock Tests"
        badge={entryTest.name}
        displayName={displayName}
        tests={tests}
        activeTestId={entryTest.id}
      />
      <main className="px-4 pb-24 pt-28 md:px-12 md:pb-20">
        <div className="mx-auto max-w-4xl">
          {/* Hero / start card */}
          {data?.blueprint ? (
            <section className="mb-12 border-2 border-black bg-black p-8 text-white shadow-hard-primary md:p-10">
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-fixed">
                Full Simulation
              </div>
              <h2 className="mb-4 font-headline text-4xl font-bold uppercase leading-none tracking-tighter md:text-5xl">
                {data.blueprint.name}
              </h2>
              <p className="mb-6 max-w-xl font-body text-base text-white/80">
                {data.blueprint.description}
              </p>
              <div className="mb-8 flex flex-wrap gap-6 font-headline">
                <div>
                  <div className="text-3xl font-bold">
                    {data.blueprint.totalQuestions}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-white/60">
                    Questions
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold tabular-nums">
                    {formatTime(data.blueprint.durationSeconds)}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-white/60">
                    Duration
                  </div>
                </div>
              </div>
              <StartMockButton blueprintId={data.blueprint.id} />
            </section>
          ) : (
            <section className="mb-12 border-2 border-black bg-white p-8 shadow-hard">
              <p className="font-body text-on-surface-variant">
                No mock test is available for this entry test yet.
              </p>
            </section>
          )}

          {/* Recent results */}
          <section>
            <h3 className="mb-4 font-headline text-2xl font-bold uppercase tracking-tight">
              Recent Results
            </h3>
            {data && data.recentResults.length > 0 ? (
              <div className="flex flex-col gap-3">
                {data.recentResults.map((r) => (
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
                            ? new Date(r.submittedAt).toLocaleDateString()
                            : "—"}
                        </div>
                      </div>
                    </div>
                    <Icon name="chevron_right" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border-2 border-black bg-white p-8 shadow-hard">
                <p className="font-body text-on-surface-variant">
                  No mock attempts yet. Start your first full mock above to see
                  your results here.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function MockSkeleton() {
  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-30 h-20 border-b-2 border-black bg-white md:left-64" />
      <main className="px-4 pb-24 pt-28 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 h-64 w-full animate-pulse border-2 border-black bg-surface-high" />
          <div className="h-40 w-full animate-pulse border-2 border-black bg-surface-container" />
        </div>
      </main>
    </>
  );
}
