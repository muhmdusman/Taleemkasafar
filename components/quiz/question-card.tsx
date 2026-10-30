import type { ReactNode } from "react";
import { card } from "@/components/dashboard/styles";
import { cn } from "@/lib/utils";
import { MathText } from "./math-text";

/**
 * Question shell: a status header bar + the statement. Options/feedback are
 * passed as children so practice and mock runners can compose differently.
 */
export function QuestionCard({
  index,
  total,
  sectionLabel,
  statusSlot,
  statement,
  children,
}: {
  index: number;
  total: number;
  sectionLabel: string;
  statusSlot?: ReactNode;
  statement: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(card, "overflow-hidden")}>
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant bg-surface-low px-5 py-3">
        <span className="font-headline text-sm font-semibold tracking-tight text-on-surface">
          Q {index + 1}
          <span className="text-on-surface-variant"> / {total}</span>
          <span className="ml-3 text-brand">{sectionLabel}</span>
        </span>
        {statusSlot}
      </div>
      <div className="px-6 pt-6">
        <p className="font-body text-lg leading-relaxed text-on-surface">
          <MathText>{statement}</MathText>
        </p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
