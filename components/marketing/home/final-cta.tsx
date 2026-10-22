import { studentOffer } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { AuthAwareButton } from "@/components/marketing/auth-aware-cta";
import { Container } from "@/components/marketing/container";

export function FinalCta() {
  const { auth } = siteConfig;
  return (
    <section aria-labelledby="cta-heading" className="pb-16 md:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-ink p-8 text-on-ink shadow-soft-lg sm:p-12">
          {/* Decorative pattern: dot grid + rings (tokens only). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(var(--on-ink)/0.09)_1.5px,transparent_1.5px)] bg-[length:22px_22px]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-16 hidden size-72 rounded-full border-[28px] border-brand-ondark/50 md:block"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-14 hidden size-40 rounded-full border-2 border-on-ink/15 md:block"
          />
          <div className="relative max-w-2xl">
            <p className="font-headline text-sm font-semibold uppercase tracking-widest text-on-ink/70">
              {studentOffer.tagline}
            </p>
            <h2 id="cta-heading" className="mt-3 font-headline text-3xl font-bold tracking-tight sm:text-4xl">
              Your seat is out there. Start preparing today.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-on-ink/80">
              Free for students. No academy fees, no pressure. Just steady
              practice, with an explanation for every mistake, towards your
              admission.
            </p>
          </div>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
            <AuthAwareButton
              size="lg"
              arrow
              signedOut={{ label: "Register for free", href: auth.register.href, variant: "primary-dark" }}
              signedIn={{ label: auth.dashboard.label, href: auth.dashboard.href, variant: "primary-dark" }}
            />
            <AuthAwareButton
              size="lg"
              signedOut={{
                label: "I already have an account",
                href: auth.signIn.href,
                variant: "inverse-outline",
              }}
              signedIn={{ label: auth.practice.label, href: auth.practice.href, variant: "inverse-outline" }}
            />
          </div>

        </div>
      </Container>
    </section>
  );
}
