-- Read-only views powering the dashboard. security_invoker=true so RLS applies
-- as the calling user (catalog tables are readable by authenticated users).

-- Per (entry_test, subject) overview: chapter count + approved question count.
create view public.subject_overview
with (security_invoker = true) as
select
  ts.entry_test_id,
  et.slug                              as entry_test_slug,
  s.id                                 as subject_id,
  s.slug                               as subject_slug,
  s.name                               as subject_name,
  ts.display_order                     as display_order,
  ts.nature_of_questions               as nature_of_questions,
  (
    select count(*) from topics t
    where t.subject_id = s.id and t.deleted_at is null
  )                                    as chapter_count,
  (
    select count(*) from questions q
    join question_tests qt
      on qt.question_id = q.id and qt.entry_test_id = ts.entry_test_id
    where q.subject_id = s.id
      and q.deleted_at is null
      and q.moderation_status = 'approved'
  )                                    as question_count
from test_subjects ts
join subjects s     on s.id = ts.subject_id
join entry_tests et on et.id = ts.entry_test_id
where ts.deleted_at is null and ts.is_active;
