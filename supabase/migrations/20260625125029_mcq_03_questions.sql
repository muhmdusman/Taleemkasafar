-- questions: the MCQ content, stored once, referencing canonical subject/topic.
create table questions (
  id                 uuid primary key default gen_random_uuid(),
  external_id        text not null unique,
  subject_id         uuid not null references subjects (id) on delete restrict,
  topic_id           uuid,
  difficulty         difficulty not null default 'medium',
  statement          text not null,
  statement_format   content_format not null default 'plain',
  explanation        text,
  explanation_format content_format not null default 'plain',
  source             text,
  moderation_status  moderation_status not null default 'approved',
  review_note        text,
  image_path         text,
  deleted_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint fk_questions_topic_subject
    foreign key (topic_id, subject_id)
    references topics (id, subject_id)
    match simple on delete no action
);
create index idx_questions_subject on questions (subject_id)
  where deleted_at is null and moderation_status = 'approved';
create index idx_questions_topic on questions (topic_id)
  where deleted_at is null and moderation_status = 'approved';
create index idx_questions_subject_difficulty on questions (subject_id, difficulty)
  where deleted_at is null and moderation_status = 'approved';
create index idx_questions_moderation on questions (moderation_status)
  where moderation_status <> 'approved';
create trigger trg_questions_updated before update on questions
  for each row execute function set_updated_at();

-- question_tests: per-test usage (past_paper/practice) + optional overrides.
create table question_tests (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references questions (id)   on delete cascade,
  entry_test_id uuid not null references entry_tests (id) on delete cascade,
  usage_type    question_usage not null,
  difficulty    difficulty,
  source_year   int,
  paper_session text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (question_id, entry_test_id)
);
create index idx_question_tests_test_usage on question_tests (entry_test_id, usage_type);
create index idx_question_tests_question on question_tests (question_id);
create trigger trg_question_tests_updated before update on question_tests
  for each row execute function set_updated_at();

-- question_options: one row per option (a/b/c/d).
create table question_options (
  id             uuid primary key default gen_random_uuid(),
  question_id    uuid not null references questions (id) on delete cascade,
  option_label   text not null,
  content        text not null,
  content_format content_format not null default 'plain',
  is_correct     boolean not null default false,
  display_order  int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (question_id, option_label)
);
create index idx_question_options_question on question_options (question_id);
create unique index uq_one_correct_option on question_options (question_id)
  where is_correct = true;
create trigger trg_question_options_updated before update on question_options
  for each row execute function set_updated_at();

-- learning_resources: future (notes/slides/videos) attached to a syllabus node.
create table learning_resources (
  id                uuid primary key default gen_random_uuid(),
  topic_id          uuid not null references topics (id) on delete cascade,
  resource_kind     resource_kind not null,
  title             text not null,
  url               text,
  storage_path      text,
  display_order     int not null default 0,
  moderation_status moderation_status not null default 'draft',
  deleted_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index idx_learning_resources_topic on learning_resources (topic_id, display_order)
  where deleted_at is null;
create trigger trg_learning_resources_updated before update on learning_resources
  for each row execute function set_updated_at();
