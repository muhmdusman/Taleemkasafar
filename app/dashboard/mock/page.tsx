import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMockLanding } from "@/lib/queries/mock";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { getOpenMock } from "@/lib/queries/dashboard";
import { getProgress } from "@/lib/queries/progress";
import { routes } from "@/lib/routes";
import type { Tone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { Icon } from "@/components/dashboard/icon";
import { LinkPendingIndicator } from "@/components/dashboard/link-pending";
import { MockSection } from "@/components/dashboard/mock-section";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { MockCardSkeleton, RowsSkeleton } from "@/components/dashboard/skeletons";
import { card, cardInteractive } from "@/components/dashboard/styles";
import { areaTone, toneClasses } from "@/components/dashboard/tone";

/** What to expect, before the first paper (the timed mode is new to most). */
const TIPS: { icon: string; title: string; text: string; tone: Tone }[] = [
  { icon: "timer", title: "Timed like the real test", text: "The clock runs while you work. Pause from Exit if you need a break.", tone: "violet" },
  { icon: "flag", title: "Mark for review", text: "Unsure? Flag it and come back before you submit.", tone: "amber" },
  { icon: "grid_view", title: "Jump between sections", text: "Use the question map to move between subjects.", tone: "teal" },
  { icon: "insights", title: "Score by subject", text: "Your result shows where to practise next.", tone: "blue" },
];

/** Soft tone for a score: no judgement words, the number is always shown. */
function scoreTone(percent: number): Tone {
  return percent >= 70 ? "teal" : percent >= 50 ? "amber" : "rose";
}

export default function MockPage() {
  return (
    <Suspense fallback={<MockSkeleton />}>
      <MockLandingView />
    </Suspense>
  );
}

async function MockLandingView() {
  const [data, entryTest, tests, displayName, openMock, progress] = await Promise.all([
    getMockLanding(),
    getActiveEntryTest(),
    getEntryTestsCached(),
    getDisplayName(),
    // An unsubmitted mock replaces "Start" so a second paper can't orphan it.
    getOpenMock(),
    getProgress(),
  ]);

  if (!entryTest) redirect("/auth/login");

  return (
    <>
      <DashboardHeader
        title="Mock Tests"
        displayName={displayName}
        tests={tests}
        activeTestId={entryTest.id}
      />
      <main className="px-4 pb-24 pt-24 sm:px-6 md:px-12 md:pb-20 md:pt-28">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <section aria-label="Full mock test" className="flex flex-col gap-3">
            <MockSection
              blueprint={data?.blueprint ?? null}
              openMock={openMock}
              mocks={progress?.mocks ?? null}
              testName={entryTest.name}
              showResultsLink={false}
            />
            {data?.blueprint?.description && !openMock ? (
              <p className="px-1 text-sm leading-relaxed text-on-surface-variant">
                {data.blueprint.description}
              </p>
            ) : null}
          </section>

          {!progress?.mocks.taken ? (
            <section aria-labelledby="tips-heading">
              <SectionHeading id="tips-heading" icon="tips_and_updates" tone={areaTone.mocks}>
                Before your first mock
              </SectionHeading>
              <ul className="grid gap-3 sm:grid-cols-2">
                {TIPS.map((tip) => (
                  <li key={tip.title} className={cn(card, "flex items-start gap-3 p-4")}>
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", toneClasses[tip.tone].tile)}>
                      <Icon name={tip.icon} className="text-xl" />
                    </span>
                    <div>
                      <p className="font-headline font-semibold text-on-surface">{tip.title}</p>
                      <p className="mt-0.5 text-sm text-on-surface-variant">{tip.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="results-heading">
            <SectionHeading id="results-heading" icon="history" tone={areaTone.progress}>
              Recent results
            </SectionHeading>
            {data && data.recentResults.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {data.recentResults.map((r) => {
                  const tone = toneClasses[scoreTone(r.scorePercent)];
                  return (
                    <li key={r.attemptId}>
                      <Link
                        href={routes.mockResult(r.attemptId)}
                        className={cn(cardInteractive, "flex items-center justify-between gap-4 p-4 md:p-5", tone.hoverBorder)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("flex h-14 w-16 shrink-0 items-center justify-center rounded-xl font-headline text-xl font-bold tabular-nums", tone.tile)}>
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
                        <span className="text-on-surface-variant">
                          <LinkPendingIndicator>
                            <Icon name="chevron_right" />
                          </LinkPendingIndicator>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className={cn(card, "p-6")}>
                <p className="font-body text-on-surface-variant">
                  No results yet. Your scores appear here after you submit a mock.
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
      <main className="px-4 pb-24 pt-24 sm:px-6 md:px-12 md:pt-28">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <MockCardSkeleton />
          <RowsSkeleton rows={3} label="Loading results" />
        </div>
      </main>
    </>
  );
}
