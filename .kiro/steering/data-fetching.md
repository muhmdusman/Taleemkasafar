# Data Fetching & Caching

## How we read from Supabase
We do NOT open a direct Postgres connection from the app. We use the
`@supabase/ssr` / `@supabase/supabase-js` clients, which call Supabase's
**PostgREST REST API** over HTTPS. Three clients, three purposes:

- **`lib/supabase/server.ts`** (`createClient`) — cookie-based, authenticated as
  the signed-in user. Every query runs under that user's **RLS**. Because it
  reads cookies, any page using it is **dynamic** (re-runs per request). Use for
  **user-specific** data (profile, attempts, selected test) and writes.
- **`lib/supabase/anon.ts`** (`createAnonClient`) — cookieless, no session.
  Safe to use inside `"use cache"`. Use ONLY for **public catalog** reads via
  the catalog views.
- **`lib/supabase/client.ts`** — browser client for Client Components (auth, etc.).

## Caching strategy (the important part)
Split data by who it belongs to:

1. **Catalog / reference data** — same for every user, changes rarely
   (subjects, chapters, counts, entry-test list). **CACHE IT.**
   - Read it through the cacheable view layer in `lib/queries/catalog.ts`, which
     wraps each function in `"use cache"` + `cacheTag(CATALOG_TAG, ...)`.
   - Backed by `security_invoker` views (`subject_overview`, `chapter_overview`,
     `entry_test_public`) that respect RLS. The cookieless `anon` role is granted
     read access via explicit RLS policies (migration `mcq_13`) to ONLY the
     non-sensitive reference rows: active entry tests, subjects, test↔subject
     links, syllabus topics, and approved+live questions/question_tests (needed
     for counts). Question content, correct answers (`options`), explanations,
     and all user data remain locked to the authenticated owner / admin.
   - Result: navigating Home → Subjects → Home does NOT refetch the catalog.

2. **User-specific data** — stays **dynamic** (cookie client, RLS). Never cache
   per-user reads in a shared cache. Per-user fetchers live in
   `lib/queries/` (dashboard, entry-test, mock, performance, practice,
   profile, progress, subject).

## Grading and attempt writes go through RPCs
Correct answers never reach the client: `select` on `question_options` is
revoked from `anon` and `authenticated` (mcq_14). Attempts are started,
answered, graded, paused and resumed only through Postgres functions, called
from Server Actions in `app/dashboard/quiz-actions.ts`:
- `SECURITY DEFINER` (search_path pinned, re-check `auth.uid()` ownership,
  `execute` revoked from `anon`/`public`): `start_attempt`,
  `submit_practice_answer`, `generate_mock_attempt`, `submit_mock` (mcq_14),
  `pause_mock`, `resume_mock` (mcq_15).
- `SECURITY INVOKER` (RLS scopes rows): `practice_progress` (mcq_15), used by
  `lib/queries/progress.ts`.
New grading/scoring logic follows the same pattern: a new migration with a
definer function that checks ownership, revoke from `anon`/`public`, call it
from a Server Action.

## Invalidating the cache
When the question bank / catalog changes (e.g. after a CSV import or admin edit),
call `revalidateCatalog()` (in `app/dashboard/actions.ts`) which does
`revalidateTag(CATALOG_TAG, "max")`. Selecting a different entry test does NOT
need a catalog revalidation (catalog is shared across tests, keyed by slug).

## Rules for new features
- New PUBLIC reference data → add a `security_invoker` aggregate view, grant the
  `anon` role read access via an explicit RLS policy on the underlying
  non-sensitive table(s), add a `"use cache"` function in `lib/queries/catalog.ts`,
  and tag it. Run `get_advisors` (security) after — security-definer views are
  flagged as errors, so prefer invoker + RLS.
- New USER data → dynamic cookie client, owner-only via RLS, no shared cache.
- Never expose question content, correct answers, explanations, or user rows to
  the anon/cached layer.
- Cache Components is ON (`next.config.ts`): isolate dynamic reads (cookies,
  `usePathname`, `new Date()`) behind `<Suspense>` or they block the route.
- Keep business logic on the server (Server Components / Server Actions).
