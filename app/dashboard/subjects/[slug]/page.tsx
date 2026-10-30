import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSubjectPage } from "@/lib/queries/subject";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { getProgress } from "@/lib/queries/progress";
import { routes } from "@/lib/routes";
import { subjectTone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";
import { ChapterList } from "@/components/dashboard/chapter-list";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { Icon } from "@/components/dashboard/icon";
import { LinkPendingIndicator } from "@/components/dashboard/link-pending";
import { BlockSkeleton, RowsSkeleton } from "@/components/dashboard/skeletons";
import { focusRing } from "@/components/dashboard/styles";
import { subjectMeta } from "@/components/dashboard/subjects-section";
import { toneClasses } from "@/components/dashboard/tone";

export default function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<SubjectSkeleton />}>
      <SubjectView params={params} />
    </Suspense>
  );
}

async function SubjectView({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [data, entryTest, tests, displayName, progress] = await Promise.all([
    getSubjectPage(slug),
    getActiveEntryTest(),
    getEntryTestsCached(),
    getDisplayName(),
    getProgress(),
  ]);

  if (!entryTest) redirect("/auth/login");
  if (!data) notFound();

  const toneName = subjectTone(data.subjectSlug);
  const tone = toneClasses[toneName];
  const meta = subjectMeta(data.subjectSlug);
  const mine =
    progress?.hasSubjectBreakdown && data.subjectId
      ? (progress.bySubject[data.subjectId] ?? null)
      : undefined;
  const covered =
    mine && data.totalQuestions > 0
      ? Math.min(100, Math.round((mine.questionsSeen / data.totalQuestions) * 100))
      : 0;

  return (
    <>
      <DashboardHeader
        title={data.subjectName}
        displayName={displayName}
        tests={tests}
        activeTestId={entryTest.id}
      />
      <main className="px-4 pb-24 pt-24 sm:px-6 md:px-12 md:pb-20 md:pt-28">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <Link
            href={routes.subjects}
            className={cn(
              "mb-5 inline-flex items-center gap-1 rounded-lg font-headline text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface",
              focusRing,
            )}
          >
            <LinkPendingIndicator>
              <Icon name="arrow_back" className="text-lg" />
            </LinkPendingIndicator>
            All Subjects
          </Link>

          {/* Subject intro on a soft panel in the subject's tone. */}
          <section
            className={cn(
              "relative mb-8 overflow-hidden rounded-3xl border p-6 sm:p-8",
              tone.panel,
            )}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-20 size-60 rounded-full bg-surface-lowest/40"
            />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface-lowest shadow-soft">
                  <Icon name={meta.icon} className={cn("text-3xl", tone.text)} />
                </span>
                <div>
                  <h2 className="font-headline text-3xl font-bold leading-tight tracking-tight text-on-surface md:text-4xl">
                    {data.subjectName}
                  </h2>
                  <p className="mt-1 max-w-xl leading-relaxed text-on-surface-variant">
                    {data.chapters.length} chapters · {data.totalQuestions} MCQs.
                    Open a chapter, then choose practice or past paper.
                  </p>
                </div>
              </div>

              {mine !== undefined ? (
                <div className="w-full rounded-2xl bg-surface-lowest p-4 shadow-soft md:w-72">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-on-surface">
                      {mine ? `${covered}% covered` : "Not started yet"}
                    </span>
                    {mine ? (
                      <span className={cn("font-semibold tabular-nums", tone.text)}>
                        {mine.accuracyPercent}% correct
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-high" aria-hidden="true">
                    <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${covered}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-on-surface-variant">
                    {mine
                      ? `${mine.questionsSeen} of ${data.totalQuestions} questions practised`
                      : "Start with the first chapter below."}
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <ChapterList subjectSlug={data.subjectSlug} chapters={data.chapters} tone={toneName} />
        </div>
      </main>
    </>
  );
}

function SubjectSkeleton() {
  return (
    <>
      <DashboardHeaderFallback />
      <main className="px-4 pb-24 pt-24 sm:px-6 md:px-12 md:pt-28">
        <div className="mx-auto max-w-5xl">
          <BlockSkeleton className="mb-8 mt-10 h-40 rounded-3xl" />
          <RowsSkeleton rows={5} label="Loading chapters" />
        </div>
      </main>
    </>
  );
}
