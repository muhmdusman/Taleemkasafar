import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached, getSubjectsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { getHasActivity } from "@/lib/queries/dashboard";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { HeroSection } from "@/components/dashboard/hero-section";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { SubjectsSection } from "@/components/dashboard/subjects-section";
import { ChallengeSection } from "@/components/dashboard/challenge-section";
import { skeleton } from "@/components/dashboard/styles";
import { cn } from "@/lib/utils";

/**
 * Dashboard home. Each region streams in its OWN Suspense boundary so the page
 * shell + the fully-static Challenge section paint immediately, the cached
 * subjects appear almost instantly (served from the catalog cache, not
 * refetched on every navigation), and only the personalized header/hero fill in
 * last. This avoids the old single full-page skeleton that gated everything
 * behind the slowest per-user query.
 */
export default function HomePage() {
  return (
    <>
      <Suspense fallback={<DashboardHeaderFallback />}>
        <HeaderRegion />
      </Suspense>

      <main className="px-6 pb-24 pt-28 md:px-8 md:pb-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-16">
          <Suspense fallback={<HeroFallback />}>
            <HeroRegion />
          </Suspense>

          <section>
            <SectionHeading>Subjects</SectionHeading>
            <Suspense fallback={<SubjectsFallback />}>
              <SubjectsRegion />
            </Suspense>
          </section>

          {/* Fully static — no data, renders immediately. */}
          <ChallengeSection />
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
      badge="Active Session"
      displayName={displayName}
      tests={tests}
      activeTestId={entryTest.id}
    />
  );
}

/* ---- Hero (personalized: name + activity) ---- */
async function HeroRegion() {
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
    />
  );
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
  return <div className={cn(skeleton, "h-40 w-full")} />;
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
