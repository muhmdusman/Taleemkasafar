import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Check,
  MessageCircle,
  Palette,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react";
import { academiesFaq } from "@/config/faq";
import { formatPlanPrice, pricingPlans, studentOffer } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/marketing/button-link";
import { Container, SectionHeading } from "@/components/marketing/container";
import { FaqList } from "@/components/marketing/faq-list";
import { PageHeader } from "@/components/marketing/page-header";
import { JsonLd, faqPageJsonLd } from "@/components/seo/json-ld";

export const metadata = buildMetadata({
  title: "For Academies and Teachers",
  description: `Bring ${siteConfig.name} to your academy or coaching centre: a ready-made MCQ bank with explanations, past papers and timed mock tests for NET, PU, UET, FAST and NAT. Contact us on WhatsApp.`,
  path: routes.academies,
});

type Benefit = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Be honest: only "available" when it works in the product today. */
  status: "available" | "coming-soon";
};

const BENEFITS: Benefit[] = [
  {
    icon: BookOpenCheck,
    title: "Ready-made question bank",
    description:
      "Chapter-wise MCQs for NET, PU, UET, FAST and NAT with an explanation for every wrong answer, so you don't have to build one.",
    status: "available",
  },
  {
    icon: Timer,
    title: "Timed mock tests",
    description:
      "Students sit full papers that follow the real pattern and clock, then review where they lost marks.",
    status: "available",
  },
  {
    icon: BarChart3,
    title: "Progress analytics per student",
    description:
      "A teacher view of each student's accuracy by subject and chapter. Students already see their own analytics.",
    status: "coming-soon",
  },
  {
    icon: Users,
    title: "Batch accounts",
    description: "Add your whole batch at once and manage student access in one place.",
    status: "coming-soon",
  },
  {
    icon: Palette,
    title: "Branded and custom tests",
    description: "Your academy's name on the tests, and papers you assemble for your own schedule.",
    status: "coming-soon",
  },
];

const STEPS = [
  {
    title: "Tell us what you need",
    description: "Share your batch size, the tests you prepare for and how you teach today.",
  },
  {
    title: "Agree the setup",
    description: "We confirm what your students get, the price and a start date together.",
  },
  {
    title: "Launch with your students",
    description: "We help you get your batch started and stay in touch after launch.",
  },
];

const academyPlan = pricingPlans.find((p) => p.id === "academy");

/** /academies ("For Academics" in the nav): static, server-rendered. */
export default function AcademiesPage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd(academiesFaq)} />
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: routes.home },
          { name: "For Academics", path: routes.academies },
        ]}
        eyebrow="For academies and teachers"
        title="Give your students a structured way to prepare"
        description={`${siteConfig.name} gives coaching centres a ready-made practice and mock test platform for entry tests, so your teachers can spend their time teaching.`}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            href={siteConfig.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
          >
            <MessageCircle aria-hidden="true" />
            Contact on WhatsApp
            <span className="sr-only"> (opens WhatsApp)</span>
          </ButtonLink>
          <ButtonLink href={`${routes.home}#pricing`} size="lg" variant="secondary">
            See student plans
          </ButtonLink>
        </div>
      </PageHeader>

      <section aria-labelledby="benefits-heading" className="py-12 md:py-20">
        <Container>
          <SectionHeading
            id="benefits-heading"
            eyebrow="What you get"
            title="Built for coaching centres"
            description="Some of this works today and some is on the way. Each card says which."
          />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, description, status }) => (
              <li
                key={title}
                className="flex flex-col rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-fixed text-brand-container">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <StatusBadge status={status} />
                </div>
                <h3 className="mt-5 font-headline text-lg font-bold tracking-tight text-on-surface">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="academy-steps-heading" className="bg-surface-low py-12 md:py-20">
        <Container>
          <SectionHeading
            id="academy-steps-heading"
            eyebrow="How it works"
            title="From first call to launch in three steps"
          />
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft"
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center rounded-full bg-ink font-headline font-bold text-on-ink"
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
        </Container>
      </section>

      {academyPlan ? (
        <section aria-labelledby="academy-plan-heading" className="py-12 md:py-20">
          <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
            <SectionHeading
              id="academy-plan-heading"
              eyebrow="Plans for academies"
              title="Pricing that fits your batch"
              description={`Message us on WhatsApp and we will agree a plan that fits your batch. ${studentOffer.short}: your students can always use ${siteConfig.name} on their own at no cost.`}
            />
            {/* Plan name, features and CTA come from config/pricing.ts ("academy"). */}
            <div className="rounded-2xl border-2 border-brand bg-surface-lowest p-6 shadow-hard-primary sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface">
                  {academyPlan.name}
                </h3>
                <StatusBadge status="coming-soon" label="In planning" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                {academyPlan.tagline}
              </p>
              <p className="mt-6 font-headline text-2xl font-bold tracking-tight text-on-surface">
                {formatPlanPrice(academyPlan)}
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">{academyPlan.priceNote}</p>
              <p className="mt-6 text-sm font-semibold text-on-surface">Planned features</p>
              <ul className="mt-3 flex flex-col gap-3 text-sm text-on-surface">
                {academyPlan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-container" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={academyPlan.ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 w-full sm:w-auto"
              >
                <MessageCircle aria-hidden="true" />
                {academyPlan.ctaLabel}
                <span className="sr-only"> (opens WhatsApp)</span>
              </ButtonLink>
            </div>
          </Container>
        </section>
      ) : null}

      <section aria-labelledby="academy-faq-heading" className="bg-surface-low py-12 md:py-20">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            id="academy-faq-heading"
            eyebrow="FAQ"
            title="Questions from academies"
          />
          <FaqList items={academiesFaq} />
        </Container>
      </section>

      <section aria-labelledby="academy-cta-heading" className="py-12 md:py-20">
        <Container>
          <div className="rounded-2xl bg-ink p-8 text-on-ink shadow-soft-lg sm:p-12">
            <h2
              id="academy-cta-heading"
              className="max-w-2xl font-headline text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Let&apos;s plan it around your academy
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-on-ink/80">
              Tell us about your students and the tests you prepare for. Message
              us on WhatsApp at {siteConfig.contact.phone} and we reply{" "}
              {siteConfig.contact.responseTime.toLowerCase()}.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                size="lg"
              >
                <MessageCircle aria-hidden="true" />
                Contact on WhatsApp
                <span className="sr-only"> (opens WhatsApp)</span>
              </ButtonLink>
              <ButtonLink href={routes.contact} variant="inverse-outline" size="lg">
                Other ways to reach us
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: Benefit["status"];
  label?: string;
}) {
  const available = status === "available";
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-3 py-1 font-headline text-xs font-semibold uppercase tracking-wider",
        available
          ? "bg-success-fixed text-on-surface"
          : "border border-dashed border-outline text-on-surface-variant",
      )}
    >
      {label ?? (available ? "Available now" : "Coming soon")}
    </span>
  );
}
