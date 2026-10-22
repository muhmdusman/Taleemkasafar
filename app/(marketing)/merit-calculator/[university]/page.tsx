import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getUniversityBySlug, getUniversitySlugs } from "@/data/merit-formulas";
import { PracticeCta } from "@/components/marketing/practice-cta";
import {
  admissionYearNotice,
  entryTestNames,
  sourceLine,
  universityMetaDescription,
} from "@/lib/merit/display";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/marketing/button-link";
import { Container } from "@/components/marketing/container";
import { PageHeader } from "@/components/marketing/page-header";
import { FormulaCard } from "@/components/marketing/merit/formula-card";
import { MeritCalculatorForm } from "@/components/marketing/merit/merit-calculator-form";
import { MeritDisclaimer } from "@/components/marketing/merit/merit-disclaimer";

type Params = { university: string };

/**
 * Every university is prerendered from the slug list. `dynamicParams = false`
 * is not allowed with Cache Components, so unknown slugs 404 via `notFound()`
 * below (the data lookup is synchronous, so nothing streams before it).
 */
export function generateStaticParams(): Params[] {
  return getUniversitySlugs().map((university) => ({ university }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { university: slug } = await params;
  const university = getUniversityBySlug(slug);
  if (!university) return {};
  return buildMetadata({
    title: `${university.shortName} Merit Calculator — aggregate formula`,
    description: universityMetaDescription(university),
    path: routes.meritUniversity(university.slug),
  });
}

export default async function UniversityMeritPage({ params }: { params: Promise<Params> }) {
  const { university: slug } = await params;
  const university = getUniversityBySlug(slug);
  if (!university) notFound();

  const tests = entryTestNames(university);
  const multiple = university.formulas.length > 1;
  const yearNotice = admissionYearNotice(university.formulas);
  const criteria = [
    university.eligibility ? { term: "Eligibility", detail: [university.eligibility] } : null,
    university.negativeMarking
      ? { term: "Negative marking", detail: [university.negativeMarking] }
      : null,
    university.testStructure?.length
      ? { term: "Test structure", detail: university.testStructure }
      : null,
    university.notes?.length ? { term: "Good to know", detail: university.notes } : null,
  ].filter((c): c is { term: string; detail: string[] } => c !== null);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: routes.home },
          { name: "Merit Calculator", path: routes.meritCalculator },
          { name: university.shortName, path: routes.meritUniversity(university.slug) },
        ]}
        eyebrow="Merit calculator"
        title={`${university.name} merit calculator`}
        description={`Enter your marks to estimate your ${university.shortName} aggregate. The weightage and formula come from our merit criteria guide.`}
      >
        <ul aria-label="At a glance" className="mt-6 flex flex-wrap gap-2 text-sm">
          <li className="rounded-full bg-surface-lowest px-3 py-1 font-medium text-on-surface shadow-soft">
            Entry test: {tests.join(", ")}
          </li>
          {university.city ? (
            <li className="flex items-center gap-1.5 rounded-full bg-surface-lowest px-3 py-1 font-medium text-on-surface shadow-soft">
              <MapPin className="size-4" aria-hidden="true" />
              {university.city}
            </li>
          ) : null}
        </ul>
      </PageHeader>

      <Container className="grid items-start gap-8 py-10 md:py-14 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
        <section
          aria-labelledby="calculator-heading"
          className="rounded-2xl border border-outline-variant bg-surface-lowest p-5 shadow-soft sm:p-8"
        >
          <h2
            id="calculator-heading"
            className="font-headline text-2xl font-bold tracking-tight text-on-surface"
          >
            Calculate your aggregate
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Totals are pre-filled where the guide states them. All fields accept decimals.
          </p>
          <div className="mt-6">
            <MeritCalculatorForm
              formulas={university.formulas}
              universityShortName={university.shortName}
            />
          </div>
          <MeritDisclaimer className="mt-6" />
        </section>

        <div className="flex flex-col gap-6">
          {university.formulas.map((formula) => (
            <FormulaCard
              key={formula.id}
              formula={formula}
              title={multiple ? `${formula.label} formula` : `${university.shortName} merit formula`}
            />
          ))}
          {yearNotice ? (
            <p className="px-1 text-xs leading-relaxed text-on-surface-variant">{yearNotice}</p>
          ) : null}
        </div>
      </Container>

      {criteria.length > 0 ? (
        <section aria-labelledby="criteria-heading" className="bg-surface-low py-12 md:py-16">
          <Container>
            <h2
              id="criteria-heading"
              className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl"
            >
              {university.shortName} admission criteria
            </h2>
            <dl className="mt-8 grid gap-5 md:grid-cols-2">
              {criteria.map((c) => (
                <div
                  key={c.term}
                  className="rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft"
                >
                  <dt className="font-headline text-base font-bold text-on-surface">{c.term}</dt>
                  {c.detail.map((line) => (
                    <dd key={line} className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                      {line}
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
            <p className="mt-6 text-xs text-on-surface-variant">
              {sourceLine(university.sourcePages)}
            </p>
          </Container>
        </section>
      ) : null}

      <Container className="flex flex-col gap-8 py-12 md:py-16">
        <PracticeCta
          id="university-cta-heading"
          title="Want a higher aggregate?"
          description="Practise MCQs for NET, PU, UET, FAST and NAT with an explanation for every wrong answer, plus past papers and timed mock tests. Free for students."
        />
        <ButtonLink href={routes.meritCalculator} variant="secondary" className="self-start">
          <ArrowLeft aria-hidden="true" />
          All university merit calculators
        </ButtonLink>
      </Container>
    </>
  );
}
