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
