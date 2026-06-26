import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import { resolveDisplayName } from "./dashboard-helpers";

export type SubjectOverview =
  Database["public"]["Views"]["subject_overview"]["Row"];

export type DashboardData = {
  displayName: string;
  email: string | null;
  entryTestSlug: string;
  entryTestName: string;
  subjects: SubjectOverview[];
  /** True once the user has any recorded attempts (drives empty states). */
  hasActivity: boolean;
};

/**
 * Server-only loader for the dashboard. Resolves the signed-in user's profile,
 * their selected entry test (defaulting to the first active test), and the
 * subject overview for that test. All reads run under the user's RLS context.
 */
export async function getDashboardData(): Promise<DashboardData | null> {
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  const email = (claims?.claims?.email as string | undefined) ?? null;
  if (!userId) return null;

  // Profile (auto-created by trigger on signup).
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, selected_test_id")
    .eq("id", userId)
    .maybeSingle();

  // Resolve the active entry test: the user's selection, else the first active.
  let entryTest: { id: string; slug: string; name: string } | null = null;
  if (profile?.selected_test_id) {
    const { data } = await supabase
      .from("entry_tests")
      .select("id, slug, name")
      .eq("id", profile.selected_test_id)
      .maybeSingle();
    entryTest = data;
  }
  if (!entryTest) {
    const { data } = await supabase
      .from("entry_tests")
      .select("id, slug, name")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    entryTest = data;
  }
  if (!entryTest) return null;

  // Subject overview (chapter + question counts) for the test.
  const { data: subjects } = await supabase
    .from("subject_overview")
    .select("*")
    .eq("entry_test_slug", entryTest.slug)
    .order("display_order", { ascending: true });

  // Any attempts yet? (cheap existence check)
  const { count: attemptCount } = await supabase
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const displayName = resolveDisplayName(profile?.display_name, email);

  return {
    displayName,
    email,
    entryTestSlug: entryTest.slug,
    entryTestName: entryTest.name,
    subjects: subjects ?? [],
    hasActivity: (attemptCount ?? 0) > 0,
  };
}
