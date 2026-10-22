/**
 * Past-paper screens render in a focused, full-bleed layout WITHOUT the
 * dashboard sidebar/bottom-nav for a distraction-free study experience. The
 * runner provides its own slim header and footer.
 */
export default function PastPaperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="fixed inset-0 z-50 bg-surface">{children}</div>;
}
