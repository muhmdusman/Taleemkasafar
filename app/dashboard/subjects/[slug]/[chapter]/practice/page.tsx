import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getPracticeScreen } from "@/lib/queries/practice";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { PracticeRunner } from "@/components/quiz/practice-runner";
import { QuizLoadingScreen } from "@/components/quiz/ts-ring-loader";

export default function PracticePage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  return (
    <Suspense fallback={<QuizLoadingScreen label="Loading practice..." />}>
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
