"use client";

import type { EntryTest } from "@/lib/queries/entry-test";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { Spinner, TopProgressBar } from "./loading-indicators";
import { focusRing } from "./styles";
import { useSwitchEntryTest } from "./use-switch-entry-test";

/**
 * Onboarding step 1: big tap targets for each entry test. Picking the one
 * that's already shown still saves it, so the step completes in one tap.
 */
export function EntryTestPicker({
  tests,
  activeId,
}: {
  tests: EntryTest[];
  activeId: string;
}) {
  const { switchTo, isPending, pendingId } = useSwitchEntryTest(activeId);

  return (
    <div role="group" aria-label="Choose your entry test" className="flex flex-wrap gap-2">
      <TopProgressBar active={isPending} label="Saving your entry test" />
      {tests.map((t) => {
        const loading = pendingId === t.id;
        const current = t.id === activeId;
        return (
          <button
            key={t.id}
            type="button"
            disabled={isPending}
            aria-pressed={current}
            onClick={() => switchTo(t.id, { force: true })}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-xl border px-4 font-headline text-sm font-semibold tracking-tight transition-colors disabled:cursor-wait motion-reduce:transition-none",
              focusRing,
              current
                ? "border-tone-blue/40 bg-tone-blue-soft text-tone-blue"
                : "border-outline-variant bg-surface-lowest text-on-surface hover:border-outline hover:bg-surface-low",
            )}
          >
            {loading ? <Spinner /> : current ? <Icon name="check" className="text-base" /> : null}
            {t.name}
          </button>
        );
      })}
    </div>
  );
}
