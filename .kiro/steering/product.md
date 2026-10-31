# Product — Taleem ka Safar

## What this is
An entry-test preparation platform (web dashboard) for students preparing for
admission/entry tests. The focus is subject-wise MCQ practice with analytics and
mock tests.

## Core features (vision)
- **Auth**: Email/password sign-up + login, and Google OAuth sign-in.
- **Subject-wise MCQs**: Maths, Physics, English (more later), organized by
  chapter/topic. Source data lives in `mcqs/` as CSV/JSON.
- **Practice mode**: Attempt MCQs by subject/chapter, instant feedback,
  explanations.
- **Mock tests**: Timed, multi-subject test simulations that mirror real entry
  tests.
- **Analytics dashboard**: Per-user performance — accuracy by subject/chapter,
  time spent, progress over time, weak areas.
- **Dashboard shell**: Authenticated area with navigation across the above.

## Target users
Students (test takers). Later possibly teachers/admins who curate question banks.

## Current stage (2026-10-31)
- **Dashboard** (`/dashboard/*`): auth (email + Google), NET + 8 PU entry
  tests, practice/past-paper, mock tests (full-screen sitting with
  pause/resume), performance analytics. Header test switcher, onboarding test
  picker, progress-first home, soft per-subject tones.
- **Public site** (same Next.js project, served from the root): landing `/`,
  merit calculator (18 universities), blog (6 posts), contact (UI only, no
  backend), academies.
- **Hosting**: canonical origin in code is `taleemkasafar.com`
  (`config/site.ts`). Whether production has moved off
  `entrytest.taleemkasafar.com` (with a 301) is NOT confirmed in the repo;
  check with the owner before relying on it.

## Roadmap (in order)
1. ~~Calm palette~~ — done (soft rounded style, see `.kiro/context/DESIGN.md`).
2. ~~Landing page~~ — done. Still open: move the app from
   `entrytest.taleemkasafar.com` to the apex `taleemkasafar.com` (301 old host).
3. **Dashboard UI/UX fixes** (user-reported, iterative). First rounds shipped
   in PRs #3–#5.
4. **Remaining basic features** (practice reset, PU mock blueprints, profile,
   contact form backend, Terms/Privacy pages, etc.).
5. **Content SEO + growth** — blog v1 is live; more posts and growth features next.

## Goals & constraints
- **First milestone: 500 users.** Stay on Supabase free tier until it's
  outgrown, then migrate to AWS properly (keep schema portable — see workflow.md).
- **SEO is a first-class requirement** on every public page: metadata API,
  canonical URLs on `taleemkasafar.com`, sitemap/robots, structured data,
  fast static rendering. Public pages must not depend on cookies.
- **Agents-first development**: every change keeps steering, `.kiro/context/DESIGN.md`, and
  `.kiro/context/` memory current so any agent session can pick up cheaply.
- Keep the brand personality (Space Grotesk headlines, blue main actions) in
  the calm, rounded style of `.kiro/context/DESIGN.md`. Soft Brutalism (sharp
  corners, hard shadows) is retired from the live UI (2026-10-30).

## Naming
- Product name: "Taleem ka Safar" (Urdu: "the journey of education").
- Supabase project: `Taleemkasafar` (ref `lcsuasddoertvoujwsgo`, region ap-south-1).
