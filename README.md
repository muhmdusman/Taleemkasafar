# Taleem ka Safar

An entry-test preparation platform. Students choose an entry test (starting with
**NET Engineering**) and prepare with subject-wise, chapter-wise MCQ practice,
timed mock tests, and performance analytics.

> Built AI-agents-first: see `.kiro/` for the agent steering, skills, and memory
> that drive development. New here? Read **`PROJECT_MAP.md`** for a "what lives
> where" tour of the codebase.

---

## What it does

- **Choose an entry test**, then prepare across its subjects (Maths, Physics,
  English today; more tests/subjects are data, not code).
- **Practice mode**: pick a subject → chapter/topic → practice MCQs or past-paper
  MCQs, with the correct answer + explanation shown instantly.
- **Mock tests**: timed, multi-subject papers generated from a blueprint
  (maximize past-paper questions + some practice, mixed difficulty), scored and
  saved at the end.
- **Analytics**: accuracy by subject/topic, weak areas, progress, mock history.
- **Quick Notes & Lectures** per chapter (scaffolded for later).

## Tech stack

- **Next.js** (App Router, React 19, TypeScript) — business logic on the server
  (Server Components + Server Actions).
- **Supabase** (Postgres 17, Auth, RLS) via `@supabase/ssr`.
- **Tailwind CSS** with a custom **"Soft Brutalism"** design system
  (see `.kiro/steering/design-system.md`).
- **Auth**: email/password + Google OAuth.

## Project structure (high level)

```
app/            Next.js routes (auth flows + authenticated root dashboard)
components/     React components (auth/, ui/ primitives)
lib/            Supabase clients, generated DB types, helpers
supabase/       Version-controlled DB: config + ordered migrations
mcqs/           MCQ data pipeline + scripts (gitignored)
ui_design/      Reference mockups + the design system spec
.kiro/          AI agent steering, skills, context/memory, specs
```

Full file-by-file map: **`PROJECT_MAP.md`**.
Schema design: **`.kiro/specs/mcq-platform-schema/design.md`**.

## Getting started (local)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables** — create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
   ```

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 (sign up / log in to enter the app).

> Heads up: local Google OAuth can fail with an http→https redirect quirk that
> only affects `localhost` (works fine in production). Use email/password for
> local testing. See `.kiro/context/decisions.md`.

## Database

The schema lives in `supabase/migrations/*.sql` and is applied to the Supabase
project. To change it, add a **new** migration (never edit an applied one):

```bash
# via Supabase CLI (linked project)
supabase migration new <name>
supabase db push

# then regenerate types
supabase gen types typescript --linked > lib/database.types.ts
```

Every new `public` table must have RLS enabled with explicit policies. Run the
Supabase security/performance advisors after schema changes.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint |

## Deployment notes

When deploying, add your production domain to **Supabase → Authentication → URL
Configuration** (Site URL + Redirect URLs; keep `http://localhost:3000/**` too)
and set `NEXT_PUBLIC_SITE_URL`. Full checklist in `.kiro/context/decisions.md`.
