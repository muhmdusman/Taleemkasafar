"use client";

import { useEffect, useId, useRef } from "react";

/**
 * Small modal built on the native <dialog>: `showModal()` gives focus
 * trapping, Escape to close and the top layer for free. `open` is controlled;
 * Escape calls `onClose` so React state stays in sync.
 *
 * The effect cleanup closes the native dialog: with Cache Components a route
 * that is navigated away from is hidden (not unmounted), and a modal left
 * open there would make the next page inert.
 */
export function Dialog({
  open,
  title,
  onClose,
  children,
  actions,
  alert = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Buttons, last one is the main action (shown right / on top on mobile). */
  actions: React.ReactNode;
  /** Confirmation of a consequential action: announced as an alert dialog. */
  alert?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      role={alert ? "alertdialog" : undefined}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="w-[min(92vw,460px)] rounded-2xl border border-outline-variant bg-surface-lowest p-0 text-on-surface shadow-soft-lg backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      {/* Rendered only while open so the content (and its focus) resets each time. */}
      {open ? (
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <h2 id={titleId} className="font-headline text-xl font-bold tracking-tight text-on-surface">
            {title}
          </h2>
          <div id={bodyId} className="text-sm leading-relaxed text-on-surface-variant">
            {children}
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            {actions}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
