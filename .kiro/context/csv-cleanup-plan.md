# CSV Cleanup & Standardization Plan

Goal: get all four MCQ CSVs into a single, consistent, schema-ready shape with
correct field names, globally-unique namespaced IDs, and all flagged questions
reviewed/fixed/unflagged. Execute ONE phase per prompt.

## Confirmed structure
Subject -> Chapter/Topic (leaf, holds content directly) -> [Practice MCQs |
Past Papers | Quick Notes | Video Lectures]. NO subtopics inside chapters.
- Physics: kind=chapter, English/Maths chapters too; English nodes kind=topic.

## Current state (as of 2026-06-25)
| File | rows | flagged | blank correct_option | id format | has chapter_slug? |
|------|------|---------|----------------------|-----------|-------------------|
| all_maths_mcqs.csv | 357 | 51 | 2 | `ch1-q1` | NO (missing) |
| english_ch1_to_ch4.csv | 315 | 13 | 0 | `en-ch1-q1` | yes |
| physics_ch1_to_ch11.csv | 253 | 25 | 0 | `ph-ch1-q1` | yes |
| physics_2ndyr_ch12_to_ch21.csv | 244 | 17 | 0 | `ph-ch12-q1` | yes |
Totals: 1169 rows, 106 flagged, 2 blank correct_option.

Issues:
- Inconsistent headers: maths CSV lacks `chapter_slug`.
- IDs not globally unique / not namespaced by subject (maths `ch1-q1` collides
  with the convention; should be `maths-ch1-q1`).
- 106 flagged questions need manual review.
- 2 maths questions have no correct_option.

## Target schema-ready CSV columns (final, all four files identical)
```
external_id, subject, chapter_num, chapter_slug, chapter_title, node_kind,
statement, option_a, option_b, option_c, option_d, correct_option,
explanation, difficulty, flag_for_review, tests
```
- `external_id`: namespaced `<subject>-<chapterref>-q<n>` e.g. `physics-ch1-q5`,
  `maths-ch1-q1`, `english-synonyms-q4`.
- `node_kind`: `chapter` for maths/physics, `topic` for english.
- `tests`: `net:past_paper` for all current rows (OETP past papers).
- drop `past_paper` + `resource` columns (folded into `tests` and source).
  (Keep `resource`->source mapping handled at import; can retain a `source`
  column = 'oetp' if useful.)

## Execution phases (one per prompt)

### Phase 1 — Review what was asked FIRST: the flagged questions + blank answers
Per the user's explicit instruction, FIRST handle the flagged/answer-check work:
- For each flagged row AND each blank-correct_option row:
  1. Read the statement + options.
  2. Determine the correct option by actually solving/calculating (maths/physics)
     or by reasoning (english synonyms/antonyms/grammar).
  3. Set/fix `correct_option`; fix the option text if needed.
  4. Verify by recomputation.
  5. Clear `flag_for_review` (unflag) once confident.
  6. If genuinely unresolvable, leave flagged with a clear note.
- Work subject by subject. Record decisions in this file as we go.
- Start with the 2 blank maths + smaller flagged sets, then larger.

### Phase 2 — Standardize headers & IDs (one writer script)
- Write a single python script `mcqs/standardize_csvs.py` that reads all four
  CSVs and emits normalized versions with the target columns above:
  - add `chapter_slug` to maths (derive from chapter_title).
  - namespace `external_id` per subject.
  - add `node_kind`, add `tests='net:past_paper'`.
  - keep a `source='oetp'` column.
- Output to standardized files (or overwrite after backup). Idempotent.

### Phase 3 — Validate normalized CSVs
- Assert: unique external_ids across ALL files, every row has a non-blank
  correct_option in {a,b,c,d}, no remaining flags (or list the leftovers),
  consistent headers, valid difficulty values, chapter_num/slug/title present.

### Phase 4 — (later, separate spec/tasks) DB migration + import
- Apply the schema migration via Supabase MCP.
- Build importer that consumes the normalized CSVs into the schema (idempotent
  upsert on external_id + question_tests on (question_id, entry_test_id)).
- Regenerate TS types into lib/database.types.ts.

## Phase 1 log — MATHS (all_maths_mcqs.csv)
Started: 51 flagged + 2 blank.
- 2 blank (`y1-ch3-q4`, `y1-ch3-q11`): UNRECOVERABLE — matrix values lost to OCR
  ("see scan"). Cannot compute. LEFT FLAGGED for manual scan entry.
- 20 UNFLAGGED (verified by calculation/concept), via mcqs/apply_maths_review.py:
  - 19 concept/fully-specified computations confirmed correct as stored.
  - 1 FIX: `y1-ch4-q13` correct_option c->d (w^n=w^2 => n≡2 mod3; only -1 fits,
    not -2).
- 31 still flagged: these depend on OCR-garbled source NUMBERS (determinant
  entries, polynomial exponents, hyperbola constants, etc.) where the stored
  answer came "per key" but the statement as-given can't be independently
  recomputed. These need the original scan to verify. LEFT FLAGGED intentionally
  (correctness over false confidence).
Result: maths flagged 51 -> 31 (+2 blank still flagged = 33 total flagged).

## Phase 1 log — ENGLISH (english_ch1_to_ch4.csv)
Started: 13 flagged.
- 8 UNFLAGGED (definite vocabulary answers): en-ch1-q17 (Ameliorate=Improve),
  q59 (Bleak=Desolate), q90 (Ruminate=Ponder), q107 (Adorable=Ambrosial),
  q143 (Irreproachable=Exemplary), q161 (antonym Adaptable=Rigidity),
  q175 (Approbation=Consent), en-ch2-q40 (Spring:Summer::Adolescence:Youth).
- 5 KEPT FLAGGED (ambiguous or dubious key): q82 (Arid: Dry vs Parched both ok),
  q136 (Magnanimous: Selfless vs Bounteous), q167 (Tranquil antonym keyed
  'Inebriated' is wrong), q178 (Procrastination keyed 'Setback', true synonym
  absent), q184 (Aloof: Snooty vs Snobbish both ok). Need scan/human call.
Result: english flagged 13 -> 5.

## Phase 1 log — PHYSICS (both files)
Started: ch1-11 = 25, ch12-21 = 17 (42 total).
- 25 UNFLAGGED via standard constants/formulas or full computations
  (prefixes, dimensions, v=rw, T=1/f, E=1/2kx^2, M=fo/fe, f=1/P, k/G~1e20,
  Q=CV, E=sigma/eps0, V=I(R+r), Pfund series, Cobalt-60, etc.).
- 2 FIXES: ph-ch7-q36 d->a (T of sin(wt)=2pi/w, not 'None'); ph-ch16-q24
  confirmed d (changing E-field) — flag note was mistaken, already correct.
- 15 KEPT FLAGGED: garbled/missing source numbers or stems (ph-ch3-q10,
  ch4-q12, ch7-q17, ch10-q1/q4/q8/q9/q12, ch12-q25/q29, ch13-q5, ch16-q6,
  ch20-q5, ch21-q13/q17). Need the scan.
Result: physics ch1-11 25->8, ch12-21 17->7.

## Phase 1 FINAL state (flag counts)
| File | total | flagged left | blank answer |
|------|-------|--------------|--------------|
| maths   | 357 | 31 | 2 |
| english | 315 | 5  | 0 |
| physics ch1-11 | 253 | 8 | 0 |
| physics ch12-21 | 244 | 7 | 0 |
Resolved this session: english 8, physics 27 (this prompt) + maths 20 (prior).
Remaining 51 flags + 2 blank all depend on the OETP.pdf scan or human judgement
(user will help with maths next). Scripts: apply_{maths,english,physics}_review.py.

## Progress
- [x] Phase 1: english + physics done. Maths partially done (33 await user/scan).
- [x] Phase 1b: flagged checklist written to mcqs/FLAGGED_TO_FIX.md (51 items) for
      user's manual fixing later.
- [x] Phase 2: standardized -> mcqs/normalized_mcqs.csv (1169 rows, unique
      namespaced external_ids, derived slugs, node_kind, source, tests column).
      Script: mcqs/standardize_csvs.py (idempotent). Original source id kept as
      source_id for traceability.
- [x] Phase 3: validated via mcqs/validate_normalized.py — PASSED. Unique IDs,
      valid enums, all required fields present, blank answers only on the 2
      flagged unrecoverable maths rows. Breakdown: maths 357 (16 ch), physics
      497 (21 ch), english 315 (4 topics); 51 flagged remain.
- [ ] Phase 4: DB migration + importer + TS types (next).

## Phase 4 log — DB migration (DONE)
Applied 8 migrations via Supabase MCP to project lcsuasddoertvoujwsgo:
- mcq_01_enums_and_helpers, 02_catalog_core, 03_questions, 04_mock_definitions,
  05_user_owned, 06_rls_policies, 07_harden_functions, 08_revoke_public_execute.
All 15 tables created, RLS enabled on every one. Advisor: clean except the
intentional is_admin() (needed by RLS for authenticated) and the pre-existing
rls_auto_enable() (not ours). set_updated_at search_path pinned;
handle_new_user EXECUTE fully revoked.
Next: build importer to load mcqs/normalized_mcqs.csv, then gen TS types.

## Phase 4 log — IMPORT (in progress)
- Setup loaded via MCP: 1 entry_test (net), 3 subjects, 3 test_subjects, 41
  topics. Verified counts.
- Full idempotent import generated: mcqs/import.sql (all 1169 questions +
  options + question_tests). Also chunked: mcqs/import_batches/qjson_01..04.sql
  (JSON batches of 300) and batch_00_setup.sql/topics_insert.sql.
- BLOCKER: 1169 rows (~3MB SQL) is too large to relay through MCP execute_sql
  batch-by-batch. Bulk load belongs in psql/CLI.
- PLAN: link CLI (`supabase link --project-ref lcsuasddoertvoujwsgo`), then
  `psql "$DB_URL" -f mcqs/import.sql`. import.sql is idempotent (safe to rerun).
  Needs DB password (user-held). Awaiting user to run link + load, OR provide a
  way to run psql.
- AFTER import: verify row counts, run get_advisors (perf), generate TS types
  to lib/database.types.ts.

## Phase 4 COMPLETE (2026-06-25)
- Import finished via psql (fixed: removed single-txn wrapper so rows commit
  independently). Verified: 1169 questions, 4676 options, 1169 question_tests
  (all net:past_paper), 51 flagged. Matches source exactly.
- Local DB now version-controlled: `supabase/migrations/*.sql` (9 migrations,
  01-09) mirror what's applied remotely. `supabase init` ran (config.toml).
- mcq_09_perf_fixes applied: added covering indexes for all unindexed FKs;
  re-scoped admin-write RLS policies to INSERT/UPDATE/DELETE (removed the
  SELECT double-policy overlap flagged by perf advisor). Remaining advisor
  notices are benign (unused indexes = no queries run yet; is_admin executable
  by authenticated = required for RLS).
- TS types generated -> lib/database.types.ts; wired Database generic into
  lib/supabase/client.ts + server.ts (queries now type-safe).
- Skills cleaned up: removed stray agent/ + data/skills copies; .kiro/skills now
  has supabase, supabase-postgres-best-practices, react-best-practices,
  composition-patterns, web-design-guidelines, next-dev-loop, next-cache-*.
- Added .kiro/steering/workflow.md (AI-agents-first dev loop).

## Next phase: BUILD THE APP UI
- Dashboard shell under app/protected/ (My Subjects, Mock Tests, Performance).
- Subject -> chapter/topic -> [Practice | Past Paper | Quick Notes | Lectures].
- Practice loop (instant feedback) + mock test flow + analytics.
- Google OAuth still needs manual dashboard config (see decisions.md).

## 2026-06-25 — Auth UI built (Soft Brutalism)
- Added design system: tailwind tokens (ink/brand/surface/outline + shadow-hard),
  Space Grotesk + Inter fonts, Material Symbols. Steering: design-system.md.
- Auth business logic on server: app/auth/actions.ts (signInAction/signUpAction
  as Server Actions; redirect server-side — sign in -> "/", sign up ->
  /auth/sign-up-success). Google OAuth client-side via social-buttons.tsx;
  GitHub button rendered but disabled (coming soon).
- New components: components/auth/{sign-in-form,sign-up-form,social-buttons}.tsx
  ported from ui_design HTML (brand = "Taleem ka Safar", not TEST_ARCHITECT).
- app/auth/layout.tsx = branded auth shell. login + sign-up pages rewired.
  sign-up-success restyled. Deleted old login-form/sign-up-form/google-auth-button.
- Route protection: proxy.ts now guards EVERYTHING except /auth/* (root "/" is the
  authenticated landing). app/page.tsx = authed landing (Suspense-wrapped auth read
  for Cache Components) with logout.
- User updated Google OAuth client/secret in dashboard, so Google sign-in is live.
- Build passes (Next 16.1.6, Cache Components). Note: avoid `new Date()` in Server
  Components (must be cached/Suspense) — hardcoded footer year.
- [ ] Phase 2: standardize headers & IDs
- [ ] Phase 3: validate
- [ ] Phase 4: migration + import (separate)


## 2026-06-25 — Starter cruft cleanup
Deleted unused Next.js+Supabase starter demo code:
- app/protected/ (whole folder — replaced by authed root "/")
- components/tutorial/ (whole folder)
- components/{hero,next-logo,supabase-logo,deploy-button,env-var-warning,auth-button}.tsx
- components/ui/{badge,checkbox}.tsx (unused primitives)
Fixed update-password-form redirect /protected -> /. Build passes.
Remaining components: auth/{sign-in,sign-up,social-buttons}, forgot-password-form,
update-password-form, logout-button, theme-switcher, ui/{button,card,dropdown-menu,
input,label}.

## 2026-06-25 — Final cleanup + docs
- Removed now-orphaned theme-switcher.tsx (unused after protected layout deleted)
  and ui/dropdown-menu.tsx (only used by theme-switcher).
- Verified every remaining app/, components/, lib/ source file is reachable/used.
  Lean source tree. (npm deps for deleted radix components left for later; harmless.)
- Created PROJECT_MAP.md — file-by-file "what lives where" guide for the user.
- Rewrote README.md as the real Taleem ka Safar project readme (was the generic
  Next+Supabase starter readme).
Final components: auth/{sign-in-form,sign-up-form,social-buttons},
forgot-password-form, update-password-form, logout-button, ui/{button,card,input,label}.


## 2026-06-26 — Dashboard home built (Soft Brutalism)
- DB: migration mcq_10_dashboard_views adds `subject_overview` view
  (security_invoker) — per (test,subject) chapter_count + approved question_count.
  Verified: english 4/310, maths 16/326, physics 21/482. Regenerated TS types
  (Views block added to lib/database.types.ts).
- Data layer: lib/queries/dashboard.ts (getDashboardData, server-only, RLS),
  + lib/queries/dashboard-helpers.ts (pure: resolveDisplayName, avatarInitial,
  cardIndex).
- Route group app/(dashboard)/ with shared shell layout (Sidebar + BottomNav).
  Root "/" moved here = dashboard home. proxy.ts already guards all non-/auth.
- Components in components/dashboard/: icon, sidebar, bottom-nav, header,
  hero-section, subjects-section (REAL data + counts, links to /subjects/[slug]),
  challenge-section. Honest empty states (no fake stats; hasActivity flag from
  attempts count). Brand = "Taleem ka Safar".
- TESTING set up: Vitest installed, `npm run test`/`test:watch` scripts,
  vitest.config.ts. lib/queries/dashboard-helpers.test.ts (7 tests) — all pass.
- Build passes. Nav links to /subjects, /mock-tests, /performance, /settings,
  /help are placeholders (pages not built yet — next).
- Advisor note (deferred, dashboard toggle): leaked-password-protection is OFF;
  enable in Supabase Auth settings for production.

### Next: build /subjects (subject -> chapters list) then chapter view
(4 buttons: Past Paper | Practice | Quick Notes | Lectures), then practice loop.