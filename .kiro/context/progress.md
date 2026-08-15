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
