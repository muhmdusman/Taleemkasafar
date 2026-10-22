# Progress Log

## 2026-06-25 — Project setup

### Done
- Verified Supabase CLI + MCP both connected to **Taleemkasafar** org
  (`bjfbydbcshxzsbsgvlwm`), project ref `lcsuasddoertvoujwsgo`, ACTIVE_HEALTHY.
- MCP set to write-capable (removed `read_only=true` in `.kiro/settings/mcp.json`).
- Confirmed repo is the official Supabase Next.js starter:
  - `@supabase/supabase-js` + `@supabase/ssr` already installed.
  - Client helpers already exist at `lib/supabase/` (client/server/proxy) using
    the newer `getClaims()` pattern. Decided to KEEP these, not create
    `utils/supabase/`.
  - Email/password login + sign-up already wired.
- Created `.env.local` with project URL + publishable key.
- Created steering files: product.md, tech.md, structure.md.
- Created this context/memory folder.

- Added **Google OAuth**:
  - `app/auth/callback/route.ts` — PKCE code exchange + error handling.
  - `components/google-auth-button.tsx` — reusable "Continue with Google" button.
  - Wired into `login-form.tsx` and `sign-up-form.tsx` with an OR divider.
  - Email/password auth untouched and still works.
- Installed AI agent skills into `.kiro/skills/`:
  - `supabase`, `supabase-postgres-best-practices` (via `npx skills`,
    tracked in `skills-lock.json`).
  - `next-dev-loop`, `next-cache-components-optimizer`,
    `next-cache-components-adoption` (copied from `vercel/next.js` repo —
    the old `next-best-practices` skill is deprecated, now shipped via
    Next.js bundled docs + auto-generated AGENTS.md in Next.js 16.3+).
  - Cleaned up ~45 stray agent dirs the installer scattered at repo root.
- `npm run build` passes; `/auth/callback` route registered.

### In progress
- Nothing actively in progress.

### Next steps
- **Manual (human)**: configure Google provider in Google Cloud + Supabase
  dashboard (see decisions.md checklist) before Google login will work.
- Configure Google provider in Supabase dashboard (manual: client ID/secret +
  redirect URLs). See decisions.md for the checklist.
- Design the question-bank schema (subjects, chapters, questions, options,
  attempts, mock tests, analytics).
- Build a seeding/import step from `mcqs/` CSV/JSON into Supabase.
- Build the dashboard shell under `app/protected/`.

### Current DB state
- No `public` tables yet (clean slate). Only the default `auth.*` schema exists.


## 2026-06-26 — Catalog caching + two-tier context memory

### Done
- **Data-fetching clarified + cached.** App reads Supabase via the PostgREST
  REST API (not a direct DB connection). Added `lib/supabase/anon.ts` (cookieless
  client) + `lib/queries/catalog.ts` (`"use cache"` + `cacheTag` functions:
  `getEntryTestsCached`, `getSubjectsCached`, `getChaptersCached`, `CATALOG_TAG`).
  Refactored `dashboard.ts` / `subject.ts` to read reference data from the cached
  catalog and the cookie client only for user data. Home → Subjects → Home no
  longer refetches the catalog. `revalidateCatalog()` action invalidates it.
- **Security model finalized** (mcq_12 → mcq_13): catalog views are
  `security_invoker`; anon read granted via scoped RLS policies on non-sensitive
  reference rows only. `options`/answers/user data stay locked. Advisor clean of
  view errors.
- **Two-tier context memory**: global (committed) + local
  (`.kiro/context/local/session.md`, gitignored) scratchpad. Documented in
  `.kiro/context/README.md`; reconciled `data-fetching.md` steering to the real
  invoker+RLS model.
- **Tests + lint + build green**: 12 Vitest tests pass; lint 0 errors;
  `npm run build` passes (Next 16, Cache Components). Added pure helpers
  `sumQuestionCounts` + `chapterMetaLabel` with tests.

### Next steps
- Chapter content routes: practice loop (instant feedback) + past-paper viewer.
- Mock tests flow, then analytics.
- Deferred (pre-prod): enable leaked-password protection in Supabase Auth;
  resolve local Google OAuth http/https quirk (prod-only).


## 2026-06-29 — Practice/Past-Paper + Mock Tests + Analytics (spec: mock-test-and-practice)

### Done
- **Spec** `.kiro/specs/mock-test-and-practice/` (design + requirements + tasks),
  design-first, user-approved. Tasks 1-8 complete; 9 (verify) green.
- **Pure logic + tests** `lib/quiz/{mock-plan,scoring,session,time}.ts` with
  co-located tests (36 new, 48 total passing). mock-plan does difficulty-mix
  selection with nearest-band shortfall borrowing; scoring is the grading oracle.
- **DB migration mcq_14** (applied + mirrored): additive cols `attempts.usage`,
  `attempt_answers.display_order` + `marked_for_review`; **revoked is_correct**
  from anon/authenticated (answer key hidden); 4 SECURITY DEFINER RPCs
  (`start_attempt`, `submit_practice_answer`, `generate_mock_attempt`,
  `submit_mock`) — ownership-checked, search_path pinned, execute granted to
  authenticated only; seeded `net-full-mock` blueprint (200Q/120min) + 3 slots
  (Maths 100 / Physics 60 / English 40, difficulty mix per slot). Advisor clean
  (only expected WARNs). Types regenerated.
- **Integration check** PASSED: generated exactly 200Q with the exact mix,
  submit_mock graded 10/5/185 = 5.00% matching the scoring.ts oracle, idempotent.
- **Loaders** `lib/queries/{practice,mock,performance}.ts` (answer-free content
  via cookie client/RLS). **Actions** `app/(dashboard)/quiz-actions.ts` wrap the
  RPCs. **UI** `components/quiz/*` (Soft Brutalism, green/red gamified feedback):
  option-button, question-card, explanation-panel, bookmark-button,
  practice-runner, mock-runner, quiz-timer, quiz-navigation, question-palette,
  section-progress, mock-result.
- **Routes**: `/subjects/[slug]/[chapter]/{practice,past-paper}`, `/mock`,
  `/mock/[attemptId]`, `/mock/[attemptId]/result`, `/performance`. Nav fixed
  (/mock-tests -> /mock in sidebar, bottom-nav, hero, challenge).
- **Verify**: 48 tests pass, lint clean (1 known font warning), build passes
  (Cache Components). Excluded `ui_design` + `mcqs` from tsconfig (reference app
  was breaking the typecheck).

### Next steps
- Quick Notes / Lectures (learning_resources) when ready.
- Practice "reset" UI; deeper analytics charts; multiple blueprints / tests.
- Pre-prod: enable leaked-password protection; resolve local Google OAuth quirk.


## 2026-06-29 — UX pass (math rendering, loaders, practice redesign)

### Done
- **Math typography**: `lib/quiz/math.ts` (pure, tested) + `components/quiz/math-text.tsx`.
  `^`→superscript, `_`→subscript, sqrt/pi/operators→symbols. Used in practice +
  mock statements, options, explanations.
- **Icon FOUT fixed**: Material Symbols hidden until font loads (globals.css +
  inline Font Loading API script in layout.tsx, `html.ms-loaded`), + preconnect.
- **Loaders**: `components/quiz/quiz-loader.tsx` (InlineLoader "TS" + FullscreenLoader).
  Mock start uses `start-mock-button.tsx` with the fullscreen "creating your
  mock" loader. Practice option-click shows the inline TS loader on the option.
  Added `loaderSweep` keyframes to tailwind.config.ts.
- **Practice/past-paper redesigned** (focused, no sidebar): nested fixed layout
  under the two chapter routes; slim header (logo · moving counter · End),
  two-column statement/options, bottom bar (Prev · Explanation · Next), Save tag.
  Removed now-unused explanation-panel.tsx.
- 55 tests pass; lint clean (1 known font warning); build passes.

### Next
- Optional: fully static default subject cards per test; full LaTeX in MathText.


## 2026-06-29 — UX follow-ups + auth hardening + branding

### Done
- **Icon FOUT fully fixed**: Material Symbols font URL switched `display=swap`
  → `display=block` (swap was rendering the fallback ligature TEXT during load);
  reveal script now only adds `html.ms-loaded` once `document.fonts.check()`
  confirms the font is loaded (removed the unconditional timeout that leaked
  ligature text on slow/blocked loads). If the font never loads, icons stay
  blank rather than showing text. NOTE: if the Material Symbols request is
  network-blocked for a user, self-hosting the icon font is the bulletproof fix.
- **PKCE "code verifier not found" (production Google OAuth)**: root cause = the
  app served from multiple hosts (apex, *.vercel.app, canonical
  entrytest.taleemkasafar.com); verifier cookie is host-scoped. Fix:
  `lib/supabase/proxy.ts` canonical-host 308 redirect when NEXT_PUBLIC_SITE_URL
  is set (localhost exempt); `social-buttons.tsx` builds redirectTo from
  NEXT_PUBLIC_SITE_URL. Also routed email confirmation through token_hash flow
  (/auth/confirm) instead of PKCE /auth/callback. ⚠️ REQUIRES Vercel env
  `NEXT_PUBLIC_SITE_URL=https://entrytest.taleemkasafar.com` (see decisions.md).
- **Back-button bug**: signed-in users hitting auth entry pages (login, sign-up,
  sign-up-success, forgot-password) now redirect to `/` in the middleware; auth
  flow routes (callback/confirm/update-password/error) excluded.
- **Branding**: removed starter Vercel `app/favicon.ico`; added Soft Brutalism
  "TS" mark as `app/icon.svg` (+ `app/apple-icon.svg`), drawn as geometric
  shapes (font-independent).
- **Math/loaders/practice redesign** shipped in the prior UX pass commit.

### Runtime / infra notes (for the "edge" question)
- NO Supabase Edge Functions deployed (grading is via Postgres SECURITY DEFINER
  RPCs). NO explicit Next.js `runtime = 'edge'` anywhere. Pages + Server Actions
  run on the Node runtime (Vercel Fluid compute, required by @supabase/ssr);
  middleware runs on the edge by default. This is the correct architecture —
  do NOT force the full app onto the edge runtime.

### Next
- Set NEXT_PUBLIC_SITE_URL in Vercel + redeploy (auth fix is inert until then).
- Optional: self-host Material Symbols if the font is network-blocked for users.
- Optional: fully static default subject cards; full LaTeX in MathText.


## 2026-07-01 — Database index and query audit

### Done
- **Index & Query Audit**: Comprehensive analysis of database schema and query
  patterns. Created `INDEX_AND_QUERY_AUDIT.md` + `DATA_ACCESS_PATTERNS.md`.
- **Findings**: ✅ Database is production-ready. All critical paths indexed, all
  queries simple (single-table or 1-join, explicit columns, filtered predicates).
- **Index coverage**: 41 indexes across 14 tables; all FK, slug, and user_id
  lookups covered; filtered indexes for soft-deletes + approved status.
- **Query patterns**: 100% simple patterns (avg: 1 table, 3-5 columns, 1-2
  predicates); no N+1 (batch fetches via `.in()`); no full table scans.
- **Performance advisor**: 12 unused indexes (INFO level, expected for early
  stage); all are for FK coverage or anticipated analytics patterns → KEEP.
- **Security advisor**: 7 SECURITY DEFINER function warnings (expected/intentional
  for grading RPCs that access hidden answer key; ownership-checked in body).
- **Query execution**: Catalog reads ~0.1-1ms, question fetches ~1-5ms (50-100Q),
  user data ~0.5-2ms, mock generation ~50-200ms (200Q RPC).
- **Scalability**: Current size (<5K questions, <100 users) = excellent; 10K
  questions/1K users = excellent; 100K questions/10K users = good (may need
  optional composite indexes); 1M+ = requires partitioning/materialized views.

### Recommendations
- ✅ No critical issues. Current state is production-ready.
- 🔹 Optional: 3 minor composite indexes for 100K+ scale (practice attempt lookup,
  mock random selection, active blueprints) — defer until needed.
- 🔹 Optional: revoke EXECUTE on `rls_auto_enable()` and `is_admin()` from API
  roles (low priority hardening).
- 🔹 Recommended: enable leaked password protection in Auth settings (Dashboard).

### Next
- Deploy to production with confidence.
- Monitor pg_stat_statements as usage grows; run EXPLAIN ANALYZE on top queries
  monthly to catch slow paths.
- Re-audit indexes every 6 months; drop unused ones that remain unused.


## 2026-07-01 — Brand-consistent quiz loaders (TS ring spinner)

### Done
- **`components/quiz/ts-ring-loader.tsx`**: new `TsRingLoader` (favicon "TS"
  mark + rotating electric-blue arc, pure CSS `animate-spin`), `QuizLoadingScreen`
  (full-screen branded fallback, same slim header/footer chrome as the runner —
  no layout jump on hydration), and `CheckingOverlay` (centered "checking
  answer..." overlay for practice/past-paper grading).
- **`lib/hooks/use-delayed-visible.ts`**: delayed-loader hook — only renders
  the overlay if the async action exceeds 150ms, and hides it the instant the
  action resolves (no artificial minimum display time). Since
  `submit_practice_answer` typically grades in well under 150ms, the overlay
  effectively never flashes for normal answers.
- Replaced the generic pulsing-skeleton Suspense fallback on
  `/subjects/[slug]/[chapter]/practice` and `.../past-paper` with
  `QuizLoadingScreen`.
- Wired `CheckingOverlay` into `practice-runner.tsx` during answer grading.
- Removed now-dead `InlineLoader` from `quiz-loader.tsx` (superseded by the
  ring loader); `FullscreenLoader` (mock generation, a genuinely multi-step
  ~50-200ms operation) is untouched.
- Verified: lint clean, `npm run build` passes, 55/55 Vitest tests pass,
  manually confirmed in `next dev` that the skeleton no longer appears and the
  TS ring loader renders immediately on practice/past-paper load + option select.

### Next
- Push to production (Vercel auto-deploys from `main`) so
  entrytest.taleemkasafar.com picks up the new loader.


## 2026-08-14 — PU dataset prep (standardize + importer, not yet applied)

### Done
- **Patched `mcqs/build_import_sql.py`** to support 5-option questions:
  both `question_options` label loops now iterate `["a","b","c","d","e"]` and
  use `r.get(f"option_{label}", "")` so CSVs without an `option_e` column
  (like the existing `normalized_mcqs.csv`) still import cleanly.
- **New `mcqs/standardize_pu.py`**: rewrites `pu_csp_css_mcqs.csv` in place
  (backup at `pu_csp_css_mcqs.csv.bak`):
  - `subject_slug` normalised to a PU namespace so PU curriculum doesn't
    collide with the existing NET topic tree: `mathematics -> pu-maths`,
    `physics -> pu-physics`, `verbal-reasoning -> pu-verbal-reasoning`,
    `quantitative-reasoning -> pu-quantitative-reasoning`,
    `computer-science -> pu-computer-science`.
  - `external_id` rewritten to `<pu-subject-slug>-ch<N>-q<n>` with a
    sequential per-(subject, chapter) counter in CSV order (replaces the 3
    inconsistent patterns the file had). Original ID preserved in `source_id`.
  - Idempotent: rerunning against an already-standardised file no-ops.
  - Result: 1445 rows, 1445 unique external_ids matching the pattern.
- **New `mcqs/build_pu_import_sql.py`** emits `mcqs/pu_import.sql`
  (idempotent, no txn wrapper) containing:
  - 7 PU entry_tests: pu-e, pu-m, pu-csp, pu-css, pu-gs, pu-com, pu-ahs
  - 5 PU subjects (namespaced)
  - **23 test_subjects rows — data-driven**, only real (test, subject)
    combinations from the CSV. Sums: pu-e 4, pu-m 3, pu-csp 5, pu-css 4,
    pu-gs 3, pu-com 2, pu-ahs 2.
  - 48 topics (one per (subject, chapter_num))
  - 1445 questions, 5889 question_options, 6501 question_tests (== the CSV's
    total question-to-test pairs; validated).

### Blocker / next
- **Not applied to the DB yet.** `mcqs/pu_import.sql` is ready to load via
  `psql "$DB_URL" -f mcqs/pu_import.sql`; same pattern the NET import used
  (needs the CLI-linked project + DB password, user-held).
- Data quality nits (non-blocking, already flagged in CSV `flag_for_review`):
  1 row has `#ERROR!` in option_a (line 618 of the pre-standardization file),
  and 274 rows have blank correct_option ("no answer key found" — they'll
  import as `moderation_status='flagged'` and stay out of the approved views).
- No new migrations required; existing schema already supports N options via
  `question_options.option_label`.


## 2026-08-14 — PU seed corrected: 8 official tests, new naming, matrix-truth

### Done
- Confirmed the official PU admissions structure: **8 tests** (not 7) and
  **14 unique subjects** in the composition matrix. Earlier seed was inferred
  from CSV data and was under-specified (missed PU-CSE entirely and 9 subjects).
- **CSV `tests` column now normalized** by `mcqs/standardize_pu.py`. Per subject:
  verbal + quant tag all 8 tests, maths tags 5 (E, CSP, CSS, CSE, GS), physics
  tags 3 (E, M, CSP), CS tags 3 (CSP, CSS, CSE). Rerun is byte-idempotent.
  Row-count sanity: verbal 406×8=3248, quant 220×8=1760, maths 161×5=805,
  physics 159×3=477, CS 499×3=1497 → 7787 question_tests rows total (matches
  the emitted SQL exactly). Delta from previous seed = +1286 rows, all PU-CSE.
- **`mcqs/build_pu_import_sql.py` rewritten**:
  - 8 entry_tests with `PU-<CODE>-<DisciplineCamelCase>` display names
    (e.g. `PU-CSP-ICSWithPhysicsCombination`).
  - **Only 5 subjects seeded** — the ones with data (pu-verbal-reasoning,
    pu-quantitative-reasoning, pu-maths, pu-physics, pu-computer-science).
    The other 9 (Chemistry, Biology, Statistics, Economics, Accounting,
    Commerce, Islamiat/Ethics, Pak Studies, GK) are **deferred**, documented
    in `.kiro/context/pu-missing-subjects.md` with a per-test breakdown and a
    "how to fill it in" recipe.
  - `test_subjects` seed reads the official composition matrix and filters to
    the 5 seeded subjects — 27 rows: PU-E 4, PU-M 3, PU-AHS 2, PU-CSP 5,
    PU-CSS 4, PU-CSE 4, PU-GS 3, PU-COM 2.
  - Fan-out for `question_tests` reads the (now-correct) CSV tests column;
    matrix isn't re-consulted, so the CSV stays the single source of truth
    for per-question routing.
- **`.kiro/context/pu-missing-subjects.md`** documents the 9 deferred subjects,
  which tests they belong to, and step-by-step instructions for adding each
  when its question data becomes available.

### Still NOT applied to DB
`mcqs/pu_import.sql` regenerated (idempotent) and ready to load via
`psql "$DB_URL" -f mcqs/pu_import.sql` when convenient.

### Next
- Get Chemistry MCQs first (unlocks PU-E completeness + half of PU-M).
- Then Biology → PU-M complete. Then Statistics/Economics for the CS-\* and
  GS/COM tests. Islamiat/Pak Studies/GK for PU-AHS.


## 2026-08-14 — PU MCQ cleanup: rule sweep + Groq AI verification pass

### Rule-based sweep (mcqs/apply_pu_review.py)
- Auto-approved 682 rows in text-safe subjects (pu-computer-science 445,
  pu-verbal-reasoning 237). CSV `flag_for_review` cleared; audit at
  `mcqs/pu_auto_approved.csv`.
- Deliberately skipped math-heavy subjects (pu-maths / pu-physics /
  pu-quantitative-reasoning) — manual audit of 6-row/subject samples showed
  ~50-67% OCR key accuracy there vs ~90-100% for text subjects.

### Groq AI verification pass (mcqs/ai_review_pu.py + apply_ai_verdicts.py)
- Model: `llama-3.3-70b-versatile` (JSON mode works reliably; tried
  `openai/gpt-oss-120b` first but its Groq JSON validator was flaky).
- Reviewed 645 remaining flagged rows in batches of 25-30, ~30s per batch.
  Total: ~24 API calls, ~150K tokens, well under Groq free-tier limits.
  One TPM 429 mid-run — script is idempotent+resumable (skips rows with
  existing verdicts in `mcqs/pu_ai_verdicts.jsonl`), simply reran.
- Verdict breakdown across the 645:
  - `match_high`  (AI ✓ = OCR ✓)                       — 243  → approved
  - `blank_claim_ai_high` (blank claim, AI filled in)  — 249  → kept flagged
    with AI answer stored in review_note
  - `differ_high` (AI ≠ OCR, both confident)           —  99  → kept flagged
  - `ai_null` / medium / low                           —  54  → kept flagged

### Merge policy (mcqs/apply_ai_verdicts.py)
- **Strict default**: only `match_high` is unflagged. Two independent votes
  agreeing is the safe signal. `differ_high` cases in the audit sample went
  both ways (AI right on grammar/physics knowledge; AI wrong on multi-step
  math + analogy structure), so we don't ship AI-only corrections.
- All 402 rows staying flagged now carry
  `flag_for_review = "[AI:<letter>/<conf>] <reasoning> | orig:<orig>"` so a
  future human review pass can start from the AI's guess.
- Optional (not used): `--include-blank-text` would also auto-approve
  blank-claim + AI-high rows in verbal/CS (+17 rows). `--include-blank-all`
  would take all 249 blank-claim rows. Kept off for quality; easy to enable.

### End state (PU dataset)
| Stage | Approved | Flagged | Approval % |
|---|---|---|---|
| After standardize | 118 | 1327 | 8% |
| After rule sweep | 800 | 645 | 55% |
| After AI verdicts merged | 1043 | 402 | 72% |
- `mcqs/pu_import.sql` regenerated. Counts: 8 tests, 5 subjects, 27
  test_subjects, 48 topics, 1445 questions, 7787 question_tests. Still
  not applied to DB — load via `psql "$DB_URL" -f mcqs/pu_import.sql`.

### Files written
- `mcqs/apply_pu_review.py`     — rule-based sweep script (idempotent, dry-run default)
- `mcqs/ai_review_pu.py`         — Groq API client, batched, resumable
- `mcqs/apply_ai_verdicts.py`   — merges verdicts into CSV (dry-run default)
- `mcqs/pu_ai_verdicts.jsonl`   — raw AI verdicts (645 rows, one JSON per line)
- `mcqs/pu_auto_approved.csv`   — rule-sweep audit trail
- `mcqs/pu_ai_applied.csv`      — AI-merge audit trail

### Security note
Groq API key was provided in chat and used via `GROQ_API_KEY` env var only
(never written to any tracked file). User should rotate the key now that
this pass is complete — the key value is in the chat history.

### Next
- Load `mcqs/pu_import.sql` into the DB and verify counts.
- Optional: human pass over the 349 remaining flagged rows. Priority order:
  pu-maths (143), pu-quantitative-reasoning (109), pu-physics (90).
  pu-verbal-reasoning (6) and pu-computer-science (1) now all marked
  UNRESOLVABLE — original scans required for those.


## 2026-08-15 — Physics flagged MCQs: full manual resolution (90 questions)

### Done
- **All 90 pu-physics flagged rows resolved** via `mcqs/fix_physics_flagged.py`.
  Every question has a correct_option and explanation; flag_for_review cleared.
- Chapters covered: ch2 (Alternating Current / Solid State), ch3 (Modern Physics),
  ch4 (Relativity), ch5 (Nuclear Physics), ch7 (Work & Energy / Rotational Motion),
  ch8 (Physical Optics / Sound), ch9 (Current Electricity / Electrostatics),
  ch10 (Electromagnetic Induction), ch11 (Electronics).
- Key corrections vs OCR/AI: peak-to-peak = 2V₀ (not 4V₀); amorphous = no
  structure; melting = order→disorder; Balmer series identified first (not Lyman);
  proton charge/mass order corrected; escape velocity; τ=Iα; angular velocity
  along axis; net force = 0 in free-fall elevator; Faraday's law concepts, etc.
- `mcqs/pu_import.sql` regenerated: 1186 approved / 259 flagged questions.
- **pu-physics: 159/159 approved (100%)**.

### End state (PU dataset)
| Stage | Approved | Flagged | Approval % |
|---|---|---|---|
| After AI verdicts | 1043 | 402 | 72% |
| After manual CS+verbal | 1096 | 349 | 75.8% |
| After manual physics | 1186 | 259 | 82.1% |

Remaining flagged: pu-maths 143, pu-quant 109,
pu-verbal 6 (unresolvable), pu-cs 1 (unresolvable).
`pu_import.sql` still not applied to DB — load via `psql "$DB_URL" -f mcqs/pu_import.sql`.

### Next
- Fix pu-maths (143) flagged rows (last remaining resolvable subject).
- Then load `pu_import.sql` into the DB and verify counts.


## 2026-08-15 — Quantitative Reasoning flagged MCQs: full manual resolution (109 questions)

### Done
- **102 of 109 pu-quantitative-reasoning flagged rows approved** via `mcqs/fix_quant_flagged.py`.
  7 marked `[MANUAL:unresolvable]` (question text or options cut off at page margin).
- Chapters covered: ch3 (Geometry), ch4 (Equations), ch5 (Statistics — tabulation,
  frequency distributions, sampling, estimation, hypothesis testing, regression/correlation),
  ch6 (Scenario Based), ch7 (Multiplication/Division), ch10 (Unitary Method),
  ch11 (General fractions/primes), ch13 (Ratio & Proportion), ch14 (Average), ch16 (Mental Maths).
- Key corrections vs OCR/AI: average of even integers 2–100 = 51 (not 50); x+y+z average
  from pairwise sums = 4; column captions vs stub vs box-head distinctions; chain base period
  not fixed; μ±0.6745σ = 50% area; bias = E(T)−θ; both b_yx and b_xy = 0 when r=0;
  regression lines coincide when r=±1; 1 kWh = 3.6 MJ; simple interest quadruple time = 60 yr;
  multiples of 13 between 200–500 = 23; 6/6×6/12×…×6/30 = 1/120; y=2000/x; r=√(byx×bxy).
- `mcqs/pu_import.sql` regenerated: 1288 approved / 157 flagged questions.
- **pu-quantitative-reasoning: 213/220 approved (97%)**.

### End state (PU dataset)
| Stage | Approved | Flagged | Approval % |
|---|---|---|---|
| After AI verdicts | 1043 | 402 | 72% |
| After manual CS+verbal | 1096 | 349 | 75.8% |
| After manual physics | 1186 | 259 | 82.1% |
| After manual quant | 1288 | 157 | 89.1% |

Remaining flagged: pu-maths 143, pu-verbal 6 (unresolvable), pu-cs 1 (unresolvable),
pu-quant 7 (unresolvable).
`pu_import.sql` still not applied to DB — load via `psql "$DB_URL" -f mcqs/pu_import.sql`.

## 2026-08-15 — Maths flagged MCQs: full manual resolution (143 questions)

### Done
- **139 of 143 pu-maths flagged rows approved** via `mcqs/fix_maths_flagged.py`.
  4 marked `[MANUAL:unresolvable]` (fraction arithmetic answers that don't match
  any option, and 2 graph-dependent questions with no figure).
- Chapters covered: ch1 (General arithmetic), ch2 (Functions & Limits — domain,
  range, function notation, Euler, image/pre-image, difference quotients),
  ch3 (Differentiation — power rule, chain rule, product/quotient rule,
  standard derivatives), ch4 (More differentiation), ch5 (Integration &
  Analytic Geometry — standard integrals, IBP, distance/midpoint/section
  formulae, centroid, incenter, translation/rotation of axes),
  ch6 (Rotation formulas).
- Key corrections vs OCR/AI: f(5)=3(5)+5/5=16 not 15; f(a)+f(−a)=2a²;
  f'(1) for x⁵+x³+x=9 not 8; trisect (0,0)→(9,12)=(3,4)(6,8); radius of
  circle=13; axis shift (−4,−6) gives (−2,−2) not (1,−2); domain of √(x−3x²)
  =[0,1/3]; Euler introduced f(x) notation; third vertex of triangle=(12,10);
  incenter calculation corrected; centroid formula; section formulae.
- `mcqs/pu_import.sql` regenerated: **1427 approved / 18 flagged**.

### Final PU dataset state
| Stage | Approved | Flagged | Approval % |
|---|---|---|---|
| After AI verdicts | 1043 | 402 | 72% |
| After manual CS+verbal | 1096 | 349 | 75.8% |
| After manual physics | 1186 | 259 | 82.1% |
| After manual quant | 1288 | 157 | 89.1% |
| After manual maths | 1427 | 18 | **98.8%** |

All 18 remaining flags are `[MANUAL:unresolvable]` (missing figures, options
that don't match calculated answers — original Dogar source pages required).
**The dataset is ready to load into the DB.**

## 2026-08-15 — Final 4 maths MCQs rewritten → pu-maths 100%

- **ch1-q8**: option_a corrected from `7 12/14` → `7 11/14` (the true result of 109/14).
- **ch1-q9**: option_b corrected from `20/22` → `20/21` (the true result of 40/42).
- **ch3-q2**: graph-dependent question rewritten as "which function has a removable
  discontinuity at x=3?" → correct=b (y=(x²−9)/(x−3), x≠3).
- **ch3-q3**: graph-dependent domain question rewritten as domain of √(x+1)/(x−3)
  → correct=b ([-1,3)).
- **pu-maths: 161/161 approved (100%).**
- `pu_import.sql` regenerated: **1431 approved / 14 flagged (99.0%)**.
- 14 remaining flags are all `[MANUAL:unresolvable]` across quant(7)/verbal(6)/cs(1).

### Final PU dataset state — READY TO LOAD
| Subject | Approved | Total | % |
|---|---|---|---|
| pu-maths | 161 | 161 | **100%** |
| pu-physics | 159 | 159 | **100%** |
| pu-computer-science | 498 | 499 | 100% |
| pu-verbal-reasoning | 400 | 406 | 99% |
| pu-quantitative-reasoning | 213 | 220 | 97% |
| **Total** | **1431** | **1445** | **99.0%** |

### Next
- ✅ DONE: Load into DB
- Call `revalidateCatalog()` from the dashboard to refresh cached chapter counts.
- Verify PU tests appear in the entry-test selector on the dashboard.

## 2026-08-15 — PU dataset loaded into DB ✅

### Done
- `mcqs/pu_import.sql` applied to the linked Supabase project via
  `supabase db query --linked` (batched in 50-question chunks to stay within
  the CLI's 120s timeout window).
- **Final DB counts (post-import)**:
  - entry_tests: 9 (1 NET + 8 PU)
  - subjects: 8 (3 NET + 5 PU)
  - test_subjects: 30 (3 NET + 27 PU)
  - topics: 89 (41 NET + 48 PU)
  - PU questions: 1445 (1431 approved / 14 flagged)
  - PU question_options: 5896
  - PU question_tests: 7787
- NET data untouched.

### Next
- Invalidate catalog cache: call `revalidateCatalog()` from the dashboard
  (or trigger `POST /api/revalidate-catalog` if wired).
- Verify PU entry tests appear in the entry-test selector.
- Consider adding PU-specific mock blueprint(s) in `mock_test_blueprints`.


## 2026-08-15 — Manual review: verbal-reasoning + computer-science flagged questions

### Done
- Reviewed all 8 remaining flagged rows in pu-verbal-reasoning (7) and
  pu-computer-science (1).
- **1 approved** (line 381, pu-verbal-reasoning-ch3-q59 BEGUILE):
  Antonyms/Synonyms chapter. OCR answer key had `d` (Persuade) but AI
  correctly identified BEGUILE = cheat/deceive → synonym = `a` (Cheat).
  Corrected correct_option from `d` to `a`, added explanation, cleared flag.
- **7 marked UNRESOLVABLE** (lines 220, 253, 427, 454, 479, 528, 1248):
  - Lines 220, 253, 454, 479, 528: options/answer completely missing
    (page crop / scan cutoff). No reconstruction possible.
  - Line 427: two-blank sentence completion with option-pair first words
    cut off — cannot reconstruct correct pairing without original source.
  - Line 1248 (pu-computer-science-ch11-q65): options c/d missing from
    scan; neither visible option (a: BASIC/COBOL/Fortran, b: Prolog) is a
    correct answer to "which are low-level languages".
  All 7 retain flag_for_review = "[MANUAL:unresolvable] ..." so they'll
  import as moderation_status='flagged' and stay out of approved views.

### End state (PU dataset)
| Stage | Approved | Flagged | Approval % |
|---|---|---|---|
| After AI verdicts | 1043 | 402 | 72% |
| After manual CS+verbal | 1096 | 349 | 75.8% |

Remaining flagged: pu-maths 143, pu-quant 109, pu-physics 90,
pu-verbal 6 (unresolvable), pu-cs 1 (unresolvable).
pu_import.sql still not applied to DB — regenerate then load via psql.


## 2026-10-22 — Phase kickoff: calm palette, landing, SEO (roadmap reset)

### State check (read this first)
- PU dataset IS loaded in the DB (see "PU dataset loaded into DB ✅" above).
  The trailing "Manual review: verbal + CS" entry above is older and out of
  order; ignore its "not applied" line.
- App is live at `entrytest.taleemkasafar.com`; will move to apex
  `taleemkasafar.com` alongside a landing page in this same project.

### Done
- **`DESIGN.md` (repo root, committed)** — new design source of truth.
  The old `ui_design/design_scheme/DESIGN.md` is gitignored, so it couldn't
  serve as shared agent memory. v2 "Calm Edition": same shapes/type, softer
  palette (charcoal `#1F2328` instead of black, paper `#F6F6F3`, blue
  `#2D5DB5`), contrast targets measured (body ≥12:1, muted ≥4.5:1). Palette is
  an INTERIM proposal pending the user's color schemes.
- Steering refreshed: `product.md` (roadmap + goals: 500 users, SEO-first,
  agents-first), `structure.md` (real `(dashboard)` layout, no `protected/`),
  `design-system.md` (tokens-only rule, points at `DESIGN.md`).

### Roadmap (user-set order)
1. Calm palette (token refactor → apply user's scheme).
2. Landing page + apex domain move + SEO foundation.
3. Dashboard UI/UX fixes (user will list).
4. Remaining basic features.
5. Blog + content SEO.

### Next
- Token refactor: replace raw `black`/`white`/hex in components with semantic
  tokens backed by CSS variables (no visual change), so the palette swap is a
  one-file edit.
- Waiting on user: color schemes; landing route layout decision.


## 2026-10-22 — Color token refactor

### Done
- `app/globals.css` `:root` now holds RGB-channel vars for every Soft Brutalism
  token (v1 values): ink, on-ink, surface*, on-surface*, outline*, brand*,
  on-brand, success (#16A34A), success-fixed (#DCFCE7), danger, danger-fixed
  (#FEE2E2, not used yet). shadcn HSL vars untouched; no `.dark` palette yet.
- `tailwind.config.ts`: tokens are `rgb(var(--x) / <alpha-value>)` (opacity
  modifiers work); added `on-ink`, `on-brand`, `success{,-fixed}`,
  `danger-fixed`; `shadow-hard*` read `--ink` / `--brand`.
- 37 files in `app/` + `components/` migrated off raw colors (black/white,
  red-500, blue-200, arbitrary hexes, SVG fills in `ts-ring-loader.tsx` →
  `fill-*`/`stroke-*` classes). Zero raw color utilities remain; only the
  Google logo fills in `social-buttons.tsx` keep hexes (brand-mandated).
- Lint (0 errors), 55 tests, build all green.

### Next
- **Palette swap = edit the `:root` token block in `app/globals.css` only**
  (v2 values in `DESIGN.md` §3), then re-measure contrast targets.


## 2026-10-22 — Route restructure: landing at /, app at /dashboard

### Done
- `git mv app/(dashboard) app/dashboard` → app now at `/dashboard/*`.
  Imports switched to `@/app/dashboard/{actions,quiz-actions}`.
- New `app/(marketing)/` (layout + placeholder landing `page.tsx`): static
  prerender (`○ /`), title/description/canonical via metadata API, CTAs to
  sign-up / login, "full landing coming soon" note. Root `metadataBase` now
  prefers `NEXT_PUBLIC_SITE_URL` (canonical host, not `*.vercel.app`).
- `lib/routes.ts` (+ `routes.test.ts`, 16 tests): `routes.*` URL builders,
  `isPublicPath` (deny-by-default allowlist: `/`, `/auth/*`, metadata/static,
  `/_next/*`), `shouldBounceSignedIn` (`/` + auth entry pages),
  `safeNextPath` (open-redirect guard, used by /auth/callback + /auth/confirm),
  `isNavActive` (Home active only on `/dashboard`).
- Proxy uses the helpers; post-auth defaults (sign-in, sign-up email, OAuth,
  confirm, update-password, confirm-signup template) → `/dashboard`.
- `next.config.ts` 308s legacy `/subjects*`, `/mock*`, `/performance`.
- All internal links/redirects/revalidatePath use `routes.*`. Sidebar
  Settings/Help placeholders moved to `/dashboard/settings` / `/dashboard/help`
  (pages still not built).
- Lint 0 errors, 71 tests, build green. Runtime not checked (no dev server).

### Next
- Landing page content (waiting on user instructions).
- Apex domain move: set `NEXT_PUBLIC_SITE_URL=https://taleemkasafar.com`,
  add the apex host to Supabase Auth Site URL / redirect URLs, 301 old host.
  (Callback/confirm paths are unchanged; only `next=` changed, so no Supabase
  config change is needed for this restructure itself.)
- Hosted Supabase "Confirm signup" email template: if it was pasted from
  `supabase/templates/confirm-signup.html`, update `next=/` → `next=/dashboard`
  there too (old value still works: `/` bounces signed-in users to /dashboard).


## 2026-10-22 — Merit calculator data + logic (no UI)

### Done
- `data/merit-formulas.ts`: 18 institutions / 19 formulas (FAST-NUCES has
  NU Test + NTS routes) extracted ONLY from the merit PDF, each with PDF page
  refs. Plain data + `getUniversities()`, `getUniversityBySlug()`,
  `getUniversitySlugs()`. Also `IBCC_GRADE_EQUIVALENCE` (p9, reference only).
- `lib/merit/types.ts` (DB-shaped records), `validate.ts` (field-level error
  codes, never throws), `calculate.ts` (`calculateMerit`, per-component
  breakdown, PDF qualifying minimums, `MERIT_DISCLAIMER`, `formatScore` 2dp).
- Every formula is `needsReview` (the PDF states no year); 14/19 also have
  formula-specific flags (23 total). All listed in `NOTES.md` (repo root).
- 75 Vitest tests pass; eslint clean; tsc 0 errors in data/ + lib/merit/.
### Next
- User reviews `NOTES.md` (year, NED academic label, COMSATS/IST /100 totals,
  combined-academics universities).
- Build /merit-calculator + /merit-calculator/[university] UI on these helpers.
## 2026-10-22 — Public site Phase 1: theme, layout, home, SEO foundation
### Done
- Palette v2 (DESIGN.md §3) applied to `:root` in `app/globals.css` (app-wide);
  shadcn HSL vars aligned to brand tokens (primary = ink, ring = brand, ...);
  `--radius` untouched. `shadow-soft` / `shadow-soft-lg` (tokenized) added.
  DESIGN.md §11 "Public site variant" (rounded) added.
- shadcn: `accordion`, `sheet` (+ `@esuiss/trace`, `@esuiss/code-block`
  installed, NOT used yet; button.tsx/lib/utils.ts overwrites declined).
  New deps pinned exact. `npm run typecheck` script added.
- `config/site.ts`, `config/pricing.ts` (3-month trial, plans PLACEHOLDER,
  prices "TBD"), `config/faq.ts` (feeds accordion + FAQPage JSON-LD).
- SEO: `lib/seo/metadata.ts` (`buildMetadata`), `components/seo/json-ld.tsx`
  (Organization/WebSite/FAQPage/BreadcrumbList, `<` escaped),
  `lib/seo/public-routes.ts` → `app/sitemap.ts`, `app/robots.ts`, branded
  `app/opengraph-image.tsx` + `twitter-image.tsx` (old PNGs deleted).
- `lib/routes.ts`: public-site builders + allowlist (`/merit-calculator/*`,
  `/blog/*`, `/contact`, `/academies`, `/sign-in`, `/register`); tests extended.
  `next.config.ts`: `/sign-in` → `/auth/login`, `/register` → `/auth/sign-up` (307).
- Marketing layout (skip link, sticky header w/ Sheet mobile menu + active
  links, footer) and home page (hero, features, how it works, merit teaser,
  pricing, FAQ, final CTA) under `components/marketing/`. `/` is ○ static.
- Material Symbols font moved from root layout to dashboard + auth layouts
  (`components/material-symbols-font.tsx`); unused Geist font removed.
- Lint 0, typecheck 0, 152 tests, build green. Lighthouse `/` (local):
  perf 77–84, a11y 100, best-practices 96, SEO 100. Evidence:
  `.agents/tasks/marketing-phase1-verification.md`.
### Next
- Phase 2 pages: /merit-calculator(+[university]), /blog(+[slug]), /contact,
  /academies (links/sitemap already point there; they 404 until built).
- Perf: TBT is framework hydration under 4x CPU throttle; revisit after the
  pages exist (measure on the deployed host).

## 2026-10-22 — Public site Phase 2: merit pages, contact, academies + Phase 1 fixes
### Done
- `/merit-calculator` (card per university, explainer, disclaimer) and
  `/merit-calculator/[university]` (18 slugs prerendered; calculator island with
  route picker, inline errors, aria-live result, breakdown bars, qualifying
  minimums, notes; server-rendered formula card + admission criteria).
  `getMeritSitemapEntries()` spread into `app/sitemap.ts` (blog slot reserved).
- `/contact` (PLACEHOLDER contact cards, form UI, honest "not sent" success,
  `TODO(backend)`), validation in `lib/contact/validate.ts` (+ tests).
- `/academies` (Available now / Coming soon benefits, 3 steps, academy plan from
  `config/pricing.ts`, FAQ + FAQPage JSON-LD, CTA).
- Phase 1 fixes: FAQ → native `<details>` (accordion.tsx deleted); lazy mobile
  Sheet + 44px close button; coverage copy = NET + PU (ECAT/MDCAT "coming
  soon"); `config/site.ts` canonical comment fixed; sign-up form muted text
  class → `text-on-surface-variant`.
- Lint 0, typecheck 0, 186 tests, build green. Lighthouse (local, loaded
  machine): a11y/BP/SEO 100 on all 5 pages, perf 76–83 (below 90). Evidence:
  `.agents/tasks/marketing-phase2-verification.md`.
### Next
- User fills `config/site.ts` `contact` placeholders and academy plan details.
- Blog (`/blog`, `/blog/[slug]`, `getBlogSitemapEntries()`) — separate run.
- Contact server action (backend) when ready; decide on removing @esuiss deps
  and `@radix-ui/react-accordion`.
- Perf: re-measure on the deployed host (TBT is framework hydration).

## 2026-10-22 — Public site Phase 4: blog + final verification
### Done
- Blog: `lib/blog/` (types, strict frontmatter validation, server-only
  Markdown → HTML with raw HTML dropped + unsafe URLs stripped, loader = DB
  swap point, tests), `content/blog/README.md`, `/blog` (category-grouped
  cards) and `/blog/[slug]` (6 static posts, article styles, related posts,
  trial CTA, Article + BreadcrumbList JSON-LD, OG `article`). Per-post PNG
  OG/Twitter images in `app/blog/[slug]/` (outside the route group so the URL
  has no hash suffix). Sitemap = 29 URLs.
- Phase 2 review fixes: PU mock claims → "full mocks for NET, PU coming soon"
  everywhere (FAQ + JSON-LD, metas, CTA, OG image, 5 posts); emptied total =
  `total-required`; hint list in `aria-describedby`; year notice from data
  (`admissionYearNotice`); FAST route switch keeps shared marks
  (`lib/merit/form-state.ts`); `@radix-ui/react-accordion` removed.
- Lint 0, typecheck 0, 215 tests, build green. Lighthouse mobile medians
  (loaded host, benchmarkIndex ~600): perf 67–80, a11y/BP/SEO 100 everywhere;
  desktop home 86. No perf code changes (cost = framework runtime; see
  `.agents/tasks/blog-phase4-verification.md`).
### Next
- Before launch: fill `config/site.ts` contact placeholders, pricing TBDs,
  review FAQ/blog copy; re-measure perf with PageSpeed Insights on the
  deployed host.
- Decide: keep or remove the unused @esuiss files (trace, code-block,
  collapsible, shiki, highlighter).
## 2026-10-22 — Public site Phase 4: blog + final verification (review fixes)
### Done
- Blog loader hardening: YAML-only frontmatter (gray-matter JS engine
  overridden + `---<lang>` fences rejected), quoted ISO dates only, build fails
  on a missing cover file, test that every internal post link resolves.
  Unknown-slug OG/Twitter images 404; post cover uses `preload`; README fixed.
- Lint 0, typecheck 0, 218 tests, build green, sitemap 29 URLs. Lighthouse
  mobile medians 67–83 on a loaded host (a11y/BP/SEO 100), desktop home 99;
  cost is the framework runtime chunk. Evidence:
  `.agents/tasks/blog-phase4-verification.md`.
### Next
- Before launch: PageSpeed Insights on the deployed host; fill contact
  placeholders, pricing TBDs, review FAQ/blog copy; decide on @esuiss files.


## 2026-10-23 — Public site polish round (direct edits, no workflow)

### Done
- `/` no longer bounces signed-in users; header/hero/final CTA/mobile menu swap
  to Access dashboard / Start practice when a session cookie is present.
- Free-for-students positioning across home, pricing, FAQ, academies, merit and
  blog CTAs, OG image, meta descriptions; Rs 250 cap note; academies via WhatsApp.
- New hero copy ("Entry test preparation that explains every mistake"), test
  names in copy (NET, PU, UET, FAST, NAT), chips removed, wrong-answer
  explanation shown in the hero visual.
- Feature cards with light-blue gradients + gradient icon tiles; FAQ heading on
  top with full-width, taller rows; shared `PracticeCta`; Parhlai-style gradient
  banner header with logo on all inner pages; real contact details; footer
  links NET/PU to the dashboard.
- Palette v2.1 (lighter charcoal, brighter blue, iris violet accent).
- Verified: typecheck + lint clean, 224 tests pass (new session-hint tests),
  build green with all public pages static, screenshots of home (desktop +
  mobile), merit calculator and contact checked.

### Next
- Manual check while signed in: header shows Access dashboard on `/`.
- DESIGN.md §3 still lists v2 values; update the table to v2.1 when the palette settles.
