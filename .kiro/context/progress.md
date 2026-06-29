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
