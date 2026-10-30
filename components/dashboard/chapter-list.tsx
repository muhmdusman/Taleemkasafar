"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./icon";
import { card, focusRing } from "./styles";
import { cardIndex, chapterMetaLabel } from "@/lib/queries/dashboard-helpers";
import type { ChapterOverview } from "@/lib/queries/subject";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type ContentButton = {
  key: string;
  label: string;
  icon: string;
  /** href when enabled; undefined => "coming soon" (disabled) */
  href?: string;
};

/**
 * Accordion list of chapters. Expanding a chapter reveals the four content
 * entry points (Past Paper, Practice, Quick Notes, Lectures). MCQ options link
 * to the practice/past-paper routes; notes & lectures are future (disabled).
 */
export function ChapterList({
  subjectSlug,
  chapters,
}: {
  subjectSlug: string;
  chapters: ChapterOverview[];
}) {
  const [openId, setOpenId] = useState<string | null>(
    chapters[0]?.chapter_id ?? null,
  );

  if (chapters.length === 0) {
    return (
      <div className={cn(card, "p-8")}>
        <p className="font-body text-on-surface-variant">
          No chapters available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {chapters.map((c, i) => {
        const id = c.chapter_id ?? String(i);
        const panelId = `chapter-panel-${id}`;
        const open = openId === id;
        const count = c.question_count ?? 0;
        const chapterSlug = c.chapter_slug ?? "";
        const buttons: ContentButton[] = [
          {
            key: "past_paper",
            label: "Past Paper MCQs",
            icon: "history_edu",
            href:
              count > 0 ? routes.pastPaper(subjectSlug, chapterSlug) : undefined,
          },
          {
            key: "practice",
            label: "Practice MCQs",
            icon: "assignment",
            href:
              count > 0 ? routes.practice(subjectSlug, chapterSlug) : undefined,
          },
          { key: "notes", label: "Quick Notes", icon: "sticky_note_2" },
          { key: "lectures", label: "Lectures", icon: "play_circle" },
        ];

        return (
          <div
            key={id}
            className={cn(
              "overflow-hidden rounded-2xl border bg-surface-lowest transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none",
              open
                ? "border-outline shadow-soft-lg"
                : "border-outline-variant shadow-soft",
            )}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : id)}
              aria-expanded={open}
              aria-controls={panelId}
              className={cn(
                "flex w-full items-center justify-between gap-4 p-4 text-left transition-colors motion-reduce:transition-none md:p-5",
                // Inset ring: the rounded, overflow-hidden card would clip an offset ring.
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-container",
                !open && "hover:bg-surface-low",
              )}
            >
              <div className="flex min-w-0 items-center gap-4 md:gap-5">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl font-headline text-base font-bold tabular-nums transition-colors motion-reduce:transition-none",
                    open
                      ? "bg-brand text-on-brand"
                      : "bg-surface-container text-on-surface-variant",
                  )}
                >
                  {cardIndex(i)}
                </span>
                <div className="min-w-0">
                  <h3 className="font-headline text-lg font-bold leading-snug tracking-tight text-on-surface">
                    {c.chapter_title}
                  </h3>
                  <p className="mt-0.5 text-sm text-on-surface-variant">
                    {chapterMetaLabel(c.subtopic_count, count)}
                  </p>
                </div>
              </div>
              <Icon
                name="expand_more"
                className={cn(
                  "shrink-0 text-on-surface-variant transition-transform duration-200 motion-reduce:transition-none",
                  open && "rotate-180",
                )}
              />
            </button>

            {open && (
              <div
                id={panelId}
                className="grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-2 md:px-5 md:pb-5 lg:grid-cols-4"
              >
                {buttons.map((b) =>
                  b.href ? (
                    <Link
                      key={b.key}
                      href={b.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-lowest p-4 text-left transition-colors hover:border-outline hover:bg-surface-low motion-reduce:transition-none",
                        focusRing,
                      )}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-fixed text-brand-container">
                        <Icon name={b.icon} />
                      </span>
                      <span className="font-headline text-sm font-semibold tracking-tight text-on-surface">
                        {b.label}
                      </span>
                    </Link>
                  ) : (
                    <div
                      key={b.key}
                      aria-disabled="true"
                      className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-low p-4 text-left"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
                        <Icon name={b.icon} />
                      </span>
                      <span className="flex flex-col items-start gap-1">
                        <span className="font-headline text-sm font-semibold tracking-tight text-on-surface-variant">
                          {b.label}
                        </span>
                        <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                          Coming soon
                        </span>
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
