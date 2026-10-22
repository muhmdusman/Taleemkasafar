import type { Breadcrumb } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { Container } from "@/components/marketing/container";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  breadcrumbs: Breadcrumb[];
  /** Kept for callers; shown as a small label above the intro text. */
  eyebrow?: string;
  /** The page's single h1 (shown large in the banner). */
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Inner public page intro: a light sky-blue banner with the plain white
 * "Taleemkasafar" wordmark and the page h1, then breadcrumbs, intro text and
 * actions on the page background (owner direction, 2026-10-23).
 */
export function PageHeader({
  breadcrumbs,
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={className}>
      <div className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-container text-on-brand">
        {/* Subtle dot texture (decorative). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(var(--on-brand)/0.14)_1.5px,transparent_1.5px)] bg-[length:22px_22px]"
        />
        <Container className="relative flex flex-col items-center py-12 text-center md:py-16">
          <p className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {siteConfig.wordmark}
          </p>
          <h1 className="mt-4 max-w-4xl text-balance font-headline text-2xl font-semibold leading-tight tracking-tight sm:text-3xl md:text-4xl">
            {title}
          </h1>
        </Container>
      </div>
      <Container className="pb-4 pt-8 md:pt-10">
        <Breadcrumbs items={breadcrumbs} />
        {eyebrow || description || children ? (
          <div className="mt-5 max-w-3xl">
            {eyebrow ? (
              <p className="font-headline text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
                {eyebrow}
              </p>
            ) : null}
            {description ? (
              <p className={cn("text-lg leading-relaxed text-on-surface-variant", eyebrow && "mt-2")}>
                {description}
              </p>
            ) : null}
            {children}
          </div>
        ) : null}
      </Container>
    </div>
  );
}
