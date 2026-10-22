"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, routes } from "@/lib/routes";
import { Icon } from "./icon";

const ITEMS = [
  { href: routes.dashboard, label: "Home", icon: "dashboard" },
  { href: routes.subjects, label: "Subjects", icon: "menu_book" },
  { href: routes.mocks, label: "Tests", icon: "quiz" },
  { href: routes.performance, label: "Profile", icon: "person" },
];

/** Mobile-only bottom navigation bar. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t-2 border-ink bg-surface-lowest md:hidden">
      {ITEMS.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 ${active ? "text-brand" : "text-on-surface opacity-50"}`}
          >
            <Icon name={item.icon} filled={active} />
            <span className="text-[10px] font-bold uppercase">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
