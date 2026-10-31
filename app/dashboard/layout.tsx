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
 * `theme-public` gives the dashboard the same palette as the landing page
 * (app/globals.css, .kiro/context/DESIGN.md §12); `theme-app` adds clearer
 * card edges (§14). The canvas is the light grey `surface-low` so white cards
 * stand out. The sidebar and bottom nav hide themselves on full-screen study
 * routes (practice, past paper, a mock sitting).
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
    <div className="theme-public theme-app min-h-svh bg-surface-low font-body text-on-surface">
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
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-outline-variant bg-surface-lowest md:block" />
  );
}
