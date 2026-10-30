"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, BadgeCheck, Gauge } from "lucide-react";
import { signUpAction, type AuthState } from "@/app/auth/actions";
import { appButton, focusRing } from "@/components/dashboard/styles";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { FormError, OrDivider, authInput, authLabel } from "./auth-ui";
import { PasswordInput } from "./password-input";
import { SocialButtons } from "./social-buttons";

const initialState: AuthState = { error: null };

const textLink = cn(
  "rounded font-semibold text-brand underline-offset-4 hover:text-brand-container hover:underline",
  focusRing,
);

const PERKS = [
  { icon: BadgeCheck, label: "An explanation for every mistake" },
  { icon: Gauge, label: "Progress you can track" },
];

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <div className="grid w-full max-w-3xl grid-cols-1 overflow-hidden rounded-2xl border border-outline-variant bg-surface-lowest shadow-soft-lg md:grid-cols-12">
      {/* Branding side */}
      <aside className="relative flex flex-col justify-between overflow-hidden border-b border-brand/10 bg-brand-fixed p-8 md:col-span-5 md:border-b-0 md:border-r">
        <div className="relative z-10">
          <h1 className="mb-4 font-headline text-3xl font-bold leading-tight tracking-tight text-on-surface sm:text-4xl">
            Build your future.
          </h1>
          <p className="leading-relaxed text-on-surface-variant">
            Join students preparing for NET, PU and more. Free for students,
            built by students and teachers.
          </p>
        </div>
        <ul className="relative z-10 mt-10 space-y-3">
          {PERKS.map(({ icon: PerkIcon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-lowest text-brand-container shadow-soft">
                <PerkIcon className="size-5" aria-hidden="true" />
              </span>
              <span className="font-headline text-sm font-semibold text-on-surface">{label}</span>
            </li>
          ))}
        </ul>
        {/* Decorative soft circle. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 -right-12 size-44 rounded-full bg-brand/10"
        />
      </aside>

      {/* Form side */}
      <div className="p-6 sm:p-8 md:col-span-7 md:p-10">
        <div className="mb-6">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            Create your account
          </h2>
          <p className="mt-1 text-on-surface-variant">
            It takes a minute. No card or payment needed.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className={authLabel}>
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="e.g. Ayesha Khan"
              className={authInput}
            />
          </div>

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
            <label htmlFor="password" className={authLabel}>
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              aria-describedby="password-hint"
            />
            <p id="password-hint" className="text-xs text-on-surface-variant">
              Use at least 8 characters.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container focus-visible:ring-offset-2"
            />
            <label htmlFor="terms" className="text-sm leading-snug text-on-surface-variant">
              I agree to the{" "}
              <a href="#" className={textLink}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className={textLink}>
                Privacy Policy
              </a>
              .
            </label>
          </div>

          {state.error && <FormError>{state.error}</FormError>}

          <button
            type="submit"
            disabled={isPending}
            className={cn(appButton({ size: "lg" }), "w-full")}
          >
            {isPending ? "Creating your account…" : "Create account"}
            {!isPending && <ArrowRight className="size-5" aria-hidden="true" />}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-6">
          <OrDivider label="or sign up with" />
          <SocialButtons />
        </div>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link href={routes.login} className={textLink}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
