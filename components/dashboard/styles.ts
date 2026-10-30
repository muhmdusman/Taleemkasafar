import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Shared dashboard + quiz styles. The app uses the same rounded, soft look and
 * palette as the landing page (`.theme-public`) plus `.theme-app` for clearer
 * card edges (.kiro/context/DESIGN.md §12, §14): white cards on a light grey
 * canvas, soft shadows, blue for primary actions, and soft `tone-*` accents
 * (components/dashboard/tone.ts) for subjects and app areas.
 * Tokens only: never raw colors.
 */

/** Visible keyboard focus ring in brand blue, for every interactive element. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container focus-visible:ring-offset-2";

/** Static surface: white card, hairline border, soft shadow. */
export const card = "rounded-2xl border border-outline-variant bg-surface-lowest shadow-soft";

/** Clickable card (whole card is a link): card + gentle hover lift. */
export const cardInteractive = cn(
  card,
  focusRing,
  "transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-outline hover:shadow-soft-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0",
);

/**
 * Placeholder block for Suspense fallbacks: a soft highlight sweeps across
 * (static grey with reduced motion). Shape it like the content it replaces
 * (see components/dashboard/skeletons.tsx) so the page doesn't jump.
 */
export const skeleton = "skeleton-shimmer rounded-2xl bg-surface-container";

/**
 * Dashboard buttons (mirrors `marketingButton` on the public site). Blue
 * `primary` is reserved for the main action of a screen or bar; everything
 * else is neutral `secondary` / `ghost`. Hover deepens the same color.
 */
export const appButton = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-headline font-semibold tracking-tight",
    "transition-[color,background-color,border-color,transform] duration-150 active:translate-y-px motion-reduce:transition-none",
    "disabled:pointer-events-none disabled:opacity-50",
    focusRing,
  ],
  {
    variants: {
      variant: {
        primary: "bg-brand text-on-brand hover:bg-brand-container",
        secondary:
          "border border-outline-variant bg-surface-lowest text-on-surface hover:border-outline hover:bg-surface-low",
        ghost: "text-on-surface hover:bg-surface-container",
        // Final, consequential actions (end a test): tinted, not a red block.
        danger:
          "border border-danger/30 bg-danger-fixed text-danger hover:border-danger/60",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-14 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
