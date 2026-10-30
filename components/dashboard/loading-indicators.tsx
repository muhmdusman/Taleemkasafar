import { cn } from "@/lib/utils";

/**
 * Small ring spinner in the current text colour. Decorative: pair it with
 * visible or sr-only text ("Saving…") so the state is announced.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-4 shrink-0 animate-spin", className)}
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Thin indeterminate bar pinned to the top of the viewport, for work that
 * changes the whole screen (switching entry test, leaving a test).
 */
export function TopProgressBar({
  active,
  label = "Loading",
}: {
  active: boolean;
  label?: string;
}) {
  if (!active) return null;
  return (
    <div
      role="progressbar"
      aria-label={label}
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-1 overflow-hidden bg-brand/15"
    >
      <div className="h-full w-1/3 animate-loaderSweep rounded-full bg-brand motion-reduce:animate-pulse" />
    </div>
  );
}
