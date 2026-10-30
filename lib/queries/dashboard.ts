import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/lib/routes";
import {
  mockSecondsLeft,
  openPracticeFrom,
  pickOpenMock,
  resolveDisplayName,
  type OpenMockState,
  type OpenPractice,
} from "./dashboard-helpers";
import {
  getActiveEntryTest,
  getUserTestContext,
  hasChosenEntryTest,
  type EntryTest,
} from "./entry-test";
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

/**
 * Whether the signed-in user has any recorded attempts for the ACTIVE entry
 * test (same scope as `getJourney`, so the greeting and the next-step card
 * agree after a test switch). Request-memoized so it can stream in its own
 * Suspense boundary without duplicate queries.
 */
export const getHasActivity = cache(async (): Promise<boolean> => {
  const ctx = await getUserTestContext();
  if (!ctx) return false;
  const { count } = await ctx.supabase
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .eq("entry_test_id", ctx.entryTest.id);
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

/** An unsubmitted mock for the active test: running, paused or out of time. */
export type MockResume = {
  kind: "mock";
  attemptId: string;
  state: OpenMockState;
  href: string;
  title: string;
  answered: number;
  total: number;
  /** Time left (frozen while paused, 0 once time is up); null = no limit. */
  secondsLeft: number | null;
};

/** The practice / past-paper chapter the user last answered in, unfinished. */
export type PracticeResume = {
  kind: "practice";
  href: string;
  usage: "practice" | "past_paper";
  subjectSlug: string;
  subjectName: string;
  chapterTitle: string;
  answered: number;
};

/** Where the "pick up where you left off" card sends the user. */
export type ResumePoint = MockResume | PracticeResume;

/** What the dashboard home suggests next, for the active entry test. */
export type Journey = {
  resume: ResumePoint | null;
  /** Picked an entry test themselves (vs. the default first test). */
  hasChosenTest: boolean;
  /** Has answered at least one practice / past-paper question. */
  hasPracticed: boolean;
  /** Has submitted at least one mock. */
  hasTakenMock: boolean;
};

/**
 * The unsubmitted mock to surface for the active test (see `pickOpenMock`):
 * paused or running first, else the newest one whose time ran out recently.
 * Used by the home page and the mock page, where it replaces "Start" so a
 * second paper can't orphan the first. Null when none, or if a read fails.
 */
export const getOpenMock = cache(async (): Promise<MockResume | null> => {
  const ctx = await getUserTestContext();
  if (!ctx) return null;
  const { supabase, userId, entryTest } = ctx;

  // `*` (not a column list) so this still works before the mcq_15 migration
  // adds `paused_at`: the column is simply absent.
  const { data } = await supabase
    .from("attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_test_id", entryTest.id)
    .eq("mode", "mock")
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(5);

  // Request time is fine here: this runs after the cookie read above.
  const now = Date.now();
  const open = pickOpenMock<{
    id: string;
    blueprint_id: string | null;
    expires_at: string | null;
    paused_at?: string | null;
  }>(data ?? [], now);
  if (!open) return null;
  const { attempt, state } = open;

  // Mock papers are frozen up front, so every question already has a row.
  const [answeredRes, totalRes, blueprintRes] = await Promise.all([
    supabase
      .from("attempt_answers")
      .select("question_id", { count: "exact", head: true })
      .eq("attempt_id", attempt.id)
      .not("selected_option_id", "is", null),
    supabase
      .from("attempt_answers")
      .select("question_id", { count: "exact", head: true })
      .eq("attempt_id", attempt.id),
    attempt.blueprint_id
      ? supabase
          .from("mock_test_blueprints")
          .select("name")
          .eq("id", attempt.blueprint_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    kind: "mock",
    attemptId: attempt.id,
    state,
    href: routes.mock(attempt.id),
    title: blueprintRes.data?.name ?? "Mock test",
    answered: answeredRes.count ?? 0,
    total: totalRes.count ?? 0,
    secondsLeft: state === "timeUp" ? 0 : mockSecondsLeft(attempt, now),
  };
});

/**
 * The user's next step on the dashboard home, for the active test:
 *  - an unsubmitted mock first (a running timer doesn't stop),
 *  - else the chapter they most recently ANSWERED in, if that sitting is
 *    still open (ranked by `answered_at`, so recent work wins over the
 *    first-open time),
 * plus the first-run checklist flags. Owner-scoped via RLS; failed reads
 * degrade to "nothing to resume" rather than breaking the page.
 */
export const getJourney = cache(async (): Promise<Journey> => {
  const ctx = await getUserTestContext();
  const empty: Journey = {
    resume: null,
    hasChosenTest: false,
    hasPracticed: false,
    hasTakenMock: false,
  };
  if (!ctx) return empty;
  const { supabase, userId, entryTest } = ctx;

  const [openMock, chosen, lastPracticeRes, submittedMockRes] = await Promise.all([
    getOpenMock(),
    hasChosenEntryTest(),
    // Latest answered practice question in this test, with its sitting.
    supabase
      .from("attempt_answers")
      .select("attempt_id, attempts!inner(topic_id, usage, status, user_id, entry_test_id, mode)")
      .eq("attempts.user_id", userId)
      .eq("attempts.entry_test_id", entryTest.id)
      .eq("attempts.mode", "practice")
      .not("selected_option_id", "is", null)
      .order("answered_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("entry_test_id", entryTest.id)
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
    hasChosenTest: chosen,
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
    subjectSlug: subject.slug,
    subjectName: subject.name,
    chapterTitle: topic.title,
    answered: answeredRes.count ?? 0,
  };
}
