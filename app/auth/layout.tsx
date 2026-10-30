import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { LogoMark } from "@/components/marketing/logo-mark";
import { appButton, focusRing } from "@/components/dashboard/styles";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Shared shell for auth screens: fixed brand header + centered content area.
 * Same palette (`theme-public`) and rounded style as the landing page and the
 * dashboard (.kiro/context/DESIGN.md §13). Icons are lucide (no icon font),
 * so the login form renders without waiting on an external font.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-public flex min-h-svh flex-col bg-surface-low font-body text-on-surface">
      <header className="fixed top-0 z-50 w-full border-b border-outline-variant bg-surface-lowest/90 backdrop-blur supports-[backdrop-filter]:bg-surface-lowest/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6 md:h-20">
          <Link
            href={routes.home}
            aria-label="Taleem ka Safar, home"
            className={cn("flex items-center gap-3 rounded-xl", focusRing)}
          >
            <LogoMark label={null} />
            <span className="font-headline text-lg font-bold tracking-tight text-on-surface">
              Taleem ka Safar
            </span>
          </Link>
          <Link href={routes.contact} className={appButton({ variant: "secondary", size: "sm" })}>
            <LifeBuoy className="size-4" aria-hidden="true" />
            Help
          </Link>
        </div>
      </header>

      <main className="flex flex-grow items-center justify-center px-4 pb-12 pt-28">
        {children}
      </main>

      <footer className="mt-auto p-8 text-center text-xs text-on-surface-variant">
        © 2026 Taleem ka Safar. All rights reserved.
      </footer>
    </div>
  );
}
