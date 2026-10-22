import { Ban, HandCoins, Users, type LucideIcon } from "lucide-react";
import { PRICE_CAP_PKR } from "@/config/pricing";
import { Container, SectionHeading } from "@/components/marketing/container";

type PainPoint = {
  icon: LucideIcon;
  problem: string;
  title: string;
  description: string;
  /** Honest status: features not in the product yet are labelled. */
  comingSoon?: boolean;
};

/** The three problems Taleem ka Safar solves (owner wording, 2026-10-23). */
const PAIN_POINTS: PainPoint[] = [
  {
    icon: HandCoins,
    problem: "Good prep is expensive",
    title: "Quality content without the price tag",
    description: `Free for students, and never more than Rs ${PRICE_CAP_PKR} if a fee is ever added. Every student in Pakistan gets the same quality preparation, whatever their city, school or background.`,
  },
  {
    icon: Users,
    problem: "No one to guide you",
    title: "Guidance from seniors at your dream university",
    description:
      "No cousin or elder brother studying where you want to go? Connect with university seniors who already got admission and ask them what really works.",
    comingSoon: true,
  },
  {
    icon: Ban,
    problem: "Ads ruin focus",
    title: "No ads. Just practice.",
    description:
      "No pop-ups or banners in the middle of a question. Your attention stays on preparing, not on closing ads.",
  },
];

/** "Why Taleem ka Safar": the three pain points, right below the hero. */
export function PainPoints() {
  return (
    <section aria-labelledby="pain-points-heading" className="border-y border-outline-variant bg-surface-lowest py-16 md:py-20">
      <Container>
        <SectionHeading
          id="pain-points-heading"
          eyebrow="Why Taleem ka Safar"
          title="Built to fix what holds students back"
          description="Three problems almost every entry-test student in Pakistan faces, and how we solve them."
        />
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {PAIN_POINTS.map(({ icon: Icon, problem, title, description, comingSoon }) => (
            <li
              key={title}
              className="flex flex-col rounded-2xl border border-outline-variant bg-surface p-6 sm:p-7"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-brand text-on-brand">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-5 text-sm font-medium text-on-surface-variant">
                <span className="sr-only">Problem: </span>
                {problem}
              </p>
              <h3 className="mt-1 font-headline text-xl font-bold tracking-tight text-on-surface">
                {title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-on-surface-variant">{description}</p>
              {comingSoon ? (
                <p className="mt-5 self-start rounded-full border border-outline-variant px-3 py-1 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                  Coming soon
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
