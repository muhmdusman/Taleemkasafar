import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd, breadcrumbJsonLd, type Breadcrumb } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";

/**
 * Visible breadcrumb trail + matching BreadcrumbList JSON-LD (same items, so
 * they can't drift). The last item is the current page (not a link).
 */
export function Breadcrumbs({
  items,
  className,
  tone = "light",
}: {
  items: Breadcrumb[];
  className?: string;
  /** "dark" for use on charcoal banners. */
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
        <ol
          className={cn(
            "flex flex-wrap items-center gap-1",
            dark ? "text-on-ink/75" : "text-on-surface-variant",
          )}
        >
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1">
                {last ? (
                  <span
                    aria-current="page"
                    className={cn("font-medium", dark ? "text-on-ink" : "text-on-surface")}
                  >
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.path}
                      className={cn(
                        "rounded-md underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2",
                        dark
                          ? "hover:text-on-ink focus-visible:ring-on-ink"
                          : "hover:text-on-surface focus-visible:ring-brand-container",
                      )}
                    >
                      {item.name}
                    </Link>
                    <ChevronRight
                      className={cn("size-4", dark ? "text-on-ink/50" : "text-outline")}
                      aria-hidden="true"
                    />
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
