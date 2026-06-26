import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

/**
 * Root = authenticated landing. The proxy guards this route; we also verify on
 * the server. The auth read (cookies) is isolated in a Suspense boundary as
 * required by Cache Components.
 */
export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-surface font-body text-on-surface">
      <header className="flex h-20 w-full items-center justify-between border-b-2 border-black bg-white px-6">
        <span className="font-headline text-2xl font-bold uppercase tracking-tighter text-black">
          Taleem ka Safar
        </span>
        <LogoutButton />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6 md:p-10">
        <Suspense fallback={<WelcomeSkeleton />}>
          <Welcome />
        </Suspense>

        <div className="border-2 border-black bg-white p-8 shadow-hard">
          <p className="font-body text-on-surface-variant">
            Your dashboard is coming next — subjects, practice, mock tests and
            performance analytics.
          </p>
        </div>
      </main>
    </div>
  );
}

async function Welcome() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const email = data.claims.email as string | undefined;

  return (
    <div className="space-y-2">
      <h1 className="font-headline text-4xl font-bold uppercase leading-none tracking-tighter md:text-5xl">
        Welcome
      </h1>
      <p className="text-lg font-medium tracking-tight text-on-surface-variant">
        {email ? `Signed in as ${email}` : "You are signed in."}
      </p>
    </div>
  );
}

function WelcomeSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-12 w-48 animate-pulse bg-surface-high" />
      <div className="h-6 w-72 animate-pulse bg-surface-container" />
    </div>
  );
}
