"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUpAction, type AuthState } from "@/app/auth/actions";
import { SocialButtons } from "./social-buttons";

const initialState: AuthState = { error: null };

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialState,
  );

  const inputClass =
    "w-full border-2 border-black bg-white p-4 font-body text-black transition-all placeholder:text-outline focus:border-brand focus:shadow-hard-primary focus:outline-none";

  return (
    <div className="grid w-full max-w-2xl grid-cols-1 border-2 border-black bg-white shadow-hard md:grid-cols-12">
      {/* Branding side */}
      <aside className="relative flex flex-col justify-between overflow-hidden border-b-2 border-black bg-brand-fixed p-8 md:col-span-5 md:border-b-0 md:border-r-2">
        <div className="relative z-10">
          <h1 className="mb-6 font-headline text-4xl font-bold uppercase leading-none tracking-tighter text-[#001a42]">
            Build Your
            <br />
            Future.
          </h1>
          <p className="font-body font-medium leading-relaxed text-[#004395]">
            Join the journey of high-performance entry-test preparation.
            Precise, focused, and built for success.
          </p>
        </div>
        <div className="relative z-10 mt-12 space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-brand"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="font-headline text-sm font-bold uppercase tracking-wider">
              Premium Content
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-brand"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              speed
            </span>
            <span className="font-headline text-sm font-bold uppercase tracking-wider">
              Real-time Analysis
            </span>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rotate-12 border-4 border-black bg-brand opacity-10" />
      </aside>

      {/* Form side */}
      <div className="p-8 md:col-span-7 md:p-12">
        <div className="mb-8">
          <h2 className="mb-2 font-headline text-3xl font-extrabold uppercase tracking-tight text-black">
            Create Account
          </h2>
          <p className="font-medium text-secondary">
            Enter your details to start your journey.
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block font-headline text-xs font-bold uppercase tracking-widest text-black"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="John Doe"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block font-headline text-xs font-bold uppercase tracking-widest text-black"
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

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block font-headline text-xs font-bold uppercase tracking-widest text-black"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
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
            <p className="text-[10px] font-bold uppercase tracking-tight text-secondary">
              Minimum 8 characters.
            </p>
          </div>

          <div className="flex items-start gap-3 py-2">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="mt-0.5 h-5 w-5 rounded-none border-2 border-black text-brand focus:ring-0"
            />
            <label
              htmlFor="terms"
              className="text-xs font-medium leading-tight text-on-surface-variant"
            >
              I agree to the{" "}
              <a href="#" className="font-bold text-brand underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-bold text-brand underline">
                Privacy Policy
              </a>
              .
            </label>
          </div>

          {state.error && (
            <p className="text-sm font-medium text-danger">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-3 border-2 border-black bg-black px-8 py-5 font-headline text-xl font-bold uppercase tracking-tighter text-white transition-colors hover:bg-brand disabled:opacity-70"
          >
            <span>{isPending ? "Creating…" : "Create Account"}</span>
            {!isPending && (
              <span className="material-symbols-outlined">arrow_forward</span>
            )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative mb-6 flex items-center">
            <div className="flex-grow border-t-2 border-surface-variant" />
            <span className="mx-4 flex-shrink font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-outline">
              Or join with
            </span>
            <div className="flex-grow border-t-2 border-surface-variant" />
          </div>
          <SocialButtons next="/" />
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 font-headline">
          <span className="text-xs font-bold uppercase text-on-surface-variant">
            Already have an account?
          </span>
          <Link
            href="/auth/login"
            className="text-xs font-bold uppercase text-brand underline-offset-4 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
