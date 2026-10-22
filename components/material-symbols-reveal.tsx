"use client";

import { useEffect } from "react";

const FONT = '24px "Material Symbols Outlined"';

/**
 * Adds `html.ms-loaded` once the Material Symbols font is ready. Needed after
 * client-side navigation into the dashboard/auth (the inline reveal script in
 * MaterialSymbolsFont only runs on a full page load). Renders nothing.
 */
export function MaterialSymbolsReveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("ms-loaded") || !document.fonts?.load) return;
    let cancelled = false;
    const show = () => {
      if (!cancelled && document.fonts.check(FONT)) root.classList.add("ms-loaded");
    };
    document.fonts.load(FONT).then(show).catch(() => undefined);
    document.fonts.ready.then(show).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
