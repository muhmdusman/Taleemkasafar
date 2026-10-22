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

## Current stage (2026-10-22)
Dashboard MVP is live at `entrytest.taleemkasafar.com`: auth (email + Google),
NET + 8 PU entry tests, practice/past-paper, mock tests, performance analytics.

## Roadmap (in order)
1. **Calm palette** — soften colors for long sessions (see `.kiro/context/DESIGN.md`).
2. **Landing page** in this same Next.js project; move the app from
   `entrytest.taleemkasafar.com` to the apex `taleemkasafar.com` (301 old host).
3. **Dashboard UI/UX fixes** (user-reported, iterative).
4. **Remaining basic features** (practice reset, PU mock blueprints, profile, etc.).
5. **Blog + content SEO**, then other growth features.

## Goals & constraints
- **First milestone: 500 users.** Stay on Supabase free tier until it's
  outgrown, then migrate to AWS properly (keep schema portable — see workflow.md).
- **SEO is a first-class requirement** on every public page: metadata API,
  canonical URLs on `taleemkasafar.com`, sitemap/robots, structured data,
  fast static rendering. Public pages must not depend on cookies.
- **Agents-first development**: every change keeps steering, `.kiro/context/DESIGN.md`, and
  `.kiro/context/` memory current so any agent session can pick up cheaply.
- Keep the Soft Brutalism brand; reduce visual harshness, not personality.

## Naming
- Product name: "Taleem ka Safar" (Urdu: "the journey of education").
- Supabase project: `Taleemkasafar` (ref `lcsuasddoertvoujwsgo`, region ap-south-1).
