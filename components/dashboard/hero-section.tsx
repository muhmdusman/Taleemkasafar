import Link from "next/link";
import { routes } from "@/lib/routes";
import { Icon } from "./icon";
import { appButton } from "./styles";

/**
 * Dashboard hero. `hasActivity` toggles between a returning-user message and a
 * first-time welcome (no fake stats when the user has no attempts yet).
 */
export function HeroSection({
  displayName,
  testName,
  hasActivity,
}: {
  displayName: string;
  testName: string;
  hasActivity: boolean;
}) {
  return (
    <section className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
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
          Practice by chapter, attempt past papers, and take full mock tests.
          Your path to peak performance starts here.
        </p>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link href={routes.mocks} className={appButton({ size: "lg" })}>
            Start Mock Test
            <Icon name="arrow_forward" className="text-xl" />
          </Link>
          <Link
            href={routes.subjects}
            className={appButton({ variant: "secondary", size: "lg" })}
          >
            Practice by Topic
          </Link>
        </div>
      </div>

      <div className="hidden lg:col-span-4 lg:block">
        <div className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-outline-variant bg-surface-lowest p-6 text-center shadow-soft-lg">
          <span className="mb-5 flex size-20 items-center justify-center rounded-2xl bg-brand-fixed text-brand-container">
            <Icon name="rocket_launch" filled className="text-5xl" />
          </span>
          <div className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            Let&apos;s go
          </div>
          <div className="mt-1 text-sm text-on-surface-variant">
            Start preparing today
          </div>
        </div>
      </div>
    </section>
  );
}
