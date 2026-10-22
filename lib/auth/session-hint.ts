/**
 * Cheap, client-side "is someone signed in?" HINT for the public site.
 *
 * The public pages are static (no cookie reads on the server, for SEO and
 * speed), so the header/hero decide between "Sign in / Register" and
 * "Access dashboard" in the browser. @supabase/ssr stores the session in a
 * JS-readable cookie named `sb-<project-ref>-auth-token`, split into
 * `.0`, `.1`, ... chunks when large. We only check that such a cookie exists;
 * we never parse or trust it. Real authorization still happens in the proxy
 * and the dashboard (an expired cookie just means the user is asked to sign
 * in again after clicking "Access dashboard").
 *
 * The PKCE `...-auth-token-code-verifier` cookie (set mid-OAuth, before any
 * session exists) deliberately does NOT match.
 */
const SESSION_COOKIE = /^sb-[a-z0-9]+-auth-token(?:\.\d+)?$/;

/** True when `cookieString` (e.g. `document.cookie`) has a Supabase session cookie. */
export function hasSessionCookie(cookieString: string): boolean {
  if (!cookieString) return false;
  return cookieString.split(";").some((part) => {
    const eq = part.indexOf("=");
    if (eq === -1) return false;
    const name = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    return SESSION_COOKIE.test(name) && value.length > 0;
  });
}
