import Link from "next/link";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { SectionHeading } from "./section-heading";
import { cardInteractive } from "./styles";

const CHALLENGES = [
  {
    href: routes.mocks,
    icon: "description",
    title: "Full Mock Test",
    subtitle: "Timed, multi-subject paper",
  },
  {
    href: routes.subjects,
    icon: "category",
    title: "Subject-wise Practice",
    subtitle: "Focus on one subject",
  },
  {
    href: routes.subjects,
    icon: "psychology",
    title: "Topic Practice",
    subtitle: "Master one chapter at a time",
  },
];

/** "Choose your challenge" — entry points into the study modes. */
export function ChallengeSection() {
  return (
    <section>
      <SectionHeading>Choose Your Challenge</SectionHeading>

      <div className="flex flex-col gap-4">
        {CHALLENGES.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className={cn(cardInteractive, "group flex items-center justify-between gap-4 p-5 md:p-6")}
          >
            <div className="flex items-center gap-4 md:gap-5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand-fixed text-brand-container">
                <Icon name={c.icon} className="text-3xl" />
              </span>
              <div>
                <p className="font-headline text-lg font-bold leading-tight tracking-tight text-on-surface md:text-xl">
                  {c.title}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">{c.subtitle}</p>
              </div>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">
              <Icon name="arrow_forward" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
