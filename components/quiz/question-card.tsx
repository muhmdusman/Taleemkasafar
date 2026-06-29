import type { ReactNode } from "react";
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
    <div className="border-2 border-black bg-white shadow-hard">
      <div className="flex items-center justify-between border-b-2 border-black bg-surface-low p-4">
        <span className="font-headline text-sm font-bold uppercase tracking-tight">
          Q {index + 1}
          <span className="text-on-surface-variant"> / {total}</span>
          <span className="ml-3 text-brand">{sectionLabel}</span>
        </span>
        {statusSlot}
      </div>
      <div className="border-b-2 border-black p-6">
        <p className="font-body text-lg leading-relaxed text-on-surface">
          <MathText>{statement}</MathText>
        </p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
