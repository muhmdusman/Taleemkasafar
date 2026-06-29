import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // --- Canonical host enforcement (fixes "PKCE code verifier not found") ---
  // The OAuth PKCE code_verifier is stored in a cookie scoped to the host where
  // sign-in STARTED. If a user begins on a non-canonical host (apex domain,
  // www, or the *.vercel.app URL) and the flow ends on the canonical host, the
  // verifier cookie is orphaned and the exchange fails. Redirecting every
  // request to the single canonical host up front guarantees the verifier is
  // written and read on the same origin. Gated on NEXT_PUBLIC_SITE_URL so local
  // dev (localhost) is unaffected.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    const canonical = new URL(siteUrl);
    const url = request.nextUrl;
    const isLocalhost =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (!isLocalhost && url.host !== canonical.host) {
      const redirectUrl = new URL(url.pathname + url.search, canonical.origin);
      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Public routes that do NOT require authentication.
  const isPublicRoute =
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/login");

  if (!user && !isPublicRoute) {
    // No user → send to login. Everything except /auth/* is behind auth,
    // including the root dashboard "/".
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
