import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPerformance } from "@/lib/queries/performance";
import { getProgress } from "@/lib/queries/progress";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached, getSubjectsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { routes } from "@/lib/routes";
import { subjectTone, type Tone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { Icon } from "@/components/dashboard/icon";
import { LinkPendingIndicator } from "@/components/dashboard/link-pending";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { ProgressSkeleton, RowsSkeleton } from "@/components/dashboard/skeletons";
import { appButton, card, cardInteractive } from "@/components/dashboard/styles";
import { areaTone, toneClasses } from "@/components/dashboard/tone";

function scoreTone(percent: number): Tone {
  return percent >= 70 ? "teal" : percent >= 50 ? "amber" : "rose";
}

export default function PerformancePage() {
  return (
    <Suspense fallback={<PerfSkeleton />}>
      <PerformanceView />
    </Suspense>
  );
}

async function PerformanceView() {
  const [data, progress, entryTest, tests, displayName] = await Promise.all([
    getPerformance(),
    getProgress(),
    getActiveEntryTest(),
    getEntryTestsCached(),
    getDisplayName(),
  ]);

  if (!entryTest) redirect("/auth/login");
  const subjects = await getSubjectsCached(entryTest.slug);

  const hasActivity =
    !!data && (data.mockResults.length > 0 || data.practice.answered > 0);

  return (
    <>
      <DashboardHeader
        title="Progress"
        displayName={displayName}
        tests={tests}
        activeTestId={entryTest.id}
      />
      <main className="px-4 pb-24 pt-24 sm:px-6 md:px-12 md:pb-20 md:pt-28">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          {!hasActivity || !data ? (
            <div className={cn(card, "p-10 text-center")}>
              <span className={cn("mx-auto flex size-14 items-center justify-center rounded-2xl", toneClasses[areaTone.progress].tile)}>
                <Icon name="insights" className="text-3xl" />
              </span>
              <h2 className="mt-4 font-headline text-2xl font-bold tracking-tight text-on-surface">
                No activity yet for {entryTest.name}
              </h2>
              <p className="mx-auto mt-2 max-w-md font-body text-on-surface-variant">
                Practise a chapter or take a mock test, and your accuracy,
                scores and weak areas will show up here.
              </p>
              {/* Practice first: it's the gentler start (same order as the home checklist). */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href={routes.subjects} className={appButton()}>
                  Practise a chapter
                </Link>
                <Link href={routes.mocks} className={appButton({ variant: "secondary" })}>
                  Take a mock
                </Link>
              </div>
            </div>
          ) : (
            <>
              <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                  tone="violet"
                  icon="emoji_events"
                  label="Best mock"
                  value={data.bestScore !== null ? `${Math.round(data.bestScore)}%` : "—"}
                />
                <SummaryCard
                  tone="amber"
                  icon="equalizer"
                  label="Average mock"
                  value={data.averageScore !== null ? `${Math.round(data.averageScore)}%` : "—"}
                />
                <SummaryCard
                  tone="teal"
                  icon="target"
                  label="Practice accuracy"
                  value={data.practice.answered > 0 ? `${data.practice.accuracyPercent}%` : "—"}
                  sub={
                    data.practice.answered > 0
                      ? `${data.practice.correct.toLocaleString()} of ${data.practice.answered.toLocaleString()} correct`
                      : undefined
                  }
                />
              </section>

              {progress?.hasSubjectBreakdown && subjects.length > 0 ? (
                <section aria-labelledby="by-subject-heading">
                  <SectionHeading id="by-subject-heading" icon="menu_book" tone={areaTone.subjects}>
                    Practice by subject
                  </SectionHeading>
                  <ul className={cn(card, "flex flex-col divide-y divide-outline-variant")}>
                    {subjects.map((s) => {
                      const p = s.subject_id ? progress.bySubject[s.subject_id] : undefined;
                      const tone = toneClasses[subjectTone(s.subject_slug)];
                      const total = s.question_count ?? 0;
                      const covered = p && total > 0 ? Math.min(100, Math.round((p.questionsSeen / total) * 100)) : 0;
                      return (
                        <li key={s.subject_id ?? s.subject_slug} className="p-4 sm:p-5">
                          <Link
                            href={routes.subject(s.subject_slug ?? "")}
                            className="group flex flex-col gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container focus-visible:ring-offset-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex items-center gap-3 font-headline font-semibold text-on-surface">
                                <span className={cn("size-2.5 rounded-full", tone.bar)} aria-hidden="true" />
                                {s.subject_name}
                              </span>
                              <span className="text-sm text-on-surface-variant">
                                {p ? (
                                  <>
                                    <span className={cn("font-semibold tabular-nums", tone.text)}>
                                      {p.accuracyPercent}%
                                    </span>{" "}
                                    correct · {covered}% covered
                                  </>
                                ) : (
                                  "Not started"
                                )}
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-surface-high" aria-hidden="true">
                              <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${covered}%` }} />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              <section aria-labelledby="history-heading">
                <SectionHeading id="history-heading" icon="history" tone={areaTone.mocks}>
                  Mock history
                </SectionHeading>
                {data.mockResults.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {data.mockResults.map((r) => {
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
                                  {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—"}
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
                      No mock attempts yet. Your practice is tracked above.
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
  tone,
  icon,
  label,
  value,
  sub,
}: {
  tone: Tone;
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className={cn(card, "p-5")}>
      <span className={cn("flex size-9 items-center justify-center rounded-xl", toneClasses[tone].tile)}>
        <Icon name={icon} className="text-xl" />
      </span>
      <div className="mt-3 font-headline text-4xl font-bold tabular-nums tracking-tight text-on-surface">
        {value}
      </div>
      <div className="mt-0.5 font-headline text-sm font-semibold text-on-surface">{label}</div>
      {sub && <div className="mt-1 text-xs text-on-surface-variant">{sub}</div>}
    </div>
  );
}

function PerfSkeleton() {
  return (
    <>
      <DashboardHeaderFallback />
      <main className="px-4 pb-24 pt-24 sm:px-6 md:px-12 md:pt-28">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <ProgressSkeleton />
          <RowsSkeleton rows={3} label="Loading mock history" />
        </div>
      </main>
    </>
  );
}
