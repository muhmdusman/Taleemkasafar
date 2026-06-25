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

## Current stage
Project setup phase. Auth + project scaffolding first, then schema for the
question bank, then practice/analytics features.

## Naming
- Product name: "Taleem ka Safar" (Urdu: "the journey of education").
- Supabase project: `Taleemkasafar` (ref `lcsuasddoertvoujwsgo`, region ap-south-1).
