import type { Section } from "@/lib/quiz/session";
import { sectionAnsweredCount } from "@/lib/quiz/session";

/** Per-section answered counts with Soft Brutalism progress bars. */
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
            <div className="mb-1 flex justify-between font-headline text-xs font-bold uppercase tracking-tight">
              <span>{s.label}</span>
              <span className="text-on-surface-variant">
                {answered} / {total}
              </span>
            </div>
            <div className="h-3 w-full border-2 border-black bg-surface-high">
              <div
                className="h-full bg-brand transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
