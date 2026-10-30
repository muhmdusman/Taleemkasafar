import { studentOffer } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { AuthAwareButton } from "@/components/marketing/auth-aware-cta";
import { Container } from "@/components/marketing/container";

/**
 * Closing call to action. A light blue tinted panel (was a charcoal poster):
 * the page ends calmly, with the blue reserved for the main button.
 */
export function FinalCta() {
  const { auth } = siteConfig;
  return (
    <section aria-labelledby="cta-heading" className="pb-16 md:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-brand/15 bg-brand-fixed p-8 shadow-soft sm:p-12">
          {/* Decorative pattern: dot grid + rings (tokens only). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(var(--brand)/0.10)_1.5px,transparent_1.5px)] bg-[length:22px_22px]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-16 hidden size-72 rounded-full border-[28px] border-brand/10 md:block"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-14 hidden size-40 rounded-full border-2 border-brand/15 md:block"
          />
          <div className="relative max-w-2xl">
            <p className="font-headline text-sm font-semibold uppercase tracking-widest text-brand-container">
              {studentOffer.tagline}
            </p>
            <h2
              id="cta-heading"
              className="mt-3 font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl"
            >
              Your seat is out there. Start preparing today.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
              Free for students. No academy fees, no pressure. Just steady
              practice, with an explanation for every mistake, towards your
              admission.
            </p>
          </div>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
            <AuthAwareButton
              size="lg"
              arrow
              signedOut={{ label: "Register for free", href: auth.register.href }}
              signedIn={{ label: auth.dashboard.label, href: auth.dashboard.href }}
            />
            <AuthAwareButton
              size="lg"
              signedOut={{
                label: "I already have an account",
                href: auth.signIn.href,
                variant: "secondary",
              }}
              signedIn={{ label: auth.practice.label, href: auth.practice.href, variant: "secondary" }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
