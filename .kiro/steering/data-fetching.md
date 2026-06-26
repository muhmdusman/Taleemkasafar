# Data Fetching & Caching

## How we read from Supabase
We do NOT open a direct Postgres connection from the app. We use the
`@supabase/ssr` / `@supabase/supabase-js` clients, which call Supabase's
**PostgREST REST API** over HTTPS. Two clients, two purposes:

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
   per-user reads in a shared cache.

## Invalidating the cache
When the question bank / catalog changes (e.g. after a CSV import or admin edit),
call `revalidateCatalog()` (in `app/(dashboard)/actions.ts`) which does
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
