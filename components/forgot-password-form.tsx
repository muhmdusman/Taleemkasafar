"use client";

import { MailCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  AuthCard,
  AuthHeading,
  FormError,
  authInput,
  authLabel,
} from "@/components/auth/auth-ui";
import { appButton, focusRing } from "@/components/dashboard/styles";
import { routes } from "@/lib/routes";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const backLink = cn(
    "rounded font-semibold text-brand underline-offset-4 hover:text-brand-container hover:underline",
    focusRing,
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <>
          <AuthHeading
            title="Check your email"
            description="Password reset instructions sent."
          />
          <AuthCard>
            <div role="status" className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-fixed text-brand-container">
                <MailCheck className="size-6" aria-hidden="true" />
              </span>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                If you registered using your email and password, you will
                receive a password reset email.
              </p>
            </div>
            <Link href={routes.login} className={appButton({ variant: "secondary" })}>
              Back to sign in
            </Link>
          </AuthCard>
        </>
      ) : (
        <>
          <AuthHeading
            title="Reset your password"
            description="Type in your email and we'll send you a link to reset your password."
          />
          <AuthCard>
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className={authLabel}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={authInput}
                />
              </div>
              {error && <FormError>{error}</FormError>}
              <button
                type="submit"
                className={cn(appButton({ size: "lg" }), "w-full")}
                disabled={isLoading}
              >
                {isLoading ? "Sending…" : "Send reset email"}
              </button>
            </form>
            <p className="text-center text-sm text-on-surface-variant">
              Remembered it?{" "}
              <Link href={routes.login} className={backLink}>
                Sign in
              </Link>
            </p>
          </AuthCard>
        </>
      )}
    </div>
  );
}
