import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/queries/dashboard";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { SubjectsSection } from "@/components/dashboard/subjects-section";
import { skeleton } from "@/components/dashboard/styles";
import { cn } from "@/lib/utils";

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
      <DashboardHeaderFallback />
      <main className="px-6 pb-24 pt-28 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn(skeleton, "h-56")} />
          ))}
        </div>
      </main>
    </>
  );
}
