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
