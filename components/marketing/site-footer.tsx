import Link from "next/link";
import { siteConfig } from "@/config/site";
import { studentOffer } from "@/config/pricing";
import { routes } from "@/lib/routes";
import { Container } from "@/components/marketing/container";
import { LogoMark } from "@/components/marketing/logo-mark";

const { contact } = siteConfig;

const linkClass =
  "rounded-md text-sm text-on-surface-variant transition-colors hover:text-on-surface hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container";

const headingClass = "font-headline text-sm font-semibold uppercase tracking-widest text-on-surface";

/** Public-site footer. Static: copyright year comes from config (no Date). */
export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant bg-surface-low">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <div className="flex items-center gap-3">
            <LogoMark label={null} />
            <span className="font-headline text-lg font-bold tracking-tight text-on-surface">
              {siteConfig.name}
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
            {studentOffer.tagline} Entry test preparation for Pakistani students:
            chapter-wise practice with explanations, timed mock tests, past papers
            and progress tracking, all in one place.
          </p>
          <ul className="mt-5 flex flex-col gap-2 text-sm">
            <li>
              <a href={`mailto:${contact.email}`} className={linkClass}>
                {contact.email}
              </a>
            </li>
            <li>
              <a
                href={contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                WhatsApp {contact.phone}
                <span className="sr-only"> (opens WhatsApp)</span>
              </a>
            </li>
          </ul>
        </div>

        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore" className={headingClass}>
            Explore
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {siteConfig.nav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={headingClass}>Entry tests</h2>
          {/* Tests with live content link to the dashboard (signed-out
              visitors are sent to sign in first by the route guard). */}
          <ul className="mt-4 flex flex-col gap-3 text-sm text-on-surface-variant">
            {siteConfig.entryTests.map((test) => (
              <li key={test.short}>
                {test.dashboardLive ? (
                  <Link href={routes.dashboard} prefetch={false} className={linkClass}>
                    Practise {test.name}
                  </Link>
                ) : (
                  test.name
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Account</h2>
          <ul className="mt-4 flex flex-col gap-3">
            <li>
              <Link href={siteConfig.auth.register.href} prefetch={false} className={linkClass}>
                Create a free account
              </Link>
            </li>
            <li>
              <Link href={siteConfig.auth.signIn.href} prefetch={false} className={linkClass}>
                Sign in to your account
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-outline-variant">
        <Container className="flex flex-col gap-3 py-6 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {siteConfig.copyrightYear} {siteConfig.name}. All rights reserved.
          </p>
          {/* PLACEHOLDER: legal pages not written yet; plain text, not links. */}
          <p>Privacy policy and terms of use coming soon.</p>
        </Container>
      </div>
    </footer>
  );
}
