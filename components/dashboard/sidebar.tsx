"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { isNavActive, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { focusRing } from "./styles";

type NavItem = { href: string; label: string; icon: string };

// Only pages that exist: Settings stays out of the nav until it is built
// (it was a 404 dead end).
const NAV: NavItem[] = [
  { href: routes.dashboard, label: "Home", icon: "dashboard" },
  { href: routes.subjects, label: "My Subjects", icon: "menu_book" },
  { href: routes.mocks, label: "Mock Tests", icon: "quiz" },
  { href: routes.performance, label: "Performance", icon: "insights" },
];

const itemBase = cn(
  "flex items-center gap-3 rounded-xl px-3 py-2.5 font-headline text-[15px] font-semibold tracking-tight transition-colors motion-reduce:transition-none",
  focusRing,
);
const itemIdle = "text-on-surface-variant hover:bg-surface-container hover:text-on-surface";
/** Active page: light blue tint, the sidebar's one blue highlight. */
const itemActive = "bg-brand-fixed text-brand-container";

/** Fixed left sidebar (desktop). Brand = Taleem ka Safar. */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(itemBase, active ? itemActive : itemIdle)}
            >
              <Icon name={item.icon} filled={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant pt-4">
        {/* The contact page is the help channel until a help center exists. */}
        <Link href={routes.contact} className={cn(itemBase, itemIdle)}>
          <Icon name="help" />
          Help &amp; Contact
        </Link>
        <button
          type="button"
          onClick={logout}
          className={cn(itemBase, itemIdle, "text-left")}
        >
          <Icon name="logout" />
          Logout
        </button>
      </div>
    </aside>
  );
}
