import { Icon } from "./icon";
import { avatarInitial } from "@/lib/queries/dashboard-helpers";

/**
 * Top header for the dashboard shell. Sits to the right of the sidebar on
 * desktop, full width on mobile.
 */
export function DashboardHeader({
  title,
  badge,
  displayName,
}: {
  title: string;
  badge?: string;
  displayName: string;
}) {
  const initial = avatarInitial(displayName);
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-20 items-center justify-between border-b-2 border-black bg-white px-6 md:left-64 md:px-8">
      <div className="flex items-center gap-4">
        <h1 className="font-headline text-2xl font-bold uppercase tracking-tighter text-black">
          {title}
        </h1>
        {badge && (
          <span className="hidden border-2 border-black bg-brand-fixed px-2 py-1 text-xs font-bold text-[#001a42] sm:inline">
            {badge}
          </span>
        )}
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
