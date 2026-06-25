-- entry_tests: top-level choice (NET Engineering, MDCAT, ECAT, ...).
create table entry_tests (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  slug          text not null unique,
  name          text not null,
  description   text,
  source        text,
  is_active     boolean not null default true,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index idx_entry_tests_active on entry_tests (is_active, display_order);
create trigger trg_entry_tests_updated before update on entry_tests
  for each row execute function set_updated_at();

-- subjects: canonical logical subjects (Physics, Mathematics, English).
create table subjects (
  id          uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  slug        text not null unique,
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_subjects_updated before update on subjects
  for each row execute function set_updated_at();

-- test_subjects: composition link (which subjects a test includes + per-test meta).
create table test_subjects (
  id                  uuid primary key default gen_random_uuid(),
  entry_test_id       uuid not null references entry_tests (id) on delete cascade,
  subject_id          uuid not null references subjects (id)   on delete restrict,
  nature_of_questions text,
  difficulty_profile  jsonb not null default '{}'::jsonb,
  display_order       int not null default 0,
  is_active           boolean not null default true,
  deleted_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (entry_test_id, subject_id)
);
create index idx_test_subjects_test on test_subjects (entry_test_id, display_order)
  where deleted_at is null;
create trigger trg_test_subjects_updated before update on test_subjects
  for each row execute function set_updated_at();

-- topics: self-referential syllabus tree (chapters/topics), per canonical subject.
create table topics (
  id              uuid primary key default gen_random_uuid(),
  external_id     text not null unique,
  subject_id      uuid not null references subjects (id) on delete cascade,
  parent_topic_id uuid,
  kind            topic_kind not null default 'topic',
  title           text not null,
  slug            text not null,
  display_order   int not null default 0,
  source_ref      text,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (id, subject_id),
  unique (subject_id, parent_topic_id, slug),
  constraint fk_topics_parent_subject
    foreign key (parent_topic_id, subject_id)
    references topics (id, subject_id)
    match simple on delete no action
);
create index idx_topics_subject_parent on topics (subject_id, parent_topic_id, display_order)
  where deleted_at is null;
create index idx_topics_parent on topics (parent_topic_id);
create trigger trg_topics_updated before update on topics
  for each row execute function set_updated_at();
