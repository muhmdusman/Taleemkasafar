"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/dashboard/icon";
import { cn } from "@/lib/utils";
import { TsRingLoader } from "./ts-ring-loader";

/**
 * Full-screen overlay loader for longer operations (e.g. generating a mock
 * test): the brand ring plus a short checklist that ticks forward and then
 * waits on the last step, so the wait feels like progress, not a freeze.
 */
export function FullscreenLoader({
  title = "Creating your test",
  steps = [
    "Selecting questions",
    "Setting difficulty",
    "Building sections",
    "Almost ready",
  ],
}: {
  title?: string;
  steps?: string[];
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }, 900);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div
      className="theme-public theme-app fixed inset-0 z-[80] flex items-center justify-center bg-surface-low/85 p-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex w-[min(92vw,400px)] flex-col items-center gap-5 rounded-2xl border border-outline-variant bg-surface-lowest p-8 text-center shadow-soft-lg">
        {/* The ring has its own status role; this overlay already is one. */}
        <div aria-hidden="true">
          <TsRingLoader size={80} label={title} />
        </div>
        <div className="font-headline text-xl font-bold tracking-tight text-on-surface">
          {title}
        </div>
        <ol className="flex w-full flex-col gap-2 text-left">
          {steps.map((label, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors motion-reduce:transition-none",
                  current ? "bg-tone-violet-soft font-semibold text-tone-violet" : "text-on-surface-variant",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full",
                    done ? "bg-success-fixed text-success" : current ? "bg-surface-lowest" : "bg-surface-container",
                  )}
                  aria-hidden="true"
                >
                  {done ? <Icon name="check" className="text-sm" /> : null}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
