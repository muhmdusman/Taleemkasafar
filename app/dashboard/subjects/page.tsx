import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/queries/dashboard";
import { getProgress } from "@/lib/queries/progress";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { SubjectCardsSkeleton } from "@/components/dashboard/skeletons";
import { SubjectsSection } from "@/components/dashboard/subjects-section";

export default function SubjectsPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <SubjectsView />
    </Suspense>
  );
}

async function SubjectsView() {
  const [data, progress] = await Promise.all([getDashboardData(), getProgress()]);
  if (!data) redirect("/auth/login");

  return (
    <>
      <DashboardHeader
        title="My Subjects"
        displayName={data.displayName}
        tests={data.tests}
        activeTestId={data.entryTest.id}
      />
      <main className="px-4 pb-24 pt-24 sm:px-6 md:px-8 md:pb-20 md:pt-28">
        <div className="mx-auto max-w-7xl">
          <p className="mb-6 max-w-2xl text-on-surface-variant">
            Pick a subject, then a chapter. Every chapter has practice MCQs
            and past-paper questions with explanations.
          </p>
          <SubjectsSection
            subjects={data.subjects}
            progress={progress?.hasSubjectBreakdown ? progress.bySubject : null}
          />
        </div>
      </main>
    </>
  );
}

function Skeleton() {
  return (
    <>
      <DashboardHeaderFallback />
      <main className="px-4 pb-24 pt-24 sm:px-6 md:px-8 md:pt-28">
        <div className="mx-auto max-w-7xl pt-16">
          <SubjectCardsSkeleton count={6} />
        </div>
      </main>
    </>
  );
}
