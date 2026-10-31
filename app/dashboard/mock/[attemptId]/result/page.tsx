import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getMockResult } from "@/lib/queries/mock";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { BlockSkeleton, RowsSkeleton } from "@/components/dashboard/skeletons";
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
        displayName={displayName}
        tests={tests}
        activeTestId={entryTest.id}
      />
      <main className="px-4 pb-24 pt-24 sm:px-6 md:px-12 md:pb-20 md:pt-28">
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
      <DashboardHeaderFallback />
      <main className="px-4 pb-24 pt-24 sm:px-6 md:px-12 md:pt-28">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <BlockSkeleton className="h-56" label="Loading your result" />
          <RowsSkeleton rows={3} label="Loading subject breakdown" />
        </div>
      </main>
    </>
  );
}
