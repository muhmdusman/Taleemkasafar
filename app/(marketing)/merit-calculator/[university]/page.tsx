import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUniversities, getUniversityBySlug, getUniversitySlugs } from "@/data/merit-formulas";
import { universityIntro, universityMetaDescription } from "@/lib/merit/display";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { Container } from "@/components/marketing/container";
import { PracticeCta } from "@/components/marketing/practice-cta";
import { AdmissionCriteria } from "@/components/marketing/merit/admission-criteria";
import { MeritCalculatorForm } from "@/components/marketing/merit/merit-calculator-form";
import { OtherCalculators } from "@/components/marketing/merit/other-calculators";

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
    title: `${university.shortName} Merit & Aggregate Calculator`,
    description: universityMetaDescription(university),
    path: routes.meritUniversity(university.slug),
  });
}

/**
 * One centred column: title + formula in one sentence, the calculator card
 * (with "how it's calculated" inside), admission criteria, then links to
 * every other university's calculator.
 */
export default async function UniversityMeritPage({ params }: { params: Promise<Params> }) {
  const { university: slug } = await params;
  const university = getUniversityBySlug(slug);
  if (!university) notFound();

  const others = getUniversities().filter((u) => u.slug !== university.slug);

  return (
    <Container className="py-8 md:py-12">
      {/* One reading column, centred on wide screens. */}
      <div className="mx-auto flex max-w-4xl flex-col gap-10 md:gap-12">
        <div>
          <Breadcrumbs
            items={[
              { name: "Home", path: routes.home },
              { name: "Merit Calculator", path: routes.meritCalculator },
              { name: university.shortName, path: routes.meritUniversity(university.slug) },
            ]}
          />
          <h1 className="mt-5 text-balance font-headline text-3xl font-bold tracking-tight text-brand-container sm:text-4xl">
            {university.shortName} Merit & Aggregate Calculator
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            {universityIntro(university)}
          </p>
        </div>

        <MeritCalculatorForm formulas={university.formulas} />
        <AdmissionCriteria university={university} />
        <OtherCalculators universities={others} />
        <PracticeCta id="university-cta-heading" title="Want a higher aggregate?" />
      </div>
    </Container>
  );
}
