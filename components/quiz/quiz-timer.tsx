"use client";

import { useState, useEffect, useRef } from "react";
import { formatTime, remainingSeconds } from "@/lib/quiz/time";
import { Icon } from "@/components/dashboard/icon";
import { cn } from "@/lib/utils";

/**
 * Display-only countdown anchored to a server-set expiry. The server is the
 * source of truth (submit_mock rejects/auto-finalizes after expiry); this just
 * ticks locally and fires onExpire once when it hits zero.
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
      className={cn(
        "flex items-center gap-2 border-2 border-black px-4 py-2 font-headline text-lg font-bold tabular-nums",
        danger ? "bg-danger text-white" : "bg-black text-white",
      )}
      aria-live="polite"
    >
      <Icon name="timer" className="text-xl" />
      {formatTime(secs)}
    </div>
  );
}
