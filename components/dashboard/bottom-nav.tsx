"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isFocusRoute, isNavActive, routes } from "@/lib/routes";
import type { Tone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { LinkPendingIndicator } from "./link-pending";
import { focusRing } from "./styles";
import { areaTone, toneClasses } from "./tone";

const ITEMS: { href: string; label: string; icon: string; tone: Tone }[] = [
  { href: routes.dashboard, label: "Home", icon: "dashboard", tone: areaTone.home },
  { href: routes.subjects, label: "Subjects", icon: "menu_book", tone: areaTone.subjects },
  { href: routes.mocks, label: "Tests", icon: "quiz", tone: areaTone.mocks },
  { href: routes.performance, label: "Progress", icon: "insights", tone: areaTone.progress },
];

/** Mobile-only bottom navigation bar. Hidden on full-screen study routes. */
export function BottomNav() {
  const pathname = usePathname();
  if (isFocusRoute(pathname)) return null;

  return (
    <nav
      aria-label="Dashboard"
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-outline-variant bg-surface-lowest/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-surface-lowest/85 md:hidden"
    >
      {ITEMS.map((item) => {
        const active = isNavActive(pathname, item.href);
        const tone = toneClasses[item.tone];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-2 py-1",
              focusRing,
              active ? tone.text : "text-on-surface-variant",
            )}
          >
            {/* Active item gets a soft tinted pill behind the icon. */}
            <span
              className={cn(
                "flex h-7 w-12 items-center justify-center rounded-full transition-colors motion-reduce:transition-none",
                active && tone.tile,
              )}
            >
              <LinkPendingIndicator>
                <Icon name={item.icon} filled={active} />
              </LinkPendingIndicator>
            </span>
            <span className="text-[11px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
