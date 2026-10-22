"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  NavLinks,
  desktopActiveClass,
  desktopLinkClass,
} from "@/components/marketing/nav-links";
import { marketingButton } from "@/components/marketing/button-link";
import { cn } from "@/lib/utils";

/** Desktop nav links with the active state (reads the pathname). */
export function DesktopNavLinks() {
  const pathname = usePathname();
  return (
    <NavLinks
      links={siteConfig.nav}
      pathname={pathname}
      className="flex items-center gap-1"
      linkClassName={desktopLinkClass}
      activeClassName={desktopActiveClass}
    />
  );
}

const loadSheet = () => import("@/components/marketing/mobile-menu-sheet");
// Radix Dialog + the menu are only fetched/hydrated after the first open.
const MobileMenuSheet = dynamic(loadSheet, { ssr: false });

const MENU_ID = "mobile-menu";

/**
 * Mobile menu trigger. A plain <button> (tiny island); the Sheet chunk is
 * preloaded on hover/focus/touch and mounted on the first click.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={MENU_ID}
        onPointerEnter={loadSheet}
        onFocus={loadSheet}
        onTouchStart={loadSheet}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        className={cn(marketingButton({ variant: "ghost", size: "sm" }), "size-11 px-0")}
      >
        <Menu aria-hidden="true" />
      </button>
      {mounted ? (
        <MobileMenuSheet
          id={MENU_ID}
          open={open}
          onOpenChange={setOpen}
          returnFocusTo={triggerRef}
        />
      ) : null}
    </>
  );
}
