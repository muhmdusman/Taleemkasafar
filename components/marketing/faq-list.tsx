import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/config/faq";
import { cn } from "@/lib/utils";

/**
 * FAQ list as native <details>/<summary>: zero client JS, every answer is in
 * the server HTML (matches the FAQPage JSON-LD), keyboard accessible by
 * default (Tab + Enter/Space), and no empty landmark regions.
 * Full width with roomy rows on desktop. Neutral styling: blue is reserved
 * for primary CTAs and key highlights, not for icons or hover states.
 */
export function FaqList({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {items.map((item) => (
        <details
          key={item.id}
          className="group rounded-2xl border border-outline-variant bg-surface-lowest shadow-soft open:border-outline"
        >
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 rounded-2xl px-5 py-5 text-left font-headline text-base font-semibold text-on-surface transition-colors hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:px-7 md:min-h-20 md:text-lg [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <ChevronDown
              className="size-5 shrink-0 text-on-surface-variant transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </summary>
          <p className="max-w-4xl px-5 pb-6 text-base leading-relaxed text-on-surface-variant sm:px-7 md:text-lg">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
