import { Check, GraduationCap, MessageCircle } from "lucide-react";
import { formatPlanPrice, pricingPlans, studentOffer } from "@/config/pricing";
import { ButtonLink } from "@/components/marketing/button-link";
import { Container, SectionHeading } from "@/components/marketing/container";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="bg-surface-low py-16 md:py-24">
      <Container>
        <SectionHeading
          id="pricing-heading"
          eyebrow="Pricing"
          title="Free for students. Always affordable."
          description="Taleem ka Safar is built by students and teachers who know how expensive entry test prep can be."
        />

        {/* Key selling point: the one blue-bordered highlight in this section. */}
        <div className="mt-10 flex flex-col gap-6 rounded-2xl border-2 border-brand bg-surface-lowest p-6 shadow-soft sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
              <GraduationCap className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-headline text-xl font-bold leading-snug tracking-tight text-on-surface sm:text-2xl">
                {studentOffer.headline}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
                {studentOffer.priceCapNote}
              </p>
            </div>
          </div>
          <ButtonLink href={studentOffer.ctaHref} size="lg" className="shrink-0">
            {studentOffer.ctaLabel}
          </ButtonLink>
        </div>

        <ul className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          {pricingPlans.map((plan) => (
            <li
              key={plan.id}
              className={cn(
                // Soft cards; the highlighted plan gets a 2px brand edge instead
                // of a hard offset shadow (eye comfort, 2026-10-30).
                "relative flex flex-col rounded-2xl bg-surface-lowest p-6 sm:p-8",
                plan.highlighted
                  ? "border-2 border-brand shadow-soft-lg"
                  : "border border-outline-variant shadow-soft",
              )}
            >
              {plan.highlighted ? (
                <p className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 font-headline text-xs font-semibold uppercase tracking-widest text-on-brand">
                  {studentOffer.short}
                </p>
              ) : null}
              <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface">
                {plan.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{plan.tagline}</p>
              <p className="mt-6 font-headline text-4xl font-bold tracking-tight text-on-surface">
                {formatPlanPrice(plan)}
              </p>
              <p className="mt-2 text-sm font-medium text-on-surface-variant">{plan.priceNote}</p>
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-on-surface">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-container" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={plan.ctaHref}
                variant={plan.highlighted ? "primary" : "secondary"}
                className="mt-8 w-full"
                aria-label={`${plan.ctaLabel}: ${plan.name} plan${plan.external ? " (opens WhatsApp)" : ""}`}
                {...(plan.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {plan.external ? <MessageCircle aria-hidden="true" /> : null}
                {plan.ctaLabel}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
