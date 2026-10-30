"use client";

import { useState, useEffect } from "react";

/**
 * Full-screen overlay loader for longer operations (e.g. generating a mock
 * test). Shows an indeterminate progress bar and cycles through step
 * messages so the wait feels intentional.
 */
export function FullscreenLoader({
  title = "Creating your test",
  steps = [
    "Selecting questions...",
    "Setting difficulty...",
    "Building sections...",
    "Almost ready...",
  ],
}: {
  title?: string;
  steps?: string[];
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 1100);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="w-[min(90vw,420px)] rounded-2xl border border-outline-variant bg-surface-lowest p-8 shadow-soft-lg">
        <div className="mb-2 font-headline text-2xl font-bold tracking-tight text-on-surface">
          {title}
        </div>
        <div className="mb-6 h-5 font-body text-sm text-on-surface-variant">
          {steps[step]}
        </div>
        {/* Indeterminate progress bar: light track, brand-blue sweep. */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-high">
          <div className="h-full w-1/3 animate-[loaderSweep_1.1s_ease-in-out_infinite] rounded-full bg-brand" />
        </div>
      </div>
    </div>
  );
}
