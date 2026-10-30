"use client";

import { useState, useEffect, useRef } from "react";
import { formatTime, remainingSeconds } from "@/lib/quiz/time";
import { Icon } from "@/components/dashboard/icon";
import { cn } from "@/lib/utils";

/**
 * Display-only countdown anchored to a server-set expiry. The server is the
 * source of truth (submit_mock rejects/auto-finalizes after expiry); this just
 * ticks locally and fires onExpire once when it hits zero.
 *
 * `role="timer"` (implicitly aria-live off) so screen readers can read it on
 * demand without announcing every second.
 */
export function QuizTimer({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire: () => void;
}) {
  const expMs = new Date(expiresAt).getTime();
  const [secs, setSecs] = useState(() => remainingSeconds(expMs, Date.now()));
  const firedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const left = remainingSeconds(expMs, Date.now());
      setSecs(left);
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpire();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expMs, onExpire]);

  const danger = secs <= 60;

  return (
    <div
      role="timer"
      className={cn(
        "flex h-11 items-center gap-2 rounded-xl border px-4 font-headline text-lg font-bold tabular-nums transition-colors motion-reduce:transition-none",
        danger
          ? "border-danger/40 bg-danger-fixed text-danger"
          : "border-outline-variant bg-surface-lowest text-on-surface shadow-soft",
      )}
    >
      <Icon name="timer" className={cn("text-xl", !danger && "text-on-surface-variant")} />
      <span className="sr-only">Time remaining: </span>
      {formatTime(secs)}
    </div>
  );
}
