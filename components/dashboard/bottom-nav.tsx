"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { focusRing } from "./styles";

const ITEMS = [
  { href: routes.dashboard, label: "Home", icon: "dashboard" },
  { href: routes.subjects, label: "Subjects", icon: "menu_book" },
  { href: routes.mocks, label: "Tests", icon: "quiz" },
  { href: routes.performance, label: "Progress", icon: "insights" },
];

/** Mobile-only bottom navigation bar. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Dashboard"
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-outline-variant bg-surface-lowest/95 backdrop-blur supports-[backdrop-filter]:bg-surface-lowest/85 md:hidden"
    >
      {ITEMS.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1",
              focusRing,
              active ? "text-brand-container" : "text-on-surface-variant",
            )}
          >
            {/* Active item gets a soft pill behind the icon. */}
            <span
              className={cn(
                "flex h-7 w-12 items-center justify-center rounded-full transition-colors motion-reduce:transition-none",
                active && "bg-brand-fixed",
              )}
            >
              <Icon name={item.icon} filled={active} />
            </span>
            <span className="text-[11px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
