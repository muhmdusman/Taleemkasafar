/**
 * Dashboard greeting. `hasActivity` toggles between a returning-user message
 * and a first-time welcome (no fake stats when the user has no attempts yet).
 * `aside` holds the next-step card, which carries the screen's main action,
 * so the greeting itself has no competing buttons.
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
    <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:items-center">
      <div className="space-y-6 lg:col-span-7 xl:col-span-8">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-lowest px-4 py-1.5 font-headline text-sm font-semibold tracking-tight text-on-surface shadow-soft">
            <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
            {testName}
          </span>
          {hasActivity && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-4 py-1.5 font-headline text-sm font-semibold tracking-tight text-on-surface">
              Keep your streak going 🔥
            </span>
          )}
        </div>

        <h1 className="font-headline text-4xl font-bold leading-[1.1] tracking-tighter text-on-surface sm:text-5xl md:text-6xl">
          {hasActivity ? (
            <>
              Ready to beat your <span className="text-brand">last score?</span>
            </>
          ) : (
            <>
              Welcome, <span className="text-brand">{displayName}.</span>
            </>
          )}
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
          {hasActivity
            ? "Pick up where you left off, or start something new. Small, steady sessions add up."
            : "Start with one chapter, check every explanation, then take a timed mock when you feel ready."}
        </p>
      </div>

      <div className="lg:col-span-5 xl:col-span-4">{aside}</div>
    </section>
  );
}
