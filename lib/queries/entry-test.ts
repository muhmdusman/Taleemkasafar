import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type EntryTest = {
  id: string;
  slug: string;
  name: string;
};

type ServerClient = Awaited<ReturnType<typeof createClient>>;

type Resolved = {
  supabase: ServerClient;
  userId: string | null;
  test: EntryTest | null;
  /** The user picked this test themselves (vs. the default first test). */
  chosen: boolean;
};

/**
 * One lookup per request: the cookie client, the signed-in user and their
 * active entry test (their selected one, else the first active test).
 * Wrapped in React `cache()` so every Suspense region shares it.
 */
const resolveEntryTest = cache(async (): Promise<Resolved> => {
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();
  const userId = (claims?.claims?.sub as string | undefined) ?? null;

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("selected_test_id")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.selected_test_id) {
      const { data } = await supabase
        .from("entry_tests")
        .select("id, slug, name")
        .eq("id", profile.selected_test_id)
        .maybeSingle();
      if (data) return { supabase, userId, test: data, chosen: true };
    }
  }

  const { data } = await supabase
    .from("entry_tests")
    .select("id, slug, name")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  return { supabase, userId, test: data ?? null, chosen: false };
});

/**
 * Resolve the user's active entry test: their selected one, else the first
 * active test. Server-only; runs under the caller's RLS context.
 */
export const getActiveEntryTest = cache(
  async (): Promise<EntryTest | null> => (await resolveEntryTest()).test,
);

/** Whether the user has picked an entry test themselves (drives onboarding). */
export const hasChosenEntryTest = cache(
  async (): Promise<boolean> => (await resolveEntryTest()).chosen,
);

/**
 * Cookie client + signed-in user id + active test for per-user reads, or null
 * when signed out or no test exists. Shares the request's single lookup.
 */
export const getUserTestContext = cache(
  async (): Promise<{
    supabase: ServerClient;
    userId: string;
    entryTest: EntryTest;
  } | null> => {
    const { supabase, userId, test } = await resolveEntryTest();
    if (!userId || !test) return null;
    return { supabase, userId, entryTest: test };
  },
);
