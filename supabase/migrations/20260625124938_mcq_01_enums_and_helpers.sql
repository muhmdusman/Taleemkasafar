-- Enums (closed, stable sets) + shared updated_at trigger function.
create type question_usage    as enum ('past_paper', 'practice');
create type difficulty        as enum ('easy', 'medium', 'hard');
create type content_format    as enum ('plain', 'latex', 'markdown');
create type attempt_mode      as enum ('practice', 'mock');
create type attempt_status    as enum ('in_progress', 'submitted', 'abandoned');
create type moderation_status as enum ('draft', 'flagged', 'approved');
create type user_role         as enum ('student', 'admin');
create type topic_kind        as enum ('chapter', 'topic', 'subtopic');
create type resource_kind     as enum ('note', 'slides', 'video');

create or replace function set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
