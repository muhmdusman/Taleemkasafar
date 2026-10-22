"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/dashboard/icon";
import { FullscreenLoader } from "./quiz-loader";
import { startMock } from "@/app/dashboard/quiz-actions";
import { routes } from "@/lib/routes";

/**
 * Starts a mock test. Shows a full-screen "creating your test" loader while the
 * server generates + freezes the 200-question paper, then routes to the sitting.
 */
export function StartMockButton({ blueprintId }: { blueprintId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    const attemptId = await startMock(blueprintId);
    if (attemptId) {
      router.push(routes.mock(attemptId));
    } else {
      setLoading(false);
    }
  }

  return (
    <>
      {loading && (
        <FullscreenLoader
          title="Creating your mock"
          steps={[
            "Selecting questions...",
            "Setting difficulty mix...",
            "Building sections...",
            "Starting the timer...",
          ]}
        />
      )}
      <button
        type="button"
        onClick={handleStart}
        disabled={loading}
        className="flex items-center gap-2 border-2 border-on-ink bg-surface-lowest px-6 py-3 font-headline text-sm font-bold uppercase tracking-tight text-on-surface shadow-hard-primary transition-colors hover:bg-brand-fixed active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-70"
      >
        {loading ? "Creating..." : "Start Mock Test"}
        <Icon name="play_arrow" className="text-lg" />
      </button>
    </>
  );
}
