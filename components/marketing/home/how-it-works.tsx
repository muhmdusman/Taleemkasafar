import { ChevronDown, ChevronRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/marketing/container";

const STEPS = [
  {
    title: "Create your free account",
    description: "Sign up in a minute. It's free for students, no card or payment needed.",
  },
  {
    title: "Pick your entry test",
    description: "Choose the test you are sitting, and your subjects and chapters are ready.",
  },
  {
    title: "Practise and take mocks",
    description:
      "Work through chapters with an explanation for every wrong answer, then sit timed mock tests.",
  },
  {
    title: "Track progress, fix weak areas",
    description: "See accuracy by subject and chapter, and spend your time where it counts.",
  },
];

/**
 * Step timeline as a semantic ordered list (server-rendered, no client JS).
 * The @esuiss Trace component was evaluated here and not used: see
 * .agents/tasks/marketing-phase1-verification.md.
 */
export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="bg-surface-low py-16 md:py-24">
      <Container>
        <SectionHeading
          id="how-heading"
          eyebrow="How it works"
          title="From sign-up to test day in four steps"
        />
        <ol className="mt-12 grid gap-8 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-xl border-2 border-brand/30 bg-surface-lowest p-6 shadow-soft"
            >
              {/* Progress connector to the next step: down on mobile, right on desktop. */}
              {i < STEPS.length - 1 ? (
                <>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-[42px] top-full flex h-8 flex-col items-center lg:hidden"
                  >
                    <span className="w-0.5 flex-1 bg-brand" />
                    <ChevronDown className="-mt-1.5 size-4 text-brand" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-full top-[36px] hidden w-8 items-center lg:flex"
                  >
                    <span className="h-0.5 flex-1 bg-brand" />
                    <ChevronRight className="-ml-1.5 size-4 text-brand" />
                  </span>
                </>
              ) : null}
              <span
                className="flex size-10 items-center justify-center rounded-full bg-brand font-headline text-base font-bold text-on-brand"
                aria-hidden="true"
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
  );
}
