import {
  BarChart3,
  BookOpenCheck,
  Calculator,
  FileClock,
  Lightbulb,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { Container, SectionHeading } from "@/components/marketing/container";

type Feature = { icon: LucideIcon; title: string; description: string };

const FEATURES: Feature[] = [
  {
    icon: BookOpenCheck,
    title: "Chapter-wise practice",
    description:
      "MCQs organised by subject and chapter, so you can master one topic at a time on your phone or laptop.",
  },
  {
    icon: Lightbulb,
    title: "Explanations for every wrong answer",
    description:
      "Don't just see the right option. Understand why your answer was wrong, right after you attempt.",
  },
  {
    icon: Timer,
    title: "Timed mock tests",
    description: "Full papers that follow the real test pattern and clock, so test day feels familiar.",
  },
  {
    icon: BarChart3,
    title: "Performance analytics",
    description: "Accuracy by subject and chapter shows exactly what to revise next.",
  },
  {
    icon: FileClock,
    title: "Past papers",
    description: "Practise with questions in the style of previous entry tests.",
  },
  {
    icon: Calculator,
    title: "Merit calculator",
    description: "Estimate your aggregate for 18 universities from your marks.",
  },
];

export function Features() {
  return (
    <section aria-labelledby="features-heading" className="py-16 md:py-24">
      <Container>
        <SectionHeading
          id="features-heading"
          eyebrow="Features"
          title="Everything you need to prepare, in one place"
          description="Stop juggling books, notes and random PDFs. Practise, test yourself and see your progress without leaving one platform."
        />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft"
            >
              {/* Light sky-blue tile: the one blue accent per card. */}
              <span className="flex size-12 items-center justify-center rounded-xl bg-brand-fixed text-brand-container">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-headline text-lg font-bold tracking-tight text-on-surface">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
