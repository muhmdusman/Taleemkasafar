"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";

const ITEMS = [
  { href: "/", label: "Home", icon: "dashboard" },
  { href: "/subjects", label: "Subjects", icon: "menu_book" },
  { href: "/mock", label: "Tests", icon: "quiz" },
  { href: "/performance", label: "Profile", icon: "person" },
];

/** Mobile-only bottom navigation bar. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t-2 border-black bg-white md:hidden">
      {ITEMS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 ${active ? "text-brand" : "text-black opacity-50"}`}
          >
            <Icon name={item.icon} filled={active} />
            <span className="text-[10px] font-bold uppercase">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
