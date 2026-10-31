"use client";

import { useCallback, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { selectEntryTest } from "@/app/dashboard/actions";
import { routes } from "@/lib/routes";

/**
 * Switch the student's entry test (header dropdown + onboarding picker).
 * Saves via the Server Action, then refreshes server data. `isPending` stays
 * true until the new test's data is on screen, so callers can show progress.
 *
 * A subject page belongs to one test, so from there we go to the subjects
 * list first (the old subject would 404 under the new test).
 */
export function useSwitchEntryTest(activeId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const switchTo = useCallback(
    (id: string, { force = false }: { force?: boolean } = {}) => {
      // `force` saves even the current test (onboarding: "yes, this one").
      if (isPending || (id === activeId && !force)) return;
      setPendingId(id);
      startTransition(async () => {
        if (pathname.startsWith(`${routes.subjects}/`)) router.push(routes.subjects);
        await selectEntryTest(id);
        router.refresh();
      });
    },
    [activeId, isPending, pathname, router],
  );

  return { switchTo, isPending, pendingId: isPending ? pendingId : null };
}
