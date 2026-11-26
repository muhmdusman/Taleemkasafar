import {
  ArrowDown,
  Check,
  CheckCircle2,
  Compass,
  GraduationCap,
  Lock,
  MessagesSquare,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getUniversities } from "@/data/merit-formulas";
import { seniorConnect } from "@/config/senior-connect";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { ButtonLink } from "@/components/marketing/button-link";
import { Container, SectionHeading } from "@/components/marketing/container";
import { FaqList } from "@/components/marketing/faq-list";
import { HeroChat } from "@/components/marketing/seniors/hero-chat";
import { SignupForm } from "@/components/marketing/seniors/signup-form";
import { JsonLd, faqPageJsonLd } from "@/components/seo/json-ld";

export const metadata = buildMetadata({
  title: "Senior Connect (Beta): Talk to University Seniors",
  description:
    "Preparing for NET, ECAT, PU or FAST? Senior Connect introduces you to bachelor students at your dream university for honest answers on admissions, programmes and campus life. Free for students.",
  path: routes.seniors,
});

const POINT_ICONS: Record<string, LucideIcon> = {
  users: Users,
  messages: MessagesSquare,
  compass: Compass,
};

/** University suggestions for the forms (merit data; MDCAT is not a university). */
const UNIVERSITY_SUGGESTIONS = getUniversities()
  .filter((u) => u.slug !== "mdcat")
  .map((u) => u.shortName);

const STUDENT_ANCHOR = "join-student";
const SENIOR_ANCHOR = "join-senior";

/**
 * /seniors: Senior Connect (Beta). Static page; the two sign-up forms are
 * client islands that deliver through Web3Forms. Story order (for a short
 * pitch): problem -> solution -> how it works -> who it is for -> join.
 */
export default function SeniorsPage() {
  const { hero, problem, steps, audiences, forms, privacy } = seniorConnect;
  const faq = [...seniorConnect.faq];

  return (
    <>
      <JsonLd data={faqPageJsonLd(faq)} />

      {/* Hero: charcoal poster (the one dark section on the page). */}
      <section aria-labelledby="seniors-heading" className="relative overflow-hidden bg-ink text-on-ink">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(var(--on-ink)/0.08)_1.5px,transparent_1.5px)] bg-[length:22px_22px]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 hidden size-96 rounded-full border-[40px] border-brand-ondark/25 lg:block"
        />
        <Container className="relative grid items-center gap-12 py-12 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <div className="max-w-2xl">
            <Breadcrumbs
              tone="dark"
              items={[
                { name: "Home", path: routes.home },
                { name: seniorConnect.name, path: routes.seniors },
              ]}
            />
            <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-on-ink/20 bg-on-ink/5 py-1 pl-1 pr-4 font-headline text-sm font-semibold">
              <span className="rounded-full bg-brand-ondark px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-on-brand">
                {seniorConnect.badge}
              </span>
              {seniorConnect.name}
            </p>
            <h1
              id="seniors-heading"
              className="mt-6 text-balance font-headline text-5xl font-bold leading-[1.05] tracking-tighter sm:text-6xl lg:text-7xl"
            >
              Talk to someone who{" "}
              <span className="underline decoration-brand-ondark decoration-[6px] underline-offset-[10px]">
                already got in.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-ink/80">{hero.description}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={`#${STUDENT_ANCHOR}`} variant="primary-dark" size="lg">
                {audiences.student.cta}
                <ArrowDown aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href={`#${SENIOR_ANCHOR}`} variant="outline-dark" size="lg">
                <GraduationCap aria-hidden="true" />
                {audiences.senior.cta}
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-col gap-2 text-sm font-medium text-on-ink/85 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {hero.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-on-ink/60" aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <HeroChat />
        </Container>
      </section>

      {/* Problem */}
      <section aria-labelledby="problem-heading" className="py-16 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <div className="rounded-xl border-2 border-ink bg-surface-lowest p-8 shadow-hard sm:p-10">
            <p className="font-headline text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
              The problem
            </p>
            <p className="mt-4 font-headline text-7xl font-bold leading-none tracking-tighter text-brand sm:text-8xl">
              {problem.stat.value}
            </p>
            <p className="mt-5 text-lg font-medium leading-relaxed text-on-surface">{problem.stat.label}</p>
            {problem.stat.source ? (
              <p className="mt-4 text-sm text-on-surface-variant">Source: {problem.stat.source}</p>
            ) : null}
          </div>
          <div>
            <h2
              id="problem-heading"
              className="font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl"
            >
              {problem.title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{problem.body}</p>
            <ul className="mt-8 flex flex-col gap-5">
              {problem.points.map((p) => {
                const Icon = POINT_ICONS[p.icon] ?? Users;
                return (
                  <li key={p.title} className="flex gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-headline text-lg font-bold tracking-tight text-on-surface">{p.title}</h3>
                      <p className="mt-1 leading-relaxed text-on-surface-variant">{p.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>

      {/* Solution + how it works */}
      <section aria-labelledby="how-heading" className="bg-surface-low py-16 md:py-24">
        <Container>
          <SectionHeading
            id="how-heading"
            eyebrow="The solution"
            title="A senior from your dream university, one message away"
            description="During the beta our team makes every match by hand, so each introduction is checked."
          />
          <ol className="mt-12 grid gap-8 lg:grid-cols-3">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="relative rounded-xl border-2 border-brand/30 bg-surface-lowest p-6 shadow-soft sm:p-7"
              >
                <span
                  aria-hidden="true"
                  className="flex size-11 items-center justify-center rounded-full bg-brand font-headline text-lg font-bold text-on-brand"
                >
                  {i + 1}
                </span>
                <h3 className="mt-5 font-headline text-xl font-bold tracking-tight text-on-surface">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-on-surface-variant">{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Who it is for */}
      <section aria-labelledby="audiences-heading" className="py-16 md:py-24">
        <Container>
          <h2 id="audiences-heading" className="sr-only">
            Who Senior Connect is for
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {(
              [
                { key: "student", icon: Compass, anchor: STUDENT_ANCHOR, variant: "primary" },
                { key: "senior", icon: GraduationCap, anchor: SENIOR_ANCHOR, variant: "secondary" },
              ] as const
            ).map(({ key, icon: Icon, anchor, variant }) => {
              const a = audiences[key];
              return (
                <div
                  key={key}
                  className="flex flex-col rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft sm:p-8"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-brand-fixed text-brand">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-headline text-2xl font-bold tracking-tight text-on-surface">{a.title}</h3>
                  <ul className="mt-5 flex flex-1 flex-col gap-3">
                    {a.points.map((point) => (
                      <li key={point} className="flex gap-3 text-on-surface">
                        <Check className="mt-1 size-4 shrink-0 text-brand" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <ButtonLink href={`#${anchor}`} variant={variant} className="mt-8 self-start">
                    {a.cta}
                  </ButtonLink>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Join: the two sign-up forms */}
      <section aria-labelledby="join-heading" className="bg-surface-low py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="join-heading" className="font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
              Join the {seniorConnect.name} beta
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
              Choose who you are. It takes less than a minute.
            </p>
          </div>
          <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
            {(
              [
                { kind: "student", anchor: STUDENT_ANCHOR },
                { kind: "senior", anchor: SENIOR_ANCHOR },
              ] as const
            ).map(({ kind, anchor }) => {
              const f = forms[kind];
              return (
                <section
                  key={kind}
                  id={anchor}
                  aria-labelledby={`${anchor}-title`}
                  className="scroll-mt-24 rounded-xl border-2 border-ink bg-surface-lowest p-6 shadow-hard sm:p-8"
                >
                  <p className="font-headline text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
                    {f.eyebrow}
                  </p>
                  <h3
                    id={`${anchor}-title`}
                    className="mt-2 font-headline text-2xl font-bold tracking-tight text-on-surface"
                  >
                    {f.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-on-surface-variant">{f.description}</p>
                  <div className="mt-6">
                    <SignupForm kind={kind} universities={UNIVERSITY_SUGGESTIONS} />
                  </div>
                </section>
              );
            })}
          </div>
          <p className="mx-auto mt-8 flex max-w-2xl items-start justify-center gap-2 text-center text-sm leading-relaxed text-on-surface-variant">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {privacy}
          </p>
        </Container>
      </section>

      {/* FAQ */}
      <section aria-labelledby="seniors-faq-heading" className="py-16 md:py-24">
        <Container className="flex flex-col gap-10">
          <h2
            id="seniors-faq-heading"
            className="text-center font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl"
          >
            Questions about {seniorConnect.name}
          </h2>
          <FaqList items={faq} />
        </Container>
      </section>
    </>
  );
}
