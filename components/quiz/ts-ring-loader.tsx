"use client";

import { useDelayedVisible } from "@/lib/hooks/use-delayed-visible";

/**
 * The "TS" brand mark (same geometry as `app/icon.svg`), inlined so it can be
 * sized freely and composed with the ring spinner without depending on the
 * favicon route.
 */
function TsMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="64" height="64" fill="#000000" />
      <rect y="55" width="64" height="9" fill="#0058be" />
      <g fill="#ffffff">
        <rect x="9" y="16" width="22" height="7" />
        <rect x="16.5" y="16" width="7" height="30" />
      </g>
      <g fill="#0058be">
        <rect x="35" y="16" width="20" height="7" />
        <rect x="35" y="16" width="7" height="14" />
        <rect x="35" y="27.5" width="20" height="7" />
        <rect x="48" y="32" width="7" height="14" />
        <rect x="35" y="39" width="20" height="7" />
      </g>
    </svg>
  );
}

/**
 * Brand spinner: the "TS" mark with a blue arc rotating around it (matches
 * the reference indicator). Pure CSS rotation (Tailwind's `animate-spin`),
 * no JS animation loop — cheap and smooth.
 */
export function TsRingLoader({
  size = 96,
  label = "Loading",
}: {
  size?: number;
  label?: string;
}) {
  const markSize = Math.round(size * 0.52);
  const stroke = Math.max(4, Math.round(size * 0.055));
  const r = size / 2 - stroke;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * 0.7;
  const gap = circumference - dash;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: "0.9s" }}
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#0058be"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
        />
      </svg>
      <TsMark size={markSize} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Full-screen branded loading state for the practice / past-paper routes
 * (Suspense fallback while the question set loads). Keeps the same slim
 * header + footer chrome as the runner so the transition into content
 * doesn't jump.
 */
export function QuizLoadingScreen({
  label = "Loading questions...",
}: {
  label?: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="h-14 shrink-0 border-b-2 border-black bg-white" />
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <TsRingLoader size={96} label={label} />
        <p className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          {label}
        </p>
      </div>
      <div className="h-16 shrink-0 border-t-2 border-black bg-white" />
    </div>
  );
}

/**
 * Centered "checking answer" overlay shown while a practice/past-paper
 * answer is being graded server-side. Grading (`submit_practice_answer`)
 * typically resolves in well under 150ms, so the overlay only appears if
 * the wait actually exceeds that threshold — instant responses never flash
 * a spinner. The moment grading resolves, the overlay disappears immediately
 * (no artificial minimum display time), so the feedback UI shows without
 * added delay.
 */
export function CheckingOverlay({
  active,
  label = "Checking answer...",
}: {
  active: boolean;
  label?: string;
}) {
  const visible = useDelayedVisible(active, 150);
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 backdrop-blur-[1px]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 border-2 border-black bg-white px-10 py-8 shadow-hard">
        <TsRingLoader size={72} label={label} />
        <span className="font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
      </div>
    </div>
  );
}
