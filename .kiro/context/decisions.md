# Decisions Log

## 2026-06-25

### Keep `lib/supabase/`, don't add `utils/supabase/`
The repo already ships Supabase client helpers in `lib/supabase/` using the
newer `getClaims()` + `proxy.ts` pattern. This is preferred over the older
`utils/supabase/middleware.ts` snippet. All code references `@/lib/supabase/*`.

### Use the publishable key, not legacy anon key
Env var is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`). Client
helpers already read this. Newer, rotatable, recommended for new apps.

### Auth strategy
Support BOTH:
1. Email + password (already implemented in starter).
2. Google OAuth (PKCE flow via `signInWithOAuth`, callback at
   `/auth/callback/route.ts` exchanging the code for a session).

### Google OAuth — manual setup checklist (dashboard, can't be done via MCP)
To enable Google sign-in, the following must be configured by a human:
1. Google Cloud Console → create OAuth 2.0 Client ID (Web application).
2. Authorized redirect URI:
   `https://lcsuasddoertvoujwsgo.supabase.co/auth/v1/callback`
3. Copy Client ID + Client Secret.
4. Supabase Dashboard → Authentication → Providers → Google → enable, paste
   Client ID + Secret.
5. Supabase Dashboard → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (dev) / production URL later.
   - Redirect URLs: add `http://localhost:3000/**` and the prod equivalent.

### MCP write access
Removed `?read_only=true` so the agent can run migrations and seed data. Keep
RLS enabled on every public table; run `get_advisors` after DDL.


## 2026-06-25 — Local Google OAuth http/https (deferred)

### Symptom
Google OAuth on local dev succeeds (session is set) but the final redirect
lands on `https://localhost:3000` instead of `http://localhost:3000`, giving
`ERR_SSL_PROTOCOL_ERROR` (dev server has no SSL). Persists across Chrome
incognito AND Firefox. Supabase Site URL is correctly `http://localhost:3000`.
App code (callback route + social-buttons redirectTo) correctly uses the
request origin / window.location.origin (http) — no forced https in our code.

### Decision: DEFER (dev-only artifact)
This is a localhost-only http/https mismatch. In PRODUCTION the app is served
over real HTTPS on a real domain, so the redirect back is genuinely https and
works. The error cannot occur in production. Email/password auth works locally
for testing meanwhile. Revisit local Google dev later (likely 127.0.0.1 instead
of localhost, or PKCE/detectSessionInUrl tweak).

### PRODUCTION DEPLOY CHECKLIST (auth URLs) — do at deploy time
Supabase Dashboard -> Authentication -> URL Configuration:
- Site URL = production URL, e.g. https://taleemkasafar.com
- Redirect URLs: add https://<prod-domain>/** , keep http://localhost:3000/** ,
  and (if Vercel) add https://*-<project>.vercel.app/** for preview deploys.
Google Cloud Console OAuth client: Authorized redirect URI stays
https://lcsuasddoertvoujwsgo.supabase.co/auth/v1/callback (unchanged per env).
Also set NEXT_PUBLIC_SITE_URL env in production so server-side emailRedirectTo
uses the right origin.


## 2026-06-26 — Catalog caching + two-tier context memory

### How we fetch from Supabase (clarification)
The app does NOT open a direct Postgres connection. It uses `@supabase/ssr` /
`@supabase/supabase-js`, which call Supabase's PostgREST REST API over HTTPS.
Two read clients by ownership of data:
- `lib/supabase/server.ts` — cookie-based, RLS as the signed-in user. Reading
  cookies makes the page dynamic. Use for USER data + writes.
- `lib/supabase/anon.ts` — cookieless, no session. Safe inside `"use cache"`.
  Use ONLY for public catalog reads.

### Cache the catalog, not the user
Reference data (subjects, chapters, counts, entry-test list) is identical for
everyone and changes rarely → cache it. Implemented `lib/queries/catalog.ts`
with `"use cache"` + `cacheTag(CATALOG_TAG, ...)`, read via the cookieless anon
client. User data stays dynamic (cookie client, RLS), never shared-cached.
Navigating Home → Subjects → Home no longer refetches the catalog.
Invalidate after an import/edit with `revalidateCatalog()` in
`app/(dashboard)/actions.ts` → `revalidateTag(CATALOG_TAG, "max")` (Next 16
requires the 2nd "max" arg).

### Security model for the cacheable layer (mcq_12 → mcq_13)
mcq_12 first made the catalog views `security definer` + granted anon — the
security advisor flagged definer views as ERRORs. mcq_13 REVERTED to
`security_invoker` views and instead granted the `anon` role read access via
explicit RLS policies on only the non-sensitive reference rows (active entry
tests, subjects, active test_subjects, live topics, and approved+live
questions/question_tests for counts). `options` (correct answers), explanations,
and all user tables have NO anon policy → stay locked. Advisor is now clean of
view errors. DECISION: public reference data uses invoker views + scoped anon
RLS, never security-definer.

### Two-tier AI-agent context memory
Split memory to keep sessions cheap:
- GLOBAL (committed) — `.kiro/context/{progress,decisions,csv-cleanup-plan}.md`:
  curated durable record, shared across machines/sessions.
- LOCAL (gitignored, `.kiro/context/local/session.md`) — fast volatile
  scratchpad; read FIRST to recover state, then read only targeted files.
Workflow: jot volatile notes locally during work; promote durable facts up to
the global files when a chunk completes, then trim the local file.


## 2026-06-29 — Mock/practice grading: server-authoritative answer key

### Decision: hide is_correct, grade via SECURITY DEFINER RPCs
`question_options.is_correct` was readable by `authenticated`, making mock scores
forgeable. We revoked column read of `is_correct` from anon+authenticated
(re-granted the other option columns) and moved all grading behind four
SECURITY DEFINER RPCs (migration mcq_14): `start_attempt`,
`submit_practice_answer` (returns correctness+explanation — practice's whole
point), `generate_mock_attempt` (server-side selection + freeze), `submit_mock`
(grades whole paper in one tx, writes mock_results, idempotent). Each body pins
`search_path=public` and re-checks `auth.uid()` ownership; execute granted to
authenticated only. Advisor flags these as WARN (definer + authenticated-
executable) which is EXPECTED and correct for this design.

### Decision: reuse existing tables; two additive columns only
No new tables. `attempts.usage` separates practice vs past-paper resume state;
`attempt_answers.display_order` freezes mock question ordering;
`attempt_answers.marked_for_review` persists review flags. Mock question set is
frozen by pre-inserting unanswered attempt_answers rows at generation (carries
ordering), avoiding an attempt_questions table.

### Decision: mock difficulty mix is data, deterministic
Whole-paper target 30 easy / 90 medium / 80 hard, split proportionally per slot
and stored in `mock_blueprint_slots.difficulty_mix` (jsonb). Selection borrows
from the nearest difficulty band on shortfall. Tunable without code changes.

### Decision: practice resume is server-side (not localStorage)
The reference quiz app used localStorage; we persist each practice answer to the
server (via submit_practice_answer) so progress follows the user across devices
and feeds analytics. Resume = first unanswered question in stable order.

### Decision: exclude ui_design + mcqs from tsconfig
`ui_design/quiz_screen` is a full reference Next app (design source, gitignored);
it broke `next build`'s typecheck. Added `ui_design` + `mcqs` to tsconfig
`exclude`. They remain on disk as reference/data, not part of the app build.


## 2026-06-29 — Fix "PKCE code verifier not found in storage" on first login

### Root cause
Email sign-up confirmation was routed through the PKCE code-exchange flow
(`emailRedirectTo: /auth/callback` → `exchangeCodeForSession`). PKCE stores a
`code_verifier` in a cookie bound to the browser that STARTED sign-up. Users
frequently open the confirmation email in a different browser / device / in-app
webview (Gmail/Outlook app), where that cookie doesn't exist → error. This is
why it was intermittent and "first login only". (OAuth round-trips in the same
browser, so it's mostly fine there; email confirmation does not.)

### Fix (per Supabase Next.js SSR tutorial)
- `app/auth/actions.ts` signUp now uses `emailRedirectTo: /auth/confirm?next=/`
  (token_hash + verifyOtp flow, NOT browser-bound).
- `app/auth/confirm/route.ts` hardened (NextResponse redirects, clear errors).
- `app/auth/callback/route.ts` gives a clear recoverable message if a PKCE
  verifier is ever missing.
- Local email template: `supabase/templates/confirm-signup.html` +
  `[auth.email.template.confirmation]` in config.toml.

### ⚠️ REQUIRED manual step on the HOSTED project (emails come from there)
Dashboard → Authentication → Emails → **Confirm signup** template: change the
link from `{{ .ConfirmationURL }}` to:
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/`
Without this, production emails still send the PKCE ?code= link and the error
persists. (Recovery/magic-link templates should get the same treatment if used.)


## 2026-06-29 — PKCE error in PRODUCTION is a multi-host cookie issue (not email)

### Symptom
`https://entrytest.taleemkasafar.com/auth/error?error=PKCE code verifier not
found in storage` after Google sign-in. Email confirmation is OFF and no SMTP is
configured, so this is the OAuth flow, not email.

### Root cause
The PKCE `code_verifier` is stored in a cookie scoped to the host where sign-in
STARTED. The app is reachable from multiple hosts (apex `taleemkasafar.com`,
`entrytest-taleemkasafar.vercel.app`, and the canonical
`entrytest.taleemkasafar.com`). If the flow starts on one host and the callback
lands on another (or Supabase falls back to Site URL), the verifier cookie is
orphaned and `exchangeCodeForSession` fails.

### Ruled out
- Supabase URL config is correct (Site URL = entrytest; redirect URLs include
  entrytest + vercel.app + localhost).
- Google Console: redirect URI correctly = `…supabase.co/auth/v1/callback`.
  An `app.taleemkasafar.com` entry under *Authorized JavaScript origins* is
  harmless — the server-side redirect flow doesn't use JS origins, only the
  redirect URI. Not the cause.
- "User clicked Google before signing up" is NOT a cause — OAuth auto-creates
  the user; sign-in/sign-up pages call the same signInWithOAuth.

### Fix (code)
- `lib/supabase/proxy.ts`: canonical-host enforcement — if NEXT_PUBLIC_SITE_URL
  is set and the request host differs (and isn't localhost), 308-redirect to the
  canonical origin BEFORE auth starts, so the verifier is set+read on one host.
- `components/auth/social-buttons.tsx`: `redirectTo` built from
  NEXT_PUBLIC_SITE_URL (fallback window.location.origin in dev).
- `.env.example`: documented NEXT_PUBLIC_SITE_URL.

### ⚠️ REQUIRED on Vercel
Set env var `NEXT_PUBLIC_SITE_URL=https://entrytest.taleemkasafar.com`
(Production; also Preview if desired) and redeploy. The fix is inert until this
is set. Optional hygiene: point apex/www domains in Vercel to redirect to the
canonical host; clean the Google JS-origins entry to entrytest.
