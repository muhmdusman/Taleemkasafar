import Link from "next/link";
import type { NavLink } from "@/config/site";
import { isNavActive } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Small "Beta"-style pill next to a nav label. */
export function NavBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 align-middle font-headline text-[10px] font-bold uppercase leading-none tracking-wider text-on-brand">
      {children}
    </span>
  );
}

export const desktopLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container";
export const desktopActiveClass = "bg-surface-container font-semibold text-on-surface";

type NavLinksProps = {
  links: readonly NavLink[];
  /** Current path; `null` while unknown (Suspense fallback) = no active link. */
  pathname: string | null;
  className?: string;
  linkClassName?: string;
  activeClassName?: string;
};

/** Plain list of nav links with `aria-current="page"` on the active one. */
export function NavLinks({
  links,
  pathname,
  className,
  linkClassName,
  activeClassName,
}: NavLinksProps) {
  return (
    <ul className={className}>
      {links.map((link) => {
        const active = pathname !== null && isNavActive(pathname, link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(linkClassName, active && activeClassName)}
            >
              {link.label}
              {link.badge ? <NavBadge>{link.badge}</NavBadge> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
