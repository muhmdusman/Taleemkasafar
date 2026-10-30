/** Left-aligned dashboard section title (same scale as the landing page h2s). */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 font-headline text-2xl font-bold tracking-tight text-on-surface md:text-3xl">
      {children}
    </h2>
  );
}
