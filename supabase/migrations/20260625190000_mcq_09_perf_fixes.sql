-- Performance advisor fixes.

-- 1. Add covering indexes for foreign keys flagged as unindexed.
create index if not exists idx_attempt_answers_selected_option
  on attempt_answers (selected_option_id);
create index if not exists idx_attempts_blueprint
  on attempts (blueprint_id);
create index if not exists idx_attempts_entry_test
  on attempts (entry_test_id);
create index if not exists idx_attempts_test_subject
  on attempts (test_subject_id);
create index if not exists idx_attempts_topic
  on attempts (topic_id);
create index if not exists idx_bookmarks_question
  on bookmarks (question_id);
create index if not exists idx_mock_blueprint_slots_test_subject
  on mock_blueprint_slots (test_subject_id);
create index if not exists idx_test_subjects_subject
  on test_subjects (subject_id);
-- composite FK (topic_id, subject_id) on questions
create index if not exists idx_questions_topic_subject
  on questions (topic_id, subject_id);
-- composite self-FK (parent_topic_id, subject_id) on topics
create index if not exists idx_topics_parent_subject
  on topics (parent_topic_id, subject_id);

-- 2. Remove multiple-permissive-policy overlap on catalog tables.
-- The "admin write ... FOR ALL" policies also matched SELECT, doubling up with
-- the "auth read ..." policies. Re-scope admin writes to INSERT/UPDATE/DELETE so
-- only ONE policy evaluates per SELECT. (Admin SELECT is already covered by the
-- read policies, which include `or is_admin()` where relevant.)

-- entry_tests
drop policy "admin write entry_tests" on entry_tests;
create policy "admin insert entry_tests" on entry_tests for insert to authenticated with check (is_admin());
create policy "admin update entry_tests" on entry_tests for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin delete entry_tests" on entry_tests for delete to authenticated using (is_admin());

-- subjects
drop policy "admin write subjects" on subjects;
create policy "admin insert subjects" on subjects for insert to authenticated with check (is_admin());
create policy "admin update subjects" on subjects for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin delete subjects" on subjects for delete to authenticated using (is_admin());

-- test_subjects
drop policy "admin write test_subjects" on test_subjects;
create policy "admin insert test_subjects" on test_subjects for insert to authenticated with check (is_admin());
create policy "admin update test_subjects" on test_subjects for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin delete test_subjects" on test_subjects for delete to authenticated using (is_admin());

-- topics
drop policy "admin write topics" on topics;
create policy "admin insert topics" on topics for insert to authenticated with check (is_admin());
create policy "admin update topics" on topics for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin delete topics" on topics for delete to authenticated using (is_admin());

-- learning_resources
drop policy "admin write learning_resources" on learning_resources;
create policy "admin insert learning_resources" on learning_resources for insert to authenticated with check (is_admin());
create policy "admin update learning_resources" on learning_resources for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin delete learning_resources" on learning_resources for delete to authenticated using (is_admin());

-- questions
drop policy "admin write questions" on questions;
create policy "admin insert questions" on questions for insert to authenticated with check (is_admin());
create policy "admin update questions" on questions for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin delete questions" on questions for delete to authenticated using (is_admin());

-- question_tests
drop policy "admin write question_tests" on question_tests;
create policy "admin insert question_tests" on question_tests for insert to authenticated with check (is_admin());
create policy "admin update question_tests" on question_tests for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin delete question_tests" on question_tests for delete to authenticated using (is_admin());

-- question_options
drop policy "admin write question_options" on question_options;
create policy "admin insert question_options" on question_options for insert to authenticated with check (is_admin());
create policy "admin update question_options" on question_options for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin delete question_options" on question_options for delete to authenticated using (is_admin());

-- mock_test_blueprints
drop policy "admin write blueprints" on mock_test_blueprints;
create policy "admin insert blueprints" on mock_test_blueprints for insert to authenticated with check (is_admin());
create policy "admin update blueprints" on mock_test_blueprints for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin delete blueprints" on mock_test_blueprints for delete to authenticated using (is_admin());

-- mock_blueprint_slots
drop policy "admin write slots" on mock_blueprint_slots;
create policy "admin insert slots" on mock_blueprint_slots for insert to authenticated with check (is_admin());
create policy "admin update slots" on mock_blueprint_slots for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin delete slots" on mock_blueprint_slots for delete to authenticated using (is_admin());
