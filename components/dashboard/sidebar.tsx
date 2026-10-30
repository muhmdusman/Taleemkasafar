"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isFocusRoute, isNavActive, routes } from "@/lib/routes";
import type { Tone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { LinkPendingIndicator } from "./link-pending";
import { focusRing } from "./styles";
import { areaTone, toneClasses } from "./tone";

type NavItem = { href: string; label: string; icon: string; tone: Tone };

// Only pages that exist: Settings stays out of the nav until it is built
// (it was a 404 dead end). Each area has its own soft tone.
const NAV: NavItem[] = [
  { href: routes.dashboard, label: "Home", icon: "dashboard", tone: areaTone.home },
  { href: routes.subjects, label: "My Subjects", icon: "menu_book", tone: areaTone.subjects },
  { href: routes.mocks, label: "Mock Tests", icon: "quiz", tone: areaTone.mocks },
  { href: routes.performance, label: "Progress", icon: "insights", tone: areaTone.progress },
];

const itemBase = cn(
  "flex items-center gap-3 rounded-xl px-3 py-2.5 font-headline text-[15px] font-semibold tracking-tight transition-colors motion-reduce:transition-none",
  focusRing,
);
const itemIdle = "text-on-surface-variant hover:bg-surface-container hover:text-on-surface";

/** Fixed left sidebar (desktop). Hidden on full-screen study routes. */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (isFocusRoute(pathname)) return null;

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col gap-4 border-r border-outline-variant bg-surface-lowest p-4 md:flex">
      <div className="mb-6 flex flex-col gap-1 px-3 pt-2">
        <span className="font-headline text-xl font-bold tracking-tight text-on-surface">
          Taleem ka Safar
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          Entry Test Prep
        </span>
      </div>

      <nav aria-label="Dashboard" className="flex flex-grow flex-col gap-1">
        {NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          const tone = toneClasses[item.tone];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(itemBase, active ? tone.chip : itemIdle)}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  active ? tone.solid : tone.tile,
                )}
              >
                <LinkPendingIndicator>
                  <Icon name={item.icon} filled={active} className="text-xl" />
                </LinkPendingIndicator>
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant pt-4">
        {/* The contact page is the help channel until a help center exists. */}
        <Link href={routes.contact} className={cn(itemBase, itemIdle)}>
          <span className="flex size-8 items-center justify-center">
            <Icon name="help" />
          </span>
          Help &amp; Contact
        </Link>
        <button
          type="button"
          onClick={logout}
          className={cn(itemBase, itemIdle, "text-left")}
        >
          <span className="flex size-8 items-center justify-center">
            <Icon name="logout" />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}
