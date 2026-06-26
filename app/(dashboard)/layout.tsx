import { Sidebar } from "@/components/dashboard/sidebar";
import { BottomNav } from "@/components/dashboard/bottom-nav";

/**
 * Shell for all authenticated dashboard pages: fixed sidebar (desktop),
 * bottom nav (mobile), and a content area offset for the fixed chrome.
 * Auth is enforced by proxy.ts (everything outside /auth/* requires login);
 * pages also verify on the server.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-surface font-body text-on-surface">
      <Sidebar />
      <BottomNav />
      <div className="md:ml-64">{children}</div>
    </div>
  );
}
