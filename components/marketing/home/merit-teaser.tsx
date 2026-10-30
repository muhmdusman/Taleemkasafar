import { ArrowRight, Calculator, Info, Plus } from "lucide-react";
import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/marketing/button-link";
import { Container } from "@/components/marketing/container";

// Static teaser: no merit data imported here (the calculator owns it).
const PARTS = ["Matric marks", "Intermediate marks", "Entry test score"];

export function MeritTeaser() {
  return (
    <section aria-labelledby="merit-heading" className="py-16 md:py-24">
      <Container>
        <div className="grid gap-10 rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <span className="flex size-12 items-center justify-center rounded-xl bg-brand-fixed text-brand-container">
              <Calculator className="size-6" aria-hidden="true" />
            </span>
            <h2
              id="merit-heading"
              className="mt-6 font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl"
            >
              Know where you stand before merit lists open
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
              Enter your matric, intermediate and entry test marks to estimate
              your aggregate for each university, using its published
              weightages.
            </p>
            <ButtonLink href={routes.meritCalculator} className="mt-8">
              Open the merit calculator
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </div>

          <div className="rounded-2xl bg-surface-low p-6">
            <ul className="flex flex-col gap-3">
              {PARTS.map((part, i) => (
                <li key={part} className="flex flex-col gap-3">
                  <span className="rounded-xl border border-outline-variant bg-surface-lowest px-4 py-3 font-headline font-semibold text-on-surface">
                    {part}
                  </span>
                  {i < PARTS.length - 1 ? (
                    <Plus className="mx-auto size-4 text-outline" aria-hidden="true" />
                  ) : null}
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-brand-fixed px-4 py-3 text-center font-headline font-semibold text-brand-container">
              = Your estimated aggregate
            </p>
            <p className="mt-4 flex gap-2 text-sm leading-relaxed text-on-surface-variant">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Estimates only. Always verify with the official university
              admission notification.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
