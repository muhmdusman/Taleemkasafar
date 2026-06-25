-- profiles: extends auth.users with app data.
create table profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  display_name     text,
  selected_test_id uuid references entry_tests (id) on delete set null,
  role             user_role not null default 'student',
  avatar_url       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index idx_profiles_selected_test on profiles (selected_test_id);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- auto-create a profile row when a new auth user is created.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- attempts: one session in practice or mock mode.
create table attempts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles (id) on delete cascade,
  entry_test_id   uuid not null references entry_tests (id) on delete restrict,
  mode            attempt_mode not null,
  status          attempt_status not null default 'in_progress',
  blueprint_id    uuid references mock_test_blueprints (id) on delete set null,
  test_subject_id uuid references test_subjects (id) on delete set null,
  topic_id        uuid references topics (id) on delete set null,
  started_at      timestamptz not null default now(),
  expires_at      timestamptz,
  submitted_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint chk_mock_blueprint check (
    (mode = 'mock'     and blueprint_id is not null) or
    (mode = 'practice' and blueprint_id is null)
  )
);
create index idx_attempts_user_test on attempts (user_id, entry_test_id, started_at desc);
create index idx_attempts_user_mode on attempts (user_id, mode, status);
create trigger trg_attempts_updated before update on attempts
  for each row execute function set_updated_at();

-- attempt_answers: one row per answered question (analytics backbone).
create table attempt_answers (
  id                 uuid primary key default gen_random_uuid(),
  attempt_id         uuid not null references attempts (id) on delete cascade,
  question_id        uuid not null references questions (id) on delete restrict,
  selected_option_id uuid references question_options (id) on delete set null,
  is_correct         boolean,
  time_taken_ms      int,
  answered_at        timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  unique (attempt_id, question_id)
);
create index idx_answers_attempt on attempt_answers (attempt_id);
create index idx_answers_question on attempt_answers (question_id);
create index idx_answers_correct on attempt_answers (attempt_id, is_correct);

-- mock_results: 1:1 with a submitted mock attempt.
create table mock_results (
  id              uuid primary key default gen_random_uuid(),
  attempt_id      uuid not null unique references attempts (id) on delete cascade,
  total_questions int not null,
  attempted_count int not null,
  correct_count   int not null,
  incorrect_count int not null,
  skipped_count   int not null,
  score_percent   numeric(5,2) not null,
  total_time_ms   int,
  per_subject     jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  constraint chk_score_range check (score_percent >= 0 and score_percent <= 100)
);
create index idx_mock_results_attempt on mock_results (attempt_id);

-- bookmarks: explicit user-saved questions.
create table bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  question_id uuid not null references questions (id) on delete cascade,
  note        text,
  created_at  timestamptz not null default now(),
  unique (user_id, question_id)
);
create index idx_bookmarks_user on bookmarks (user_id, created_at desc);
