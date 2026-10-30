import { getUniversities } from "@/data/merit-formulas";
import { admissionYearNotice } from "@/lib/merit/display";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";
import { Container, SectionHeading } from "@/components/marketing/container";
import { PracticeCta } from "@/components/marketing/practice-cta";
import { PageHeader } from "@/components/marketing/page-header";
import { MeritDisclaimer } from "@/components/marketing/merit/merit-disclaimer";
import { UniversityCard } from "@/components/marketing/merit/university-card";

export const metadata = buildMetadata({
  title: "Merit Calculator for Pakistani Universities",
  description:
    "Free merit calculators for 18 Pakistani universities and admission systems, including NUST, UET Lahore, FAST-NUCES, GIKI, COMSATS, PU and MDCAT. Enter your marks to estimate your aggregate.",
  path: routes.meritCalculator,
});

const STEPS = [
  {
    title: "Each part is turned into a percentage",
    description:
      "Your entry test, intermediate and matric marks are each divided by their total marks.",
  },
  {
    title: "Each percentage is weighted",
    description:
      "Every university decides how much each part counts, for example 75% test, 15% inter and 10% matric.",
  },
  {
    title: "The weighted parts are added up",
    description:
      "The sum is your aggregate out of 100. Merit lists rank applicants by this number.",
  },
];

/** /merit-calculator: one card per university (static, server-rendered). */
export default function MeritCalculatorIndexPage() {
  const universities = getUniversities();
  const yearNotice = admissionYearNotice(universities.flatMap((u) => u.formulas));
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: routes.home },
          { name: "Merit Calculator", path: routes.meritCalculator },
        ]}
        eyebrow="Free tool"
        title="Merit calculator for Pakistani universities"
        description="Pick your university, enter your marks and see your estimated aggregate with a clear breakdown of how each part counts."
      />

      <section aria-labelledby="universities-heading" className="py-12 md:py-16">
        <Container>
          <h2
            id="universities-heading"
            className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl"
          >
            Choose your university
          </h2>
          <p className="mt-3 max-w-2xl text-on-surface-variant">
            {universities.length} universities and admission systems. Weightages
            come from our merit criteria guide.
          </p>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {universities.map((university) => (
              <UniversityCard key={university.id} university={university} />
            ))}
          </ul>
          {yearNotice ? (
            <p className="mt-8 text-sm text-on-surface-variant">Note: {yearNotice}</p>
          ) : null}
        </Container>
      </section>

      <section aria-labelledby="how-merit-heading" className="bg-surface-low py-12 md:py-16">
        <Container>
          <SectionHeading
            id="how-merit-heading"
            eyebrow="How it works"
            title="How merit is calculated"
            description="Most Pakistani universities use a weighted aggregate. The idea is the same everywhere; only the weights and totals change."
          />
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft"
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center rounded-full bg-brand-fixed font-headline font-bold text-brand-container"
                >
                  {i + 1}
                </span>
                <h3 className="mt-5 font-headline text-lg font-bold tracking-tight text-on-surface">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-8 rounded-xl bg-surface-lowest px-4 py-3 font-mono text-sm text-on-surface">
            Aggregate = (Test ÷ Test total × Test weight) + (Inter ÷ Inter total × Inter
            weight) + (Matric ÷ Matric total × Matric weight)
          </p>
          <MeritDisclaimer className="mt-6 max-w-3xl" />
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        <PracticeCta
          id="merit-cta-heading"
          title="Raise the number that counts most"
          description="The entry test usually carries the biggest weight. Practise chapter-wise MCQs with an explanation for every wrong answer, then take timed mock tests."
        />
      </Container>
    </>
  );
}
