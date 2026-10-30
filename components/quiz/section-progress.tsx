import type { Section } from "@/lib/quiz/session";
import { sectionAnsweredCount } from "@/lib/quiz/session";

/** Per-section answered counts with rounded progress bars. */
export function SectionProgress({
  sections,
  savedFlags,
}: {
  sections: Section[];
  savedFlags: boolean[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {sections.map((s) => {
        const total = s.end - s.start;
        const answered = sectionAnsweredCount(s, savedFlags);
        const pct = total === 0 ? 0 : (answered / total) * 100;
        return (
          <div key={s.label}>
            <div className="mb-1.5 flex justify-between font-headline text-xs font-semibold tracking-tight">
              <span className="text-on-surface">{s.label}</span>
              <span className="tabular-nums text-on-surface-variant">
                {answered} / {total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-high">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
