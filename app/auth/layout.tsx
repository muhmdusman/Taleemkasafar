import Link from "next/link";
import { MaterialSymbolsFont } from "@/components/material-symbols-font";

/**
 * Shared shell for auth screens: fixed brand header + centered content area,
 * in the Soft Brutalism style. Brand is "Taleem ka Safar".
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-surface font-body text-on-surface">
      <MaterialSymbolsFont />
      <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b-2 border-ink bg-surface-lowest px-6">
        <Link
          href="/"
          className="font-headline text-2xl font-bold uppercase tracking-tighter text-on-surface"
        >
          Taleem ka Safar
        </Link>
        <Link
          href="/"
          className="border-2 border-ink px-4 py-2 font-headline text-sm font-bold uppercase tracking-tight transition-colors hover:bg-surface-container"
        >
          Help Center
        </Link>
      </header>

      <main className="flex flex-grow items-center justify-center px-4 pb-12 pt-28">
        {children}
      </main>

      <footer className="mt-auto p-8 text-center text-[10px] font-bold uppercase tracking-widest text-outline">
        © 2026 Taleem ka Safar. All rights reserved.
      </footer>
    </div>
  );
}
