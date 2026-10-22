"use client";

import { ArrowRight, LayoutDashboard } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { ButtonLink, type marketingButton } from "@/components/marketing/button-link";
import { siteConfig } from "@/config/site";
import { useSignedIn } from "@/lib/hooks/use-signed-in";

type Variant = VariantProps<typeof marketingButton>["variant"];
type Size = VariantProps<typeof marketingButton>["size"];

export type CtaSpec = { label: string; href: string; variant?: Variant };

type AuthAwareButtonProps = {
  signedOut: CtaSpec;
  signedIn: CtaSpec;
  size?: Size;
  className?: string;
  /** Trailing arrow icon (decorative). */
  arrow?: boolean;
};

/**
 * One CTA that shows `signedOut` for visitors and `signedIn` for students who
 * are already logged in (see lib/hooks/use-signed-in.ts). Server components
 * pass plain data; icons are chosen here so nothing non-serializable crosses
 * the client boundary.
 */
export function AuthAwareButton({
  signedOut,
  signedIn,
  size,
  className,
  arrow,
}: AuthAwareButtonProps) {
  const isSignedIn = useSignedIn();
  const cta = isSignedIn ? signedIn : signedOut;
  return (
    <ButtonLink href={cta.href} variant={cta.variant} size={size} className={className}>
      {cta.label}
      {arrow ? <ArrowRight aria-hidden="true" /> : null}
    </ButtonLink>
  );
}

/** Header buttons: Sign in + Register, or Start practice + Access dashboard. */
export function HeaderAuthButtons() {
  const isSignedIn = useSignedIn();
  const { auth } = siteConfig;
  if (isSignedIn) {
    return (
      <>
        <ButtonLink
          href={auth.practice.href}
          variant="secondary"
          size="sm"
          className="hidden sm:inline-flex"
        >
          {auth.practice.label}
        </ButtonLink>
        <ButtonLink
          href={auth.dashboard.href}
          variant="primary"
          size="sm"
          className="hidden sm:inline-flex"
        >
          <LayoutDashboard aria-hidden="true" />
          {auth.dashboard.label}
        </ButtonLink>
      </>
    );
  }
  return (
    <>
      <ButtonLink
        href={auth.signIn.href}
        variant="secondary"
        size="sm"
        className="hidden sm:inline-flex"
      >
        {auth.signIn.label}
      </ButtonLink>
      <ButtonLink
        href={auth.register.href}
        variant="primary"
        size="sm"
        className="hidden sm:inline-flex"
      >
        {auth.register.label}
      </ButtonLink>
    </>
  );
}
