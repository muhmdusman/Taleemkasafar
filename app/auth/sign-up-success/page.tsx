import Link from "next/link";
import { ArrowRight, MailCheck } from "lucide-react";
import { AuthCard, AuthHeading } from "@/components/auth/auth-ui";
import { appButton } from "@/components/dashboard/styles";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6 md:max-w-[440px]">
      <AuthHeading
        title="Check your email"
        description="We've sent you a confirmation link."
      />

      <AuthCard>
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-fixed text-brand-container">
            <MailCheck className="size-6" aria-hidden="true" />
          </span>
          <p className="leading-relaxed text-on-surface-variant">
            You&apos;ve signed up. Open the email we sent, confirm your account,
            then sign in to start your preparation. Can&apos;t find it? Check
            your spam or promotions folder.
          </p>
        </div>

        <Link href={routes.login} className={cn(appButton({ size: "lg" }), "w-full")}>
          Go to sign in
          <ArrowRight className="size-5" aria-hidden="true" />
        </Link>
      </AuthCard>
    </div>
  );
}
