import Link from "next/link";
import { LogoMark } from "@/components/marketing/logo-mark";
import { avatarInitial } from "@/lib/queries/dashboard-helpers";
import type { EntryTest } from "@/lib/queries/entry-test";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { EntryTestSelector } from "./entry-test-selector";
import { focusRing, skeleton } from "./styles";

const headerShell =
  "fixed left-0 right-0 top-0 z-30 h-16 border-b border-outline-variant bg-surface-lowest/90 backdrop-blur supports-[backdrop-filter]:bg-surface-lowest/80 md:left-64 md:h-20";

/**
 * Top header for the dashboard shell. Left: logo (mobile, where there is no
 * sidebar) + page title. Right: the entry-test dropdown (every size) + avatar.
 */
export function DashboardHeader({
  title,
  displayName,
  tests,
  activeTestId,
}: {
  title: string;
  displayName: string;
  tests: EntryTest[];
  activeTestId: string;
}) {
  const initial = avatarInitial(displayName);
  return (
    <header className={cn(headerShell, "flex items-center justify-between gap-3 px-4 sm:px-6 md:px-8")}>
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={routes.dashboard}
          aria-label="Taleem ka Safar, dashboard home"
          className={cn("shrink-0 rounded-lg md:hidden", focusRing)}
        >
          <LogoMark label={null} className="size-8" />
        </Link>
        <h1 className="truncate font-headline text-lg font-bold tracking-tight text-on-surface sm:text-xl md:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <EntryTestSelector tests={tests} activeId={activeTestId} />
        <div
          role="img"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tone-violet-soft font-headline font-bold text-tone-violet"
          aria-label={`Signed in as ${displayName}`}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}

/** Header-shaped placeholder for Suspense fallbacks (title + selector + avatar). */
export function DashboardHeaderFallback() {
  return (
    <div className={cn(headerShell, "flex items-center justify-between gap-3 px-4 sm:px-6 md:px-8")} aria-hidden="true">
      <div className={cn(skeleton, "h-6 w-32 rounded-lg")} />
      <div className="flex items-center gap-3">
        <div className={cn(skeleton, "h-10 w-28 rounded-xl sm:w-36")} />
        <div className={cn(skeleton, "size-9 rounded-full")} />
      </div>
    </div>
  );
}
