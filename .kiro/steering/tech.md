# Tech Stack & Conventions

## Stack
- **Framework**: Next.js 16 (App Router; `package.json` pins `latest`, lockfile
  resolves 16.1.6) with React 19, TypeScript. `eslint-config-next` is pinned
  at 15.3.1.
- **Cache Components** is ON (`cacheComponents: true` in `next.config.ts`).
  See `data-fetching.md` for what that means for data reads.
- **Tests**: Vitest (`vitest.config.ts`), co-located `*.test.ts`.
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

- `NEXT_PUBLIC_SITE_URL` (production only; leave unset locally). Canonical
  origin: used by `config/site.ts` (falls back to `https://taleemkasafar.com`)
  and to keep OAuth PKCE cookies and auth redirects on one host. Template:
  `.env.example`.

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
- The authenticated app lives under `app/dashboard/` (`/dashboard/*`). The
  guard in `proxy.ts` → `lib/supabase/proxy.ts` is deny-by-default: only paths
  in the `isPublicPath` allowlist (`lib/routes.ts`) are public. New public
  pages must be added there. Build internal URLs with `routes.*` from
  `lib/routes.ts`; validate any `next` redirect param with `safeNextPath`.
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
- Build: `npm run build`  |  Lint: `npm run lint`  |  Types: `npm run typecheck`
- Tests: `npm run test` (`vitest run`, single pass). `npm run test:watch` is
  watch mode; agents must not run it.
- Full check before declaring done:
  `npm run lint && npm run typecheck && npm run test && npm run build`

## `next.config.ts`
- `cacheComponents: true`.
- `outputFileTracingIncludes` ships `content/blog/**` and
  `public/blog/covers/**` with `/blog/*` (the loader reads them at runtime for
  the 404 fallback).
- `redirects()`: legacy `/subjects*`, `/mock*`, `/performance` → `/dashboard/*`
  (308); short aliases `/sign-in` → `/auth/login`, `/register` →
  `/auth/sign-up` (307).
- CLI is logged in to the Taleemkasafar account. Link with:
  `supabase link --project-ref lcsuasddoertvoujwsgo`

## Code style
- TypeScript strict. Functional React components. Server Components by default;
  add `"use client"` only when needed (state, effects, browser APIs).
- Path alias `@/*` maps to repo root.
- Keep secrets out of client code; only `NEXT_PUBLIC_*` is exposed to the browser.
