# Project Structure

## Top-level layout
```
app/                  Next.js App Router pages & routes
  auth/               Auth flows (login, sign-up, callback, confirm, etc.)
  protected/          Authenticated dashboard area (guarded by proxy.ts)
  page.tsx            Public landing page
  layout.tsx          Root layout (ThemeProvider, fonts)
components/           Shared React components
  ui/                 shadcn/ui primitives (button, card, input, ...)
  tutorial/           Starter tutorial components (can be removed later)
lib/
  supabase/           Supabase client helpers (client, server, proxy)
  utils.ts            cn() + hasEnvVars helpers
  database.types.ts   generated DB types (after schema changes)
mcqs/                 Source MCQ data (CSV/JSON) + data-prep + import scripts. GITIGNORED.
supabase/             Local Supabase project (version-controlled DB)
  config.toml         project config
  migrations/         ordered, timestamped schema migrations (source of truth)
proxy.ts              Next.js middleware entry → session refresh + route guard
.kiro/
  steering/           AI agent guidance (product, tech, structure, workflow)
  skills/             installed agent skills (supabase, react, design, next)
  context/            project memory / decision log for AI agents
  specs/              feature specs (design/requirements/tasks)
  settings/mcp.json   MCP server config (Supabase)
```

## Conventions for new code
- **Routes/pages**: under `app/`. Group related routes in folders.
- **Dashboard features** (practice, mock tests, analytics): build under
  `app/protected/<feature>/` so they inherit auth protection.
- **Reusable UI**: `components/`. Generic primitives → `components/ui/`.
- **Domain logic / data access**: put query helpers in `lib/` (e.g.
  `lib/queries/` for Supabase data fetchers) rather than inline in components.
- **DB types**: generated into `lib/database.types.ts`.
- **Naming**: files kebab-case (`mock-test-card.tsx`), React components
  PascalCase, DB tables/columns snake_case.

## MCQ data
- Raw datasets live in `mcqs/` (maths, physics, english) as CSV + JSON, produced
  by the python build scripts there. This folder is gitignored.
- These feed the Supabase question bank via a seeding/import step (to be built).

## AI agent memory
- Long-lived decisions, schema notes, and "where we left off" live in
  `.kiro/context/`. Read it at the start of a task; update it as decisions are made.
