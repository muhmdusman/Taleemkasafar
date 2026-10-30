import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached, getSubjectsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { getHasActivity, getJourney } from "@/lib/queries/dashboard";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { HeroSection } from "@/components/dashboard/hero-section";
import { NextStepCard } from "@/components/dashboard/next-step-card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { SubjectsSection } from "@/components/dashboard/subjects-section";
import { skeleton } from "@/components/dashboard/styles";
import { cn } from "@/lib/utils";

/**
 * Dashboard home: greeting + ONE next step (resume / get started / keep
 * going), then the subjects. Each region streams in its OWN Suspense boundary:
 * the cached subjects appear almost instantly (served from the catalog cache,
 * not refetched on every navigation), the greeting next, and the next-step
 * card (a few small per-user reads) last, without holding up the rest.
 */
export default function HomePage() {
  return (
    <>
      <Suspense fallback={<DashboardHeaderFallback />}>
        <HeaderRegion />
      </Suspense>

      <main className="px-6 pb-24 pt-28 md:px-8 md:pb-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-14">
          <Suspense fallback={<HeroFallback />}>
            <HeroRegion />
          </Suspense>

          <section>
            <SectionHeading>Subjects</SectionHeading>
            <Suspense fallback={<SubjectsFallback />}>
              <SubjectsRegion />
            </Suspense>
          </section>
        </div>
      </main>
    </>
  );
}

/* ---- Header (personalized: selector + name) ---- */
async function HeaderRegion() {
  const [entryTest, tests, displayName] = await Promise.all([
    getActiveEntryTest(),
    getEntryTestsCached(),
    getDisplayName(),
  ]);
  if (!entryTest) redirect("/auth/login");
  return (
    <DashboardHeader
      title="Dashboard"
      displayName={displayName}
      tests={tests}
      activeTestId={entryTest.id}
    />
  );
}

/* ---- Hero (personalized: name + activity) ---- */
async function HeroRegion() {
  // Start the next-step reads now; `cache` hands the same promise to
  // NextStepRegion, so the card doesn't wait for this region first.
  void getJourney();
  const [entryTest, displayName, hasActivity] = await Promise.all([
    getActiveEntryTest(),
    getDisplayName(),
    getHasActivity(),
  ]);
  if (!entryTest) redirect("/auth/login");
  return (
    <HeroSection
      displayName={displayName}
      testName={entryTest.name}
      hasActivity={hasActivity}
      aside={
        <Suspense fallback={<div className={cn(skeleton, "h-64 w-full")} />}>
          <NextStepRegion testName={entryTest.name} />
        </Suspense>
      }
    />
  );
}

/* ---- Next step (resume / checklist; per-user) ---- */
async function NextStepRegion({ testName }: { testName: string }) {
  const journey = await getJourney();
  return <NextStepCard journey={journey} testName={testName} />;
}

/* ---- Subjects (cached catalog — fast across navigations) ---- */
async function SubjectsRegion() {
  const entryTest = await getActiveEntryTest();
  if (!entryTest) redirect("/auth/login");
  const subjects = await getSubjectsCached(entryTest.slug);
  return <SubjectsSection subjects={subjects} heading={false} />;
}

/* ---- Static fallbacks ---- */
function HeroFallback() {
  return <div className={cn(skeleton, "h-64 w-full")} />;
}

function SubjectsFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className={cn(skeleton, "h-56")} />
      ))}
    </div>
  );
}
