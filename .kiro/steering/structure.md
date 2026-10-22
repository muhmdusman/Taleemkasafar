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
  layout.tsx          Root layout (ThemeProvider, fonts)
  globals.css         Tailwind layers + design tokens (CSS variables)
  sitemap.ts robots.ts opengraph-image.tsx twitter-image.tsx   SEO routes
components/           Shared React components
  ui/                 shadcn/ui primitives (button, card, input, sheet, ...)
  auth/               Sign-in/up forms, social buttons
  dashboard/          Dashboard shell + home sections (sidebar, header, nav)
  quiz/               Practice + mock runners, timer, palette, results
  marketing/          Public-site components (rounded variant): header/nav,
                      footer, page-header, breadcrumbs, button-link, faq-list,
                      home/, merit/, blog/, contact/
  seo/                json-ld.tsx (JsonLd + Organization/WebSite/FAQPage/
                      BreadcrumbList/Article builders)
config/               site.ts (brand, origin, nav, PLACEHOLDER contact),
                      pricing.ts (trial + plans, TBD prices), faq.ts
data/                 merit-formulas.ts (typed criteria from the PDF guide)
content/blog/         Blog posts as Markdown + frontmatter (README = schema)
lib/
  supabase/           Supabase client helpers (client, server, proxy, anon)
  queries/            Data fetchers (catalog.ts = cached public reads)
  quiz/               Pure quiz logic (scoring, mock-plan, math) + tests
  merit/              Merit calculator logic: types, validate, calculate,
                      display, form-state (+ tests)
  blog/               Blog loader (DB swap point), parse (validation +
                      Markdown → HTML), types, format (+ tests)
  seo/                metadata.ts (buildMetadata), og-image.tsx,
                      public-routes.ts, merit-sitemap.ts
  contact/            Contact form validation (+ tests)
  routes.ts           URL builders + public allowlist (deny-by-default)
  utils.ts            cn() + hasEnvVars helpers
  database.types.ts   generated DB types (after schema changes)
public/blog/covers/   Blog cover SVGs (<slug>.svg, 1200x630)
DESIGN.md             Design system source of truth (palette, tokens)
NOTES.md              Merit PDF inconsistencies for owner review
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
  `app/dashboard/<feature>/` so they inherit the dashboard shell + auth guard.
- **Public/marketing pages** (landing, blog, SEO pages): live in the
  `app/(marketing)/` route group, served from the root (`/`, later `/blog`,
  etc.), with NO cookie/session reads so they prerender static for SEO. Every
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
- These feed the Supabase question bank via a seeding/import step (to be built).

## AI agent memory
- Long-lived decisions, schema notes, and "where we left off" live in
  `.kiro/context/`. Read it at the start of a task; update it as decisions are made.
