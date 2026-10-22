import { Suspense } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { routes } from "@/lib/routes";
import { HeaderAuthButtons } from "@/components/marketing/auth-aware-cta";
import { Container } from "@/components/marketing/container";
import { LogoMark } from "@/components/marketing/logo-mark";
import {
  NavLinks,
  desktopActiveClass,
  desktopLinkClass,
} from "@/components/marketing/nav-links";
import { DesktopNavLinks, MobileNav } from "@/components/marketing/site-nav";

/**
 * Public-site header. Server component; only the nav links read the pathname
 * (client, inside Suspense) so the marketing layout stays static. Fallbacks
 * render the same links without the active state.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <Container className="flex h-16 items-center justify-between gap-4 md:h-20">
        <Link
          href={routes.home}
          aria-label={`${siteConfig.name}, home`}
          className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <LogoMark />
          <span className="font-headline text-lg font-bold tracking-tight text-on-surface">
            {siteConfig.name}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <Suspense
            fallback={
              <NavLinks
                links={siteConfig.nav}
                pathname={null}
                className="flex items-center gap-1"
                linkClassName={desktopLinkClass}
                activeClassName={desktopActiveClass}
              />
            }
          >
            <DesktopNavLinks />
          </Suspense>
        </nav>

        <div className="flex items-center gap-2">
          {/* Swaps to Start practice / Access dashboard for signed-in visitors. */}
          <HeaderAuthButtons />
          <div className="lg:hidden">
            {/* Trigger only; the Sheet loads on first open (no pathname read here). */}
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
