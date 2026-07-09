"use client";

import { useEffect, useState } from "react";

/**
 * Shows a loading indicator only if `active` stays true for longer than
 * `delayMs`. This is the standard "delayed loader" pattern: for operations
 * that usually resolve in milliseconds (grading a single answer), flashing a
 * spinner on/off reads as jank. We wait `delayMs` before revealing the
 * spinner, but the moment `active` flips back to false the spinner is hidden
 * immediately — no artificial minimum display time.
 */
export function useDelayedVisible(active: boolean, delayMs = 150): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    const id = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(id);
  }, [active, delayMs]);

  return visible;
}
