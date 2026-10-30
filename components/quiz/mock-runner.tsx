"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/dashboard/icon";
import { Spinner, TopProgressBar } from "@/components/dashboard/loading-indicators";
import { appButton, card } from "@/components/dashboard/styles";
import { toneClasses } from "@/components/dashboard/tone";
import {
  pauseMock,
  saveMockAnswer,
  submitMock,
  syncMock,
  toggleReview,
} from "@/app/dashboard/quiz-actions";
import type { MockAttemptData } from "@/lib/queries/mock";
import {
  buildSections,
  mockSubmitCounts,
  resumeIndex,
  type AnswerState,
} from "@/lib/quiz/session";
import { routes } from "@/lib/routes";
import { subjectTone } from "@/lib/subject-tone";
import { cn } from "@/lib/utils";
import { Dialog } from "./dialog";
import { MathText } from "./math-text";
import { OptionButton } from "./option-button";
import { PaletteLegend, QuestionPalette } from "./question-palette";
import { FullscreenLoader } from "./quiz-loader";
import { QuizTimer } from "./quiz-timer";
import { SectionTabs } from "./section-tabs";
import { useBackGuard } from "./use-back-guard";

type Clock = { expiresAt: string | null; pausedSecondsLeft: number | null };
type OpenDialog = "submit" | "leave" | "map" | null;

const statusChip =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-headline text-xs font-semibold";

/**
 * Timed mock sitting on a full-screen, distraction-free layout (no dashboard
 * sidebar or bottom nav), like practice:
 *  - header: Exit, paper title + answered count + save status, timer, Submit
 *  - body: question card + (desktop) section tabs and question map
 *  - footer: Prev, Mark for review, Questions (mobile map), Next
 *
 * Leaving: Exit or the browser Back button opens "Pause or end?". Pause stops
 * the timer on the server (mcq_15) and goes home; End submits and goes home.
 * Every exit first pops the Back-guard entry, then `router.replace`s, so the
 * sitting doesn't stay in Back history. Each selection saves immediately;
 * failed saves are retried (and must succeed) before pausing, and are always
 * included on submit.
 *
 * Cache Components may hide this screen and show it again later with its old
 * state. So every time it is shown, a layout effect (which runs before the
 * timer's effects) resets the UI and marks the clock unconfirmed; the server
 * sync then resumes a paused timer, or redirects if the mock was already
 * submitted. Time-up only submits once the server has confirmed the clock.
 */
export function MockRunner({ data }: { data: MockAttemptData }) {
  const router = useRouter();
  const { attemptId, questions, sectionLabels, sectionSlugs } = data;

  const [index, setIndex] = useState(() =>
    resumeIndex(questions.map((q) => q.savedOptionId !== null)),
  );
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.savedOptionId) init[q.id] = q.savedOptionId;
    });
    return init;
  });
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  });
  const [review, setReview] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    questions.forEach((q, i) => {
      if (data.reviewFlags[i]) init[q.id] = true;
    });
    return init;
  });

  const [clock, setClock] = useState<Clock>({
    expiresAt: data.expiresAt,
    pausedSecondsLeft: data.pausedSecondsLeft,
  });
  // The expiry the server confirmed since this screen was (re)shown
  // (undefined = not confirmed yet). Refs, so resets are visible to the
  // timer's effects in the same flush.
  const confirmedExpiry = useRef<string | null | undefined>(undefined);
  const clockRef = useRef(clock);
  useEffect(() => {
    clockRef.current = clock;
  });
  const [syncFailed, setSyncFailed] = useState(false);
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [busy, setBusy] = useState<"pause" | "end" | null>(null);
  // Why the leave dialog couldn't pause: answers not saved, or pause failed.
  const [leaveProblem, setLeaveProblem] = useState<"unsaved" | "pause" | null>(null);
  const [submitting, setSubmitting] = useState<"result" | "home" | null>(null);
  const [submitFailed, setSubmitFailed] = useState(false);
  const submitInFlight = useRef(false);
  const [leaving, startLeaving] = useTransition();

  // ---- Save status (each selection is persisted immediately) ----
  const [savingCount, setSavingCount] = useState(0);
  const [unsaved, setUnsaved] = useState<Record<string, string | null>>({});

  const questionStartRef = useRef<number>(Date.now());
  const bodyRef = useRef<HTMLDivElement>(null);
  const sections = useMemo(() => buildSections(sectionLabels), [sectionLabels]);

  useEffect(() => {
    questionStartRef.current = Date.now();
    bodyRef.current?.scrollTo({ top: 0 });
  }, [index]);

  // ---- Back guard + exits ----
  const openLeave = useCallback(() => {
    setLeaveProblem(null);
    setSubmitFailed(false);
    setDialog("leave");
  }, []);
  const releaseGuard = useBackGuard(!submitting && !busy && !leaving, openLeave);

  /** Leave the sitting: pop the guard entry, then replace this page's entry. */
  const exitTo = useCallback(
    async (href: string) => {
      setDialog(null);
      await releaseGuard();
      startLeaving(() => router.replace(href));
    },
    [releaseGuard, router],
  );

  // ---- Sync with the server on open / re-show ----
  const syncTimer = useCallback(async () => {
    setSyncFailed(false);
    const s = await syncMock(attemptId).catch(() => null);
    if (!s) {
      setSyncFailed(true);
      return;
    }
    if (s.status === "submitted") {
      submitInFlight.current = true;
      void exitTo(routes.mockResult(attemptId));
      return;
    }
    if (s.status !== "in_progress") {
      void exitTo(routes.mocks);
      return;
    }
    confirmedExpiry.current = s.expiresAt;
    setClock({ expiresAt: s.expiresAt, pausedSecondsLeft: null });
  }, [attemptId, exitTo]);

  // Layout effect: runs before the timer's (child) effects on every show.
  useLayoutEffect(() => {
    setDialog(null);
    setBusy(null);
    setLeaveProblem(null);
    setSubmitFailed(false);
    confirmedExpiry.current = undefined;
    // Keep the overlay if a submit is genuinely still running.
    if (!submitInFlight.current) setSubmitting(null);
    void syncTimer();
  }, [syncTimer]);

  const persist = useCallback(
    async (questionId: string, optionId: string | null, timeMs: number | null) => {
      setSavingCount((n) => n + 1);
      const ok = await saveMockAnswer(attemptId, questionId, optionId, timeMs).catch(() => false);
      setSavingCount((n) => n - 1);
      // A newer selection for this question supersedes this result.
      if ((selectedRef.current[questionId] ?? null) === optionId) {
        setUnsaved((u) => {
          const next = { ...u };
          if (ok) delete next[questionId];
          else next[questionId] = optionId;
          return next;
        });
      }
      return ok;
    },
    [attemptId],
  );

  const retryUnsaved = useCallback(async () => {
    const results = await Promise.all(
      Object.entries(unsaved).map(([q, o]) => persist(q, o, null)),
    );
    return results.every(Boolean);
  }, [unsaved, persist]);

  const current = questions[index];
  const unsavedCount = Object.keys(unsaved).length;
  const hasUnsaved = savingCount > 0 || unsavedCount > 0;

  // Warn before closing the tab only when something isn't saved yet.
  useEffect(() => {
    if (!hasUnsaved) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsaved]);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (!current) return;
      setSelected((s) => ({ ...s, [current.id]: optionId }));
      selectedRef.current = { ...selectedRef.current, [current.id]: optionId };
      void persist(current.id, optionId, Date.now() - questionStartRef.current);
    },
    [current, persist],
  );

  const handleClear = useCallback(() => {
    if (!current) return;
    setSelected((s) => {
      const next = { ...s };
      delete next[current.id];
      return next;
    });
    const nextRef = { ...selectedRef.current };
    delete nextRef[current.id];
    selectedRef.current = nextRef;
    void persist(current.id, null, null);
  }, [current, persist]);

  const handleToggleReview = useCallback(() => {
    if (!current) return;
    const next = !review[current.id];
    setReview((r) => ({ ...r, [current.id]: next }));
    void toggleReview(attemptId, current.id, next);
  }, [current, review, attemptId]);

  // ---- Submit (Submit button, End test, or the timer running out) ----
  const doSubmit = useCallback(
    async (destination: "result" | "home") => {
      if (submitInFlight.current) return;
      submitInFlight.current = true;
      setSubmitFailed(false);
      setDialog(null);
      setSubmitting(destination);
      const answers = questions.map((q) => ({
        question_id: q.id,
        selected_option_id: selectedRef.current[q.id] ?? null,
        time_taken_ms: null,
      }));
      const id = await submitMock(attemptId, answers).catch(() => null);
      if (id) {
        // The paper is done: stay "in flight" so a re-show only redirects.
        await exitTo(destination === "home" ? routes.dashboard : routes.mockResult(id));
      } else {
        submitInFlight.current = false;
        setSubmitting(null);
        setBusy(null);
        setSubmitFailed(true);
      }
    },
    [questions, attemptId, exitTo],
  );

  const submitRef = useRef(doSubmit);
  useEffect(() => {
    submitRef.current = doSubmit;
  });
  // Stable (so the timer's interval isn't reset each render). The timer calls
  // it every second at zero; it only submits when the clock on screen is the
  // one the server confirmed, so a stale screen shown again can't submit a
  // paused (or extended) paper.
  const onTimeUp = useCallback(() => {
    const c = clockRef.current;
    if (
      confirmedExpiry.current !== undefined &&
      c.pausedSecondsLeft === null &&
      c.expiresAt === confirmedExpiry.current
    ) {
      void submitRef.current("result");
    }
  }, []);

  async function pauseAndExit() {
    setBusy("pause");
    setLeaveProblem(null);
    if (!(await retryUnsaved())) {
      setBusy(null);
      setLeaveProblem("unsaved");
      return;
    }
    const ok = await pauseMock(attemptId).catch(() => false);
    if (!ok) {
      setBusy(null);
      setLeaveProblem("pause");
      return;
    }
    // Freeze the clock here too, so this screen shows "paused" if shown again.
    setClock((c) => ({
      expiresAt: c.expiresAt,
      pausedSecondsLeft: c.expiresAt
        ? Math.max(0, Math.round((Date.parse(c.expiresAt) - Date.now()) / 1000))
        : null,
    }));
    confirmedExpiry.current = undefined;
    await exitTo(routes.dashboard);
  }

  async function leaveWithoutPause() {
    setBusy("pause");
    if (!(await retryUnsaved())) {
      setBusy(null);
      setLeaveProblem("unsaved");
      return;
    }
    await exitTo(routes.dashboard);
  }

  async function endAndExit() {
    setBusy("end");
    await doSubmit("home");
  }

  // ---- Keyboard: ← / → move between questions ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (dialog || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      if (e.key === "ArrowRight") setIndex((i) => Math.min(questions.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, questions.length]);

  if (questions.length === 0 || !current) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="font-body text-on-surface-variant">This mock has no questions.</p>
        <Link href={routes.mocks} className={appButton({ variant: "secondary" })}>
          <Icon name="arrow_back" className="text-lg" /> Back to mock tests
        </Link>
      </div>
    );
  }

  const states: AnswerState[] = questions.map((q) => ({
    saved: selected[q.id] !== undefined,
    review: review[q.id] === true,
  }));
  const savedFlags = states.map((s) => s.saved === true);
  const counts = mockSubmitCounts(states);
  const answeredPct = (counts.answered / questions.length) * 100;
  const section = sections.find((s) => index >= s.start && index < s.end) ?? sections[0];
  const tone = toneClasses[subjectTone(sectionSlugs[index] || sectionLabels[index])];
  const isFirst = index === 0;
  const isLast = index === questions.length - 1;
  const marked = review[current.id] === true;
  const answered = selected[current.id] !== undefined;
  const locked = submitting !== null || busy !== null || leaving;

  const goTo = (i: number) => {
    setIndex(i);
    setDialog(null);
  };

  const questionMap = (
    <>
      <SectionTabs
        sections={sections}
        sectionSlugs={sectionSlugs}
        savedFlags={savedFlags}
        currentIndex={index}
        onJump={goTo}
      />
      {section ? (
        <div className="flex flex-col gap-3">
          <p className="font-headline text-sm font-semibold text-on-surface">
            {section.label} · questions {section.start + 1}–{section.end}
          </p>
          <QuestionPalette
            start={section.start}
            end={section.end}
            currentIndex={index}
            states={states}
            onNavigate={goTo}
          />
          <PaletteLegend />
        </div>
      ) : null}
    </>
  );

  return (
    <div className="flex h-full flex-col">
      <TopProgressBar active={leaving} label="Leaving the test" />
      {submitting ? (
        <FullscreenLoader
          title="Submitting your test"
          steps={[
            "Saving your answers",
            "Scoring each section",
            submitting === "home" ? "Taking you home" : "Preparing your result",
          ]}
        />
      ) : null}

      {/* Question changes, announced politely for screen readers. */}
      <p className="sr-only" aria-live="polite">
        Question {index + 1} of {questions.length}, {section?.label}
      </p>

      {/* ---- Header ---- */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-outline-variant bg-surface-lowest px-3 sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={openLeave}
          disabled={locked}
          className={cn(appButton({ variant: "ghost", size: "sm" }), "px-2 sm:px-3")}
        >
          <Icon name="close" className="text-xl" />
          <span className="sr-only sm:not-sr-only">Exit</span>
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-headline text-sm font-bold text-on-surface sm:text-base">
            {data.title}
          </p>
          <p className="flex items-center gap-2 truncate text-xs text-on-surface-variant">
            <span className="tabular-nums">
              {counts.answered}/{questions.length} answered
            </span>
            <SaveStatus
              saving={savingCount > 0}
              unsavedCount={unsavedCount}
              onRetry={() => void retryUnsaved()}
            />
          </p>
        </div>

        <QuizTimer
          expiresAt={clock.expiresAt}
          pausedSecondsLeft={clock.pausedSecondsLeft}
          onTimeUp={onTimeUp}
        />

        <button
          type="button"
          onClick={() => setDialog("submit")}
          disabled={locked}
          className={cn(appButton({ size: "sm" }), "sm:h-11 sm:px-5")}
        >
          <span className="sr-only sm:not-sr-only">Submit</span>
          <Icon name="done_all" className="text-lg" />
        </button>
      </header>

      {/* Answered progress along the header's edge. */}
      <div className="h-1 shrink-0 bg-surface-high" aria-hidden="true">
        <div
          className="h-full bg-tone-violet transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${answeredPct}%` }}
        />
      </div>

      {syncFailed ? (
        <div role="alert" className="flex shrink-0 items-center justify-center gap-3 bg-tone-amber-soft px-4 py-2 text-sm text-tone-amber">
          {clock.pausedSecondsLeft !== null
            ? "Couldn't restart the timer."
            : "Couldn't check the timer with the server."}
          <button type="button" onClick={() => void syncTimer()} className="font-semibold underline underline-offset-4">
            Try again
          </button>
        </div>
      ) : null}

      {/* ---- Body ---- */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-6 p-4 md:p-6 lg:grid-cols-[1fr_320px] lg:p-8">
          <section
            aria-labelledby="question-heading"
            className={cn(card, "overflow-hidden border-t-4", tone.topBorder)}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant bg-surface-low/60 px-5 py-3">
              <h2 id="question-heading" className="font-headline text-sm font-semibold text-on-surface">
                Question <span className="tabular-nums">{index + 1}</span>
                <span className="text-on-surface-variant"> of {questions.length}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn(statusChip, tone.chip)}>{section?.label}</span>
                {marked ? (
                  <span className={cn(statusChip, "bg-tone-amber-soft text-tone-amber")}>
                    <Icon name="flag" filled className="text-sm" /> For review
                  </span>
                ) : answered ? (
                  <span className={cn(statusChip, "bg-success-fixed text-success")}>
                    <Icon name="check" className="text-sm" /> Answered
                  </span>
                ) : null}
              </div>
            </div>

            <div className="px-5 pt-5 sm:px-6 sm:pt-6">
              <p className="font-body text-lg leading-relaxed text-on-surface">
                <MathText>{current.statement}</MathText>
              </p>
            </div>

            <div className="flex flex-col gap-3 p-5 sm:p-6">
              {current.options.map((o) => (
                <OptionButton
                  key={o.id}
                  label={o.label}
                  content={o.content}
                  state={selected[current.id] === o.id ? "selected" : "idle"}
                  disabled={locked}
                  onClick={() => handleSelect(o.id)}
                />
              ))}
              {answered ? (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={locked}
                  className={cn(appButton({ variant: "ghost", size: "sm" }), "self-start text-on-surface-variant")}
                >
                  <Icon name="backspace" className="text-lg" /> Clear answer
                </button>
              ) : null}
            </div>
          </section>

          <aside aria-label="Question map" className="hidden flex-col gap-4 lg:sticky lg:top-0 lg:flex">
            <div className={cn(card, "flex flex-col gap-4 p-4")}>{questionMap}</div>
            <p className="px-1 text-xs text-on-surface-variant">
              Tip: use the ← and → keys to move between questions.
            </p>
          </aside>
        </div>
      </div>

      {/* ---- Footer ---- */}
      <footer className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-t border-outline-variant bg-surface-lowest px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst || locked}
          className={appButton({ variant: "secondary" })}
        >
          <Icon name="arrow_back" className="text-lg" />
          <span className="sr-only sm:not-sr-only">Prev</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleReview}
            aria-pressed={marked}
            disabled={locked}
            className={cn(
              appButton({ variant: "secondary" }),
              marked && "border-tone-amber/40 bg-tone-amber-soft text-tone-amber hover:border-tone-amber/60 hover:bg-tone-amber-soft",
            )}
          >
            <Icon name="flag" filled={marked} className="text-lg" />
            <span className="sr-only sm:not-sr-only">{marked ? "Marked" : "Review"}</span>
          </button>
          <button
            type="button"
            onClick={() => setDialog("map")}
            className={cn(appButton({ variant: "secondary" }), "lg:hidden")}
          >
            <Icon name="grid_view" className="text-lg" />
            <span className="tabular-nums">
              {index + 1}/{questions.length}
            </span>
            <span className="sr-only">, open question map</span>
          </button>
        </div>

        {isLast ? (
          <button
            type="button"
            onClick={() => setDialog("submit")}
            disabled={locked}
            className={appButton()}
          >
            <span className="sr-only sm:not-sr-only">Review &amp; submit</span>
            <Icon name="done_all" className="text-lg" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={locked}
            className={appButton()}
          >
            <span className="sr-only sm:not-sr-only">Next</span>
            <Icon name="arrow_forward" className="text-lg" />
          </button>
        )}
      </footer>

      {/* ---- Dialogs ---- */}
      <Dialog
        alert
        open={dialog === "submit"}
        title="Submit your test?"
        onClose={() => setDialog(null)}
        actions={
          <>
            <button type="button" onClick={() => setDialog(null)} className={appButton({ variant: "secondary" })}>
              Keep working
            </button>
            <button type="button" onClick={() => void doSubmit("result")} className={appButton()}>
              Submit test
            </button>
          </>
        }
      >
        <SubmitSummary
          answered={counts.answered}
          total={questions.length}
          unanswered={counts.unanswered}
          markedForReview={counts.markedForReview}
        />
        <p className="mt-2">You can&apos;t change answers after submitting.</p>
      </Dialog>

      <Dialog
        alert
        open={dialog === "leave"}
        title="Leave the mock test?"
        onClose={() => {
          if (!busy) setDialog(null);
        }}
        actions={
          <>
            <button
              type="button"
              onClick={() => setDialog(null)}
              disabled={busy !== null}
              className={appButton({ variant: "secondary" })}
            >
              Keep going
            </button>
            <button
              type="button"
              onClick={() => void endAndExit()}
              disabled={busy !== null}
              className={appButton({ variant: "danger" })}
            >
              {busy === "end" ? <Spinner /> : <Icon name="done_all" className="text-lg" />}
              End test
            </button>
            {leaveProblem === "pause" ? (
              <button
                type="button"
                onClick={() => void leaveWithoutPause()}
                disabled={busy !== null}
                className={appButton({ variant: "secondary" })}
              >
                Leave anyway
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void pauseAndExit()}
                disabled={busy !== null}
                className={appButton()}
              >
                {busy === "pause" ? <Spinner /> : <Icon name="pause" className="text-lg" />}
                {busy === "pause" ? "Pausing…" : "Pause & exit"}
              </button>
            )}
          </>
        }
      >
        <p>
          You&apos;ve answered{" "}
          <strong className="font-semibold text-on-surface tabular-nums">
            {counts.answered} of {questions.length}
          </strong>
          .{" "}
          {unsavedCount > 0
            ? `${unsavedCount} ${unsavedCount === 1 ? "answer isn't" : "answers aren't"} saved yet.`
            : "Your answers are saved."}
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          <li className="flex gap-2">
            <Icon name="pause_circle" className="mt-0.5 text-lg text-brand" />
            <span>
              <strong className="font-semibold text-on-surface">Pause</strong> stops the timer.
              Resume any time from your dashboard.
            </span>
          </li>
          <li className="flex gap-2">
            <Icon name="done_all" className="mt-0.5 text-lg text-danger" />
            <span>
              <strong className="font-semibold text-on-surface">End test</strong> submits now
              and scores it. Unanswered questions get no marks.
            </span>
          </li>
        </ul>
        {leaveProblem === "pause" ? (
          <p role="alert" className="mt-3 rounded-xl bg-tone-amber-soft px-3 py-2 text-tone-amber">
            Pausing isn&apos;t available right now, so the timer would keep running
            if you leave. Your answers are saved.
          </p>
        ) : null}
        {leaveProblem === "unsaved" ? (
          <p role="alert" className="mt-3 rounded-xl bg-danger-fixed px-3 py-2 text-danger">
            Some answers couldn&apos;t be saved. Check your connection and try
            again, or End test (it sends every answer with the submission).
          </p>
        ) : null}
        {submitFailed ? (
          <p role="alert" className="mt-3 rounded-xl bg-danger-fixed px-3 py-2 text-danger">
            Couldn&apos;t submit. Check your connection and try again.
          </p>
        ) : null}
      </Dialog>

      <Dialog
        open={dialog === "map"}
        title="Question map"
        size="lg"
        describe={false}
        onClose={() => setDialog(null)}
        bodyClassName="flex flex-col gap-4"
        actions={
          <button type="button" onClick={() => setDialog(null)} className={appButton({ variant: "secondary" })}>
            Close
          </button>
        }
      >
        {questionMap}
      </Dialog>

      {submitFailed && dialog === null ? (
        <div role="alert" className="fixed inset-x-4 bottom-20 z-[60] mx-auto max-w-md rounded-xl border border-danger/30 bg-danger-fixed px-4 py-3 text-center text-sm text-danger shadow-soft-lg">
          Couldn&apos;t submit. Check your connection, then press Submit again.
        </div>
      ) : null}
    </div>
  );
}

function SubmitSummary({
  answered,
  total,
  unanswered,
  markedForReview,
}: {
  answered: number;
  total: number;
  unanswered: number;
  markedForReview: number;
}) {
  return (
    <p>
      You have answered{" "}
      <strong className="font-semibold text-on-surface tabular-nums">
        {answered} of {total}
      </strong>{" "}
      questions.
      {unanswered > 0
        ? ` ${unanswered} unanswered ${unanswered === 1 ? "question gets" : "questions get"} no marks.`
        : ""}
      {markedForReview > 0
        ? ` ${markedForReview} ${markedForReview === 1 ? "is" : "are"} marked for review.`
        : ""}
    </p>
  );
}

/** "Saving…" / "Saved" / "Not saved · Retry" next to the answered count. */
function SaveStatus({
  saving,
  unsavedCount,
  onRetry,
}: {
  saving: boolean;
  unsavedCount: number;
  onRetry: () => void;
}) {
  if (saving) {
    return (
      <span className="inline-flex items-center gap-1" role="status">
        <Spinner className="size-3" /> Saving…
      </span>
    );
  }
  if (unsavedCount > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-danger" role="alert">
        <Icon name="cloud_off" className="text-sm" /> {unsavedCount} not saved ·
        <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2">
          Retry
        </button>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-success">
      <Icon name="cloud_done" className="text-sm" /> Saved
    </span>
  );
}
