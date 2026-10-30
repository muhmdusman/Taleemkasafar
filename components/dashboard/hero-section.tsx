import Link from "next/link";
import { routes } from "@/lib/routes";
import type { Tone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { LinkPendingIndicator } from "./link-pending";
import { focusRing } from "./styles";
import { areaTone, toneClasses } from "./tone";

const SHORTCUTS: { href: string; label: string; icon: string; tone: Tone }[] = [
  { href: routes.subjects, label: "Practise a chapter", icon: "menu_book", tone: areaTone.subjects },
  { href: routes.mocks, label: "Mock tests", icon: "quiz", tone: areaTone.mocks },
  { href: routes.performance, label: "My progress", icon: "insights", tone: areaTone.progress },
];

/**
 * Dashboard greeting on a soft blue panel. `hasActivity` toggles between a
 * returning-user message and a first-time welcome (no fake stats). `aside`
 * holds the next-step card, which carries the screen's one main action; the
 * shortcuts below the greeting are quiet, tinted links to every area.
 */
export function HeroSection({
  displayName,
  testName,
  hasActivity,
  aside,
}: {
  displayName: string;
  testName: string;
  hasActivity: boolean;
  aside: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby="greeting"
      className="relative overflow-hidden rounded-3xl border border-tone-blue/15 bg-tone-blue-soft p-5 sm:p-8 lg:p-10"
    >
      {/* Decorative soft shapes. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-tone-violet/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full bg-tone-teal/10"
      />

      <div className="relative grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:items-center">
        <div className="space-y-5 lg:col-span-7 xl:col-span-8">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-lowest px-4 py-1.5 font-headline text-sm font-semibold tracking-tight text-on-surface shadow-soft">
              <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
              {testName}
            </span>
            {hasActivity && (
              <span className="inline-flex items-center gap-1 rounded-full bg-tone-amber-soft px-4 py-1.5 font-headline text-sm font-semibold tracking-tight text-tone-amber">
                Keep your streak going 🔥
              </span>
            )}
          </div>

          <h2
            id="greeting"
            className="font-headline text-3xl font-bold leading-[1.1] tracking-tighter text-on-surface sm:text-4xl md:text-5xl"
          >
            {hasActivity ? (
              <>
                Ready to beat your <span className="text-brand">last score?</span>
              </>
            ) : (
              <>
                Welcome, <span className="text-brand">{displayName}.</span>
              </>
            )}
          </h2>

          <p className="max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
            {hasActivity
              ? "Pick up where you left off, or start something new. Small, steady sessions add up."
              : "Start with one chapter, check every explanation, then take a timed mock when you feel ready."}
          </p>

          <nav aria-label="Shortcuts" className="flex flex-wrap gap-2 pt-1">
            {SHORTCUTS.map((s) => {
              const tone = toneClasses[s.tone];
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-xl border border-outline-variant bg-surface-lowest px-3 font-headline text-sm font-semibold tracking-tight text-on-surface shadow-soft transition-colors motion-reduce:transition-none",
                    tone.hoverBorder,
                    focusRing,
                  )}
                >
                  <span className={cn("flex size-6 items-center justify-center rounded-md", tone.tile)}>
                    <LinkPendingIndicator>
                      <Icon name={s.icon} className="text-base" />
                    </LinkPendingIndicator>
                  </span>
                  {s.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="lg:col-span-5 xl:col-span-4">{aside}</div>
      </div>
    </section>
  );
}
