"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./icon";
import { cardIndex, chapterMetaLabel } from "@/lib/queries/dashboard-helpers";
import type { ChapterOverview } from "@/lib/queries/subject";

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
      <div className="border-2 border-black bg-white p-8 shadow-hard">
        <p className="font-body text-on-surface-variant">
          No chapters available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {chapters.map((c, i) => {
        const id = c.chapter_id ?? String(i);
        const open = openId === id;
        const count = c.question_count ?? 0;
        const base = `/subjects/${subjectSlug}/${c.chapter_slug}`;
        const buttons: ContentButton[] = [
          {
            key: "past_paper",
            label: "Past Paper MCQs",
            icon: "history_edu",
            href: count > 0 ? `${base}/past-paper` : undefined,
          },
          {
            key: "practice",
            label: "Practice MCQs",
            icon: "assignment",
            href: count > 0 ? `${base}/practice` : undefined,
          },
          { key: "notes", label: "Quick Notes", icon: "sticky_note_2" },
          { key: "lectures", label: "Lectures", icon: "play_circle" },
        ];

        return (
          <div
            key={id}
            className={
              open
                ? "relative z-10 flex flex-col border-2 border-black bg-white shadow-hard"
                : "border-2 border-black bg-white"
            }
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : id)}
              aria-expanded={open}
              className={
                open
                  ? "flex items-center justify-between bg-black p-5 text-left text-white"
                  : "flex items-center justify-between p-5 text-left transition-colors hover:bg-surface-low"
              }
            >
              <div className="flex items-center gap-6">
                <span
                  className={
                    open
                      ? "font-headline text-2xl font-bold text-brand-fixed"
                      : "font-headline text-2xl font-bold text-black opacity-20"
                  }
                >
                  {cardIndex(i)}
                </span>
                <div>
                  <h3 className="font-headline text-xl font-bold uppercase tracking-tight">
                    {c.chapter_title}
                  </h3>
                  <p
                    className={
                      open
                        ? "mt-1 text-xs font-bold uppercase tracking-tighter text-blue-200"
                        : "mt-1 text-xs font-bold uppercase tracking-tighter text-on-surface-variant"
                    }
                  >
                    {chapterMetaLabel(c.subtopic_count, count)}
                  </p>
                </div>
              </div>
              <Icon name={open ? "expand_less" : "expand_more"} />
            </button>

            {open && (
              <div className="grid grid-cols-1 gap-4 bg-white p-6 md:grid-cols-2 lg:grid-cols-4">
                {buttons.map((b) =>
                  b.href ? (
                    <Link
                      key={b.key}
                      href={b.href}
                      className="group flex flex-col gap-3 border-2 border-black p-4 text-left transition-colors hover:bg-brand-fixed"
                    >
                      <Icon name={b.icon} className="text-brand" />
                      <span className="font-headline text-sm font-bold uppercase tracking-tight">
                        {b.label}
                      </span>
                    </Link>
                  ) : (
                    <div
                      key={b.key}
                      title="Coming soon"
                      className="flex cursor-not-allowed flex-col gap-3 border-2 border-black p-4 text-left opacity-40"
                    >
                      <Icon name={b.icon} className="text-brand" />
                      <span className="font-headline text-sm font-bold uppercase tracking-tight">
                        {b.label}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Coming soon
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
