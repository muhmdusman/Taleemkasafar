"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { marketingButton, prefetchFor } from "@/components/marketing/button-link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { isNavActive } from "@/lib/routes";
import { useSignedIn } from "@/lib/hooks/use-signed-in";
import { cn } from "@/lib/utils";

export type MobileMenuSheetProps = {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where focus returns when the sheet closes (the trigger button). */
  returnFocusTo: React.RefObject<HTMLButtonElement | null>;
};

/**
 * Mobile slide-over menu (shadcn Sheet = Radix Dialog: focus trap, Esc to
 * close). Loaded lazily by `MobileNav` on the first open, so desktop and
 * never-opening visitors don't download or hydrate Radix Dialog.
 */
export default function MobileMenuSheet({
  id,
  open,
  onOpenChange,
  returnFocusTo,
}: MobileMenuSheetProps) {
  const pathname = usePathname();
  const isSignedIn = useSignedIn();
  const { auth } = siteConfig;
  // Signed in: Access dashboard + Start practice; otherwise Register + Sign in.
  const [primary, secondary] = isSignedIn
    ? [auth.dashboard, auth.practice]
    : [auth.register, auth.signIn];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id={id}
        side="right"
        // No Radix Trigger (the trigger lives outside this lazy chunk), so
        // return focus to it by hand.
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo.current?.focus();
        }}
        // `theme-public`: the Sheet is portaled outside the marketing layout.
        className="theme-public flex w-[85vw] max-w-sm flex-col gap-6 rounded-l-2xl border-l border-outline-variant bg-surface-lowest p-6 text-on-surface"
      >
        <div className="flex min-h-11 items-center pr-12">
          <SheetTitle className="font-headline text-lg font-bold tracking-tight text-on-surface">
            Menu
          </SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation and account links
          </SheetDescription>
        </div>
        <nav aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {siteConfig.nav.map((link) => {
              const active = isNavActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <SheetClose asChild>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-xl px-4 py-3 text-base font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container",
                        active && "bg-surface-container font-semibold",
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          {[primary, secondary].map((cta, i) => (
            <SheetClose asChild key={cta.href}>
              <Link
                href={cta.href}
                prefetch={prefetchFor(cta.href)}
                className={marketingButton({
                  variant: i === 0 ? "primary" : "secondary",
                  size: "md",
                })}
              >
                {cta.label}
              </Link>
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
