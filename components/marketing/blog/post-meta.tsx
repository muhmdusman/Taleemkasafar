import type { BlogCategory } from "@/lib/blog/types";
import { cn } from "@/lib/utils";

/** Category pill shown on cards and above the post title. */
export function CategoryBadge({
  category,
  className,
}: {
  category: BlogCategory;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex self-start rounded-full bg-brand-fixed px-3 py-1 font-headline text-xs font-semibold uppercase tracking-wider text-brand-container",
        className,
      )}
    >
      <span className="sr-only">Category: </span>
      {category}
    </p>
  );
}
