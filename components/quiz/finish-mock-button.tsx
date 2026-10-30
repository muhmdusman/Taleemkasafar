"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitMock } from "@/app/dashboard/quiz-actions";
import { Icon } from "@/components/dashboard/icon";
import { Spinner } from "@/components/dashboard/loading-indicators";
import { appButton } from "@/components/dashboard/styles";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * For a mock whose time ran out before it was submitted: grades the saved
 * answers (submit_mock with no extra selections) and opens the result,
 * without loading the whole paper again.
 */
export function FinishMockButton({
  attemptId,
  className,
}: {
  attemptId: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function finish() {
    setFailed(false);
    startTransition(async () => {
      const id = await submitMock(attemptId, []);
      if (id) router.push(routes.mockResult(id));
      else setFailed(true);
    });
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={finish}
        disabled={isPending}
        className={cn(appButton(), "w-full")}
      >
        {isPending ? <Spinner /> : <Icon name="done_all" className="text-lg" />}
        {isPending ? "Scoring your answers…" : "See my score"}
      </button>
      {failed ? (
        <p role="alert" className="text-center text-sm text-danger">
          Couldn&apos;t submit right now. Check your connection and try again.
        </p>
      ) : null}
    </div>
  );
}
