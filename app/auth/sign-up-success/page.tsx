import Link from "next/link";

export default function Page() {
  return (
    <div className="w-full max-w-md md:max-w-[440px]">
      <div className="flex flex-col gap-8">
        <div className="space-y-2">
          <h1 className="font-headline text-5xl font-bold uppercase leading-none tracking-tighter text-on-surface md:text-6xl">
            Check Your
            <br />
            Email
          </h1>
          <p className="text-lg font-medium tracking-tight text-on-surface-variant">
            We&apos;ve sent you a confirmation link.
          </p>
        </div>

        <div className="flex flex-col gap-6 border-2 border-black bg-white p-8 shadow-hard">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-4xl text-brand"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              mark_email_unread
            </span>
            <p className="font-body text-on-surface-variant">
              You&apos;ve successfully signed up. Confirm your account via the
              email we sent, then sign in to start your preparation.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="flex w-full items-center justify-center gap-3 border-2 border-black bg-black py-5 font-headline text-xl font-bold uppercase tracking-tight text-white shadow-hard transition-all hover:bg-brand active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Go to Sign In
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
