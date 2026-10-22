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
        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft"
            >
              <span
                className="flex size-10 items-center justify-center rounded-full bg-ink font-headline text-base font-bold text-on-ink"
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
