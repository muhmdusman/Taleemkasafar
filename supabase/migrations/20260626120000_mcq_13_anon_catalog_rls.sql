-- Replace the security-definer catalog views (flagged by the advisor) with the
-- proper approach: keep views as security_invoker (RLS-respecting) and grant the
-- `anon` role read access to the NON-SENSITIVE reference tables via explicit RLS
-- policies. This lets the cookieless/cached layer read catalog metadata without
-- bypassing RLS. Question content + user data remain locked down.

-- 1. Revert the three views to security_invoker.
alter view public.subject_overview  set (security_invoker = true);
alter view public.chapter_overview   set (security_invoker = true);
alter view public.entry_test_public  set (security_invoker = true);

-- 2. Anon read policies on reference tables the catalog views read from.
--    (authenticated already has read policies from mcq_06.)

-- entry_tests: anon may read active tests.
create policy "anon read active entry_tests" on entry_tests
  for select to anon using (is_active);

-- subjects: anon may read all (just names/slugs).
create policy "anon read subjects" on subjects
  for select to anon using (true);

-- test_subjects: anon may read active, non-deleted links.
create policy "anon read test_subjects" on test_subjects
  for select to anon using (deleted_at is null and is_active);

-- topics: anon may read non-deleted syllabus nodes.
create policy "anon read topics" on topics
  for select to anon using (deleted_at is null);

-- questions: anon may read ONLY live + approved rows (needed for counts).
-- No question content is selected by the views, but counts require row access.
create policy "anon read approved questions" on questions
  for select to anon using (deleted_at is null and moderation_status = 'approved');

-- question_tests: anon may read rows whose parent question is live + approved.
create policy "anon read question_tests" on question_tests
  for select to anon using (
    exists (
      select 1 from questions q
      where q.id = question_tests.question_id
        and q.deleted_at is null
        and q.moderation_status = 'approved'
    )
  );
