"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CATALOG_TAG } from "@/lib/queries/catalog";

/**
 * Server Action: set the signed-in user's selected entry test.
 * Business logic on the server; the header selector calls this.
 */
export async function selectEntryTest(entryTestId: string): Promise<void> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) return;

  // Validate the test exists and is active before saving.
  const { data: test } = await supabase
    .from("entry_tests")
    .select("id")
    .eq("id", entryTestId)
    .eq("is_active", true)
    .maybeSingle();
  if (!test) return;

  await supabase
    .from("profiles")
    .update({ selected_test_id: entryTestId })
    .eq("id", userId);

  // The selected test changed → re-render pages (catalog stays cached and is
  // shared across tests, so we only need to refresh the dynamic shell).
  revalidatePath("/", "layout");
}

/**
 * Revalidate cached catalog data. Call after importing/editing the question
 * bank so subject/chapter counts refresh. (Wire to an admin action later.)
 */
export async function revalidateCatalog(): Promise<void> {
  revalidateTag(CATALOG_TAG, "max");
}
