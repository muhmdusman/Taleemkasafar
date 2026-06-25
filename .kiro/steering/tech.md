# Tech Stack & Conventions

## Stack
- **Framework**: Next.js (App Router, latest) with React 19, TypeScript.
- **Styling**: Tailwind CSS v3 + `tailwindcss-animate`. UI primitives from
  shadcn/ui (Radix under the hood) in `components/ui/`.
- **Backend**: Supabase (Postgres 17, Auth, Storage, RLS).
- **Auth**: `@supabase/ssr` with cookie-based sessions.
- **Icons**: `lucide-react`. **Themes**: `next-themes`.

## Supabase project
- Name: `Taleemkasafar`
- Ref / project_id: `lcsuasddoertvoujwsgo`
- Region: `ap-south-1` (Mumbai)
- URL: `https://lcsuasddoertvoujwsgo.supabase.co`

## Environment variables
Defined in `.env.local` (gitignored):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (publishable key, not the legacy anon JWT)

This project uses the **publishable key** pattern (`sb_publishable_...`), not the
legacy `anon` key. Client helpers read `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Supabase client usage (IMPORTANT)
Use the existing helpers in `lib/supabase/` — do NOT create a `utils/supabase/`
folder.
- `lib/supabase/client.ts` → `createClient()` for **Client Components**.
- `lib/supabase/server.ts` → `await createClient()` for **Server Components,
  Route Handlers, Server Actions**. Always create a new client per request
  (Fluid compute safe). Never store in a global.
- `lib/supabase/proxy.ts` → `updateSession()` keeps sessions fresh; wired via
  root `proxy.ts`. Uses `getClaims()` — never insert code between
  `createServerClient` and `getClaims()`.

## Auth conventions
- Prefer `supabase.auth.getClaims()` over `getUser()` for speed where claims
  suffice.
- Protected routes live under `app/protected/` and are guarded by `proxy.ts`
  redirect logic.
- OAuth callback handled at `app/auth/callback/route.ts` (PKCE code exchange).
- Email confirmation handled at `app/auth/confirm/route.ts`.

## Database / MCP conventions
- Schema changes go through migrations via the Supabase MCP
  (`apply_migration`), named in snake_case. Do not hardcode generated IDs.
- Every new table in `public` MUST have RLS enabled with explicit policies.
- After DDL changes, run `get_advisors` (security + performance) to catch
  missing policies / indexes.
- Generate TS types into `lib/database.types.ts` after schema changes.

## Commands
- Dev server: `npm run dev` (run manually, do not background from the agent).
- Build: `npm run build`  |  Lint: `npm run lint`
- CLI is logged in to the Taleemkasafar account. Link with:
  `supabase link --project-ref lcsuasddoertvoujwsgo`

## Code style
- TypeScript strict. Functional React components. Server Components by default;
  add `"use client"` only when needed (state, effects, browser APIs).
- Path alias `@/*` maps to repo root.
- Keep secrets out of client code; only `NEXT_PUBLIC_*` is exposed to the browser.
