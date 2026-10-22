import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

/**
 * Public website shell (landing, merit calculator, blog, contact, academies),
 * served from the root. MUST stay static: no cookie, session, header or
 * searchParams reads anywhere under this group, so pages prerender for SEO.
 * Signed-in visitors may browse it; CTAs swap client-side (auth-aware-cta.tsx).
 * Rounded "public site variant" of the brand: DESIGN.md §11. `theme-public`
 * (app/globals.css) sets the sky-blue #009DFF public brand for this subtree.
 */
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-public flex min-h-svh flex-col bg-surface font-body text-on-surface">
      <a
        href="#main"
        className="sr-only z-50 rounded-xl bg-ink px-4 py-3 font-headline text-sm font-semibold text-on-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-brand-container focus:ring-offset-2 focus:ring-offset-surface"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-grow focus:outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
