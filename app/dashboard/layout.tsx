import { Suspense } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { MaterialSymbolsFont } from "@/components/material-symbols-font";

/**
 * Shell for all authenticated dashboard pages: fixed sidebar (desktop),
 * bottom nav (mobile), and a content area offset for the fixed chrome.
 * Auth is enforced by proxy.ts (deny-by-default: everything outside the
 * public allowlist in lib/routes.ts requires login); pages also verify on the
 * server.
 *
 * The nav components read usePathname() (dynamic); they're wrapped in Suspense
 * so that dynamic read doesn't block page rendering under Cache Components.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-surface font-body text-on-surface">
      <MaterialSymbolsFont />
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar />
      </Suspense>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
      <div className="md:ml-64">{children}</div>
    </div>
  );
}

function SidebarFallback() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r-2 border-ink bg-surface-lowest md:block" />
  );
}
