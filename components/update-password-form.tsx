"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  AuthCard,
  AuthHeading,
  FormError,
  authLabel,
} from "@/components/auth/auth-ui";
import { PasswordInput } from "@/components/auth/password-input";
import { appButton } from "@/components/dashboard/styles";
import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Redirect to the dashboard after password update.
      router.push(routes.dashboard);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <AuthHeading
        title="Choose a new password"
        description="Please enter your new password below."
      />
      <AuthCard>
        <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className={authLabel}>
              New password
            </label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
              minLength={8}
              aria-describedby="password-hint"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* Same rule as sign-up (app/auth/actions.ts). */}
            <p id="password-hint" className="text-xs text-on-surface-variant">
              Use at least 8 characters.
            </p>
          </div>
          {error && <FormError>{error}</FormError>}
          <button
            type="submit"
            className={cn(appButton({ size: "lg" }), "w-full")}
            disabled={isLoading}
          >
            {isLoading ? "Saving…" : "Save new password"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
