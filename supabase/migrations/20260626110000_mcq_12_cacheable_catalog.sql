-- Make the aggregate catalog views cacheable by a cookieless (anon) client.
-- These views expose ONLY non-sensitive reference data: subject/chapter names,
-- ordering, and counts. No question content, no answers, no user data.
-- They run as definer (bypass RLS) and are granted to anon so they can be read
-- without a session and cached at the edge. The underlying tables (questions,
-- etc.) remain locked to authenticated/admin.

-- subject_overview: switch to security definer (default) + grant anon read.
create or replace view public.subject_overview
with (security_invoker = false) as
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

-- chapter_overview: switch to security definer + grant anon read.
create or replace view public.chapter_overview
with (security_invoker = false) as
select
  qt_scope.entry_test_id,
  et.slug                              as entry_test_slug,
  t.subject_id                         as subject_id,
  s.slug                               as subject_slug,
  t.id                                 as chapter_id,
  t.external_id                        as chapter_external_id,
  t.slug                               as chapter_slug,
  t.title                              as chapter_title,
  t.kind                               as chapter_kind,
  t.display_order                      as display_order,
  (
    select count(*) from topics c
    where c.parent_topic_id = t.id and c.deleted_at is null
  )                                    as subtopic_count,
  (
    select count(*) from questions q
    join question_tests qt
      on qt.question_id = q.id and qt.entry_test_id = qt_scope.entry_test_id
    where q.deleted_at is null
      and q.moderation_status = 'approved'
      and (
        q.topic_id = t.id
        or q.topic_id in (
          select c.id from topics c where c.parent_topic_id = t.id
        )
      )
  )                                    as question_count
from test_subjects qt_scope
join entry_tests et on et.id = qt_scope.entry_test_id
join subjects s     on s.id = qt_scope.subject_id
join topics t       on t.subject_id = qt_scope.subject_id
where qt_scope.deleted_at is null
  and qt_scope.is_active
  and t.parent_topic_id is null
  and t.deleted_at is null;

-- Public entry-test list (active tests only) for the selector — non-sensitive.
create or replace view public.entry_test_public
with (security_invoker = false) as
select id, slug, name, description, source, display_order
from entry_tests
where is_active = true;

grant select on public.subject_overview  to anon, authenticated;
grant select on public.chapter_overview   to anon, authenticated;
grant select on public.entry_test_public  to anon, authenticated;
