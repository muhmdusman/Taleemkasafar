import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getPracticeScreen } from "@/lib/queries/practice";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { DashboardHeader } from "@/components/dashboard/header";
import { PracticeRunner } from "@/components/quiz/practice-runner";
import { Icon } from "@/components/dashboard/icon";

export default function PastPaperPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <PastPaperView params={params} />
    </Suspense>
  );
}

async function PastPaperView({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;

  const [data, entryTest, tests, displayName] = await Promise.all([
    getPracticeScreen(slug, chapter, "past_paper"),
    getActiveEntryTest(),
    getEntryTestsCached(),
    getDisplayName(),
  ]);

  if (!entryTest) redirect("/auth/login");
  if (!data) notFound();

  return (
    <>
      <DashboardHeader
        title={data.chapterTitle}
        badge="Past Paper"
        displayName={displayName}
        tests={tests}
        activeTestId={entryTest.id}
      />
      <main className="px-4 pb-24 pt-28 md:px-12 md:pb-20">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/subjects/${data.subjectSlug}`}
            className="mb-6 inline-flex items-center gap-1 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-brand"
          >
            <Icon name="arrow_back" className="text-base" />
            {data.subjectName}
          </Link>
          <h2 className="mb-8 font-headline text-3xl font-bold uppercase leading-none tracking-tighter text-black md:text-4xl">
            {data.chapterTitle}
          </h2>
          <PracticeRunner data={data} />
        </div>
      </main>
    </>
  );
}

function QuizSkeleton() {
  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-30 h-20 border-b-2 border-black bg-white md:left-64" />
      <main className="px-4 pb-24 pt-28 md:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 h-10 w-2/3 animate-pulse border-2 border-black bg-surface-high" />
          <div className="h-80 w-full animate-pulse border-2 border-black bg-surface-container" />
        </div>
      </main>
    </>
  );
}
