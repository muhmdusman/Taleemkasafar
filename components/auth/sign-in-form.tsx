"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { signInAction, type AuthState } from "@/app/auth/actions";
import { appButton, focusRing } from "@/components/dashboard/styles";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { AuthCard, AuthHeading, FormError, OrDivider, authInput, authLabel } from "./auth-ui";
import { PasswordInput } from "./password-input";
import { SocialButtons } from "./social-buttons";

const initialState: AuthState = { error: null };

const textLink = cn(
  "rounded font-semibold text-brand underline-offset-4 hover:text-brand-container hover:underline",
  focusRing,
);

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <AuthHeading
        title="Sign in"
        description="Welcome back. Pick up your preparation where you left off."
      />

      <AuthCard>
        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className={authLabel}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              required
              placeholder="you@example.com"
              className={authInput}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className={authLabel}>
                Password
              </label>
              <Link href="/auth/forgot-password" className={cn(textLink, "text-sm")}>
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="Your password"
            />
          </div>

          {state.error && <FormError>{state.error}</FormError>}

          <button
            type="submit"
            disabled={isPending}
            className={cn(appButton({ size: "lg" }), "w-full")}
          >
            {isPending ? "Signing in…" : "Sign in"}
            {!isPending && <ArrowRight className="size-5" aria-hidden="true" />}
          </button>
        </form>

        <OrDivider label="or continue with" />

        <SocialButtons />

        <p className="text-center text-sm text-on-surface-variant">
          New to Taleem ka Safar?{" "}
          <Link href={routes.signUp} className={textLink}>
            Create a free account
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
