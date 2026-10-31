import Link from "next/link";
import type { FocusSuggestion } from "@/lib/queries/dashboard-helpers";
import type { Progress } from "@/lib/queries/progress";
import { routes } from "@/lib/routes";
import { subjectTone, type Tone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { LinkPendingIndicator } from "./link-pending";
import { card, cardInteractive, focusRing } from "./styles";
import { toneClasses } from "./tone";

/**
 * "Your progress" on the dashboard home: four soft-coloured stat tiles for the
 * active test, plus one suggested focus subject when something stands out.
 * New students see the same tiles with friendly hints instead of zeros.
 */
export function ProgressSection({
  progress,
  focus,
}: {
  progress: Progress;
  focus: FocusSuggestion | null;
}) {
  const { practice, mocks } = progress;
  const latest = mocks.latest;
  const trend =
    latest && mocks.previous ? Math.round(latest.scorePercent - mocks.previous.scorePercent) : null;

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          tone="blue"
          icon="task_alt"
          label="Questions practised"
          value={practice.answered.toLocaleString()}
          hint={practice.answered === 0 ? "Answer a few to start" : "in practice & past papers"}
        />
        <StatTile
          tone="teal"
          icon="target"
          label="Practice accuracy"
          value={practice.answered === 0 ? "—" : `${practice.accuracyPercent}%`}
          hint={
            practice.answered === 0
              ? "Shows after your first answers"
              : `${practice.correct.toLocaleString()} correct`
          }
        />
        <StatTile
          tone="violet"
          icon="timer"
          label="Mock tests"
          value={String(mocks.taken)}
          hint={mocks.best === null ? "None taken yet" : `Best ${Math.round(mocks.best)}%`}
        />
        <StatTile
          tone="amber"
          icon="trending_up"
          label="Latest mock"
          value={latest ? `${Math.round(latest.scorePercent)}%` : "—"}
          hint={
            latest
              ? trend === null
                ? "Your first score"
                : trend === 0
                  ? "Same as last time"
                  : `${trend > 0 ? "+" : ""}${trend} vs last mock`
              : "Take one when ready"
          }
          href={latest ? routes.mockResult(latest.attemptId) : undefined}
        />
      </ul>

      {focus ? <FocusCard focus={focus} /> : null}
    </div>
  );
}

function StatTile({
  tone,
  icon,
  label,
  value,
  hint,
  href,
}: {
  tone: Tone;
  icon: string;
  label: string;
  value: string;
  hint: string;
  href?: string;
}) {
  const t = toneClasses[tone];
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("flex size-9 items-center justify-center rounded-xl", t.tile)}>
          <Icon name={icon} className="text-xl" />
        </span>
        {href ? (
          <span className="text-on-surface-variant">
            <LinkPendingIndicator>
              <Icon name="chevron_right" className="text-xl" />
            </LinkPendingIndicator>
          </span>
        ) : null}
      </div>
      <div className="mt-3 font-headline text-3xl font-bold tabular-nums tracking-tight text-on-surface">
        {value}
      </div>
      <div className="mt-0.5 font-headline text-sm font-semibold text-on-surface">{label}</div>
      <div className="mt-1 text-xs text-on-surface-variant">{hint}</div>
    </>
  );

  return (
    <li className="flex">
      {href ? (
        <Link href={href} className={cn(cardInteractive, "w-full p-4 sm:p-5", t.hoverBorder)}>
          {body}
        </Link>
      ) : (
        <div className={cn(card, "w-full p-4 sm:p-5")}>{body}</div>
      )}
    </li>
  );
}

function FocusCard({ focus }: { focus: FocusSuggestion }) {
  const t = toneClasses[subjectTone(focus.slug)];
  const why =
    focus.reason === "mock"
      ? `${focus.name} was your weakest subject in the last mock (${focus.percent}%).`
      : focus.reason === "practice"
        ? `${focus.name} is at ${focus.percent}% correct in practice.`
        : `You haven't started ${focus.name} yet.`;
  return (
    <div className={cn("flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5", t.panel)}>
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-lowest shadow-soft">
          <Icon name="lightbulb" filled className={cn("text-xl", t.text)} />
        </span>
        <div>
          <p className="font-headline text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
            Suggested focus
          </p>
          <p className="mt-0.5 font-headline text-base font-bold text-on-surface">{why}</p>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            One chapter today makes a real difference.
          </p>
        </div>
      </div>
      <Link
        href={routes.subject(focus.slug)}
        className={cn(
          "inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-surface-lowest px-4 font-headline text-sm font-semibold shadow-soft transition-colors hover:bg-surface-low motion-reduce:transition-none sm:self-auto",
          t.text,
          focusRing,
        )}
      >
        Practise {focus.name}
        <LinkPendingIndicator>
          <Icon name="arrow_forward" className="text-lg" />
        </LinkPendingIndicator>
      </Link>
    </div>
  );
}
