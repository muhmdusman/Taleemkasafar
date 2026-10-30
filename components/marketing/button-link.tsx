import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Public-site button styles (.kiro/context/DESIGN.md §11: rounded-xl, tokens only, brand
 * focus ring). Use `ButtonLink` for navigation and `marketingButton()` for
 * <button>s. The dashboard keeps the Soft Brutalism buttons.
 */
export const marketingButton = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-headline font-semibold tracking-tight transition-[color,background-color,border-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-px motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Blue is reserved for the MAIN call to action on a section
        // (owner, 2026-10-23). Hover only deepens the same blue.
        primary: "bg-brand text-on-brand hover:bg-brand-container",
        // Everything else is neutral: no blue on hover.
        secondary:
          "border border-outline-variant bg-surface-lowest text-on-surface hover:border-outline hover:bg-surface-low",
        brand: "bg-brand text-on-brand hover:bg-brand-container",
        ghost: "text-on-surface hover:bg-surface-container",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonLinkProps = React.ComponentProps<typeof Link> &
  VariantProps<typeof marketingButton>;

/**
 * Auth pages bundle the Supabase client; prefetching them from the public
 * site loads that JS on every landing visit (Lighthouse TBT). They are static
 * and fast without prefetch, so auth links opt out by default.
 */
export function prefetchFor(href: ButtonLinkProps["href"]): boolean | undefined {
  return typeof href === "string" && href.startsWith("/auth") ? false : undefined;
}

export function ButtonLink({ className, variant, size, prefetch, ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(marketingButton({ variant, size }), className)}
      prefetch={prefetch ?? prefetchFor(props.href)}
      {...props}
    />
  );
}
