"use client";

import { useState, useEffect } from "react";

/**
 * Full-screen overlay loader for longer operations (e.g. generating a mock
 * test). Shows a square progress bar that fills and cycles through step
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
    >
      <div className="w-[min(90vw,420px)] border-2 border-black bg-white p-8 shadow-hard">
        <div className="mb-2 font-headline text-2xl font-bold uppercase tracking-tighter text-black">
          {title}
        </div>
        <div className="mb-6 h-5 font-body text-sm text-on-surface-variant">
          {steps[step]}
        </div>
        {/* Indeterminate square progress bar: black track, electric-blue sweep. */}
        <div className="h-4 w-full overflow-hidden border-2 border-black bg-white">
          <div className="h-full w-1/3 animate-[loaderSweep_1.1s_ease-in-out_infinite] bg-brand" />
        </div>
      </div>
    </div>
  );
}
