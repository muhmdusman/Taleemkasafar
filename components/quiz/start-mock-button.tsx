"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/dashboard/icon";
import { appButton } from "@/components/dashboard/styles";
import { FullscreenLoader } from "./quiz-loader";
import { startMock } from "@/app/dashboard/quiz-actions";
import { routes } from "@/lib/routes";

/**
 * Starts a mock test. Shows a full-screen "creating your test" loader while the
 * server generates + freezes the paper and the sitting loads. The loader is
 * the transition's pending state, so it also ends when the page is kept
 * alive in the background (Cache Components hides routes instead of
 * unmounting them) and shown again later.
 */
export function StartMockButton({ blueprintId }: { blueprintId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function handleStart() {
    setFailed(false);
    startTransition(async () => {
      const attemptId = await startMock(blueprintId);
      if (attemptId) router.push(routes.mock(attemptId));
      else setFailed(true);
    });
  }

  return (
    <>
      {isPending && (
        <FullscreenLoader
          title="Creating your mock"
          steps={[
            "Selecting questions",
            "Setting the difficulty mix",
            "Building sections",
            "Starting the timer",
          ]}
        />
      )}
      <button
        type="button"
        onClick={handleStart}
        disabled={isPending}
        className={appButton({ size: "lg" })}
      >
        {isPending ? "Creating..." : "Start Mock Test"}
        <Icon name="play_arrow" className="text-xl" />
      </button>
      {failed ? (
        <p role="alert" className="text-sm text-danger">
          Couldn&apos;t create the mock. Check your connection and try again.
        </p>
      ) : null}
    </>
  );
}
