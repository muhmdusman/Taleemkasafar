import { Info } from "lucide-react";
import { MERIT_DISCLAIMER } from "@/lib/merit/calculate";
import { cn } from "@/lib/utils";

/** The always-visible merit disclaimer (lib/merit/calculate.ts). */
export function MeritDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex gap-3 rounded-xl border border-outline-variant bg-surface-low px-4 py-3 text-sm leading-relaxed text-on-surface-variant",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-on-surface" aria-hidden="true" />
      <span>
        <strong className="font-semibold text-on-surface">Disclaimer: </strong>
        {MERIT_DISCLAIMER}
      </span>
    </p>
  );
}
