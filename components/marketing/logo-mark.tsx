import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  /** Accessible name. Pass `null` when the mark sits next to visible brand text. */
  label?: string | null;
};

/**
 * The geometric "TS" mark (same geometry as app/icon.svg), drawn with token
 * fills so it follows the palette. Rounded container for the public site.
 */
export function LogoMark({ className, label = "Taleem ka Safar logo" }: LogoMarkProps) {
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-9 shrink-0 overflow-hidden rounded-lg", className)}
      focusable="false"
      {...a11y}
    >
      {label ? <title>{label}</title> : null}
      <rect width="64" height="64" className="fill-ink" />
      <rect y="55" width="64" height="9" className="fill-brand" />
      <g className="fill-on-ink">
        <rect x="9" y="16" width="22" height="7" />
        <rect x="16.5" y="16" width="7" height="30" />
      </g>
      <g className="fill-brand">
        <rect x="35" y="16" width="20" height="7" />
        <rect x="35" y="16" width="7" height="14" />
        <rect x="35" y="27.5" width="20" height="7" />
        <rect x="48" y="32" width="7" height="14" />
        <rect x="35" y="39" width="20" height="7" />
      </g>
    </svg>
  );
}
