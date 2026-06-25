-- mock_test_blueprints: a reusable timed-mock definition for an entry test.
create table mock_test_blueprints (
  id               uuid primary key default gen_random_uuid(),
  external_id      text unique,
  entry_test_id    uuid not null references entry_tests (id) on delete cascade,
  name             text not null,
  description      text,
  duration_seconds int not null,
  total_questions  int not null,
  is_active        boolean not null default true,
  display_order    int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint chk_blueprint_duration check (duration_seconds > 0),
  constraint chk_blueprint_total    check (total_questions > 0)
);
create index idx_blueprints_test on mock_test_blueprints (entry_test_id, is_active, display_order);
create trigger trg_blueprints_updated before update on mock_test_blueprints
  for each row execute function set_updated_at();

-- mock_blueprint_slots: per-subject composition of a blueprint.
create table mock_blueprint_slots (
  id              uuid primary key default gen_random_uuid(),
  blueprint_id    uuid not null references mock_test_blueprints (id) on delete cascade,
  test_subject_id uuid not null references test_subjects (id) on delete restrict,
  question_count  int not null,
  past_paper_min  int not null default 0,
  practice_max    int,
  difficulty_mix  jsonb not null default '{}'::jsonb,
  display_order   int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (blueprint_id, test_subject_id),
  constraint chk_slot_count check (question_count > 0),
  constraint chk_slot_pp    check (past_paper_min >= 0 and past_paper_min <= question_count)
);
create index idx_slots_blueprint on mock_blueprint_slots (blueprint_id, display_order);
create trigger trg_slots_updated before update on mock_blueprint_slots
  for each row execute function set_updated_at();
