import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSubjectPage } from "@/lib/queries/subject";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { ChapterList } from "@/components/dashboard/chapter-list";
import { Icon } from "@/components/dashboard/icon";
import { card, focusRing, skeleton } from "@/components/dashboard/styles";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

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

  const [data, entryTest, tests, displayName] = await Promise.all([
    getSubjectPage(slug),
    getActiveEntryTest(),
    getEntryTestsCached(),
    getDisplayName(),
  ]);

  if (!entryTest) redirect("/auth/login");
  if (!data) notFound();

  return (
    <>
      <DashboardHeader
        title={data.subjectName}
        badge={data.entryTestName}
        displayName={displayName}
        tests={tests}
        activeTestId={entryTest.id}
      />
      <main className="px-4 pb-24 pt-28 md:px-12 md:pb-20">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <Link
            href={routes.subjects}
            className={cn(
              "mb-6 inline-flex items-center gap-1 rounded-lg font-headline text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface",
              focusRing,
            )}
          >
            <Icon name="arrow_back" className="text-lg" />
            All Subjects
          </Link>

          {/* Header section */}
          <section className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="mb-3 font-headline text-4xl font-bold leading-tight tracking-tight text-on-surface md:text-5xl">
                {data.subjectName}
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant">
                Explore {data.chapters.length} chapters. Attempt past papers,
                practice MCQs, and master each topic.
              </p>
            </div>
            <div className={cn(card, "flex min-w-[240px] items-center gap-4 p-5")}>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-fixed text-brand-container">
                <Icon name="quiz" className="text-2xl" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                  Question Bank
                </div>
                <div className="font-headline text-3xl font-bold tabular-nums tracking-tight text-on-surface">
                  {data.totalQuestions}
                </div>
                <div className="text-xs text-on-surface-variant">Approved MCQs</div>
              </div>
            </div>
          </section>

          <ChapterList subjectSlug={data.subjectSlug} chapters={data.chapters} />
        </div>
      </main>
    </>
  );
}

function SubjectSkeleton() {
  return (
    <>
      <DashboardHeaderFallback />
      <main className="px-4 pb-24 pt-28 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className={cn(skeleton, "mb-10 h-32 w-full")} />
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={cn(skeleton, "h-20")} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
