/**
 * Central URL map + pure route-guard decisions.
 *
 * - `routes.*` builds every internal app URL, so moving a section is a
 *   one-file edit.
 * - `isPublicPath` / `shouldBounceSignedIn` are used by the proxy
 *   (lib/supabase/proxy.ts). The guard is DENY-BY-DEFAULT: anything not on the
 *   explicit public allowlist below requires a signed-in user. Every new public
 *   page (landing sections, blog, SEO pages) must be added here on purpose.
 * - `safeNextPath` sanitises `?next=` redirect targets (open-redirect guard).
 */

const DASHBOARD = "/dashboard";
const MERIT = "/merit-calculator";
const BLOG = "/blog";

export const routes = {
  home: "/",
  login: "/auth/login",
  signUp: "/auth/sign-up",
  // Short public aliases (next.config.ts redirects them to login / signUp).
  signInAlias: "/sign-in",
  registerAlias: "/register",
  // Public website (app/(marketing)).
  meritCalculator: MERIT,
  meritUniversity: (university: string) => `${MERIT}/${university}`,
  blog: BLOG,
  blogPost: (slug: string) => `${BLOG}/${slug}`,
  academies: "/academies",
  contact: "/contact",
  dashboard: DASHBOARD,
  subjects: `${DASHBOARD}/subjects`,
  subject: (slug: string) => `${DASHBOARD}/subjects/${slug}`,
  practice: (slug: string, chapter: string) =>
    `${DASHBOARD}/subjects/${slug}/${chapter}/practice`,
  pastPaper: (slug: string, chapter: string) =>
    `${DASHBOARD}/subjects/${slug}/${chapter}/past-paper`,
  mocks: `${DASHBOARD}/mock`,
  mock: (attemptId: string) => `${DASHBOARD}/mock/${attemptId}`,
  mockResult: (attemptId: string) => `${DASHBOARD}/mock/${attemptId}/result`,
  performance: `${DASHBOARD}/performance`,
  // Nav placeholders: pages not built yet (render 404 for now).
  settings: `${DASHBOARD}/settings`,
  help: `${DASHBOARD}/help`,
} as const;

/** Exact public paths: public pages + Next metadata/static files. */
const PUBLIC_EXACT = new Set<string>([
  routes.home,
  routes.contact,
  routes.academies,
  routes.signInAlias,
  routes.registerAlias,
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon.svg",
  "/apple-icon.svg",
]);

/** Public path prefixes. Each matches the segment itself or anything below it. */
const PUBLIC_PREFIXES = ["/auth", "/_next", routes.meritCalculator, routes.blog];

/** Root-level metadata image routes (static or generated, optional suffix). */
const METADATA_IMAGE = /^\/(?:opengraph|twitter)-image(?:[-.][\w.-]*)?$/;

/** Is `base` the segment `pathname` or one of its ancestors? (`/a` vs `/ab`) */
function isUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** True when `pathname` can be served without a signed-in user. */
export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (METADATA_IMAGE.test(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => isUnder(pathname, p));
}

/**
 * Pages a signed-in user should never see (the browser back button after
 * login lands here): the auth ENTRY pages. The landing page `/` is NOT here:
 * signed-in users may browse it, and its header/hero swap to "Access
 * dashboard" CTAs (components/marketing/auth-aware-cta.tsx). Auth FLOW
 * routes (callback, confirm, update-password, error) are deliberately absent
 * so a signed-in user can still complete them.
 */
const SIGNED_IN_BOUNCE = new Set<string>([
  routes.login,
  routes.signUp,
  "/auth/sign-up-success",
  "/auth/forgot-password",
]);

/** True when a signed-in user on `pathname` should be sent to the dashboard. */
export function shouldBounceSignedIn(pathname: string): boolean {
  return SIGNED_IN_BOUNCE.has(pathname);
}

/**
 * Sanitise a `next` redirect target. Only same-origin relative paths that
 * start with a single `/` are accepted; protocol-relative (`//evil.com`),
 * backslash tricks (`/\evil.com`), absolute URLs and anything else fall back.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback: string = routes.dashboard,
): string {
  if (!next || !next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  // Reject control characters (browsers strip tabs/newlines, e.g. "/\t/evil").
  for (let i = 0; i < next.length; i++) {
    const code = next.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return fallback;
  }
  return next;
}

/**
 * Nav highlight: the dashboard home is active only on exactly `/dashboard`;
 * other items are active on their own path and anything beneath it.
 */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === routes.dashboard) return pathname === routes.dashboard;
  return isUnder(pathname, href);
}
