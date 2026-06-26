import { createClient } from "@/lib/supabase/server";
import { resolveDisplayName } from "./dashboard-helpers";

/** The signed-in user's friendly display name (for the header avatar/label). */
export async function getDisplayName(): Promise<string> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub as string | undefined;
  const email = (claims?.claims?.email as string | undefined) ?? null;
  if (!userId) return resolveDisplayName(null, email);

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();

  return resolveDisplayName(profile?.display_name, email);
}
