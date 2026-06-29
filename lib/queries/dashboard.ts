import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { resolveDisplayName } from "./dashboard-helpers";
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

/**
 * Whether the signed-in user has any recorded attempts. Request-memoized so it
 * can stream in its own Suspense boundary without duplicate queries.
 */
export const getHasActivity = cache(async (): Promise<boolean> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return false;
  const { count } = await supabase
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
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
