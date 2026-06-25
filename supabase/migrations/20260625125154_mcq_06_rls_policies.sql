-- Enable RLS on every public table.
alter table entry_tests          enable row level security;
alter table subjects             enable row level security;
alter table test_subjects        enable row level security;
alter table topics               enable row level security;
alter table learning_resources   enable row level security;
alter table questions            enable row level security;
alter table question_tests       enable row level security;
alter table question_options     enable row level security;
alter table mock_test_blueprints enable row level security;
alter table mock_blueprint_slots enable row level security;
alter table profiles             enable row level security;
alter table attempts             enable row level security;
alter table attempt_answers      enable row level security;
alter table mock_results         enable row level security;
alter table bookmarks            enable row level security;

-- admin check (SECURITY DEFINER to read profiles under RLS).
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

-- ============ CATALOG: authenticated read, admin write ============
create policy "auth read entry_tests" on entry_tests
  for select to authenticated using (is_active or is_admin());
create policy "admin write entry_tests" on entry_tests
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "auth read subjects" on subjects
  for select to authenticated using (true);
create policy "admin write subjects" on subjects
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "auth read test_subjects" on test_subjects
  for select to authenticated using ((deleted_at is null and is_active) or is_admin());
create policy "admin write test_subjects" on test_subjects
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "auth read topics" on topics
  for select to authenticated using (deleted_at is null or is_admin());
create policy "admin write topics" on topics
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "auth read learning_resources" on learning_resources
  for select to authenticated using (
    is_admin() or (
      deleted_at is null and moderation_status = 'approved' and exists (
        select 1 from topics t where t.id = learning_resources.topic_id and t.deleted_at is null
      )
    )
  );
create policy "admin write learning_resources" on learning_resources
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "auth read questions" on questions
  for select to authenticated using ((deleted_at is null and moderation_status = 'approved') or is_admin());
create policy "admin write questions" on questions
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "auth read question_tests" on question_tests
  for select to authenticated using (
    is_admin() or exists (
      select 1 from questions q
      where q.id = question_tests.question_id and q.deleted_at is null and q.moderation_status = 'approved'
    )
  );
create policy "admin write question_tests" on question_tests
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "auth read question_options" on question_options
  for select to authenticated using (
    is_admin() or exists (
      select 1 from questions q
      where q.id = question_options.question_id and q.deleted_at is null and q.moderation_status = 'approved'
    )
  );
create policy "admin write question_options" on question_options
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "auth read blueprints" on mock_test_blueprints
  for select to authenticated using (is_active or is_admin());
create policy "admin write blueprints" on mock_test_blueprints
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "auth read slots" on mock_blueprint_slots
  for select to authenticated using (true);
create policy "admin write slots" on mock_blueprint_slots
  for all to authenticated using (is_admin()) with check (is_admin());

-- ============ USER-OWNED: owner only ============
create policy "own profile select" on profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "own profile update" on profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "own profile insert" on profiles
  for insert to authenticated with check ((select auth.uid()) = id);

create policy "own attempts all" on attempts
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own answers all" on attempt_answers
  for all to authenticated
  using (exists (select 1 from attempts a where a.id = attempt_answers.attempt_id and a.user_id = (select auth.uid())))
  with check (exists (select 1 from attempts a where a.id = attempt_answers.attempt_id and a.user_id = (select auth.uid())));

create policy "own mock_results all" on mock_results
  for all to authenticated
  using (exists (select 1 from attempts a where a.id = mock_results.attempt_id and a.user_id = (select auth.uid())))
  with check (exists (select 1 from attempts a where a.id = mock_results.attempt_id and a.user_id = (select auth.uid())));

create policy "own bookmarks all" on bookmarks
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
