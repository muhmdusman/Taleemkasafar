# Requirements: Practice / Past-Paper MCQs, Mock Tests & Analytics

## Introduction

This feature adds the learner-facing "attempt" experiences on top of the
existing NET question bank: a simple instant-feedback MCQ loop (practice and
past-paper), a timed multi-section mock exam, and a results/analytics surface.
It builds on the schema from `mcq-platform-schema` (attempts, attempt_answers,
mock_results, blueprints) with no new tables — only additive columns, grading
RPCs, a seeded NET blueprint, and the UI/query/action layer. Score integrity is
a first-class requirement: correctness is computed and revealed only by the
server. All UI follows the Soft Brutalism design system and is responsive on
mobile and desktop.

Terminology: a **practice/past-paper screen** is the simple single-question loop
with instant feedback; a **mock test** is the timed, no-feedback exam simulation;
an **attempt** is one persisted session; a **blueprint** defines a mock paper.

---

## Requirement 1 — Practice & Past-Paper MCQ screen (instant feedback)

**User Story:** As a learner, I want to attempt a chapter's MCQs one at a time
and immediately see whether I was right, with an explanation, so that I learn as
I practice.

#### Acceptance Criteria
1. WHEN a learner opens a chapter's Practice or Past-Paper screen THEN the system
   SHALL display one question at a time with its statement and selectable options.
2. WHEN a learner selects an option THEN the system SHALL grade that answer on the
   server and reveal the result: the correct option styled green and, if the pick
   was wrong, the chosen option styled red.
3. WHEN an answer has been graded THEN the system SHALL display the question's
   explanation below the options.
4. WHEN a learner has graded the current question THEN the system SHALL allow
   moving to the Next and Previous questions.
5. WHEN a learner chooses to Save/Bookmark a question THEN the system SHALL
   persist that bookmark for the learner.
6. IF a chapter has no available questions for the selected surface THEN the
   system SHALL show an empty state rather than an error.
7. WHEN the screen is viewed on mobile or desktop THEN the layout SHALL be
   responsive and follow the Soft Brutalism design system.
8. WHEN a learner answers THEN the client SHALL NOT have had access to the correct
   answer before grading (correctness comes only from the server response).

---

## Requirement 2 — Resume practice where the learner left off

**User Story:** As a learner, I want to return to a chapter and continue from
where I stopped, so that I don't lose progress or redo questions.

#### Acceptance Criteria
1. WHEN a learner opens a chapter surface they previously started THEN the system
   SHALL resume at the first unanswered question in the stable question order.
2. WHEN a learner answers a question THEN the system SHALL persist that answer to
   their server-side attempt immediately (not only in the browser).
3. WHEN a learner re-answers a previously answered question THEN the system SHALL
   overwrite the prior answer without creating a duplicate.
4. WHEN a learner returns on a different device THEN the system SHALL resume from
   the same server-side progress.
5. WHEN a learner chooses to Finish or Reset the set THEN the system SHALL end or
   restart that attempt accordingly.
6. WHERE practice and past-paper are different surfaces over the same chapter THE
   system SHALL keep their resume progress separate.

---

## Requirement 3 — Timed mock test (NET Engineering)

**User Story:** As a learner, I want to take a timed, full-length NET mock exam
that mirrors the real paper, so that I can simulate test conditions.

#### Acceptance Criteria
1. WHEN a learner starts the NET mock THEN the system SHALL generate a 200-question
   paper of 100 Mathematics, 60 Physics, and 40 English questions drawn from the
   NET question bank.
2. WHEN the paper is generated THEN the system SHALL select questions per subject
   according to the blueprint's difficulty mix (whole-paper target 30 easy / 90
   medium / 80 hard), borrowing from the nearest band if a band is short, so each
   subject always reaches its required count.
3. WHEN a mock attempt is generated THEN its question set and ordering SHALL be
   frozen for that sitting and remain stable across reloads.
4. WHEN a learner is in a mock THEN the system SHALL display a countdown timer
   anchored to a server-set expiry.
5. WHEN a learner is in a mock THEN the system SHALL provide Save, Next, Previous,
   Mark-for-Review, Next Section, and Previous Section controls and a question
   palette showing each question's state (answered / saved / marked / current /
   unattempted).
6. WHILE a mock is in progress THE system SHALL NOT reveal whether any answer is
   correct.
7. WHEN the timer reaches zero THEN the system SHALL automatically submit the
   mock with whatever answers were saved.
8. WHEN the mock screen is viewed on mobile or desktop THEN the layout SHALL be
   responsive and follow the Soft Brutalism design system.

---

## Requirement 4 — Mock submission, scoring & result

**User Story:** As a learner, I want my mock graded and scored after I submit, so
that I can see how I performed overall and per subject.

#### Acceptance Criteria
1. WHEN a learner submits a mock (or time expires) THEN the system SHALL grade all
   answers on the server in a single transaction and persist a result record.
2. WHEN a result is computed THEN the system SHALL store total questions,
   attempted, correct, incorrect, skipped counts, score percent, and a per-subject
   breakdown.
3. WHEN grading completes THEN the system SHALL display a result screen with the
   overall score and the per-subject breakdown.
4. IF a mock is submitted more than once THEN the system SHALL return the existing
   result without re-grading (idempotent).
5. WHEN the result is shown THEN the score SHALL have been computed by the server,
   not the client.

---

## Requirement 5 — Analytics / performance history

**User Story:** As a learner, I want to see my past mock results and a summary of
my accuracy, so that I can track progress and find weak areas.

#### Acceptance Criteria
1. WHEN a learner opens the Performance page THEN the system SHALL list their
   submitted mock attempts with score and date, most recent first.
2. WHEN a learner selects a past mock result THEN the system SHALL show that
   result's detail (score + per-subject breakdown).
3. WHEN a learner has practice activity THEN the system SHALL surface a basic
   accuracy summary and an entry point to resume practice.
4. IF a learner has no attempts yet THEN the system SHALL show an honest empty
   state (no fabricated statistics).
5. WHEN the page is viewed on mobile or desktop THEN the layout SHALL be responsive
   and follow the Soft Brutalism design system.

---

## Requirement 6 — Answer-key confidentiality (security)

**User Story:** As the platform owner, I want correct answers hidden from the
client during mocks, so that scores reflect real ability and cannot be forged.

#### Acceptance Criteria
1. THE system SHALL NOT expose the `is_correct` flag of options to the
   `anon` or `authenticated` API roles.
2. THE system SHALL compute answer correctness only inside server-side
   `SECURITY DEFINER` functions whose `search_path` is pinned.
3. WHEN any grading function runs THEN it SHALL verify the calling user owns the
   target attempt before reading or writing.
4. THE system SHALL grant execute on grading functions to authenticated users
   only and revoke it from anonymous users.
5. WHEN questions are rendered THEN the client payload SHALL include option text
   and identifiers but NOT correctness.

---

## Requirement 7 — Persistence, ownership & data integrity

**User Story:** As a learner, I want my attempts and results to be private to me
and consistent, so that my data is safe and accurate.

#### Acceptance Criteria
1. THE system SHALL restrict every learner's attempts, answers, results, and
   bookmarks to that learner via row-level security keyed on their identity.
2. WHEN a practice answer is saved THEN it SHALL be unique per (attempt, question)
   and upsert on conflict.
3. WHEN a mock paper is generated THEN each selected question SHALL appear at most
   once in the attempt with an explicit display order.
4. WHEN schema changes are applied THEN they SHALL be delivered as a new,
   ordered migration mirrored in `supabase/migrations/`, followed by an advisor
   check and regenerated TypeScript types.
5. THE schema additions SHALL remain standard PostgreSQL (portable), coupling only
   to Supabase auth/RLS as the rest of the project does.

---

## Requirement 8 — Quality gates (tests, build, design)

**User Story:** As an AI-agents-first team, I want this feature verified, so that
it ships correct and maintainable.

#### Acceptance Criteria
1. WHEN non-trivial logic exists (mock-plan selection counts, scoring,
   resume/section derivation, time formatting) THEN it SHALL live in pure helpers
   with co-located unit tests.
2. WHEN the feature is implemented THEN `npm run build`, `npm run lint`, and
   `npm run test` SHALL all pass.
3. WHEN server-side grading is implemented THEN an integration check SHALL confirm
   the SQL grade matches the pure-helper scoring oracle.
4. WHEN UI is built THEN it SHALL follow `.kiro/steering/design-system.md` (Soft
   Brutalism) and be responsive on mobile and desktop.
5. WHEN the work completes THEN the project context memory SHALL be updated
   (progress + decisions).
