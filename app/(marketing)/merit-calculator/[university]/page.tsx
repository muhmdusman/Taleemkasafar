import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUniversityBySlug, getUniversitySlugs } from "@/data/merit-formulas";
import { universityMetaDescription } from "@/lib/merit/display";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";
import { Container } from "@/components/marketing/container";
import { PageHeader } from "@/components/marketing/page-header";
import { PracticeCta } from "@/components/marketing/practice-cta";
import { AdmissionCriteria } from "@/components/marketing/merit/admission-criteria";
import { FormulaCard } from "@/components/marketing/merit/formula-card";
import { MeritCalculatorForm } from "@/components/marketing/merit/merit-calculator-form";

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

/**
 * One job: enter marks, get the aggregate. The calculator sits on the left;
 * the formula and admission criteria it relies on sit beside it.
 */
export default async function UniversityMeritPage({ params }: { params: Promise<Params> }) {
  const { university: slug } = await params;
  const university = getUniversityBySlug(slug);
  if (!university) notFound();

  const multiple = university.formulas.length > 1;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: routes.home },
          { name: "Merit Calculator", path: routes.meritCalculator },
          { name: university.shortName, path: routes.meritUniversity(university.slug) },
        ]}
        title={`${university.name} merit calculator`}
      />

      <Container className="grid items-start gap-6 py-8 md:py-10 lg:grid-cols-[1.3fr_1fr] lg:gap-8">
        <MeritCalculatorForm formulas={university.formulas} />
        <div className="flex flex-col gap-6">
          {university.formulas.map((formula) => (
            <FormulaCard
              key={formula.id}
              formula={formula}
              title={multiple ? `${formula.label} formula` : `${university.shortName} merit formula`}
            />
          ))}
          <AdmissionCriteria university={university} />
        </div>
      </Container>

      <Container className="pb-12 md:pb-16">
        <PracticeCta id="university-cta-heading" title="Want a higher aggregate?" />
      </Container>
    </>
  );
}
