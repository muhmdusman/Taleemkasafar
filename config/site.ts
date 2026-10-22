import { routes } from "@/lib/routes";

/**
 * Public-site configuration: brand, canonical origin, navigation.
 * Single source for the marketing header/footer, metadata, sitemap and
 * JSON-LD. Copy is a first draft; refine during the SEO/content phase.
 */

/**
 * Canonical origin for canonicals, sitemap, robots and JSON-LD. Reads
 * `NEXT_PUBLIC_SITE_URL` first, like `metadataBase` in app/layout.tsx, but the
 * fallbacks differ: here it is the production apex `https://taleemkasafar.com`;
 * `metadataBase` falls back to `VERCEL_URL`, then `http://localhost:3000`.
 * In production `NEXT_PUBLIC_SITE_URL` decides every canonical URL.
 */
const url = (process.env.NEXT_PUBLIC_SITE_URL || "https://taleemkasafar.com").replace(
  /\/+$/,
  "",
);

export type NavLink = { label: string; href: string };

export const siteConfig = {
  name: "Taleem ka Safar",
  shortName: "Taleem ka Safar",
  tagline: "Entry test preparation for Pakistani students",
  description:
    "Prepare for the NUST NET and Punjab University entry tests with chapter-wise MCQ practice, past papers, timed NET mock tests and progress analytics, plus a merit calculator for 18 universities.",
  url,
  locale: "en_PK",
  language: "en",
  /** Fixed so marketing pages stay static (no `new Date()` under Cache Components). */
  copyrightYear: 2026,
  nav: [
    { label: "Home", href: routes.home },
    { label: "Merit Calculator", href: routes.meritCalculator },
    { label: "Blog", href: routes.blog },
    { label: "For Academics", href: routes.academies },
    { label: "Contact", href: routes.contact },
  ] satisfies NavLink[],
  auth: {
    signIn: { label: "Sign in", href: routes.login },
    register: { label: "Register", href: routes.signUp },
    // Shown instead of Sign in / Register when the visitor is signed in.
    dashboard: { label: "Access dashboard", href: routes.dashboard },
    practice: { label: "Start practice", href: routes.subjects },
  },
  /**
   * Entry tests named in public copy (product owner, 2026-10-22: "mention
   * PU, UET, NET, FAST, NAT for now; data is being added"). `dashboardLive`
   * marks tests whose content is in the dashboard today; the footer links
   * those to the dashboard.
   */
  entryTests: [
    { name: "NET (NUST)", short: "NET", dashboardLive: true },
    { name: "PU entry tests", short: "PU", dashboardLive: true },
    { name: "UET (ECAT)", short: "UET", dashboardLive: false },
    { name: "FAST-NUCES", short: "FAST", dashboardLive: false },
    { name: "NTS NAT", short: "NAT", dashboardLive: false },
  ],
  /** Real contact details (product owner, 2026-10-22). */
  contact: {
    email: "musman@taleemkasafar.com" as string,
    /** Display format; also the WhatsApp number. */
    phone: "0330 1358202" as string,
    /** E.164 for tel: links. */
    phoneE164: "+923301358202",
    whatsappUrl: "https://wa.me/923301358202",
    responseTime: "Within 24 hours" as string,
  },
} as const;

/** True while a config value has not been filled in by the product owner. */
export function isPlaceholder(value: string | null | undefined): boolean {
  return !value || value.trim().toUpperCase() === "PLACEHOLDER";
}

/** Alt text of the default OG/Twitter image (app/opengraph-image.tsx). */
export const defaultOgImageAlt = `${siteConfig.name}: ${siteConfig.tagline}`;

/** Absolute URL on the canonical origin for a site path. */
export function absoluteUrl(path: string = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
