"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/dashboard/icon";
import { appButton } from "@/components/dashboard/styles";
import { toggleBookmark } from "@/app/dashboard/quiz-actions";
import { cn } from "@/lib/utils";

/** Toggle a bookmark for a question. Optimistic, with a server round trip. */
export function BookmarkButton({
  questionId,
  initiallySaved = false,
}: {
  questionId: string;
  initiallySaved?: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !saved;
    setSaved(next); // optimistic
    startTransition(async () => {
      const result = await toggleBookmark(questionId);
      setSaved(result);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={saved}
      className={cn(
        appButton({ variant: "secondary", size: "sm" }),
        // Keep full opacity while the toggle is in flight (it's optimistic).
        "disabled:opacity-100",
        saved && "border-brand/40 bg-brand-fixed text-brand-container hover:border-brand/60 hover:bg-brand-fixed",
      )}
    >
      <Icon name="bookmark" filled={saved} className="text-lg" />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
