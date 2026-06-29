"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/dashboard/icon";
import { toggleBookmark } from "@/app/(dashboard)/quiz-actions";
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
        "flex items-center gap-2 border-2 border-black px-3 py-2 font-headline text-xs font-bold uppercase tracking-tight transition-colors",
        saved ? "bg-black text-white" : "bg-white text-black hover:bg-brand-fixed",
      )}
    >
      <Icon name="bookmark" filled={saved} className="text-lg" />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
