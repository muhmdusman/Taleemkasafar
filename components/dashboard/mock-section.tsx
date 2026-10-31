import Link from "next/link";
import type { MockResume } from "@/lib/queries/dashboard";
import type { MockBlueprintSummary } from "@/lib/queries/mock";
import type { Progress } from "@/lib/queries/progress";
import { formatTime } from "@/lib/quiz/time";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { FinishMockButton } from "@/components/quiz/finish-mock-button";
import { StartMockButton } from "@/components/quiz/start-mock-button";
import { Icon } from "./icon";
import { LinkPendingIndicator } from "./link-pending";
import { appButton, card, focusRing } from "./styles";
import { areaTone, toneClasses } from "./tone";

/**
 * Mock tests on the dashboard home: the active test's full mock, with the one
 * action that fits (start, resume a running or paused paper, or score one
 * whose time ran out) and the latest/best scores.
 */
export function MockSection({
  blueprint,
  openMock,
  mocks,
  testName,
  showResultsLink = true,
}: {
  blueprint: MockBlueprintSummary | null;
  openMock: MockResume | null;
  mocks: Progress["mocks"] | null;
  testName: string;
  /** Off on the mock page itself, which lists the results below. */
  showResultsLink?: boolean;
}) {
  const tone = toneClasses[areaTone.mocks];

  if (!blueprint && !openMock) {
    return (
      <div className={cn(card, "flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between")}>
        <div className="flex items-start gap-3">
          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone.tile)}>
            <Icon name="hourglass_top" className="text-xl" />
          </span>
          <p className="text-on-surface-variant">
            Full mock tests for {testName} are on the way. Meanwhile, chapter
            practice builds the same skills.
          </p>
        </div>
        <Link href={routes.subjects} className={cn(appButton({ variant: "secondary" }), "shrink-0")}>
          Practise a chapter
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border p-6 sm:p-8", tone.panel)}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-tone-violet/10"
      />
      <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className={cn("inline-flex items-center gap-2 rounded-full bg-surface-lowest px-3 py-1 font-headline text-xs font-semibold uppercase tracking-widest shadow-soft", tone.text)}>
            <Icon name="timer" className="text-base" />
            {openMock ? stateLabel(openMock.state) : "Full simulation"}
          </p>
          <h3 className="mt-3 font-headline text-2xl font-bold leading-tight tracking-tight text-on-surface md:text-3xl">
            {openMock?.title ?? blueprint?.name}
          </h3>

          {openMock ? (
            <p className="mt-2 text-on-surface-variant">
              <span className="font-semibold text-on-surface tabular-nums">
                {openMock.answered} of {openMock.total}
              </span>{" "}
              answered
              {openMock.secondsLeft !== null && openMock.state !== "timeUp"
                ? ` · ${formatTime(openMock.secondsLeft)} left`
                : ""}
              .{" "}
              {openMock.state === "paused"
                ? "The timer is stopped until you resume."
                : openMock.state === "timeUp"
                  ? "Your saved answers will be scored."
                  : "The timer is running."}
            </p>
          ) : blueprint ? (
            <dl className="mt-4 flex flex-wrap gap-2">
              <Chip label="Questions" value={String(blueprint.totalQuestions)} />
              <Chip label="Duration" value={formatTime(blueprint.durationSeconds)} />
              {mocks?.best != null ? <Chip label="Your best" value={`${Math.round(mocks.best)}%`} /> : null}
            </dl>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 lg:items-end">
          {openMock?.state === "timeUp" ? (
            <FinishMockButton attemptId={openMock.attemptId} className="w-full lg:w-64" />
          ) : openMock ? (
            <Link href={openMock.href} className={cn(appButton({ size: "lg" }), "w-full lg:w-auto")}>
              Resume mock
              <LinkPendingIndicator>
                <Icon name="arrow_forward" className="text-xl" />
              </LinkPendingIndicator>
            </Link>
          ) : blueprint ? (
            <StartMockButton blueprintId={blueprint.id} />
          ) : null}
          {showResultsLink ? (
            <Link
              href={routes.mocks}
              className={cn(
                "inline-flex items-center gap-1 self-start rounded font-headline text-sm font-semibold text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline lg:self-end",
                focusRing,
              )}
            >
              {mocks && mocks.taken > 0 ? `All results (${mocks.taken})` : "About mock tests"}
              <LinkPendingIndicator>
                <Icon name="chevron_right" className="text-lg" />
              </LinkPendingIndicator>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function stateLabel(state: MockResume["state"]) {
  return state === "paused" ? "Paused" : state === "timeUp" ? "Time's up" : "In progress";
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-lowest px-3 py-2 shadow-soft">
      <dt className="text-xs font-semibold text-on-surface-variant">{label}</dt>
      <dd className="font-headline text-lg font-bold tabular-nums text-on-surface">{value}</dd>
    </div>
  );
}
