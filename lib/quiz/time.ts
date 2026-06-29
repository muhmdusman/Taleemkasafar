/**
 * Pure time helpers for the mock timer (no DB, no React).
 */

/** Format seconds as M:SS (or H:MM:SS when an hour or more remains). */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

/**
 * Seconds remaining until `expiresAt`, clamped at 0. Both args are epoch ms
 * (or Date). Server-anchored: the client ticks `now` locally but the source of
 * truth is the server-set expiry.
 */
export function remainingSeconds(
  expiresAt: number | Date,
  now: number | Date,
): number {
  const exp = expiresAt instanceof Date ? expiresAt.getTime() : expiresAt;
  const cur = now instanceof Date ? now.getTime() : now;
  return Math.max(0, Math.round((exp - cur) / 1000));
}

/** Whether the mock has expired. */
export function isExpired(expiresAt: number | Date, now: number | Date): boolean {
  return remainingSeconds(expiresAt, now) <= 0;
}
