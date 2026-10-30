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


## 2026-08-14 — PU dataset: namespace PU subjects, don't unify with NET

### Decision: `pu-` prefix all PU subject slugs; do NOT merge into NET's
The PU CSV has `subject_slug=mathematics` (and `physics`, `computer-science`,
`verbal-reasoning`, `quantitative-reasoning`). Two conceptual options:
- **Option A** — unify: map `mathematics -> maths`, `physics -> physics`,
  share `subjects.id` with existing NET rows. Topics live in a single tree.
- **Option B** (chosen) — namespace: rewrite to `pu-maths`, `pu-physics`,
  `pu-verbal-reasoning`, `pu-quantitative-reasoning`, `pu-computer-science`.
  Every PU subject is its own row; PU curriculum has its own topic tree.

Why B: the two curricula have different chapter breakdowns and different
chapter_nums for the same abstract subject (NET Mathematics ch1 = "Number
Systems"; PU Mathematics ch1 = "General"). Sharing subject_id would either
collide on topic natural keys (`unique (subject_id, parent_topic_id, slug)`
or the per-CSV `external_id = subject:ch<num>`) or require reworking the
topic key strategy. Namespacing keeps both trees clean, keeps NET data
untouched, and the UI's `test_subjects` join naturally shows the correct
subject list per test slug.

### Decision: 5-option questions are stored as-is (no schema change)
`question_options` is already row-shaped with `option_label text` (unique per
`(question_id, option_label)`) and the partial unique index
`uq_one_correct_option` enforces "at most one correct" regardless of option
count. Runtime path (`lib/queries/practice.ts`, `lib/queries/mock.ts`) already
selects options as an array; no UI hardcoding of a-d. The only code touch
needed was extending the CSV importer's label loop from `["a","b","c","d"]` to
`["a","b","c","d","e"]` (and switching to `r.get()` so CSVs without an
`option_e` column still import cleanly).

### Decision: test_subjects is data-driven from the CSV, not blanket-linked
Every PU test only lists the subjects it actually contains questions for.
`build_pu_import_sql.py` scans the `tests` column across every row, computes
the (test_slug, subject_slug) set of real combinations, and emits exactly
those `test_subjects` rows (23 rows total for the current CSV). This means
the dashboard's subject selector will show the right subjects per test with
zero manual config: e.g. pu-com and pu-ahs will only show Verbal Reasoning
and Quantitative Reasoning, while pu-csp shows all 5 PU subjects.

### PU test slug naming (best-guess pending user confirmation)
Names in `PU_TESTS` are our current understanding of the Dogar guide-book
codes: pu-e = BS Engineering, pu-m = Pre-Medical, pu-csp = CS (Programming),
pu-css = CS (Software Studies), pu-gs = General Sciences, pu-com = Commerce,
pu-ahs = Allied Health Sciences. The `slug` (natural key) is what wires the
rows together; the `name` is a display label and safe to rename in the DB
later without breaking any references.


## 2026-08-14 — PU seed uses OFFICIAL composition, not CSV inference

### Problem with the previous approach
`build_pu_import_sql.py` v1 inferred which subjects each PU test contains
from the CSV's `tests` column. That worked mechanically but was
under-specified: because the CSV only carries Verbal, Quant, Maths, Physics
and CS questions, tests like PU-M (which officially takes Physics + Chemistry
+ Biology + V + Q) looked as if they only took Physics + V + Q. And PU-CSE
didn't exist in the CSV at all, so the seed had 7 tests instead of 8.

### Decision: composition matrix (source of truth) drives seeding
Both scripts now carry the official Punjab University 8-test × 5-subject-per-test
composition as a hardcoded matrix. `standardize_pu.py` uses the inverse
(subject -> tests) to rewrite each CSV row's `tests` column deterministically;
`build_pu_import_sql.py` uses the matrix directly for `test_subjects`. The
CSV then serves as the single source of truth for per-question routing (its
tests column is trusted after normalization).

### Decision: skip subjects with no data (defer, don't seed empty)
9 of the 14 official PU subjects have no MCQ data yet (Chemistry, Biology,
Statistics, Economics, Accounting, Commerce, Islamiat/Ethics, Pakistan Studies,
General Knowledge). Rather than seed them as empty subject rows (which would
show up in the dashboard as "0 chapters, 0 questions" and clutter the UI),
we seed only the 5 subjects with data. The composition matrix silently skips
deferred subjects when materialising `test_subjects` — e.g. PU-COM currently
shows only Verbal + Quant, and PU-M shows Physics + Verbal + Quant. When
question data arrives for a deferred subject we add it to `PU_SUBJECT_NAMES`,
rerun the scripts, and the correct `test_subjects` rows appear automatically.
`.kiro/context/pu-missing-subjects.md` documents exactly what's deferred and
how to fill it in.

### Decision: display name format is `PU-<CODE>-<DisciplineCamelCase>`
Per user, dashboard-facing entry_tests.name is
`PU-CSP-ICSWithPhysicsCombination`-style (dashes, no spaces, no parens).
This matches the code prefix pattern and reads well in the entry-test
selector dropdown without extra frontend logic.

### Decision: Verbal + Quant tag ALL 8 tests
Every question in Verbal Reasoning and Quantitative Reasoning is common to
every PU test (they are always part of the paper regardless of discipline).
Standardize_pu.py enforces this in the CSV so no test — including PU-CSE
and PU-AHS — is ever completely empty even before subject-specific data
arrives.


## 2026-10-22 — Design source of truth + color tokens

### Decision: `DESIGN.md` lives at repo root (committed)
`ui_design/` is gitignored (it contains a full reference Next app), so the
original `ui_design/design_scheme/DESIGN.md` was invisible to git and to other
machines. Agents-first means the design spec must be versioned. Root
`DESIGN.md` is now the source of truth; the steering file
`.kiro/steering/design-system.md` is the short always-loaded summary.

### Decision: semantic color tokens via CSS variables, tokens-only in components
An audit found ~250 raw color utilities in `app/` + `components/`
(`border-black` 113, `bg-white` 71, `text-white` 36, `text-black` 28,
`bg-black` 21, plus `red-500`). That makes any palette change a 40-file edit.
Rule: components use semantic tokens only (`ink`, `on-ink`, `surface-*`,
`on-surface*`, `brand*`, `on-brand`, `success*`, `danger*`); values are CSS
variables in `app/globals.css` consumed by `tailwind.config.ts`. Palette swaps
and a future dark mode become CSS-variable edits.

### Decision: calm palette for long sessions (v2, interim)
Pure `#000` on `#fff` (21:1) causes glare over multi-hour sessions. v2 keeps
brutalist shape (0 radius, 2px borders, hard shadows) but uses charcoal ink,
paper surfaces, and a less saturated blue. Targets: body text ≥12:1, muted
≥4.5:1, UI borders ≥3:1. Final hexes come from the user's color schemes.


## 2026-10-22 — URL layout: landing at `/`, app at `/dashboard/*` (user-approved)

- `/` = public landing page (`app/(marketing)/`), static, no cookie reads, SEO.
- Authenticated app moves from the root to `/dashboard/*`
  (`/dashboard`, `/dashboard/subjects/...`, `/dashboard/mock/...`,
  `/dashboard/performance`). Keeps the root namespace free for public SEO
  pages (`/blog`, `/net-entry-test`, ...) without clashing with app routes.
- Signed-in visitors to `/` and to auth entry pages are redirected to `/dashboard`
  by the proxy. Post-login / OAuth / email-confirm defaults become `/dashboard`.
- Old app URLs (`/subjects/*`, `/mock/*`, `/performance`) permanently redirect
  to their `/dashboard/*` equivalents so bookmarks and shared links keep working.
- Route guard stays **deny-by-default**: an explicit public allowlist (`/`,
  `/auth/*`, metadata/static files) instead of "protect only /dashboard".
  Every new public page must be added to the allowlist on purpose.


## 2026-10-22 — Public website build (landing, merit calculator, blog, contact, academies)

- **Frontend-only, no Supabase** for these pages (user instruction). Data lives
  in typed files (`config/`, `data/`, `content/blog/`) shaped like future DB tables.
- **Rounded public-site variant** (user override): public pages use rounded-xl/2xl,
  soft tokenized shadows, 1px subtle borders allowed. Dashboard stays Soft
  Brutalism for now. See `.kiro/steering/design-system.md`.
- **Calm palette v2 applied app-wide** via the `:root` tokens in `app/globals.css`
  (user: "black + blue, slightly lighter"; no exact hexes given). Tune there.
- **`/sign-in` and `/register` are aliases, not new shells.** Working auth pages
  already exist at `/auth/login` and `/auth/sign-up`; duplicate non-functional
  shells would confuse users and create duplicate content. The aliases redirect
  (temporary 307, so we can flip canonical later) and nav links point at the real pages.
- **Merit formulas come only from the PDF** (`Pakistan Universities Merit
  Formulas and Admission Criteria Guide.pdf`), with page references; anything
  unclear goes to root `NOTES.md` for user review.
- `@esuiss/*` shadcn items come from a third-party registry listed in the
  official shadcn registry index (suiss.app/ui); installed source must be reviewed.

## 2026-10-22 — Public site Phase 1
- **Palette v2 applied app-wide**; shadcn HSL vars mirror brand tokens; global
  `--radius` left alone so the dashboard stays square. Public site rounding is
  per-class (DESIGN.md §11).
- **Material Symbols only on dashboard + auth** (`MaterialSymbolsFont` in their
  layouts, React-hoisted `<link precedence>`, same CSS order as before). Public
  pages use lucide only. A client reveal effect covers client-side navigation.
- **Marketing links to `/auth/*` don't prefetch** (`prefetchFor` in
  `components/marketing/button-link.tsx`): prefetch pulled the Supabase client
  bundle into every landing visit.
- **@esuiss/trace + code-block installed but unused**: Trace is an agent-trace
  UI and both use Tailwind v4-only classes (`in-[…]`, `ring-3`, `--spacing()`,
  `data-open:`) that our Tailwind v3 does not compile. Code Block is a candidate
  for formula display on merit pages once restyled. The CLI's overwrites of
  `components/ui/button.tsx` and `lib/utils.ts` were declined; the unused `cn`
  dep it added was removed.
- **FAQ accordion uses `forceMount`** so answers are in the static HTML
  (hidden while closed) and match the FAQPage JSON-LD.

## 2026-10-22 — Public site Phase 2 (merit pages, contact, academies)
- **FAQ = native `<details>/<summary>`** (`components/marketing/faq-list.tsx`),
  supersedes the `forceMount` accordion above: zero JS, answers in HTML, no empty
  `region` landmarks. `components/ui/accordion.tsx` deleted; the accordion
  keyframes stay because the unused @esuiss `trace.tsx` references them.
  `@radix-ui/react-accordion` is still in package.json (unused; remove later).
- **Mobile menu is lazy**: `MobileNav` is a plain button (aria-expanded /
  aria-controls); the Radix Sheet (`mobile-menu-sheet.tsx`) is loaded with
  `next/dynamic({ ssr:false })`, preloaded on hover/focus/touch, mounted on
  first click; focus is returned to the trigger by hand (no Radix Trigger).
- **`/merit-calculator/[university]` has no `dynamicParams = false`**: Next 16
  rejects that segment config with Cache Components. All 18 slugs prerender
  fully static; unknown slugs 404 via `notFound()` (verified). The build table
  shows ◐ for the route only because of the unknown-param fallback shell.
- **@esuiss Code Block NOT used for formulas**: a formula is plain text; a
  server-rendered formula card keeps it in the HTML for SEO, while Code Block
  highlights client-side with shiki (extra JS on every university page) and
  needs Tailwind v4 classes. Trace/Code Block stay installed until the user
  decides to remove them.
- **Coverage honesty**: practice/mocks copy says NUST NET + PU only;
  ECAT/MDCAT appear only as "coming soon" (`siteConfig.entryTestsComingSoon`).
  The merit calculator may claim all 18 institutions.
- **Contact form has no backend**: success state says the message was NOT sent
  and points to the contact email. Contact details are `"PLACEHOLDER"` in
  `config/site.ts` and render as visibly marked placeholders (no fake values).

## 2026-10-22 — Blog architecture
- Posts are Markdown in `content/blog/`; `lib/blog/loader.ts` is the ONLY
  import point (DB swap point). Sync file reads behind an async API keep pages
  prerendered without `"use cache"`; a future DB fetch must add `"use cache"` +
  `cacheTag("blog")`. Markdown is rendered on the server with raw HTML
  disabled and URL sanitising, so DB/admin content stays safe.
- Per-post OG images live in `app/blog/[slug]/` (outside `(marketing)`):
  metadata image routes under a route group get a hash suffix
  (`opengraph-image-<hash>`), which metadata/JSON-LD can't reference stably.
- Merit calculator: an explicitly emptied total is `total-required` (only an
  omitted total uses the PDF default). Obtained marks are shared across a
  university's routes when component key + label match; totals are per formula.


## 2026-10-23 — Public site: free-for-students, signed-in landing, palette v2.1

- **Signed-in users may browse `/`** (supersedes the 2026-10-22 bounce). Only
  auth entry pages bounce to /dashboard. The static public pages detect a
  signed-in visitor in the browser (`lib/auth/session-hint.ts`: presence of the
  `sb-<ref>-auth-token[.N]` cookie, never parsed or trusted) and swap CTAs via
  `components/marketing/auth-aware-cta.tsx`: header Sign in/Register become
  Start practice / Access dashboard; hero and CTAs go to /dashboard. Pages stay
  static (server snapshot = signed out). Real auth is still enforced by the proxy.
- **Pricing positioning**: "Free for students, by the students & teachers".
  Any future fee is capped at Rs 250 (`PRICE_CAP_PKR` in config/pricing.ts),
  only to cover technical costs. Academies contact us on WhatsApp. The
  3-month-trial messaging is removed everywhere.
- **Entry tests named in copy**: NET, PU, UET, FAST, NAT (owner: data is being
  added). `siteConfig.entryTests[].dashboardLive` marks NET + PU (footer links
  them to the dashboard).
- **Contact**: musman@taleemkasafar.com, 0330 1358202 (WhatsApp wa.me/923301358202),
  response within 24 hours (config/site.ts).
- **Palette v2.1** (app-wide, globals.css): ink lighter #2B3038, brand brighter
  #2563EB (hover #1D4ED8), brand-fixed #E1EAFF, new violet accent `iris`
  #5B4BDB / `iris-fixed` #ECEAFF. Public-site primary buttons are brand blue;
  inner pages open with a brand→iris gradient banner + logo (`page-header.tsx`).


## 2026-10-23 (b) — Public brand = sky blue #009DFF, used sparingly

- Owner: too much blue made the site look cheap and less trustworthy. Blue is
  now ONLY for the main CTA per section and key highlights; black for text and
  everything else; no blue hovers/dropdown icons/washes. The violet `iris`
  accent was removed.
- `.theme-public` (app/globals.css) scopes the public palette to the marketing
  layout + mobile menu portal: brand #009DFF (fills), brand-container #0077C8
  (blue text/links/focus/hover), brand-fixed #E5F5FF. Dashboard/auth unchanged.
- ⚠️ Accessibility trade-off, owner's call: white text on #009DFF is 2.9:1
  (WCAG AA needs 4.5:1 for button text, 3:1 for large text). Affects primary
  buttons and the hero tagline bubble. Fix if needed = change `--brand` in
  `.theme-public` to #0077C8 (4.7:1) or #0080D0 (4.2:1, large text only).
- Hero: "Making Quality [Entry-Test|NET|FAST|PU|UET|NAT] Preparation Accessible
  to Everyone." (CSS-only rotating word, full sentence in sr-only for SEO);
  tagline bubble "By Students. For Students. With Teachers."
- New "Why Taleem ka Safar" pain-points section: free/affordable for every
  student, senior guidance (labelled COMING SOON: not built yet), no ads.
- Inner-page banners: plain white "Taleemkasafar" wordmark, lighter sky blue.


## 2026-10-23 (c) — Public palette v3 + landing tweaks (supersedes the #009DFF trial)

- `.theme-public` palette: brand #296FBB (white text 5.1:1, passes AA), hover
  #1F5A9C, tint #EAF2FB; white backgrounds; solid black text (#000); charcoal
  #2B2F36 (light black) ONLY for dark banners/posters, brutalist borders and
  hard shadows; muted text #52525B.
- Hero h1: "Your [Entry Tests, | NET, | FAST, | PU, | UET, | NAT,] Finally
  Simplified." (rotating, bolder via size + subtle text-stroke since Space
  Grotesk tops out at 700). White tagline bubble with a blue dot. Check-list
  under the CTAs removed.
- "Why Taleem ka Safar" section paused (component kept at
  components/marketing/home/pain-points.tsx); its points moved into the home
  FAQ, incl. a neutral "Why us when Maqsad, Chaajao ... exist?" answer that
  makes no claims about other platforms.
- FAQ heading centered, no eyebrow. How-it-works: blue step numbers, blue
  connectors between cards, light-blue 2px borders. Pricing plan cards back to
  brutalist 2px border + hard shadow with rounded-xl corners. Final CTA banner:
  charcoal with dot pattern + rings.


## 2026-10-30 — Dashboard adopts the landing palette + rounded variant

- Owner: the dashboard's sharp corners and solid charcoal/blue blocks felt
  harsh; it should match the landing page. Supersedes "dashboard keeps Soft
  Brutalism" (2026-10-22 §11 note).
- **How**: reuse `.theme-public` on `app/dashboard/layout.tsx` instead of a
  new theme class, so landing and app can't drift. Trade-off: the landing
  palette uses pure black text on white (21:1), which the v2 calm palette
  avoided for long reading. Mitigation: light grey `surface-low` canvas
  behind white cards. If students report glare, override `--on-surface` for
  the dashboard only.
- **Shared styles** in `components/dashboard/styles.ts` (cva `appButton` +
  card/focus constants) rather than importing `marketingButton`, so the
  public site and the app can evolve separately while sharing tokens.
- Soft Brutalism now only covers auth pages.


## 2026-10-30 (b) — One calm, rounded style everywhere; light theme forced

- Owner: avoid very sharp colors and sharp corners that tire the eyes, on the
  landing page, auth and dashboard. Supersedes 2026-10-23 (c) "solid black
  text", the charcoal final-CTA banner, the blue-gradient PageHeader and the
  brutalist pricing cards. Soft Brutalism is retired from the live UI.
- Text #1F2328 (15.3:1) on an #FAFBFC page; white only for cards/inputs.
  Banners/highlight panels = light `brand-fixed` tint with dark text.
- **Dark mode off until designed**: `forcedTheme="light"` + `color-scheme:
  light`. "system" mixed shadcn dark variables with light brand tokens and
  dark native inputs, which caused the unreadable login fields.
- **Dashboard journey**: every screen gets one obvious next step, scoped to
  the active test. Resume priority: a running mock (in-progress, `expires_at`
  in the future), else the practice sitting behind the user's latest
  `attempt_answers.answered_at` if still `in_progress`. `started_at` is NOT
  used for practice: `start_attempt` reuses one row per chapter, so it is the
  first-open time. While a mock is open, "Start Mock Test" is hidden (a new
  paper would orphan the old one ungraded). Reads degrade to "nothing to
  resume". No schema change.
- Shared app styles stay in `components/dashboard/styles.ts` (now also used
  by quiz + auth) rather than moving the file while PR #3 is open.
