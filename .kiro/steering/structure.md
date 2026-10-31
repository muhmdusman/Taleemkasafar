# Project Structure

## Top-level layout
```
app/                  Next.js App Router pages & routes
  auth/               Auth flows (login, sign-up, callback, confirm, etc.)
  (marketing)/        Public website, served from the root. Static: NO
                      cookie/session/header reads (prerendered for SEO).
    layout.tsx        Skip link, SiteHeader, <main>, SiteFooter, title template
    page.tsx          Landing `/` (hero, features, how it works, merit teaser,
                      pricing, FAQ, final CTA)
    merit-calculator/ `/merit-calculator` + `[university]/` (18 static slugs)
    blog/             `/blog` + `[slug]/` (6 static posts from content/blog)
    contact/          `/contact` (form UI, no backend yet)
    academies/        `/academies` ("For Academics" in the nav)
  blog/[slug]/        Per-post opengraph-image / twitter-image ONLY (outside
                      the group so the URL has no hash suffix)
  dashboard/          Authenticated app at /dashboard/* (guarded by proxy.ts):
                      home `page.tsx`, subjects/, mock/, performance/,
                      actions.ts, quiz-actions.ts
  layout.tsx          Root layout (ThemeProvider forced light, fonts)
  globals.css         Tailwind layers + design tokens (CSS variables)
  sitemap.ts robots.ts opengraph-image.tsx twitter-image.tsx   SEO routes
components/           Shared React components
  ui/                 shadcn/ui primitives (button, card, input, sheet, ...)
  auth/               auth-ui (shared pieces), password-input, sign-in/up
                      forms, social buttons
  dashboard/          Shell (sidebar, bottom-nav, header, entry-test selector
                      + onboarding picker), home sections (next-step-card,
                      progress, subjects, mock), shared building blocks:
                      styles.ts, tone.ts, skeletons, loading-indicators,
                      link-pending
  quiz/               Practice + mock runners, use-back-guard, dialog, timer,
                      section-tabs, palette, quiz-loader (FullscreenLoader),
                      results, math-text
  marketing/          Public-site components: header/nav (site-nav,
                      nav-links, mobile-menu-sheet), footer, page-header,
                      breadcrumbs, button-link, auth-aware-cta, practice-cta,
                      container, logo-mark, faq-list, home/, merit/, blog/,
                      contact/
  seo/                json-ld.tsx (JsonLd + Organization/WebSite/FAQPage/
                      BreadcrumbList/Article builders) + test
  *.tsx (root)        forgot/update-password forms, logout-button,
                      material-symbols-font/-reveal (dashboard layout only)
config/               site.ts (brand, origin, nav, PLACEHOLDER contact),
                      pricing.ts (trial + plans, TBD prices), faq.ts
data/                 merit-formulas.ts (typed criteria from the PDF guide) + test
content/blog/         Blog posts as Markdown + frontmatter (README = schema)
hooks/                use-highlighted-code.ts (Shiki, for the unused code-block)
lib/
  supabase/           Supabase client helpers (client, server, proxy, anon)
  queries/            Data fetchers: catalog.ts (cached public reads) +
                      per-user dashboard, entry-test, mock, performance,
                      practice, profile, progress, subject;
                      dashboard-helpers (+ test)
  quiz/               Pure quiz logic: scoring, mock-plan, math, session,
                      time (+ tests)
  merit/              Merit calculator logic: types, validate, calculate,
                      display, form-state (+ tests)
  blog/               Blog loader (DB swap point), parse (validation +
                      Markdown → HTML), types, format (+ tests)
  seo/                metadata.ts (buildMetadata), og-image.tsx,
                      public-routes.ts, merit-sitemap.ts
  contact/            Contact form validation (+ tests)
  auth/               session-hint.ts (+ test)
  hooks/              use-delayed-visible, use-signed-in
  routes.ts           URL builders + public allowlist (deny-by-default),
                      isFocusRoute (+ test)
  subject-tone.ts     subjectTone(slug) (+ test)
  highlighter.tsx     Shiki highlighter (unused yet)
  utils.ts            cn() + hasEnvVars helpers
  database.types.ts   generated DB types (after schema changes)
public/blog/covers/   Blog cover SVGs (<slug>.svg, 1200x630)
docs/                 LOCAL-ONLY notes (gitignored): NOTES.md (merit review),
                      DATA_ACCESS_PATTERNS.md, ux-issues.md (a root
                      /ux-issues.md is also gitignored)
ui_design/            LOCAL-ONLY mockups (gitignored; layout reference only)
.agents/              LOCAL-ONLY verification evidence (gitignored)
mcq_csv/              LOCAL-ONLY raw MCQ CSVs (gitignored)
mcqs/                 Source MCQ data (CSV/JSON) + data-prep + import scripts. GITIGNORED.
supabase/             Local Supabase project (version-controlled DB)
  config.toml         project config
  migrations/         ordered, timestamped schema migrations (source of truth),
                      mcq_01 … mcq_15
  templates/          auth email templates (confirm-signup.html)
proxy.ts              Next.js middleware entry → session refresh + route guard
next.config.ts        cacheComponents, blog file tracing, legacy redirects
tailwind.config.ts    Tailwind theme (maps the CSS-variable tokens, incl. tone-*)
vitest.config.ts      Vitest config
components.json       shadcn/ui config
skills-lock.json      installed agent skills lockfile
.env.example          env var template (copy to .env.local)
.kiro/
  steering/           AI agent guidance (product, tech, structure, workflow,
                      data-fetching, design-system)
  skills/             installed agent skills (supabase, react, design, next)
  context/            project memory for AI agents: progress.md, decisions.md,
                      csv-cleanup-plan.md, pu-missing-subjects.md, README.md,
                      DESIGN.md (design system source of truth),
                      PROJECT_MAP.md (what lives where), local/ (gitignored)
  specs/              feature specs: mcq-platform-schema,
                      mock-test-and-practice
  settings/mcp.json   MCP server config (Supabase)
```

## Conventions for new code
- **Routes/pages**: under `app/`. Group related routes in folders.
- **Dashboard features** (practice, mock tests, analytics): build under
  `app/dashboard/<feature>/` so they inherit the dashboard shell + auth guard.
- **Public/marketing pages** (landing, blog, SEO pages): live in the
  `app/(marketing)/` route group, served from the root (`/`, `/blog`,
  `/merit-calculator`, `/contact`, `/academies`), with NO cookie/session reads so they prerender static for SEO. Every
  new public path must be added to the public allowlist in `lib/routes.ts`
  (`isPublicPath`, deny-by-default).
- **App URLs**: the authenticated app lives under `/dashboard/*` (moved from
  the root in the 2026-10-22 route restructure). Build internal links with the
  `routes.*` builders in `lib/routes.ts`, never hand-written path strings.
- **Reusable UI**: `components/`. Generic primitives → `components/ui/`.
- **Domain logic / data access**: put query helpers in `lib/` (e.g.
  `lib/queries/` for Supabase data fetchers) rather than inline in components.
- **DB types**: generated into `lib/database.types.ts`.
- **Naming**: files kebab-case (`mock-test-card.tsx`), React components
  PascalCase, DB tables/columns snake_case.

## MCQ data
- Raw datasets live in `mcqs/` (maths, physics, english) as CSV + JSON, produced
  by the python build scripts there. This folder is gitignored.
- These feed the Supabase question bank via generated import SQL loaded with
  psql (NET and PU datasets are loaded). Status: `.kiro/context/csv-cleanup-plan.md`.

## AI agent memory
- Long-lived decisions, schema notes, and "where we left off" live in
  `.kiro/context/`. Read it at the start of a task; update it as decisions are made.
