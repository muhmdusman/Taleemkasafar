/**
 * Practice screens render in a focused, full-bleed layout WITHOUT the dashboard
 * sidebar/bottom-nav for a distraction-free study experience. This nested
 * layout overrides the dashboard shell's left offset by spanning full width;
 * the runner provides its own slim header and footer.
 */
export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="fixed inset-0 z-50 bg-surface">{children}</div>;
}
