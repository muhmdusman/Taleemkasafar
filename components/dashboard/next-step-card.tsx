import Link from "next/link";
import type { Journey } from "@/lib/queries/dashboard";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { appButton, card, focusRing } from "./styles";

/**
 * The one thing to do next, shown beside the dashboard greeting:
 *  1. an unfinished practice chapter or mock -> "Continue"
 *  2. first visit -> a 3-step "Get started" checklist
 *  3. otherwise -> practise or take another mock
 * One primary (blue) button per state keeps the next step obvious.
 */
export function NextStepCard({
  journey,
  testName,
}: {
  journey: Journey;
  testName: string;
}) {
  const { resume, hasPracticed, hasTakenMock } = journey;
  if (resume) return <ResumeCard resume={resume} />;
  if (!hasPracticed || !hasTakenMock) {
    return (
      <GetStartedCard
        testName={testName}
        hasPracticed={hasPracticed}
        hasTakenMock={hasTakenMock}
      />
    );
  }
  return <KeepGoingCard />;
}

const quietLink = cn(
  "rounded font-headline text-sm font-semibold text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline",
  focusRing,
);

function CardShell({
  eyebrow,
  icon,
  children,
}: {
  eyebrow: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={eyebrow} className={cn(card, "flex flex-col gap-5 p-6 shadow-soft-lg")}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-fixed text-brand-container">
          <Icon name={icon} filled className="text-xl" />
        </span>
        <p className="font-headline text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          {eyebrow}
        </p>
      </div>
      {children}
    </section>
  );
}

function ResumeCard({ resume }: { resume: NonNullable<Journey["resume"]> }) {
  if (resume.kind === "mock") {
    const pct = resume.total === 0 ? 0 : (resume.answered / resume.total) * 100;
    return (
      <CardShell eyebrow="Pick up where you left off" icon="timer">
        <div>
          <h2 className="font-headline text-xl font-bold leading-snug tracking-tight text-on-surface">
            {resume.title}
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            <span className="tabular-nums">
              {resume.answered} of {resume.total}
            </span>{" "}
            answered. The timer keeps running while you are away.
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-high" aria-hidden="true">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        <Link href={resume.href} className={cn(appButton(), "w-full")}>
          Resume mock
          <Icon name="arrow_forward" className="text-lg" />
        </Link>
      </CardShell>
    );
  }

  return (
    <CardShell eyebrow="Pick up where you left off" icon="history">
      <div>
        <h2 className="font-headline text-xl font-bold leading-snug tracking-tight text-on-surface">
          {resume.chapterTitle}
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          {resume.subjectName} · {resume.usage === "past_paper" ? "Past paper" : "Practice"}
          {resume.answered > 0 ? (
            <>
              {" "}
              · <span className="tabular-nums">{resume.answered}</span> answered
            </>
          ) : null}
        </p>
      </div>
      <Link href={resume.href} className={cn(appButton(), "w-full")}>
        Continue
        <Icon name="arrow_forward" className="text-lg" />
      </Link>
      <p className="text-center text-sm text-on-surface-variant">
        Or{" "}
        <Link href={routes.subjects} className={quietLink}>
          pick another chapter
        </Link>
      </p>
    </CardShell>
  );
}

function GetStartedCard({
  testName,
  hasPracticed,
  hasTakenMock,
}: {
  testName: string;
  hasPracticed: boolean;
  hasTakenMock: boolean;
}) {
  const steps = [
    { key: "test", label: `Choose your test: ${testName}`, done: true, href: null, cta: null },
    {
      key: "practice",
      label: "Answer your first practice questions",
      done: hasPracticed,
      href: routes.subjects,
      cta: "Pick a chapter",
    },
    {
      key: "mock",
      label: "Take a timed mock test",
      done: hasTakenMock,
      href: routes.mocks,
      cta: "Start a mock",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  // The first unfinished step gets the primary button.
  const nextKey = steps.find((s) => !s.done)?.key;

  return (
    <CardShell eyebrow="Get started" icon="flag">
      <p className="text-sm text-on-surface-variant">
        <span className="font-semibold text-on-surface tabular-nums">
          {doneCount} of {steps.length}
        </span>{" "}
        steps done. Practising first makes your first mock less stressful.
      </p>
      <ol className="flex flex-col gap-3">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full font-headline text-xs font-bold",
                s.done
                  ? "bg-success-fixed text-success"
                  : s.key === nextKey
                    ? "bg-brand text-on-brand"
                    : "bg-surface-container text-on-surface-variant",
              )}
            >
              {s.done ? <Icon name="check" className="text-base" /> : i + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span
                className={cn(
                  "font-headline text-sm font-semibold",
                  s.done ? "text-on-surface-variant" : "text-on-surface",
                )}
              >
                {s.label}
                {s.done ? <span className="sr-only"> (done)</span> : null}
              </span>
              {!s.done && s.href && s.cta ? (
                <Link
                  href={s.href}
                  className={appButton({
                    variant: s.key === nextKey ? "primary" : "secondary",
                    size: "sm",
                    className: "self-start",
                  })}
                >
                  {s.cta}
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </CardShell>
  );
}

function KeepGoingCard() {
  return (
    <CardShell eyebrow="Keep going" icon="rocket_launch">
      <p className="text-sm leading-relaxed text-on-surface-variant">
        Steady practice wins. Work through a new chapter, then test yourself
        with another timed mock.
      </p>
      <Link href={routes.subjects} className={cn(appButton(), "w-full")}>
        Practice by topic
        <Icon name="arrow_forward" className="text-lg" />
      </Link>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        <Link href={routes.mocks} className={quietLink}>
          Take a mock
        </Link>
        <Link href={routes.performance} className={quietLink}>
          See your progress
        </Link>
      </div>
    </CardShell>
  );
}
