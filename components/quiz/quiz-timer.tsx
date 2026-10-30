"use client";

import { useState, useEffect } from "react";
import { formatTime, remainingSeconds } from "@/lib/quiz/time";
import { Icon } from "@/components/dashboard/icon";
import { cn } from "@/lib/utils";

/** Calm until the last 5 minutes (amber), then the last minute (red tint). */
const WARN_AT = 5 * 60;
const DANGER_AT = 60;

/**
 * Display-only countdown anchored to a server-set expiry. While running, it
 * calls `onTimeUp` on every tick at or past zero; the caller decides whether
 * that may submit (the mock runner only allows it once the server has
 * confirmed the clock, so a stale screen can't submit by accident).
 * While `pausedSecondsLeft` is set, the time is frozen and shown as paused.
 * `expiresAt` null (and not paused) means no time limit.
 *
 * `role="timer"` (implicitly aria-live off) so screen readers can read it on
 * demand without announcing every second.
 */
export function QuizTimer({
  expiresAt,
  pausedSecondsLeft = null,
  onTimeUp,
}: {
  expiresAt: string | null;
  pausedSecondsLeft?: number | null;
  onTimeUp: () => void;
}) {
  const paused = pausedSecondsLeft !== null;
  const expMs = expiresAt ? new Date(expiresAt).getTime() : null;
  const [secs, setSecs] = useState<number | null>(() =>
    paused ? pausedSecondsLeft : expMs !== null ? remainingSeconds(expMs, Date.now()) : null,
  );

  useEffect(() => {
    if (paused) {
      setSecs(pausedSecondsLeft);
      return;
    }
    if (expMs === null) {
      setSecs(null);
      return;
    }
    const tick = () => {
      const left = remainingSeconds(expMs, Date.now());
      setSecs(left);
      if (left <= 0) onTimeUp();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expMs, paused, pausedSecondsLeft, onTimeUp]);

  const level =
    paused || secs === null ? "calm" : secs <= DANGER_AT ? "danger" : secs <= WARN_AT ? "warn" : "calm";

  return (
    <div
      role="timer"
      className={cn(
        "flex h-10 items-center gap-2 rounded-xl border px-3 font-headline text-base font-bold tabular-nums transition-colors motion-reduce:transition-none sm:h-11 sm:px-4 sm:text-lg",
        level === "danger" && "border-danger/40 bg-danger-fixed text-danger",
        level === "warn" && "border-tone-amber/40 bg-tone-amber-soft text-tone-amber",
        level === "calm" && "border-tone-violet/25 bg-tone-violet-soft text-tone-violet",
      )}
    >
      <Icon name={paused ? "pause_circle" : "timer"} className="text-xl" />
      <span className="sr-only">{paused ? "Paused, time remaining: " : "Time remaining: "}</span>
      <span suppressHydrationWarning>{secs === null ? "No limit" : formatTime(secs)}</span>
      {paused ? <span className="hidden text-xs font-semibold sm:inline">Paused</span> : null}
    </div>
  );
}
