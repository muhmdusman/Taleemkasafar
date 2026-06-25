import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

// Handles the OAuth (e.g. Google) PKCE redirect: exchanges the `code` for a
// session, then redirects the user onward.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` lets us send the user to a specific page after sign-in.
  const next = searchParams.get("next") ?? "/protected";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // The provider returned an error (e.g. user cancelled).
  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(
        errorDescription ?? error,
      )}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Handle load balancer / proxy forwarded host in production.
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(
        exchangeError.message,
      )}`,
    );
  }

  // No code and no error — nothing to do.
  return NextResponse.redirect(
    `${origin}/auth/error?error=${encodeURIComponent(
      "No authorization code provided",
    )}`,
  );
}
