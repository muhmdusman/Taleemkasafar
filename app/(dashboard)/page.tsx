import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/queries/dashboard";
import { DashboardHeader } from "@/components/dashboard/header";
import { HeroSection } from "@/components/dashboard/hero-section";
import { SubjectsSection } from "@/components/dashboard/subjects-section";
import { ChallengeSection } from "@/components/dashboard/challenge-section";

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <DashboardHome />
    </Suspense>
  );
}

async function DashboardHome() {
  const data = await getDashboardData();
  if (!data) redirect("/auth/login");

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        badge="Active Session"
        displayName={data.displayName}
        tests={data.tests}
        activeTestId={data.entryTest.id}
      />
      <main className="px-6 pb-24 pt-28 md:px-8 md:pb-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-16">
          <HeroSection
            displayName={data.displayName}
            testName={data.entryTest.name}
            hasActivity={data.hasActivity}
          />
          <SubjectsSection subjects={data.subjects} />
          <ChallengeSection />
        </div>
      </main>
    </>
  );
}

function HomeSkeleton() {
  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-30 h-20 border-b-2 border-black bg-white md:left-64" />
      <main className="px-6 pb-24 pt-28 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <div className="h-40 w-full animate-pulse border-2 border-black bg-surface-high" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-56 animate-pulse border-2 border-black bg-surface-container"
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
