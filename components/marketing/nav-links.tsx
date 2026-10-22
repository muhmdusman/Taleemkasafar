import Link from "next/link";
import type { NavLink } from "@/config/site";
import { isNavActive } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
