import { Calculator, CheckCircle2, Circle, Lightbulb, XCircle } from "lucide-react";
import { studentOffer } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { routes } from "@/lib/routes";
import { AuthAwareButton } from "@/components/marketing/auth-aware-cta";
import { ButtonLink } from "@/components/marketing/button-link";
import { Container } from "@/components/marketing/container";

/** "NET, PU, UET, FAST and NAT" from config/site.ts (single source). */
const shortNames = siteConfig.entryTests.map((t) => t.short);
const testList = `${shortNames.slice(0, -1).join(", ")} and ${shortNames.at(-1)}`;

/**
 * Words cycled in the headline (CSS animation `word-rotator` in globals.css,
 * tuned for exactly 6 items + a trailing duplicate of the first).
 */
const ROTATING = ["Entry-Test", "NET", "FAST", "PU", "UET", "NAT"];

const HIGHLIGHTS = [studentOffer.short, "Explanation for every wrong answer", "No ads"];

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="overflow-hidden">
      <Container className="grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="inline-flex items-center rounded-full bg-brand px-4 py-1.5 font-headline text-sm font-semibold tracking-tight text-on-brand">
            {studentOffer.tagline}
          </p>
          <h1
            id="hero-heading"
            className="mt-6 font-headline text-4xl font-bold leading-[1.1] tracking-tight text-on-surface sm:text-5xl lg:text-6xl"
          >
            {/* Full sentence for search engines and screen readers. */}
            <span className="sr-only">
              Making Quality Entry-Test Preparation Accessible to Everyone: {testList}
            </span>
            <span aria-hidden="true" className="block">
              Making Quality
              <span className="block h-[1.15em] overflow-hidden text-brand-container">
                <span className="word-rotator flex flex-col">
                  {[...ROTATING, ROTATING[0]].map((word, i) => (
                    <span key={`${word}-${i}`} className="block h-[1.15em] leading-[1.15]">
                      {word}
                    </span>
                  ))}
                </span>
              </span>
              Preparation Accessible to Everyone.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-surface-variant">
            Chapter-wise MCQs for {testList} with an explanation for every wrong
            answer, timed mock tests and progress tracking. Free for students.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <AuthAwareButton
              size="lg"
              arrow
              signedOut={{ label: studentOffer.ctaLabel, href: studentOffer.ctaHref }}
              signedIn={{ label: "Go to dashboard", href: routes.dashboard }}
            />
            <ButtonLink href={routes.meritCalculator} size="lg" variant="secondary">
              <Calculator aria-hidden="true" />
              Try the merit calculator
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-col gap-2 text-sm font-medium text-on-surface sm:flex-row sm:flex-wrap sm:gap-x-6">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-brand-container" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual />
      </Container>
    </section>
  );
}

/**
 * Decorative product illustration built in JSX (no images). Sample content
 * only, not real user data, so it is hidden from assistive tech. Shows the
 * core selling point: a wrong answer followed by its explanation.
 */
function HeroVisual() {
  const options = [
    { key: "A", text: "Zero", state: "correct" as const },
    { key: "B", text: "Constant and non-zero", state: "wrong" as const },
    { key: "C", text: "Increasing", state: "idle" as const },
  ];
  const subjects = [
    { name: "Maths", value: 72 },
    { name: "Physics", value: 58 },
    { name: "English", value: 84 },
  ];
  const optionClass = {
    correct: "border-2 border-success bg-success-fixed",
    wrong: "border-2 border-danger bg-danger-fixed",
    idle: "border border-outline-variant bg-surface-lowest",
  };
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="rounded-2xl border border-outline-variant bg-surface-lowest p-5 shadow-soft-lg sm:p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="rounded-full bg-surface-container px-3 py-1 font-headline font-semibold text-on-surface">
            Physics · Kinematics
          </span>
          <span className="text-on-surface-variant">Sample question</span>
        </div>
        <p className="mt-5 font-medium leading-relaxed text-on-surface">
          A body moves with uniform velocity. What is its acceleration?
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {options.map((o) => (
            <li
              key={o.key}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-on-surface ${optionClass[o.state]}`}
            >
              <span className="font-headline font-bold">{o.key}</span>
              <span className="flex-1">{o.text}</span>
              {o.state === "correct" ? (
                <span className="flex items-center gap-1 font-semibold text-success">
                  <CheckCircle2 className="size-4" />
                  Correct
                </span>
              ) : o.state === "wrong" ? (
                <span className="flex items-center gap-1 font-semibold text-danger">
                  <XCircle className="size-4" />
                  Your answer
                </span>
              ) : (
                <Circle className="size-4 text-outline" />
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-xl bg-brand-fixed px-4 py-3 text-sm leading-relaxed text-on-surface">
          <p className="flex items-center gap-2 font-headline font-semibold text-brand-container">
            <Lightbulb className="size-4" />
            Why B is wrong
          </p>
          <p className="mt-1 text-on-surface-variant">
            Uniform velocity means no change in speed or direction, so there is
            no acceleration at all. The answer is zero.
          </p>
        </div>
      </div>

      <div className="relative -mt-6 ml-auto w-[85%] rounded-2xl border-2 border-ink bg-surface-lowest p-5 shadow-hard sm:-mt-8 sm:w-[75%]">
        <p className="font-headline text-sm font-semibold text-on-surface">Your progress</p>
        <ul className="mt-4 flex flex-col gap-3">
          {subjects.map((s) => (
            <li key={s.name} className="text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>{s.name}</span>
                <span className="font-semibold text-on-surface">{s.value}%</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-surface-high">
                <div className="h-2 rounded-full bg-brand" style={{ width: `${s.value}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
