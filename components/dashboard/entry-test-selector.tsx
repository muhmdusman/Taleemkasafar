"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { selectEntryTest } from "@/app/dashboard/actions";
import { Icon } from "./icon";
import { focusRing } from "./styles";
import { cn } from "@/lib/utils";
import type { EntryTest } from "@/lib/queries/entry-test";

/**
 * Header-center entry-test picker. Persists the choice via a Server Action,
 * then refreshes so server data re-loads for the new test.
 */
export function EntryTestSelector({
  tests,
  activeId,
}: {
  tests: EntryTest[];
  activeId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const active = tests.find((t) => t.id === activeId) ?? tests[0];
  if (!active) return null;

  const choose = (id: string) => {
    setOpen(false);
    if (id === activeId) return;
    startTransition(async () => {
      await selectEntryTest(id);
      router.refresh();
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-10 items-center gap-2 rounded-xl border border-outline-variant bg-surface-lowest px-4 font-headline text-sm font-semibold tracking-tight text-on-surface transition-colors hover:border-outline hover:bg-surface-low disabled:opacity-60 motion-reduce:transition-none",
          focusRing,
        )}
      >
        <Icon name="school" className="text-lg text-on-surface-variant" filled />
        <span className="max-w-[10rem] truncate">{active.name}</span>
        <Icon
          name="expand_more"
          className={cn(
            "text-lg text-on-surface-variant transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            className="absolute left-1/2 z-20 mt-2 flex w-64 -translate-x-1/2 flex-col gap-0.5 rounded-2xl border border-outline-variant bg-surface-lowest p-1.5 shadow-soft-lg"
          >
            {tests.map((t) => {
              const selected = t.id === activeId;
              return (
                <li key={t.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => choose(t.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left font-headline text-sm font-semibold tracking-tight transition-colors motion-reduce:transition-none",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-container",
                      selected
                        ? "bg-brand-fixed text-brand-container"
                        : "text-on-surface hover:bg-surface-low",
                    )}
                  >
                    {t.name}
                    {selected && <Icon name="check" className="text-lg" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
