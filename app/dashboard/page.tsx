import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveEntryTest, type EntryTest } from "@/lib/queries/entry-test";
import { getEntryTestsCached, getSubjectsCached } from "@/lib/queries/catalog";
import { getDisplayName } from "@/lib/queries/profile";
import { getHasActivity, getJourney, getOpenMock } from "@/lib/queries/dashboard";
import { pickFocusSubject } from "@/lib/queries/dashboard-helpers";
import { getActiveBlueprint } from "@/lib/queries/mock";
import { getProgress } from "@/lib/queries/progress";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { DashboardHeader, DashboardHeaderFallback } from "@/components/dashboard/header";
import { HeroSection } from "@/components/dashboard/hero-section";
import { Icon } from "@/components/dashboard/icon";
import { LinkPendingIndicator } from "@/components/dashboard/link-pending";
import { MockSection } from "@/components/dashboard/mock-section";
import { NextStepCard } from "@/components/dashboard/next-step-card";
import { ProgressSection } from "@/components/dashboard/progress-section";
import { SectionHeading } from "@/components/dashboard/section-heading";
import {
  HeroSkeleton,
  MockCardSkeleton,
  ProgressSkeleton,
  SubjectCardsSkeleton,
} from "@/components/dashboard/skeletons";
import { SubjectsSection } from "@/components/dashboard/subjects-section";
import { focusRing, skeleton } from "@/components/dashboard/styles";
import { areaTone } from "@/components/dashboard/tone";

/**
 * Dashboard home, in the order a student needs it:
 *  1. greeting + ONE next step (resume / get started / keep going)
 *  2. progress for the active test + a suggested focus subject
 *  3. subjects (with coverage + accuracy per subject)
 *  4. mock tests (start / resume / score)
 * Each region streams in its own Suspense boundary with a content-shaped
 * skeleton; the per-user reads are memoized (`cache`) and started early in
 * the header region, so later regions don't wait on earlier ones.
 */
export default function HomePage() {
  return (
    <>
      <Suspense fallback={<DashboardHeaderFallback />}>
        <HeaderRegion />
      </Suspense>

      <main className="px-4 pb-24 pt-24 sm:px-6 md:px-8 md:pb-16 md:pt-28">
        <div className="mx-auto flex max-w-7xl flex-col gap-12">
          <Suspense fallback={<HeroSkeleton />}>
            <HeroRegion />
          </Suspense>

          <section aria-labelledby="progress-heading">
            <SectionHeading
              id="progress-heading"
              icon="insights"
              tone={areaTone.progress}
              action={<SeeAll href={routes.performance} label="Full progress" />}
            >
              Your progress
            </SectionHeading>
            <Suspense fallback={<ProgressSkeleton />}>
              <ProgressRegion />
            </Suspense>
          </section>

          <section aria-labelledby="subjects-heading">
            <SectionHeading
              id="subjects-heading"
              icon="menu_book"
              tone={areaTone.subjects}
              action={<SeeAll href={routes.subjects} label="All subjects" />}
            >
              Subjects
            </SectionHeading>
            <Suspense fallback={<SubjectCardsSkeleton />}>
              <SubjectsRegion />
            </Suspense>
          </section>

          <section aria-labelledby="mocks-heading">
            <SectionHeading
              id="mocks-heading"
              icon="quiz"
              tone={areaTone.mocks}
              action={<SeeAll href={routes.mocks} label="Mock tests" />}
            >
              Mock tests
            </SectionHeading>
            <Suspense fallback={<MockCardSkeleton />}>
              <MockRegion />
            </Suspense>
          </section>
        </div>
      </main>
    </>
  );
}

function SeeAll({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded font-headline text-sm font-semibold text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline",
        focusRing,
      )}
    >
      {label}
      <LinkPendingIndicator>
        <Icon name="chevron_right" className="text-lg" />
      </LinkPendingIndicator>
    </Link>
  );
}

/* ---- Header (personalized: selector + name) ---- */
async function HeaderRegion() {
  // Start the per-user reads now; `cache` hands the same promises to the
  // regions below, so they don't queue behind each other.
  void getJourney();
  void getProgress();
  void getOpenMock();
  const [entryTest, tests, displayName] = await Promise.all([
    getActiveEntryTest(),
    getEntryTestsCached(),
    getDisplayName(),
  ]);
  if (!entryTest) redirect("/auth/login");
  return (
    <DashboardHeader
      title="Home"
      displayName={displayName}
      tests={tests}
      activeTestId={entryTest.id}
    />
  );
}

/* ---- Hero (personalized: name + activity + next step) ---- */
async function HeroRegion() {
  const [entryTest, tests, displayName, hasActivity] = await Promise.all([
    getActiveEntryTest(),
    getEntryTestsCached(),
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
        <Suspense fallback={<div aria-hidden="true" className={cn(skeleton, "h-72 w-full")} />}>
          <NextStepRegion test={entryTest} tests={tests} />
        </Suspense>
      }
    />
  );
}

/* ---- Next step (resume / checklist; per-user) ---- */
async function NextStepRegion({ test, tests }: { test: EntryTest; tests: EntryTest[] }) {
  const journey = await getJourney();
  return <NextStepCard journey={journey} test={test} tests={tests} />;
}

/* ---- Progress + suggested focus (per-user, active test) ---- */
async function ProgressRegion() {
  const [progress, entryTest] = await Promise.all([getProgress(), getActiveEntryTest()]);
  if (!progress || !entryTest) return null;
  const subjects = await getSubjectsCached(entryTest.slug);
  const focus = pickFocusSubject(
    subjects.flatMap((s) =>
      s.subject_id && s.subject_slug
        ? [{ id: s.subject_id, slug: s.subject_slug, name: s.subject_name ?? s.subject_slug }]
        : [],
    ),
    progress.mocks.latest?.perSubject ?? null,
    progress.bySubject,
  );
  return <ProgressSection progress={progress} focus={focus} />;
}

/* ---- Subjects (cached catalog + per-subject progress) ---- */
async function SubjectsRegion() {
  const entryTest = await getActiveEntryTest();
  if (!entryTest) redirect("/auth/login");
  const [subjects, progress] = await Promise.all([
    getSubjectsCached(entryTest.slug),
    getProgress(),
  ]);
  return (
    <SubjectsSection
      subjects={subjects}
      progress={progress?.hasSubjectBreakdown ? progress.bySubject : null}
      heading={false}
    />
  );
}

/* ---- Mock tests (blueprint + open mock + scores) ---- */
async function MockRegion() {
  const [entryTest, blueprint, openMock, progress] = await Promise.all([
    getActiveEntryTest(),
    getActiveBlueprint(),
    getOpenMock(),
    getProgress(),
  ]);
  if (!entryTest) return null;
  return (
    <MockSection
      blueprint={blueprint}
      openMock={openMock}
      mocks={progress?.mocks ?? null}
      testName={entryTest.name}
    />
  );
}
