import { Icon } from "./icon";
import { avatarInitial } from "@/lib/queries/dashboard-helpers";
import { EntryTestSelector } from "./entry-test-selector";
import { appButton } from "./styles";
import { cn } from "@/lib/utils";
import type { EntryTest } from "@/lib/queries/entry-test";

const headerShell =
  "fixed left-0 right-0 top-0 z-30 h-20 border-b border-outline-variant bg-surface-lowest/90 backdrop-blur supports-[backdrop-filter]:bg-surface-lowest/80 md:left-64";

/**
 * Top header for the dashboard shell. Left: page title. Center: entry-test
 * selector. Right: search + avatar.
 */
export function DashboardHeader({
  title,
  badge,
  displayName,
  tests,
  activeTestId,
}: {
  title: string;
  badge?: string;
  displayName: string;
  tests: EntryTest[];
  activeTestId: string;
}) {
  const initial = avatarInitial(displayName);
  return (
    <header className={`${headerShell} flex items-center justify-between px-6 md:px-8`}>
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate font-headline text-xl font-bold tracking-tight text-on-surface md:text-2xl">
          {title}
        </h1>
        {badge && (
          <span className="hidden shrink-0 rounded-full bg-surface-container px-3 py-1 font-headline text-xs font-semibold text-on-surface lg:inline">
            {badge}
          </span>
        )}
      </div>

      {/* Center: entry-test selector */}
      <div className="absolute left-1/2 hidden -translate-x-1/2 sm:block">
        <EntryTestSelector tests={tests} activeId={activeTestId} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Search"
          className={cn(appButton({ variant: "secondary", size: "sm" }), "w-9 px-0")}
        >
          <Icon name="search" className="text-xl" />
        </button>
        <div
          role="img"
          className="flex size-9 items-center justify-center rounded-full bg-brand-fixed font-headline font-bold text-brand-container"
          aria-label={`Signed in as ${displayName}`}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}

/** Empty header bar for Suspense fallbacks (same size, no content). */
export function DashboardHeaderFallback() {
  return <div className={headerShell} />;
}
