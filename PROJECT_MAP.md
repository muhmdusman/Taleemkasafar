# Project Map — Taleem ka Safar

A quick "what lives where" guide. For each file: what it is and what it does.
(For deeper guidance see `.kiro/steering/` and project memory in `.kiro/context/`.)

---

## App routes (`app/`)
Next.js App Router. Server Components by default; business logic on the server.

| File | What it does |
|------|--------------|
| `app/layout.tsx` | Root layout. Loads fonts (Space Grotesk, Inter, Material Symbols), ThemeProvider, global metadata/title. |
| `app/page.tsx` | **Authenticated root `/`** — the landing after login. Verifies the session (Suspense-wrapped) and shows a welcome + logout. Dashboard content goes here next. |
| `app/globals.css` | Tailwind layers + CSS variables. |
| `app/auth/layout.tsx` | Shared shell for all auth screens: branded "Taleem ka Safar" header + footer (Soft Brutalism). |
| `app/auth/actions.ts` | **Server Actions** for auth: `signInAction` (→ `/`) and `signUpAction` (→ sign-up-success). All auth business logic lives here. |
| `app/auth/login/page.tsx` | Sign-in page (renders `SignInForm`). |
| `app/auth/sign-up/page.tsx` | Sign-up page (renders `SignUpForm`). |
| `app/auth/sign-up-success/page.tsx` | "Check your email" confirmation screen. |
| `app/auth/forgot-password/page.tsx` | Forgot-password page (renders `ForgotPasswordForm`). |
| `app/auth/update-password/page.tsx` | Update-password page (renders `UpdatePasswordForm`). |
| `app/auth/error/page.tsx` | Generic auth error display. |
| `app/auth/callback/route.ts` | **OAuth (Google) callback** — exchanges the PKCE code for a session, then redirects (defaults to `/`). |
| `app/auth/confirm/route.ts` | **Email confirmation** — verifies the email OTP token, then redirects. |

## Components (`components/`)
Client Components only where interactivity is needed; otherwise presentational.

| File | What it does |
|------|--------------|
| `components/auth/sign-in-form.tsx` | Sign-in form UI (email/password). Calls `signInAction`. Soft Brutalism styling. |
| `components/auth/sign-up-form.tsx` | Sign-up form UI (name/email/password/terms) + branded side panel. Calls `signUpAction`. |
| `components/auth/social-buttons.tsx` | Google (wired) + GitHub (disabled, "coming soon") sign-in buttons. |
| `components/forgot-password-form.tsx` | Sends a password-reset email. |
| `components/update-password-form.tsx` | Sets a new password, then redirects to `/`. |
| `components/logout-button.tsx` | Signs out and returns to `/auth/login`. |
| `components/ui/button.tsx` | shadcn Button primitive. |
| `components/ui/card.tsx` | shadcn Card primitives. |
| `components/ui/input.tsx` | shadcn Input primitive. |
| `components/ui/label.tsx` | shadcn Label primitive. |

## Library (`lib/`)
| File | What it does |
|------|--------------|
| `lib/supabase/client.ts` | Browser Supabase client (typed with `Database`). For Client Components. |
| `lib/supabase/server.ts` | Server Supabase client (typed, cookie-based). For Server Components / Actions / route handlers. Create a new one per request. |
| `lib/supabase/proxy.ts` | `updateSession()` — refreshes the auth session and **guards routes**: everything except `/auth/*` requires login. |
| `lib/database.types.ts` | **Generated** TypeScript types for the entire DB schema. Regenerate after schema changes. |
| `lib/utils.ts` | `cn()` (class merge) + `hasEnvVars` check. |

## Middleware
| File | What it does |
|------|--------------|
| `proxy.ts` (repo root) | Next.js middleware entry; calls `updateSession()` from `lib/supabase/proxy.ts`. |

## Database (`supabase/`)
Version-controlled, portable Postgres schema.

| Path | What it does |
|------|--------------|
| `supabase/config.toml` | Supabase CLI project config. |
| `supabase/migrations/*.sql` | Ordered, timestamped schema migrations (source of truth). 9 migrations: enums, catalog, questions, mock defs, user-owned tables, RLS, function hardening, perf fixes. |

### Schema overview (15 tables)
- **Catalog (read-only to users):** `entry_tests`, `subjects`, `test_subjects`,
  `topics` (self-referential syllabus tree), `questions`, `question_tests`
  (per-test usage: past_paper/practice), `question_options`, `learning_resources` (future).
- **Mock tests:** `mock_test_blueprints`, `mock_blueprint_slots`.
- **User-owned (RLS owner-only):** `profiles`, `attempts`, `attempt_answers`,
  `mock_results`, `bookmarks`.
Full design: `.kiro/specs/mcq-platform-schema/design.md`.

## Data pipeline (`mcqs/`) — GITIGNORED
Raw MCQ datasets (CSV/JSON) + Python scripts that clean, standardize, and
generate the import SQL. Not part of the app runtime.
- `normalized_mcqs.csv` — the unified, schema-ready dataset (1169 questions).
- `import.sql` — idempotent loader for the DB.
- `FLAGGED_TO_FIX.md` — 51 questions needing manual review.

## AI agent config (`.kiro/`)
| Path | What it does |
|------|--------------|
| `.kiro/steering/` | Always-on guidance: `product.md`, `tech.md`, `structure.md`, `workflow.md`, `design-system.md`. |
| `.kiro/skills/` | Installed agent skills (supabase, react/next best practices, design, etc.). |
| `.kiro/context/` | Project memory: `progress.md`, `decisions.md`, `csv-cleanup-plan.md`. |
| `.kiro/specs/` | Feature specs (e.g. the schema design). |
| `.kiro/settings/mcp.json` | Supabase MCP server config. |

## UI designs (`ui_design/`)
Reference mockups (screenshot + HTML) per screen, plus `design_scheme/DESIGN.md`
(the "Soft Brutalism" system). Ported to React — never used as raw HTML.
