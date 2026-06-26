import { Icon } from "./icon";
import { avatarInitial } from "@/lib/queries/dashboard-helpers";
import { EntryTestSelector } from "./entry-test-selector";
import type { EntryTest } from "@/lib/queries/entry-test";

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
    <header className="fixed left-0 right-0 top-0 z-30 flex h-20 items-center justify-between border-b-2 border-black bg-white px-6 md:left-64 md:px-8">
      <div className="flex items-center gap-4">
        <h1 className="font-headline text-2xl font-bold uppercase tracking-tighter text-black">
          {title}
        </h1>
        {badge && (
          <span className="hidden border-2 border-black bg-brand-fixed px-2 py-1 text-xs font-bold text-[#001a42] lg:inline">
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
          className="flex h-10 w-10 items-center justify-center border-2 border-black transition-colors hover:bg-surface-container"
        >
          <Icon name="search" />
        </button>
        <div
          className="flex h-10 w-10 items-center justify-center border-2 border-black bg-brand-fixed font-headline font-bold text-[#001a42]"
          aria-label={`Signed in as ${displayName}`}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
