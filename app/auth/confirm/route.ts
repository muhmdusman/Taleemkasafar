import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Email confirmation (sign-up, email change, recovery, magic link).
 *
 * This uses the token_hash + verifyOtp flow, which is NOT bound to the browser
 * that initiated the request — so opening the confirmation email in a different
 * browser, device, or in-app webview works fine. (The PKCE code-exchange flow
 * in /auth/callback IS browser-bound and is only appropriate for OAuth, where
 * the round-trip happens in the same browser.)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/auth/error?error=${encodeURIComponent(
      "Invalid or expired confirmation link. Please request a new one.",
    )}`,
  );
}
