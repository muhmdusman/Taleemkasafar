import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getMockAttempt } from "@/lib/queries/mock";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { skeleton } from "@/components/dashboard/styles";
import { MockRunner } from "@/components/quiz/mock-runner";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export default function MockAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  return (
    <Suspense fallback={<MockRunSkeleton />}>
      <MockAttemptView params={params} />
    </Suspense>
  );
}

async function MockAttemptView({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  const [data, entryTest, tests, displayName] = await Promise.all([
    getMockAttempt(attemptId),
    getActiveEntryTest(),
    getEntryTestsCached(),
    getDisplayName(),
  ]);

  if (!entryTest) redirect("/auth/login");
  if (!data) notFound();

  // Already submitted → go to the result.
  if (data.status === "submitted") redirect(routes.mockResult(attemptId));

  return (
    <>
      <DashboardHeader
        title="Mock Test"
        badge="In Progress"
        displayName={displayName}
        tests={tests}
        activeTestId={entryTest.id}
      />
      <main className="px-4 pb-24 pt-28 md:px-12 md:pb-20">
        <div className="mx-auto max-w-6xl">
          <MockRunner data={data} />
        </div>
      </main>
    </>
  );
}

function MockRunSkeleton() {
  return (
    <>
      <DashboardHeaderFallback />
      <main className="px-4 pb-24 pt-28 md:px-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className={cn(skeleton, "h-96 w-full")} />
          <div className={cn(skeleton, "h-96 w-full")} />
        </div>
      </main>
    </>
  );
}
