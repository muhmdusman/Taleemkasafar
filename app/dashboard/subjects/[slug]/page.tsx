import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSubjectPage } from "@/lib/queries/subject";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { DashboardHeader } from "@/components/dashboard/header";
import { ChapterList } from "@/components/dashboard/chapter-list";
import { Icon } from "@/components/dashboard/icon";

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
            href="/subjects"
            className="mb-6 inline-flex items-center gap-1 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-brand"
          >
            <Icon name="arrow_back" className="text-base" />
            All Subjects
          </Link>

          {/* Header section */}
          <section className="mb-12 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h2 className="mb-4 font-headline text-5xl font-bold uppercase leading-none tracking-tighter text-black">
                {data.subjectName}
              </h2>
              <p className="max-w-xl text-lg font-medium text-on-surface-variant">
                Explore {data.chapters.length} chapters. Attempt past papers,
                practice MCQs, and master each topic.
              </p>
            </div>
            <div className="min-w-[240px] border-2 border-black bg-black p-6 text-white shadow-hard-primary">
              <div className="mb-1 text-sm font-bold uppercase tracking-widest opacity-70">
                Question Bank
              </div>
              <div className="font-headline text-4xl font-bold">
                {data.totalQuestions}
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest opacity-70">
                Approved MCQs
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
      <div className="fixed left-0 right-0 top-0 z-30 h-20 border-b-2 border-black bg-white md:left-64" />
      <main className="px-4 pb-24 pt-28 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 h-32 w-full animate-pulse border-2 border-black bg-surface-high" />
          <div className="flex flex-col gap-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse border-2 border-black bg-surface-container"
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
