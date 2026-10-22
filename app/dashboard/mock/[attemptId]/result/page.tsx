import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getMockResult } from "@/lib/queries/mock";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { DashboardHeader } from "@/components/dashboard/header";
import { MockResult } from "@/components/quiz/mock-result";

export default function MockResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  return (
    <Suspense fallback={<ResultSkeleton />}>
      <MockResultView params={params} />
    </Suspense>
  );
}

async function MockResultView({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  const [result, entryTest, tests, displayName] = await Promise.all([
    getMockResult(attemptId),
    getActiveEntryTest(),
    getEntryTestsCached(),
    getDisplayName(),
  ]);

  if (!entryTest) redirect("/auth/login");
  if (!result) notFound();

  return (
    <>
      <DashboardHeader
        title="Mock Result"
        badge={entryTest.name}
        displayName={displayName}
        tests={tests}
        activeTestId={entryTest.id}
      />
      <main className="px-4 pb-24 pt-28 md:px-12 md:pb-20">
        <div className="mx-auto max-w-3xl">
          <MockResult result={result} />
        </div>
      </main>
    </>
  );
}

function ResultSkeleton() {
  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-30 h-20 border-b-2 border-black bg-white md:left-64" />
      <main className="px-4 pb-24 pt-28 md:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 h-48 w-full animate-pulse border-2 border-black bg-surface-high" />
          <div className="h-60 w-full animate-pulse border-2 border-black bg-surface-container" />
        </div>
      </main>
    </>
  );
}
