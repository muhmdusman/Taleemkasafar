import { studentOffer } from "@/config/pricing";
import { routes } from "@/lib/routes";
import { AuthAwareButton } from "@/components/marketing/auth-aware-cta";
import { cn } from "@/lib/utils";

type PracticeCtaProps = {
  /** Heading id for aria-labelledby (must be unique on the page). */
  id: string;
  title: string;
  description: string;
  className?: string;
};

/**
 * Shared "start practising" call-to-action card for inner public pages.
 * Signed-out: "Get started free" -> sign-up; signed-in: "Go to dashboard".
 */
export function PracticeCta({ id, title, description, className }: PracticeCtaProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-outline-variant bg-surface-lowest p-6 shadow-soft sm:p-10 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="max-w-xl">
        <p className="font-headline text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          {studentOffer.short}
        </p>
        <h2
          id={id}
          className="mt-2 font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-3 text-on-surface-variant">{description}</p>
      </div>
      <AuthAwareButton
        size="lg"
        arrow
        className="shrink-0 self-start md:self-auto"
        signedOut={{ label: studentOffer.ctaLabel, href: studentOffer.ctaHref }}
        signedIn={{ label: "Go to dashboard", href: routes.dashboard }}
      />
    </section>
  );
}
