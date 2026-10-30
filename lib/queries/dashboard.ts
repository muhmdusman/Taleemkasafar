import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/lib/routes";
import {
  openPracticeFrom,
  pickLiveMock,
  resolveDisplayName,
  type OpenPractice,
} from "./dashboard-helpers";
import { getActiveEntryTest, type EntryTest } from "./entry-test";
import {
  getEntryTestsCached,
  getSubjectsCached,
  type SubjectOverview,
} from "./catalog";

export type { SubjectOverview };

export type DashboardData = {
  displayName: string;
  email: string | null;
  entryTest: EntryTest;
  tests: EntryTest[];
  subjects: SubjectOverview[];
  /** True once the user has any recorded attempts (drives empty states). */
  hasActivity: boolean;
};

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/** Cookie client + signed-in user + active test, or null if either is missing. */
async function currentUserAndTest(): Promise<{
  supabase: ServerClient;
  userId: string;
  entryTestId: string;
} | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return null;
  const entryTest = await getActiveEntryTest();
  if (!entryTest) return null;
  return { supabase, userId, entryTestId: entryTest.id };
}

/**
 * Whether the signed-in user has any recorded attempts for the ACTIVE entry
 * test (same scope as `getJourney`, so the greeting and the next-step card
 * agree after a test switch). Request-memoized so it can stream in its own
 * Suspense boundary without duplicate queries.
 */
export const getHasActivity = cache(async (): Promise<boolean> => {
  const ctx = await currentUserAndTest();
  if (!ctx) return false;
  const { count } = await ctx.supabase
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .eq("entry_test_id", ctx.entryTestId);
  return (count ?? 0) > 0;
});

/**
 * Server-only loader for the dashboard home.
 * - User-specific data (profile, selected test, attempts) → dynamic cookie client.
 * - Catalog data (tests list, subjects + counts) → cached anon client.
 */
export async function getDashboardData(): Promise<DashboardData | null> {
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  const email = (claims?.claims?.email as string | undefined) ?? null;
  if (!userId) return null;

  const [{ data: profile }, entryTest, tests] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle(),
    getActiveEntryTest(),
    getEntryTestsCached(),
  ]);

  if (!entryTest) return null;

  const [subjects, { count: attemptCount }] = await Promise.all([
    getSubjectsCached(entryTest.slug),
    supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  return {
    displayName: resolveDisplayName(profile?.display_name, email),
    email,
    entryTest,
    tests,
    subjects,
    hasActivity: (attemptCount ?? 0) > 0,
  };
}

/** A mock still running for the active test. */
export type MockResume = {
  kind: "mock";
  href: string;
  title: string;
  answered: number;
  total: number;
};

/** The practice / past-paper chapter the user last answered in, unfinished. */
export type PracticeResume = {
  kind: "practice";
  href: string;
  usage: "practice" | "past_paper";
  subjectName: string;
  chapterTitle: string;
  answered: number;
};

/** Where the "pick up where you left off" card sends the user. */
export type ResumePoint = MockResume | PracticeResume;

/** What the dashboard home suggests next, for the active entry test. */
export type Journey = {
  resume: ResumePoint | null;
  /** Has answered at least one practice / past-paper question. */
  hasPracticed: boolean;
  /** Has submitted at least one mock. */
  hasTakenMock: boolean;
};

/**
 * The newest in-progress mock whose timer hasn't run out, for the active test.
 * Used by the home card and by the mock page ("Resume mock" instead of
 * starting a second paper). Null when none, or if a read fails.
 */
export const getOpenMock = cache(async (): Promise<MockResume | null> => {
  const ctx = await currentUserAndTest();
  if (!ctx) return null;
  const { supabase, userId, entryTestId } = ctx;

  const { data } = await supabase
    .from("attempts")
    .select("id, blueprint_id, expires_at")
    .eq("user_id", userId)
    .eq("entry_test_id", entryTestId)
    .eq("mode", "mock")
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(5);

  // Request time is fine here: this runs after the cookie read above.
  const live = pickLiveMock<{
    id: string;
    blueprint_id: string | null;
    expires_at: string | null;
  }>(data ?? [], Date.now());
  if (!live) return null;

  // Mock papers are frozen up front, so every question already has a row.
  const [answeredRes, totalRes, blueprintRes] = await Promise.all([
    supabase
      .from("attempt_answers")
      .select("question_id", { count: "exact", head: true })
      .eq("attempt_id", live.id)
      .not("selected_option_id", "is", null),
    supabase
      .from("attempt_answers")
      .select("question_id", { count: "exact", head: true })
      .eq("attempt_id", live.id),
    live.blueprint_id
      ? supabase
          .from("mock_test_blueprints")
          .select("name")
          .eq("id", live.blueprint_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    kind: "mock",
    href: routes.mock(live.id),
    title: blueprintRes.data?.name ?? "Mock test",
    answered: answeredRes.count ?? 0,
    total: totalRes.count ?? 0,
  };
});

/**
 * The user's next step on the dashboard home, for the active test:
 *  - a running mock first (its timer doesn't stop),
 *  - else the chapter they most recently ANSWERED in, if that sitting is
 *    still open (ranked by `answered_at`, so recent work wins over the
 *    first-open time),
 * plus the first-run checklist flags. Owner-scoped via RLS; failed reads
 * degrade to "nothing to resume" rather than breaking the page.
 */
export const getJourney = cache(async (): Promise<Journey> => {
  const empty: Journey = { resume: null, hasPracticed: false, hasTakenMock: false };
  const ctx = await currentUserAndTest();
  if (!ctx) return empty;
  const { supabase, userId, entryTestId } = ctx;

  const [openMock, lastPracticeRes, submittedMockRes] = await Promise.all([
    getOpenMock(),
    // Latest answered practice question in this test, with its sitting.
    supabase
      .from("attempt_answers")
      .select("attempt_id, attempts!inner(topic_id, usage, status, user_id, entry_test_id, mode)")
      .eq("attempts.user_id", userId)
      .eq("attempts.entry_test_id", entryTestId)
      .eq("attempts.mode", "practice")
      .not("selected_option_id", "is", null)
      .order("answered_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("entry_test_id", entryTestId)
      .eq("mode", "mock")
      .eq("status", "submitted"),
  ]);

  const lastPractice = lastPracticeRes.data;
  const openPractice = lastPractice
    ? openPracticeFrom(lastPractice.attempt_id, lastPractice.attempts as unknown)
    : null;

  return {
    resume:
      openMock ??
      (openPractice ? await describePractice(supabase, openPractice) : null),
    hasPracticed: lastPractice !== null,
    hasTakenMock: (submittedMockRes.count ?? 0) > 0,
  };
});

/** Turn an open practice sitting into a link + label for the resume card. */
async function describePractice(
  supabase: ServerClient,
  open: OpenPractice,
): Promise<PracticeResume | null> {
  const [answeredRes, topicRes] = await Promise.all([
    supabase
      .from("attempt_answers")
      .select("question_id", { count: "exact", head: true })
      .eq("attempt_id", open.attemptId)
      .not("selected_option_id", "is", null),
    supabase
      .from("topics")
      .select("slug, title, subject_id")
      .eq("id", open.topicId)
      .maybeSingle(),
  ]);
  const topic = topicRes.data;
  if (!topic) return null;

  const { data: subject } = await supabase
    .from("subjects")
    .select("slug, name")
    .eq("id", topic.subject_id)
    .maybeSingle();
  if (!subject) return null;

  return {
    kind: "practice",
    href:
      open.usage === "past_paper"
        ? routes.pastPaper(subject.slug, topic.slug)
        : routes.practice(subject.slug, topic.slug),
    usage: open.usage,
    subjectName: subject.name,
    chapterTitle: topic.title,
    answered: answeredRes.count ?? 0,
  };
}
