import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type EntryTest = {
  id: string;
  slug: string;
  name: string;
};

/**
 * Resolve the user's active entry test: their selected one, else the first
 * active test. Server-only; runs under the caller's RLS context.
 *
 * Wrapped in React `cache()` so multiple components in the same request (header,
 * hero, subjects — each in its own Suspense boundary) share ONE resolution
 * instead of repeating the profile + entry_tests lookups.
 */
export const getActiveEntryTest = cache(
  async (): Promise<EntryTest | null> => {
    const supabase = await createClient();

    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub as string | undefined;

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
        if (data) return data;
      }
    }

    const { data } = await supabase
      .from("entry_tests")
      .select("id, slug, name")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    return data ?? null;
  },
);
