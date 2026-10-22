import Link from "next/link";
import { routes } from "@/lib/routes";
import { Icon } from "./icon";

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
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1 border-2 border-ink bg-brand-fixed px-3 py-1 text-sm font-bold uppercase text-on-surface">
            {testName}
          </span>
          {hasActivity && (
            <span className="flex items-center gap-1 border-2 border-ink bg-surface-variant px-3 py-1 text-sm font-bold uppercase">
              Keep your streak going 🔥
            </span>
          )}
        </div>

        <h1 className="font-headline text-5xl font-bold uppercase leading-none tracking-tighter md:text-7xl">
          {hasActivity ? (
            <>
              Ready to beat your <span className="italic text-brand">last score?</span>
            </>
          ) : (
            <>
              Welcome, <span className="italic text-brand">{displayName}.</span>
            </>
          )}
        </h1>

        <p className="max-w-xl text-xl font-medium text-on-surface-variant">
          Practice by chapter, attempt past papers, and take full mock tests.
          Your path to peak performance starts here.
        </p>

        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href={routes.mocks}
            className="border-2 border-ink bg-ink px-8 py-5 font-headline text-xl font-bold uppercase text-on-ink shadow-hard transition-all hover:translate-x-1 hover:translate-y-1 hover:bg-brand hover:shadow-none"
          >
            Start Mock Test ⚡
          </Link>
          <Link
            href={routes.subjects}
            className="border-2 border-ink bg-surface-lowest px-8 py-5 font-headline text-xl font-bold uppercase text-on-surface transition-all hover:bg-surface-high"
          >
            Practice by Topic
          </Link>
        </div>
      </div>

      <div className="hidden lg:col-span-4 lg:block">
        <div className="relative">
          <div className="absolute inset-0 translate-x-4 translate-y-4 border-2 border-ink bg-brand-fixed" />
          <div className="relative flex aspect-square flex-col items-center justify-center border-2 border-ink bg-surface-lowest p-6 text-center">
            <Icon
              name="rocket_launch"
              filled
              className="mb-4 text-8xl text-brand"
            />
            <div className="mb-1 font-headline text-3xl font-bold uppercase">
              Let&apos;s Go
            </div>
            <div className="text-sm font-bold uppercase opacity-60">
              Start preparing today
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
