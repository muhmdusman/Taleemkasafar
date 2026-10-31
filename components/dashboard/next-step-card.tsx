import Link from "next/link";
import type { Journey, MockResume, PracticeResume } from "@/lib/queries/dashboard";
import type { EntryTest } from "@/lib/queries/entry-test";
import { formatTime } from "@/lib/quiz/time";
import { routes } from "@/lib/routes";
import { subjectTone, type Tone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";
import { FinishMockButton } from "@/components/quiz/finish-mock-button";
import { EntryTestPicker } from "./entry-test-picker";
import { Icon } from "./icon";
import { LinkPendingIndicator } from "./link-pending";
import { appButton, card, focusRing } from "./styles";
import { areaTone, toneClasses } from "./tone";

/**
 * The one thing to do next, shown beside the dashboard greeting:
 *  1. an unsubmitted mock (running / paused / out of time) or an unfinished
 *     practice chapter -> resume it
 *  2. new student -> a 3-step "Get started" checklist, starting with the
 *     entry-test choice right here (no hunting for settings)
 *  3. otherwise -> keep going
 * One primary (blue) button per state keeps the next step obvious.
 */
export function NextStepCard({
  journey,
  test,
  tests,
}: {
  journey: Journey;
  test: EntryTest;
  tests: EntryTest[];
}) {
  const { resume, hasChosenTest, hasPracticed, hasTakenMock } = journey;
  if (resume?.kind === "mock") return <MockResumeCard resume={resume} />;
  if (resume?.kind === "practice") return <PracticeResumeCard resume={resume} />;
  if (!hasPracticed || !hasTakenMock) {
    return (
      <GetStartedCard
        test={test}
        tests={tests}
        // Practising or taking a mock means the test is settled already.
        hasChosenTest={hasChosenTest || hasPracticed || hasTakenMock}
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
  tone,
  children,
}: {
  eyebrow: string;
  icon: string;
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={eyebrow}
      className={cn(card, "flex flex-col gap-5 border-t-4 p-6 shadow-soft-lg", toneClasses[tone].topBorder)}
    >
      <div className="flex items-center gap-3">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", toneClasses[tone].tile)}>
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

function ArrowOrSpinner() {
  return (
    <LinkPendingIndicator>
      <Icon name="arrow_forward" className="text-lg" />
    </LinkPendingIndicator>
  );
}

function MockResumeCard({ resume }: { resume: MockResume }) {
  const pct = resume.total === 0 ? 0 : (resume.answered / resume.total) * 100;
  const tone = toneClasses[areaTone.mocks];
  const timeLeft = resume.secondsLeft === null ? null : formatTime(resume.secondsLeft);

  const copy = {
    running: {
      eyebrow: "Mock in progress",
      icon: "timer",
      note: timeLeft ? `${timeLeft} left. The timer keeps running while you are away.` : "Your answers are saved.",
    },
    paused: {
      eyebrow: "Mock paused",
      icon: "pause_circle",
      note: timeLeft ? `Timer stopped with ${timeLeft} left. It starts again when you resume.` : "Timer stopped.",
    },
    timeUp: {
      eyebrow: "Time's up",
      icon: "alarm",
      note: "Your time ran out before you submitted. Your saved answers still count.",
    },
  }[resume.state];

  return (
    <CardShell eyebrow={copy.eyebrow} icon={copy.icon} tone={areaTone.mocks}>
      <div>
        <h2 className="font-headline text-xl font-bold leading-snug tracking-tight text-on-surface">
          {resume.title}
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface tabular-nums">
            {resume.answered} of {resume.total}
          </span>{" "}
          answered. {copy.note}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-high" aria-hidden="true">
        <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${pct}%` }} />
      </div>
      {resume.state === "timeUp" ? (
        <FinishMockButton attemptId={resume.attemptId} className="w-full" />
      ) : (
        <Link href={resume.href} className={cn(appButton(), "w-full")}>
          Resume mock
          <ArrowOrSpinner />
        </Link>
      )}
    </CardShell>
  );
}

function PracticeResumeCard({ resume }: { resume: PracticeResume }) {
  const tone = subjectTone(resume.subjectSlug);
  return (
    <CardShell eyebrow="Pick up where you left off" icon="history" tone={tone}>
      <div>
        <span className={cn("inline-flex rounded-full px-2.5 py-0.5 font-headline text-xs font-semibold", toneClasses[tone].chip)}>
          {resume.subjectName} · {resume.usage === "past_paper" ? "Past paper" : "Practice"}
        </span>
        <h2 className="mt-2 font-headline text-xl font-bold leading-snug tracking-tight text-on-surface">
          {resume.chapterTitle}
        </h2>
        {resume.answered > 0 ? (
          <p className="mt-1 text-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface tabular-nums">{resume.answered}</span>{" "}
            answered so far
          </p>
        ) : null}
      </div>
      <Link href={resume.href} className={cn(appButton(), "w-full")}>
        Continue
        <ArrowOrSpinner />
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
  test,
  tests,
  hasChosenTest,
  hasPracticed,
  hasTakenMock,
}: {
  test: EntryTest;
  tests: EntryTest[];
  hasChosenTest: boolean;
  hasPracticed: boolean;
  hasTakenMock: boolean;
}) {
  const steps = [
    {
      key: "test",
      label: hasChosenTest ? `Preparing for ${test.name}` : "Which test are you preparing for?",
      done: hasChosenTest,
      href: null,
      cta: null,
    },
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
    <CardShell eyebrow="Get started" icon="flag" tone={areaTone.home}>
      <div>
        <div className="flex items-center justify-between text-sm text-on-surface-variant">
          <span>
            <span className="font-semibold text-on-surface tabular-nums">
              {doneCount} of {steps.length}
            </span>{" "}
            steps done
          </span>
          <span className="tabular-nums">{Math.round((doneCount / steps.length) * 100)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-high" aria-hidden="true">
          <div
            className="h-full rounded-full bg-tone-teal transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </div>
      <ol className="flex flex-col gap-4">
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
              {s.key === "test" && !s.done ? (
                <EntryTestPicker tests={tests} activeId={test.id} />
              ) : s.key === "test" ? (
                <span className="text-xs text-on-surface-variant">
                  Change it any time from the top bar.
                </span>
              ) : null}
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
                  <ArrowOrSpinner />
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
    <CardShell eyebrow="Keep going" icon="rocket_launch" tone={areaTone.home}>
      <p className="text-sm leading-relaxed text-on-surface-variant">
        Steady practice wins. Work through a new chapter, then test yourself
        with another timed mock.
      </p>
      <Link href={routes.subjects} className={cn(appButton(), "w-full")}>
        Practice by topic
        <ArrowOrSpinner />
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
