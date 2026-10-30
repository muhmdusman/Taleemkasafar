import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getMockResult } from "@/lib/queries/mock";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { skeleton } from "@/components/dashboard/styles";
import { MockResult } from "@/components/quiz/mock-result";
import { cn } from "@/lib/utils";

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
      <DashboardHeaderFallback />
      <main className="px-4 pb-24 pt-28 md:px-12">
        <div className="mx-auto max-w-3xl">
          <div className={cn(skeleton, "mb-8 h-48 w-full")} />
          <div className={cn(skeleton, "h-60 w-full")} />
        </div>
      </main>
    </>
  );
}
