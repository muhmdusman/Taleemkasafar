# Implementation Plan: Practice / Past-Paper, Mock Tests & Analytics

Build order is bottom-up: pure logic + tests first, then the DB grading boundary,
then loaders/actions, then UI, then analytics, then verify + memory. Each task is
incremental and references the requirements it satisfies.

- [x] 1. Pure quiz-logic helpers + unit tests (no DB)
  - Create `lib/quiz/mock-plan.ts`: given blueprint slots (subject, count,
    difficulty_mix) + available pool counts per (subject, difficulty), compute
    exact pick counts with nearest-band shortfall borrowing so each slot reaches
    its count. Export the whole-paper target (30/90/80) constants.
  - Create `lib/quiz/scoring.ts`: given answers + key, compute attempted/correct/
    incorrect/skipped, score_percent, and `per_subject` breakdown.
  - Create `lib/quiz/session.ts`: resume index (first unanswered), section
    boundaries from an ordered question list, palette state derivation
    (answered/saved/review/current/unattempted).
  - Create `lib/quiz/time.ts`: `formatTime(seconds)` and `remainingSeconds(expiresAt, now)`.
  - Co-locate `*.test.ts` for each, covering edge cases: band shortfall, all
    skipped, all correct, time zero/negative, empty sets.
  - _Requirements: 3.2, 4.2, 2.1, 8.1, 8.3_

- [x] 2. DB migration `mcq_14_attempt_grading` — schema + security boundary
- [x] 2.1 Additive columns
  - `alter table attempts add column usage question_usage;`
  - `alter table attempt_answers add column display_order int;`
  - _Requirements: 2.6, 3.3, 7.3_
- [x] 2.2 Revoke client read of the answer key
  - Revoke `select` on `question_options` from anon, authenticated; re-grant
    `select` on all columns EXCEPT `is_correct`.
  - _Requirements: 6.1, 6.5_
- [x] 2.3 Grading RPCs (SECURITY DEFINER, search_path=public, ownership-checked)
  - `start_attempt(p_entry_test text, p_topic uuid, p_usage question_usage)` →
    get-or-create in_progress practice attempt; returns attempt id.
  - `submit_practice_answer(p_attempt uuid, p_question uuid, p_option uuid,
    p_time_ms int)` → upsert answer, return `{is_correct, correct_option_id,
    explanation}`.
  - `generate_mock_attempt(p_blueprint uuid)` → select+freeze 200 Qs (per D4
    algorithm in SQL), set `expires_at`, pre-insert ordered unanswered
    `attempt_answers`; returns attempt id.
  - `submit_mock(p_attempt uuid, p_answers jsonb)` → grade all in one tx, write
    `mock_results`, flip status to submitted; idempotent; returns attempt id.
  - Each body checks `auth.uid()` ownership + validates question/option ∈ test.
  - `revoke execute` from anon; `grant execute` to authenticated.
  - _Requirements: 1.2, 1.8, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.4, 6.2, 6.3, 6.4_
- [x] 2.4 Seed NET mock blueprint + 3 slots (idempotent on external_id)
  - Blueprint `net-full-mock`: 200 Qs, 120 min. Slots: Maths 100, Physics 60,
    English 40, each with its `difficulty_mix` jsonb.
  - _Requirements: 3.1, 3.2_
- [x] 2.5 Apply migration, mirror to `supabase/migrations/`, run advisors, regen types
  - Apply via MCP; write the same SQL to a timestamped file under
    `supabase/migrations/`; run `get_advisors` (security+performance) and fix
    findings; regenerate `lib/database.types.ts`.
  - _Requirements: 7.4, 8.2_

- [x] 3. SQL grading integration check
  - Seed a tiny attempt (3 questions, known key), call `submit_mock`, assert
    `mock_results` matches `lib/quiz/scoring.ts` oracle. Document as a repeatable
    check (script or test that runs against a branch/local).
  - _Requirements: 4.1, 8.3_

- [x] 4. Server query loaders + Server Actions
- [x] 4.1 `lib/queries/practice.ts`
  - `getPracticeScreen(subjectSlug, chapterSlug, usage)`: resolve active test +
    topic, load ordered answer-free question content (cookie client, RLS), and
    the user's existing answers; compute resume index via `lib/quiz/session.ts`.
  - _Requirements: 1.1, 1.6, 2.1, 6.5_
- [x] 4.2 `lib/queries/mock.ts`
  - `getMockLanding()`: blueprint summary + the user's recent results.
  - `getMockAttempt(attemptId)`: frozen ordered, answer-free question set + saved
    answers + review flags + `expires_at`; ownership enforced by RLS.
  - `getMockResult(attemptId)`: the `mock_results` row.
  - _Requirements: 3.3, 3.4, 4.3, 5.2_
- [x] 4.3 `app/(dashboard)/quiz-actions.ts` (Server Actions wrapping RPCs)
  - `startPractice`, `answerPractice`, `finishPractice`, `toggleBookmark`,
    `startMock`, `saveMockAnswer`, `toggleReview`, `submitMock`.
  - Resolve `auth.uid()` server-side; return typed results/errors.
  - _Requirements: 1.2, 1.5, 2.2, 2.5, 3.5, 3.7, 4.1_

- [x] 5. Shared quiz UI primitives (Soft Brutalism, responsive)
  - `components/quiz/option-button.tsx` (idle/selected/correct/wrong states),
    `question-card.tsx`, `explanation-panel.tsx`, `bookmark-button.tsx`.
  - Re-skin the `ui_design/quiz_screen` mechanics to 0px radius, 2px borders,
    hard shadows; green=correct, red(danger)=wrong feedback only.
  - _Requirements: 1.1, 1.2, 1.3, 1.7, 8.4_

- [x] 6. Practice & Past-Paper screens
- [x] 6.1 `components/quiz/practice-runner.tsx` (client orchestrator)
  - Single-question loop; on select → `answerPractice` → reveal colors +
    explanation; Next/Prev; Save/Bookmark; Finish/Reset; resume at server index.
  - _Requirements: 1.1–1.5, 2.1–2.5_
- [x] 6.2 Route pages
  - `app/(dashboard)/subjects/[slug]/[chapter]/practice/page.tsx` (usage=practice)
  - `app/(dashboard)/subjects/[slug]/[chapter]/past-paper/page.tsx` (usage=past_paper)
  - Server Components: load via `getPracticeScreen`, render header + runner inside
    Suspense; redirect unauth, notFound on bad slug.
  - _Requirements: 1.1, 1.6, 1.7, 2.6_

- [x] 7. Mock test screen
- [x] 7.1 `components/quiz/quiz-timer.tsx`, `quiz-navigation.tsx`,
      `question-palette.tsx`, `section-progress.tsx` (re-skinned, responsive)
  - _Requirements: 3.4, 3.5, 3.8_
- [x] 7.2 `components/quiz/mock-runner.tsx` (client orchestrator)
  - Frozen set; Save/Next/Prev/Mark-Review/Next-Section/Prev-Section; palette;
    no feedback; timer from `expires_at`; auto-submit on zero via `submitMock`.
  - _Requirements: 3.3–3.7, 4.1_
- [x] 7.3 Routes
  - `app/(dashboard)/mock/page.tsx` (landing: start NET mock + results list),
    `app/(dashboard)/mock/[attemptId]/page.tsx` (sitting).
  - `startMock` action calls `generate_mock_attempt`, redirects to the sitting.
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 8. Mock result & analytics
- [x] 8.1 `components/quiz/mock-result.tsx` + `app/(dashboard)/mock/[attemptId]/result/page.tsx`
  - Score + per-subject breakdown from `mock_results` (server data).
  - _Requirements: 4.2, 4.3, 4.5_
- [x] 8.2 `lib/queries/performance.ts` + `app/(dashboard)/performance/page.tsx`
  - List submitted mocks (score+date, recent first), link to each result; basic
    practice accuracy summary; honest empty states.
  - _Requirements: 5.1–5.5_

- [x] 9. Verify + close the loop
  - Run `npm run test`, `npm run lint`, `npm run build`; fix issues.
  - Re-run `get_advisors`; confirm clean (minus known deferrals).
  - Update `.kiro/context/progress.md` + `decisions.md` (grading boundary, mock
    generation, routes) and trim `.kiro/context/local/session.md`.
  - _Requirements: 7.4, 8.2, 8.5_
```
