import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getPracticeScreen } from "@/lib/queries/practice";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { PracticeRunner } from "@/components/quiz/practice-runner";
import { QuizLoadingScreen } from "@/components/quiz/ts-ring-loader";

export default function PastPaperPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  return (
    <Suspense fallback={<QuizLoadingScreen label="Loading past paper..." />}>
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

  const [data, entryTest] = await Promise.all([
    getPracticeScreen(slug, chapter, "past_paper"),
    getActiveEntryTest(),
  ]);

  if (!entryTest) redirect("/auth/login");
  if (!data) notFound();

  return <PracticeRunner data={data} />;
}
