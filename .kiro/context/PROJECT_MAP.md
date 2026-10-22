# Project Map — Taleem ka Safar

A quick "what lives where" guide. For each file: what it is and what it does.
(For deeper guidance see `.kiro/steering/` and project memory in `.kiro/context/`.)

---

## App routes (`app/`)
Next.js App Router. Server Components by default; business logic on the server.

| File | What it does |
|------|--------------|
| `app/layout.tsx` | Root layout. Loads fonts (Space Grotesk, Inter via next/font), ThemeProvider, global metadata/title. Material Symbols is loaded only by the dashboard + auth layouts. |
| `app/(marketing)/layout.tsx` | Public website shell: skip link, `SiteHeader`, `<main id="main">`, `SiteFooter`, title template `%s \| Taleem ka Safar`. Static: no cookie/session reads. |
| `app/(marketing)/page.tsx` | **Public landing `/`**: hero, features, how it works, merit teaser, pricing, FAQ, final CTA + Organization/WebSite JSON-LD. Static (○). Signed-in visitors are bounced to `/dashboard` by the proxy. |
| `app/(marketing)/merit-calculator/page.tsx` | `/merit-calculator`: one card per university (weights, entry test, link), how-merit-works explainer, disclaimer, BreadcrumbList. Static (○). |
| `app/(marketing)/merit-calculator/[university]/page.tsx` | `/merit-calculator/<slug>`: 18 slugs prerendered via `generateStaticParams` (unknown slugs `notFound()`; `dynamicParams` is not allowed with Cache Components). Calculator island + server-rendered formula card(s) + admission criteria. |
| `app/(marketing)/contact/page.tsx` | `/contact`: contact info cards (PLACEHOLDER values from `config/site.ts`) + contact form UI (no backend). Static (○). |
| `app/(marketing)/academies/page.tsx` | `/academies` ("For Academics"): benefits (Available now / Coming soon), 3 steps, academy plan from `config/pricing.ts`, FAQ (+ FAQPage JSON-LD), CTA. Static (○). |
| `app/(marketing)/blog/page.tsx` | `/blog`: posts grouped by category (anchor-link category nav, no client JS), rounded post cards, BreadcrumbList. Static (○). |
| `app/(marketing)/blog/[slug]/page.tsx` | `/blog/<slug>`: 6 posts prerendered via `generateStaticParams` (unknown slugs `notFound()`). Article layout (`.article-body` styles in `globals.css`), related posts, trial CTA, Article + BreadcrumbList JSON-LD, OG type `article`. |
| `app/blog/[slug]/opengraph-image.tsx` / `twitter-image.tsx` | Per-post PNG social cards (title + category). Outside the `(marketing)` group on purpose: inside a route group Next adds a hash suffix to the URL; here it's a stable `/blog/<slug>/opengraph-image`. Unknown slugs `notFound()` (404). |
| `app/sitemap.ts` / `app/robots.ts` | `/sitemap.xml` (static routes from `lib/seo/public-routes.ts` + `getMeritSitemapEntries()` + `getBlogSitemapEntries()` = 29 URLs) and `/robots.txt` (disallow `/dashboard`, `/auth`). |
| `app/opengraph-image.tsx` / `app/twitter-image.tsx` | Branded default social images (render via `lib/seo/og-image.tsx`). |
| `app/dashboard/layout.tsx` | Authenticated app shell (sidebar + bottom nav) for everything under `/dashboard/*`. |
| `app/dashboard/page.tsx` | Dashboard home `/dashboard`. |
| `app/dashboard/subjects/...` | `/dashboard/subjects`, `/dashboard/subjects/[slug]`, `.../[slug]/[chapter]/practice` + `/past-paper` (focused layouts, no sidebar). |
| `app/dashboard/mock/...` | `/dashboard/mock`, `/dashboard/mock/[attemptId]`, `/dashboard/mock/[attemptId]/result`. |
| `app/dashboard/performance/page.tsx` | `/dashboard/performance` analytics. |
| `app/dashboard/actions.ts` | Server Actions: `selectEntryTest`, `revalidateCatalog`. |
| `app/dashboard/quiz-actions.ts` | Server Actions wrapping the practice/mock grading RPCs. |
| `app/globals.css` | Tailwind layers + CSS variables. |
| `app/auth/layout.tsx` | Shared shell for all auth screens: branded "Taleem ka Safar" header + footer (Soft Brutalism). |
| `app/auth/actions.ts` | **Server Actions** for auth: `signInAction` (→ `/dashboard`) and `signUpAction` (→ sign-up-success). All auth business logic lives here. |
| `app/auth/login/page.tsx` | Sign-in page (renders `SignInForm`). |
| `app/auth/sign-up/page.tsx` | Sign-up page (renders `SignUpForm`). |
| `app/auth/sign-up-success/page.tsx` | "Check your email" confirmation screen. |
| `app/auth/forgot-password/page.tsx` | Forgot-password page (renders `ForgotPasswordForm`). |
| `app/auth/update-password/page.tsx` | Update-password page (renders `UpdatePasswordForm`). |
| `app/auth/error/page.tsx` | Generic auth error display. |
| `app/auth/callback/route.ts` | **OAuth (Google) callback** — exchanges the PKCE code for a session, then redirects to a sanitised `next` (defaults to `/dashboard`). |
| `app/auth/confirm/route.ts` | **Email confirmation** — verifies the email OTP token, then redirects to a sanitised `next` (defaults to `/dashboard`). |

Legacy root URLs (`/subjects/*`, `/mock/*`, `/performance`) 308 to their
`/dashboard/*` equivalents via `redirects()` in `next.config.ts`.

## Components (`components/`)
Client Components only where interactivity is needed; otherwise presentational.

| File | What it does |
|------|--------------|
| `components/auth/sign-in-form.tsx` | Sign-in form UI (email/password). Calls `signInAction`. Soft Brutalism styling. |
| `components/auth/sign-up-form.tsx` | Sign-up form UI (name/email/password/terms) + branded side panel. Calls `signUpAction`. |
| `components/auth/social-buttons.tsx` | Google (wired) + GitHub (disabled, "coming soon") sign-in buttons. |
| `components/forgot-password-form.tsx` | Sends a password-reset email. |
| `components/update-password-form.tsx` | Sets a new password, then redirects to `/dashboard`. |
| `components/logout-button.tsx` | Signs out and returns to `/auth/login`. |
| `components/ui/button.tsx` | shadcn Button primitive. |
| `components/ui/card.tsx` | shadcn Card primitives. |
| `components/ui/input.tsx` | shadcn Input primitive. |
| `components/ui/label.tsx` | shadcn Label primitive. |

| `components/marketing/` | Public-site components (rounded variant, DESIGN.md §11): `site-header`, `site-nav` (client: active links + tiny mobile-menu trigger), `mobile-menu-sheet` (lazy-loaded Sheet, `next/dynamic` on first open), `faq-list` (native `<details>`, zero JS), `breadcrumbs` (visible trail + BreadcrumbList JSON-LD), `page-header` (inner-page crumbs + h1 + intro), `placeholder-value`, `nav-links`, `site-footer`, `button-link` (`ButtonLink`, `marketingButton`), `container` (`Container`, `SectionHeading`), `logo-mark`. |
| `components/marketing/home/` | Home sections: `hero`, `features`, `how-it-works`, `merit-teaser`, `pricing`, `faq`, `final-cta`. |
| `components/marketing/merit/` | `university-card`, `weight-chips`, `formula-card` (server, formula in HTML), `merit-disclaimer`, `merit-calculator-form` (client: route picker, fieldsets, inline errors, aria-live result + breakdown). |
| `components/marketing/blog/` | `post-card` (server: cover via next/image, category badge, title link with whole-card overlay, date, reading time, tags), `post-meta` (`CategoryBadge`). |
| `components/marketing/contact/contact-form.tsx` | Client contact form: inline errors, focus first invalid, honeypot, honest "not sent yet" success state, `TODO(backend)` for the server action. |
| `components/seo/json-ld.tsx` | `<JsonLd>` (escapes `<`) + Organization / WebSite / FAQPage / BreadcrumbList / Article helpers. |
| `components/material-symbols-font.tsx` | Material Symbols `<link>`s + reveal script, rendered by dashboard + auth layouts only. |
| `components/ui/sheet.tsx` | shadcn Sheet (mobile menu); close button 44x44px with brand focus ring. (`accordion.tsx` removed: FAQ uses `<details>`.) |
| `components/ui/trace.tsx`, `code-block.tsx`, `collapsible.tsx` | @esuiss registry components (installed, unused: Tailwind v4 classes; Code Block rejected for formulas, see decisions.md). |

## Config (`config/`)
| File | What it does |
|------|--------------|
| `config/site.ts` | Brand name, description, canonical `url` (`NEXT_PUBLIC_SITE_URL` or taleemkasafar.com), locale, nav, auth CTAs, live vs coming-soon entry tests, PLACEHOLDER `contact` details + `isPlaceholder()`, `absoluteUrl()`. |
| `config/pricing.ts` | **Pricing config**: 3-month trial offer + PLACEHOLDER plans, post-trial prices "TBD". |
| `config/faq.ts` | `homeFaq` + `academiesFaq` (each feeds its visible `<details>` list and FAQPage JSON-LD). |

## Library (`lib/`)
| File | What it does |
|------|--------------|
| `lib/supabase/client.ts` | Browser Supabase client (typed with `Database`). For Client Components. |
| `lib/supabase/server.ts` | Server Supabase client (typed, cookie-based). For Server Components / Actions / route handlers. Create a new one per request. |
| `lib/supabase/proxy.ts` | `updateSession()` — refreshes the auth session and **guards routes** (deny-by-default): only the public allowlist in `lib/routes.ts` is reachable signed out; signed-in users on `/` or auth entry pages go to `/dashboard`. |
| `lib/routes.ts` | Central URL builders (`routes.dashboard`, `routes.subject(slug)`, `routes.mockResult(id)`, ...) + pure guard helpers (`isPublicPath`, `shouldBounceSignedIn`, `safeNextPath`, `isNavActive`). Tested in `lib/routes.test.ts`. Add every new public page to its allowlist. |
| `lib/seo/metadata.ts` | `buildMetadata()` — per-page title, description, canonical, Open Graph, Twitter card. |
| `lib/seo/public-routes.ts` | Static public routes for the sitemap (dynamic sections spread their own `get…SitemapEntries()`). |
| `lib/seo/merit-sitemap.ts` | `getMeritSitemapEntries()`: one sitemap URL per university. |
| `lib/merit/display.ts` | Pure display helpers: weight chips/summary, entry test names, `p. 3, 5` source refs, university meta description, `admissionYearNotice()` (from `applicableYear` / year flags). Tested. |
| `lib/contact/validate.ts` | Pure contact validation (name/email/PK phone/topic/message, honeypot, first-invalid helper). Tested in `validate.test.ts`. |
| `lib/seo/og-image.tsx` | Shared `ImageResponse` renderers: default OG/Twitter image + `renderArticleOgImage()` for blog posts. |
| `lib/blog/loader.ts` | **Blog loader = DB swap point.** `getAllPosts`, `getPostBySlug`, `getAllPostSlugs`, `getPostsByCategory`, `getRelatedPosts`, `getBlogSitemapEntries`. Reads `content/blog/*.md` synchronously (keeps pages prerendered); async API so a DB fetch drops in. Fails on a missing cover file under `public/`. Tested in `loader.test.ts` (incl. every internal post link resolves). |
| `lib/blog/parse.ts` | YAML-only frontmatter (gray-matter's JS engine overridden, `---<lang>` fences rejected), quoted ISO dates only, strict frontmatter validation, no-H1 rule, reading time, Markdown → HTML (unified + remark-gfm + rehype-slug; raw HTML dropped, unsafe URLs stripped, tables wrapped in a focusable scroll region). |
| `lib/blog/types.ts` / `format.ts` | `BlogPost` / `BlogPostMeta` (shaped like a `blog_posts` row), `BLOG_CATEGORIES`, `BlogContentError`; date + reading-time formatting. |
| `lib/merit/form-state.ts` | Pure calculator form state: obtained marks shared across routes (key + label), totals per formula, emptied total → `total-required`. Tested. |
| `lib/highlighter.tsx` | Shiki highlighter used by `code-block` (@esuiss; unused yet). |
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

## Blog content (`content/blog/`)
One Markdown file per post (`<slug>.md`, YAML frontmatter: title, slug,
description, date, author, tags, coverImage, category). Covers live in
`public/blog/covers/<slug>.svg`. Schema, categories and how to add a post:
`content/blog/README.md`. Loaded only through `lib/blog/loader.ts`.
