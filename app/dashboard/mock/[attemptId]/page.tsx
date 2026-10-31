import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getMockAttempt } from "@/lib/queries/mock";
import { MockRunner } from "@/components/quiz/mock-runner";
import { QuizLoadingScreen } from "@/components/quiz/ts-ring-loader";
import { routes } from "@/lib/routes";

/**
 * A mock sitting, full screen like practice: no dashboard sidebar, header or
 * bottom nav (the layout's nav hides itself here, see `isFocusRoute`), so
 * the student only sees the paper. Leaving goes through the runner's
 * "Pause or end?" dialog.
 */
export default function MockAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-surface-low">
      <Suspense fallback={<QuizLoadingScreen label="Loading your mock..." />}>
        <MockAttemptView params={params} />
      </Suspense>
    </div>
  );
}

async function MockAttemptView({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  // Signed out → null (the proxy guards /dashboard anyway).
  const data = await getMockAttempt(attemptId);
  if (!data) notFound();

  // Already submitted → go to the result; abandoned → back to mock tests.
  if (data.status === "submitted") redirect(routes.mockResult(attemptId));
  if (data.status !== "in_progress") redirect(routes.mocks);

  return <MockRunner data={data} />;
}
