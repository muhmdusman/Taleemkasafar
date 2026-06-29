import Link from "next/link";
import { Icon } from "./icon";

const CHALLENGES = [
  {
    href: "/mock",
    icon: "description",
    title: "Full Mock Test",
    subtitle: "Timed, multi-subject paper",
  },
  {
    href: "/subjects",
    icon: "category",
    title: "Subject-wise Practice",
    subtitle: "Focus on one subject",
  },
  {
    href: "/subjects",
    icon: "psychology",
    title: "Topic Practice",
    subtitle: "Master one chapter at a time",
  },
];

/** "Choose your challenge" — entry points into the study modes. */
export function ChallengeSection() {
  return (
    <section>
      <div className="mb-8 flex items-center gap-4">
        <h2 className="font-headline text-4xl font-bold uppercase tracking-tight">
          Choose Your Challenge
        </h2>
        <div className="h-1 flex-grow bg-black" />
      </div>

      <div className="flex flex-col gap-4">
        {CHALLENGES.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="flex cursor-pointer items-center justify-between border-4 border-black bg-white p-6 shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center bg-black">
                <Icon name={c.icon} className="text-3xl text-white" />
              </div>
              <div>
                <p className="font-headline text-2xl font-bold uppercase leading-none">
                  {c.title}
                </p>
                <p className="mt-1 font-body text-sm font-bold opacity-60">
                  {c.subtitle}
                </p>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-brand text-white">
              <Icon name="arrow_forward" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
