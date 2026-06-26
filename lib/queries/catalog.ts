import { unstable_cacheTag as cacheTag } from "next/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import type { Database } from "@/lib/database.types";
import type { EntryTest } from "./entry-test";

export type SubjectOverview =
  Database["public"]["Views"]["subject_overview"]["Row"];
export type ChapterOverview =
  Database["public"]["Views"]["chapter_overview"]["Row"];

// Cache tags — revalidate these after a catalog import / schema data change.
export const CATALOG_TAG = "catalog";

/**
 * Cached: active entry tests (for the selector). Public reference data, cached
 * across all users/navigations until the `catalog` tag is revalidated.
 */
export async function getEntryTestsCached(): Promise<EntryTest[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  const supabase = createAnonClient();
  const { data } = await supabase
    .from("entry_test_public")
    .select("id, slug, name")
    .order("display_order", { ascending: true });
  return (data ?? []).filter(
    (t): t is EntryTest => !!t.id && !!t.slug && !!t.name,
  );
}

/**
 * Cached: subject overview (chapter + question counts) for an entry test.
 * Keyed by testSlug; cached until the `catalog` tag is revalidated.
 */
export async function getSubjectsCached(
  testSlug: string,
): Promise<SubjectOverview[]> {
  "use cache";
  cacheTag(CATALOG_TAG, `catalog:${testSlug}`);
  const supabase = createAnonClient();
  const { data } = await supabase
    .from("subject_overview")
    .select("*")
    .eq("entry_test_slug", testSlug)
    .order("display_order", { ascending: true });
  return data ?? [];
}

/**
 * Cached: chapters (with counts) for a subject within an entry test.
 */
export async function getChaptersCached(
  testSlug: string,
  subjectSlug: string,
): Promise<ChapterOverview[]> {
  "use cache";
  cacheTag(CATALOG_TAG, `catalog:${testSlug}:${subjectSlug}`);
  const supabase = createAnonClient();
  const { data } = await supabase
    .from("chapter_overview")
    .select("*")
    .eq("entry_test_slug", testSlug)
    .eq("subject_slug", subjectSlug)
    .order("display_order", { ascending: true });
  return data ?? [];
}
