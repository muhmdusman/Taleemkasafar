import type { MeritFormula } from "@/lib/merit/types";
import { weightChips } from "@/lib/merit/display";
import { cn } from "@/lib/utils";

/** "Test 75% · Inter 15% · Matric 10%" as chips. The list label is for AT. */
export function WeightChips({ formula, className }: { formula: MeritFormula; className?: string }) {
  return (
    <ul aria-label={`${formula.label} weightage`} className={cn("flex flex-wrap gap-2", className)}>
      {weightChips(formula).map((chip) => (
        <li
          key={chip.key}
          className={cn(
            "rounded-full px-3 py-1 font-headline text-sm font-semibold",
            chip.key === "entryTest"
              ? "bg-brand-fixed text-on-surface"
              : "bg-surface-container text-on-surface",
          )}
        >
          {chip.label} {chip.weightPercent}%
        </li>
      ))}
    </ul>
  );
}
