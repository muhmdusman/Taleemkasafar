"use client";

import { useCallback, useEffect, useRef } from "react";

const GUARD = "__backGuard";

type HistoryState = Record<string, unknown> | null;
const isGuard = (state: unknown) => Boolean((state as HistoryState)?.[GUARD]);

/**
 * While `active`, the browser Back button (and Android's back gesture) calls
 * `onBack` instead of leaving the page, so a timed test can ask "pause or
 * end?" first.
 *
 * How: a duplicate history entry for the current URL is pushed on mount.
 * Back pops it (the URL doesn't change), we push it again and call `onBack`.
 * The pushed state copies Next's own history state (`__NA` + router tree),
 * so Next treats the entry as one of its own and doesn't refresh the page.
 *
 * Before navigating away, `await release()`: it pops the guard entry, so a
 * following `router.replace(dest)` replaces the page's own entry and the
 * test URL doesn't stay behind in Back history.
 */
export function useBackGuard(active: boolean, onBack: () => void) {
  const onBackRef = useRef(onBack);
  const releasingRef = useRef(false);
  useEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (!active) return;
    releasingRef.current = false;
    const push = () =>
      window.history.pushState(
        { ...((window.history.state as HistoryState) ?? {}), [GUARD]: true },
        "",
        window.location.href,
      );
    // Don't stack guards (StrictMode re-runs effects; Back/Forward re-shows).
    if (!isGuard(window.history.state)) push();

    const onPop = () => {
      if (releasingRef.current) return;
      push();
      onBackRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [active]);

  return useCallback(
    () =>
      new Promise<void>((resolve) => {
        if (!isGuard(window.history.state)) {
          resolve();
          return;
        }
        releasingRef.current = true;
        let timer: ReturnType<typeof setTimeout>;
        const done = () => {
          window.removeEventListener("popstate", done);
          clearTimeout(timer);
          resolve();
        };
        // Some browsers skip popstate for same-document entries; don't hang.
        timer = setTimeout(done, 400);
        window.addEventListener("popstate", done);
        window.history.back();
      }),
    [],
  );
}
