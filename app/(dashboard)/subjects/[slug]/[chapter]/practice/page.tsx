import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getPracticeScreen } from "@/lib/queries/practice";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { PracticeRunner } from "@/components/quiz/practice-runner";

export default function PracticePage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <PracticeView params={params} />
    </Suspense>
  );
}

async function PracticeView({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;

  const [data, entryTest] = await Promise.all([
    getPracticeScreen(slug, chapter, "practice"),
    getActiveEntryTest(),
  ]);

  if (!entryTest) redirect("/auth/login");
  if (!data) notFound();

  return <PracticeRunner data={data} />;
}

function QuizSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="h-14 shrink-0 border-b-2 border-black bg-white" />
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 p-4 md:grid-cols-2 md:p-8">
        <div className="animate-pulse border-2 border-black bg-surface-high" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse border-2 border-black bg-surface-container"
            />
          ))}
        </div>
      </div>
      <div className="h-16 shrink-0 border-t-2 border-black bg-white" />
    </div>
  );
}
