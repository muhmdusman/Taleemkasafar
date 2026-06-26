-- Per-chapter overview: each top-level topic node (a "chapter") of a subject,
-- with its subtopic count and approved-question count for a given entry test.
-- security_invoker so RLS applies as the caller.
create view public.chapter_overview
with (security_invoker = true) as
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
