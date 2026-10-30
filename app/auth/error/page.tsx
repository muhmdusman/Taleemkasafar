import { Suspense } from "react";
import Link from "next/link";
import { AuthCard, AuthHeading } from "@/components/auth/auth-ui";
import { appButton } from "@/components/dashboard/styles";
import { routes } from "@/lib/routes";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <p className="text-sm leading-relaxed text-on-surface-variant">
      {params?.error ? `Code error: ${params.error}` : "An unspecified error occurred."}
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <AuthHeading title="Sorry, something went wrong." />
      <AuthCard>
        <Suspense>
          <ErrorContent searchParams={searchParams} />
        </Suspense>
        <div className="flex flex-wrap gap-3">
          <Link href={routes.login} className={appButton()}>
            Back to sign in
          </Link>
          <Link href={routes.contact} className={appButton({ variant: "secondary" })}>
            Get help
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
