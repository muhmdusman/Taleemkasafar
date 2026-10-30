"use client";

import { useEffect, useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { EntryTest } from "@/lib/queries/entry-test";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { Spinner, TopProgressBar } from "./loading-indicators";
import { focusRing } from "./styles";
import { useSwitchEntryTest } from "./use-switch-entry-test";

/**
 * Header entry-test dropdown, on every dashboard screen and every size.
 * Radix DropdownMenu gives keyboard navigation (arrows, Enter, Escape, type
 * ahead), focus return and outside-click for free. While the switch is
 * saving and the new test's data loads, the trigger shows a spinner and a
 * bar runs along the top of the screen; the result is announced politely.
 */
export function EntryTestSelector({
  tests,
  activeId,
}: {
  tests: EntryTest[];
  activeId: string;
}) {
  const { switchTo, isPending, pendingId } = useSwitchEntryTest(activeId);
  const active = tests.find((t) => t.id === activeId) ?? tests[0];
  const shown = tests.find((t) => t.id === pendingId) ?? active;

  // Announce the change once the new test is active.
  const [announcement, setAnnouncement] = useState("");
  const previousId = useRef(activeId);
  useEffect(() => {
    if (previousId.current !== activeId) {
      const now = tests.find((t) => t.id === activeId);
      if (now) setAnnouncement(`Now preparing for ${now.name}.`);
      previousId.current = activeId;
    }
  }, [activeId, tests]);

  if (!active || !shown) return null;

  return (
    <>
      <TopProgressBar active={isPending} label={`Switching to ${shown.name}`} />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          disabled={isPending}
          aria-label={`Entry test: ${shown.name}. Change entry test`}
          className={cn(
            "group flex h-10 items-center gap-2 rounded-xl border border-outline-variant bg-surface-lowest px-3 font-headline text-sm font-semibold tracking-tight text-on-surface shadow-soft transition-colors hover:border-outline hover:bg-surface-low disabled:cursor-wait data-[state=open]:border-tone-blue/40 data-[state=open]:bg-tone-blue-soft motion-reduce:transition-none sm:px-4",
            focusRing,
          )}
        >
          {isPending ? (
            <Spinner className="size-[18px] text-tone-blue" />
          ) : (
            <Icon name="school" filled className="text-lg text-tone-blue" />
          )}
          <span className="hidden font-medium text-on-surface-variant md:inline">Test:</span>
          <span className="max-w-[7rem] truncate sm:max-w-[10rem]">{shown.name}</span>
          <Icon
            name="expand_more"
            className="text-lg text-on-surface-variant transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          />
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          {/* Portaled to <body>: re-apply the app theme classes. */}
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="theme-public theme-app z-[60] w-72 rounded-2xl border border-outline-variant bg-surface-lowest p-1.5 font-body text-on-surface shadow-soft-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:data-[state=open]:animate-none"
          >
            <DropdownMenu.Label className="px-3 pb-1.5 pt-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Switch entry test
            </DropdownMenu.Label>
            <DropdownMenu.RadioGroup value={active.id} onValueChange={(id) => switchTo(id)}>
              {tests.map((t) => (
                <DropdownMenu.RadioItem
                  key={t.id}
                  value={t.id}
                  className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-headline text-sm font-semibold tracking-tight outline-none transition-colors data-[highlighted]:bg-surface-low data-[state=checked]:bg-tone-blue-soft data-[state=checked]:text-tone-blue"
                >
                  {t.name}
                  <DropdownMenu.ItemIndicator>
                    <Icon name="check" className="text-lg" />
                  </DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
            <p className="px-3 pb-2 pt-2 text-xs leading-relaxed text-on-surface-variant">
              Subjects, mock tests and progress follow the test you pick.
            </p>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
