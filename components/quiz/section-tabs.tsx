"use client";

import { focusRing } from "@/components/dashboard/styles";
import { toneClasses } from "@/components/dashboard/tone";
import { sectionAnsweredCount, type Section } from "@/lib/quiz/session";
import { subjectTone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";

/**
 * Mock sections (one per subject) as tabs with answered counts and a small
 * progress bar in the subject's tone. Choosing a section jumps to its first
 * unanswered question (or its first question when all are answered).
 */
export function SectionTabs({
  sections,
  sectionSlugs,
  savedFlags,
  currentIndex,
  onJump,
}: {
  sections: Section[];
  /** Subject slug per question (aligned to the paper). */
  sectionSlugs: string[];
  savedFlags: boolean[];
  currentIndex: number;
  onJump: (index: number) => void;
}) {
  return (
    <ul className="flex flex-col gap-2" aria-label="Sections">
      {sections.map((s) => {
        const total = s.end - s.start;
        const answered = sectionAnsweredCount(s, savedFlags);
        const pct = total === 0 ? 0 : (answered / total) * 100;
        const active = currentIndex >= s.start && currentIndex < s.end;
        const tone = toneClasses[subjectTone(sectionSlugs[s.start] || s.label)];
        const firstOpen = savedFlags.slice(s.start, s.end).findIndex((f) => !f);
        return (
          <li key={`${s.label}-${s.start}`}>
            <button
              type="button"
              onClick={() => onJump(firstOpen === -1 ? s.start : s.start + firstOpen)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex w-full flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left transition-colors motion-reduce:transition-none",
                focusRing,
                active ? cn(tone.panel, tone.border) : "border-outline-variant bg-surface-lowest hover:bg-surface-low",
              )}
            >
              <span className="flex items-center justify-between gap-2 font-headline text-sm font-semibold">
                <span className="flex items-center gap-2 text-on-surface">
                  <span className={cn("size-2.5 rounded-full", tone.bar)} aria-hidden="true" />
                  {s.label}
                </span>
                <span className="tabular-nums text-on-surface-variant">
                  {answered}/{total}
                </span>
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-surface-high" aria-hidden="true">
                <span className={cn("block h-full rounded-full", tone.bar)} style={{ width: `${pct}%` }} />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
