import type { Tone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { toneClasses } from "./tone";

/**
 * Left-aligned dashboard section title (same scale as the landing page h2s),
 * with an optional tinted icon tile and a right-aligned action (e.g. "See all").
 */
export function SectionHeading({
  id,
  icon,
  tone = "blue",
  action,
  children,
}: {
  id?: string;
  icon?: string;
  tone?: Tone;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2
        id={id}
        className="flex items-center gap-3 font-headline text-xl font-bold tracking-tight text-on-surface md:text-2xl"
      >
        {icon ? (
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", toneClasses[tone].tile)}>
            <Icon name={icon} className="text-xl" />
          </span>
        ) : null}
        {children}
      </h2>
      {action}
    </div>
  );
}
