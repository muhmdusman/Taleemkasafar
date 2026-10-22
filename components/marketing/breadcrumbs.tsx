import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd, breadcrumbJsonLd, type Breadcrumb } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";

/**
 * Visible breadcrumb trail + matching BreadcrumbList JSON-LD (same items, so
 * they can't drift). The last item is the current page (not a link).
 */
export function Breadcrumbs({ items, className }: { items: Breadcrumb[]; className?: string }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
        <ol className="flex flex-wrap items-center gap-1 text-on-surface-variant">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1">
                {last ? (
                  <span aria-current="page" className="font-medium text-on-surface">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.path}
                      className="rounded-md underline-offset-4 hover:text-on-surface hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container"
                    >
                      {item.name}
                    </Link>
                    <ChevronRight className="size-4 text-outline" aria-hidden="true" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
