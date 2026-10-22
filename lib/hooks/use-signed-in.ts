"use client";

import { useSyncExternalStore } from "react";
import { hasSessionCookie } from "@/lib/auth/session-hint";

// Cookies have no change event; re-check when the tab regains focus
// (e.g. after signing in or out in another tab).
function subscribe(onChange: () => void) {
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/**
 * Signed-in hint for static public pages. The server snapshot is always
 * `false`, so the prerendered HTML shows the signed-out CTAs and React swaps
 * them right after hydration for signed-in visitors (no hydration mismatch).
 */
export function useSignedIn(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hasSessionCookie(document.cookie),
    () => false,
  );
}
