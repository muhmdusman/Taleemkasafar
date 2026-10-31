# Agent Workflow — How to Work on This Project

This project is built **AI-agents-first**: development is done by AI agents
following a structured, token-efficient, best-practices loop. Follow this every
session.

## 1. Start every task by loading context (cheap, do it first)
Before exploring the codebase, read the project memory in this order:
- `.kiro/context/local/session.md` — per-machine scratchpad (gitignored; skip
  if it doesn't exist).
- `.kiro/context/progress.md` — start with the "Current state" block at the
  top, then the newest dated entry at the bottom (the log is oldest-first).
- `.kiro/context/decisions.md` — architectural decisions + rationale.
- `.kiro/context/PROJECT_MAP.md` — what lives where (instead of scanning).
- `.kiro/context/DESIGN.md` — before any UI work.
- `.kiro/context/csv-cleanup-plan.md` / `pu-missing-subjects.md` — data
  pipeline status (if data-related).
Then read only the specific files the task needs. Do NOT re-scan the whole repo.

## 2. Use the installed skills (don't reinvent)
Skills live in `.kiro/skills/`. Activate the matching skill for the task:
- **supabase** — ANY Supabase work (DB, auth, RLS, edge functions, client/SSR).
- **supabase-postgres-best-practices** — writing/optimizing SQL, schema, indexes.
- **react-best-practices** — writing/refactoring React/Next.js for performance.
- **composition-patterns** — component architecture, reusable APIs, React 19.
- **web-design-guidelines** — reviewing UI for accessibility/UX before shipping.
- **next-dev-loop** — verifying runtime behavior in a running `next dev`.
- **next-cache-components-*** — Cache Components adoption/optimization.

## 3. Database changes flow through version-controlled migrations
- Schema lives in `supabase/migrations/*.sql` (timestamped, ordered).
- To change schema: write a NEW migration file (never edit applied ones), then
  apply it. Two ways:
  - via Supabase MCP `apply_migration` (fast, agent-driven), OR
  - `supabase db push` from the CLI (user-run; needs DB password).
- Keep the local `supabase/migrations/` files IN SYNC with what's applied
  remotely so the schema is reproducible and portable (e.g. to AWS RDS later).
- After DDL: run MCP `get_advisors` (security + performance) and fix findings.
- Regenerate types after schema changes (see step 4).
- Every new `public` table MUST have RLS enabled with explicit policies.

## 4. Keep TypeScript types in sync with the DB
- DB types live in `lib/database.types.ts` (generated).
- Regenerate after any schema change via MCP `generate_typescript_types` or
  `supabase gen types typescript --linked > lib/database.types.ts`.

## 5. Verify before declaring done
- Run `npm run lint && npm run typecheck && npm run test && npm run build`.
  If any step can't run in your environment, record it as "⚠ Not run" in
  progress.md instead of claiming it passed.
- **Tests**: `npm run test` (Vitest, single run; never `test:watch`). Pure
  logic lives in small testable helpers (e.g. `lib/queries/*-helpers.ts`)
  with co-located `*.test.ts`. Add/extend tests when adding features or
  fixing bugs.
- For runtime behavior, use the `next-dev-loop` skill against a running dev
  server (the USER runs `npm run dev`; agents do not start long-running servers).
- For UI changes, run a pass with `web-design-guidelines` and follow
  `.kiro/steering/design-system.md` (one rounded, calm style for public
  site, dashboard and auth).

## 6. Close the loop — update memory
When a chunk of work completes, append a dated entry to the bottom of
`.kiro/context/progress.md` (done / next), refresh its "Current state" block
at the top, and append any new architectural decision to
`.kiro/context/decisions.md`. If files moved or were added, update
`PROJECT_MAP.md` and `structure.md` in the same change.
Keep entries short and factual. This is what makes future sessions cheap.

## Token-efficiency rules
- Read memory + targeted files, not the whole repo.
- Delegate broad investigation/fan-out work to sub-agents to keep the main
  context focused on implementation.
- Prefer dedicated tools (read/search/edit) over shell `cat`/`grep`/`sed`.
- Don't paste large data blobs into context; bulk data ops belong in scripts
  (`mcqs/`) or psql, not inline SQL relayed through chat.

## Portability reminder
Keep the schema standard PostgreSQL (no Supabase-only extensions in the core).
The only Supabase-coupled pieces are auth (`auth.users`) and RLS `auth.uid()`;
everything else must remain portable to plain Postgres / AWS RDS.
