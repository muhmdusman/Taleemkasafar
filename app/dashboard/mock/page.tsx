import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMockLanding } from "@/lib/queries/mock";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { Icon } from "@/components/dashboard/icon";
import { card, cardInteractive, skeleton } from "@/components/dashboard/styles";
import { StartMockButton } from "@/components/quiz/start-mock-button";
import { formatTime } from "@/lib/quiz/time";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
            <section className={cn(card, "mb-12 p-6 md:p-10")}>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-fixed px-3 py-1 font-headline text-xs font-semibold uppercase tracking-widest text-brand-container">
                <Icon name="timer" className="text-base" />
                Full Simulation
              </p>
              <h2 className="mt-4 font-headline text-3xl font-bold leading-tight tracking-tight text-on-surface md:text-4xl">
                {data.blueprint.name}
              </h2>
              <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-on-surface-variant">
                {data.blueprint.description}
              </p>
              <dl className="mt-6 grid max-w-sm grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-low px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                    Questions
                  </dt>
                  <dd className="mt-1 font-headline text-2xl font-bold tabular-nums text-on-surface">
                    {data.blueprint.totalQuestions}
                  </dd>
                </div>
                <div className="rounded-xl bg-surface-low px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                    Duration
                  </dt>
                  <dd className="mt-1 font-headline text-2xl font-bold tabular-nums text-on-surface">
                    {formatTime(data.blueprint.durationSeconds)}
                  </dd>
                </div>
              </dl>
              <div className="mt-8">
                <StartMockButton blueprintId={data.blueprint.id} />
              </div>
            </section>
          ) : (
            <section className={cn(card, "mb-12 p-8")}>
              <p className="font-body text-on-surface-variant">
                No mock test is available for this entry test yet.
              </p>
            </section>
          )}

          {/* Recent results */}
          <section>
            <h3 className="mb-4 font-headline text-xl font-bold tracking-tight text-on-surface md:text-2xl">
              Recent Results
            </h3>
            {data && data.recentResults.length > 0 ? (
              <div className="flex flex-col gap-3">
                {data.recentResults.map((r) => (
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
                            ? new Date(r.submittedAt).toLocaleDateString()
                            : "—"}
                        </div>
                      </div>
                    </div>
                    <Icon name="chevron_right" className="text-on-surface-variant" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className={cn(card, "p-8")}>
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
      <DashboardHeaderFallback />
      <main className="px-4 pb-24 pt-28 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className={cn(skeleton, "mb-12 h-64 w-full")} />
          <div className={cn(skeleton, "h-40 w-full")} />
        </div>
      </main>
    </>
  );
}
