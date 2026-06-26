import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Cookieless Supabase client for PUBLIC, cacheable catalog reads only.
 *
 * Unlike lib/supabase/server.ts, this does NOT read cookies, so functions using
 * it can be wrapped in Next's `"use cache"`. Use it ONLY for non-sensitive
 * reference data exposed via the public catalog views (subject_overview,
 * chapter_overview, entry_test_public). Never for user data or question content.
 */
export function createAnonClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}
