"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signInAction, type AuthState } from "@/app/auth/actions";
import { SocialButtons } from "./social-buttons";

const initialState: AuthState = { error: null };

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );

  const inputClass =
    "w-full border-2 border-black p-4 font-body text-on-surface transition-all placeholder:text-outline-variant focus:border-brand focus:shadow-hard-primary focus:outline-none";

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="space-y-2">
        <h1 className="font-headline text-5xl font-bold uppercase leading-none tracking-tighter text-on-surface md:text-6xl">
          Sign In
        </h1>
        <p className="text-lg font-medium tracking-tight text-on-surface-variant">
          Enter your credentials to access your dashboard.
        </p>
      </div>

      <div className="flex flex-col gap-6 border-2 border-black bg-white p-8 shadow-hard">
        <form action={formAction} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="font-headline text-sm font-bold uppercase tracking-wider text-black"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="font-headline text-sm font-bold uppercase tracking-wider text-black"
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-bold uppercase text-brand hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {state.error && (
            <p className="text-sm font-medium text-danger">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-3 border-2 border-black bg-black py-5 font-headline text-xl font-bold uppercase tracking-tight text-white shadow-hard transition-all hover:bg-brand active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-70"
          >
            {isPending ? "Authenticating…" : "Authenticate"}
            {!isPending && (
              <span className="material-symbols-outlined">arrow_forward</span>
            )}
          </button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t-2 border-surface-variant" />
          <span className="mx-4 flex-shrink font-headline text-xs font-bold uppercase text-outline">
            Or continue with
          </span>
          <div className="flex-grow border-t-2 border-surface-variant" />
        </div>

        <SocialButtons next="/" />

        <div className="flex items-center justify-center gap-2 font-headline">
          <span className="text-xs font-bold uppercase text-on-surface-variant">
            New to the platform?
          </span>
          <Link
            href="/auth/sign-up"
            className="text-xs font-bold uppercase text-brand underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
