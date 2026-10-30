import { cn } from "@/lib/utils";
import { card, skeleton } from "./styles";

/**
 * Content-shaped loading placeholders for the dashboard's Suspense
 * fallbacks. Each mirrors the layout it stands in for (same card sizes and
 * gaps), so content streams in without the page jumping. Visuals are hidden
 * from assistive tech; each fallback announces one "Loading …" message.
 */

function Bar({ className }: { className?: string }) {
  return <div className={cn(skeleton, "h-4 rounded-lg", className)} />;
}

function Loading({ label }: { label: string }) {
  return <span className="sr-only" role="status">{label}</span>;
}

/** Greeting panel + next-step card. */
export function HeroSkeleton() {
  return (
    <div className="rounded-3xl border border-outline-variant bg-surface-lowest/60 p-5 sm:p-8 lg:p-10">
      <Loading label="Loading your dashboard" />
      <div aria-hidden="true" className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        <div className="space-y-4 lg:col-span-7 xl:col-span-8">
          <Bar className="h-8 w-40 rounded-full" />
          <Bar className="h-10 w-4/5 sm:h-12" />
          <Bar className="w-3/5" />
          <div className="flex gap-2 pt-1">
            <Bar className="h-10 w-36 rounded-xl" />
            <Bar className="h-10 w-28 rounded-xl" />
            <Bar className="h-10 w-28 rounded-xl" />
          </div>
        </div>
        <div className={cn(card, "space-y-4 p-6 lg:col-span-5 xl:col-span-4")}>
          <Bar className="h-10 w-10 rounded-xl" />
          <Bar className="h-6 w-3/4" />
          <Bar className="w-1/2" />
          <Bar className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Four stat tiles. */
export function ProgressSkeleton() {
  return (
    <div>
      <Loading label="Loading your progress" />
      <ul aria-hidden="true" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className={cn(card, "space-y-3 p-4 sm:p-5")}>
            <Bar className="h-9 w-9 rounded-xl" />
            <Bar className="h-8 w-16" />
            <Bar className="w-24" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Grid of subject cards. */
export function SubjectCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div>
      <Loading label="Loading subjects" />
      <ul aria-hidden="true" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className={cn(card, "space-y-5 p-6")}>
            <div className="flex justify-between">
              <Bar className="h-12 w-12 rounded-xl" />
              <Bar className="w-6" />
            </div>
            <Bar className="h-7 w-1/2" />
            <Bar className="w-4/5" />
            <Bar className="h-2 w-full rounded-full" />
            <div className="flex justify-between border-t border-outline-variant pt-4">
              <Bar className="w-32" />
              <Bar className="size-8 rounded-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One wide mock card. */
export function MockCardSkeleton() {
  return (
    <div className={cn(card, "flex flex-col gap-4 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between")}>
      <Loading label="Loading mock tests" />
      <div aria-hidden="true" className="space-y-3">
        <Bar className="h-6 w-36 rounded-full" />
        <Bar className="h-8 w-64" />
        <div className="flex gap-2">
          <Bar className="h-14 w-24 rounded-xl" />
          <Bar className="h-14 w-24 rounded-xl" />
        </div>
      </div>
      <Bar className="h-14 w-full rounded-xl lg:w-52" />
    </div>
  );
}

/** Stack of list rows (chapters, results). */
export function RowsSkeleton({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <div className="flex flex-col gap-3">
      <Loading label={label} />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden="true" className={cn(card, "flex items-center gap-4 p-4 md:p-5")}>
          <Bar className="size-11 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Bar className="w-1/3" />
            <Bar className="h-3 w-1/5" />
          </div>
          <Bar className="size-6 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** A block the size of a page intro / big card. */
export function BlockSkeleton({ className, label }: { className?: string; label?: string }) {
  return (
    <>
      {label ? <Loading label={label} /> : null}
      <div aria-hidden="true" className={cn(skeleton, "w-full", className)} />
    </>
  );
}
