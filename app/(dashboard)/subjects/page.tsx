import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/queries/dashboard";
import { DashboardHeader } from "@/components/dashboard/header";
import { SubjectsSection } from "@/components/dashboard/subjects-section";

export default function SubjectsPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <SubjectsView />
    </Suspense>
  );
}

async function SubjectsView() {
  const data = await getDashboardData();
  if (!data) redirect("/auth/login");

  return (
    <>
      <DashboardHeader
        title="My Subjects"
        badge={data.entryTest.name}
        displayName={data.displayName}
        tests={data.tests}
        activeTestId={data.entryTest.id}
      />
      <main className="px-6 pb-24 pt-28 md:px-8 md:pb-20">
        <div className="mx-auto max-w-7xl">
          <SubjectsSection subjects={data.subjects} />
        </div>
      </main>
    </>
  );
}

function Skeleton() {
  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-30 h-20 border-b-2 border-black bg-white md:left-64" />
      <main className="px-6 pb-24 pt-28 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse border-2 border-black bg-surface-container"
            />
          ))}
        </div>
      </main>
    </>
  );
}
