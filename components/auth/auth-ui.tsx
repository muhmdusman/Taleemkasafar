import { AlertCircle } from "lucide-react";
import { card } from "@/components/dashboard/styles";
import { cn } from "@/lib/utils";

/**
 * Shared auth-screen pieces (login, sign-up, password reset), in the same
 * rounded style and palette as the landing page (.kiro/context/DESIGN.md §13).
 * No hooks here, so server pages and client forms can both use them.
 */

/**
 * Text input: white field, 3.3:1 grey edge, near-black text, placeholder at
 * 4.6:1 (readable but clearly lighter than typed text), brand focus ring.
 * `text-base` (16px) stops iOS from zooming into the field.
 */
export const authInput =
  "h-12 w-full rounded-xl border border-outline bg-surface-lowest px-4 font-body text-base text-on-surface caret-brand placeholder:text-on-surface-variant/80 transition-colors hover:border-on-surface-variant focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container/40 aria-[invalid=true]:border-danger motion-reduce:transition-none";

export const authLabel = "font-headline text-sm font-semibold text-on-surface";

/** Page title + intro above the auth card. */
export function AuthHeading({
  title,
  description,
}: {
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="text-base leading-relaxed text-on-surface-variant">{description}</p>
      ) : null}
    </div>
  );
}

/** White rounded card that holds an auth form. */
export function AuthCard({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(card, "flex flex-col gap-6 p-6 sm:p-8", className)} {...props} />;
}

/** Form-level error, announced to screen readers when it appears. */
export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-fixed px-4 py-3 text-sm font-medium text-danger"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** "or continue with" separator between the form and social sign-in. */
export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4" role="separator" aria-label={label}>
      <span className="h-px flex-grow bg-outline-variant" />
      <span className="shrink-0 text-sm text-on-surface-variant">{label}</span>
      <span className="h-px flex-grow bg-outline-variant" />
    </div>
  );
}
