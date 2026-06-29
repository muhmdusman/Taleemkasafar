-- mcq_14: attempt grading boundary + mock generation + NET blueprint seed.
--
-- Adds the server-authoritative grading layer for practice/past-paper and mock
-- attempts. The correct-answer flag (question_options.is_correct) is hidden from
-- the API roles and revealed only inside SECURITY DEFINER RPCs that re-check
-- ownership. Mock papers are generated + graded entirely server-side.

-- =====================================================================
-- 1. Additive columns (safe, nullable / defaulted)
-- =====================================================================
alter table attempts        add column if not exists usage question_usage;            -- practice surface (past_paper|practice)
alter table attempt_answers add column if not exists display_order int;               -- frozen mock ordering
alter table attempt_answers add column if not exists marked_for_review boolean not null default false;

-- =====================================================================
-- 2. Hide the answer key from the API roles (column-level privilege).
--    RLS row policies remain; SECURITY DEFINER RPCs (owner = postgres) keep
--    full read of is_correct.
-- =====================================================================
revoke select on table public.question_options from anon, authenticated;
grant  select (id, question_id, option_label, content, content_format, display_order)
  on table public.question_options to anon, authenticated;

-- =====================================================================
-- 3. Grading / attempt RPCs (SECURITY DEFINER, search_path pinned,
--    ownership-checked in the body).
-- =====================================================================

-- 3a. Get-or-create an in-progress practice/past-paper attempt for a chapter.
create or replace function start_attempt(
  p_entry_test text,
  p_topic      uuid,
  p_usage      question_usage
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user    uuid := (select auth.uid());
  v_test    uuid;
  v_attempt uuid;
begin
  if v_user is null then raise exception 'forbidden'; end if;

  select id into v_test from entry_tests where slug = p_entry_test and is_active;
  if v_test is null then raise exception 'entry test not found'; end if;

  select id into v_attempt
  from attempts
  where user_id = v_user
    and entry_test_id = v_test
    and mode = 'practice'
    and topic_id is not distinct from p_topic
    and usage   is not distinct from p_usage
    and status = 'in_progress'
  order by started_at desc
  limit 1;

  if v_attempt is null then
    insert into attempts (user_id, entry_test_id, mode, topic_id, usage, status)
    values (v_user, v_test, 'practice', p_topic, p_usage, 'in_progress')
    returning id into v_attempt;
  end if;

  return v_attempt;
end;
$$;

-- 3b. Grade one practice answer and return correctness + explanation.
create or replace function submit_practice_answer(
  p_attempt uuid,
  p_question uuid,
  p_option   uuid,
  p_time_ms  int
) returns table (is_correct boolean, correct_option_id uuid, explanation text)
language plpgsql security definer set search_path = public as $$
declare
  v_user    uuid := (select auth.uid());
  v_correct boolean;
begin
  if v_user is null then raise exception 'forbidden'; end if;
  if not exists (select 1 from attempts a where a.id = p_attempt and a.user_id = v_user) then
    raise exception 'forbidden';
  end if;

  -- The selected option must belong to the question.
  select o.is_correct into v_correct
  from question_options o
  where o.id = p_option and o.question_id = p_question;
  if v_correct is null then raise exception 'invalid option for question'; end if;

  insert into attempt_answers (attempt_id, question_id, selected_option_id, is_correct, time_taken_ms)
  values (p_attempt, p_question, p_option, v_correct, p_time_ms)
  on conflict (attempt_id, question_id) do update
    set selected_option_id = excluded.selected_option_id,
        is_correct         = excluded.is_correct,
        time_taken_ms      = excluded.time_taken_ms,
        answered_at        = now();

  return query
  select
    v_correct,
    (select o.id from question_options o where o.question_id = p_question and o.is_correct limit 1),
    (select q.explanation from questions q where q.id = p_question);
end;
$$;

-- 3c. Generate + freeze a mock attempt from a blueprint (server-side selection).
create or replace function generate_mock_attempt(p_blueprint uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user     uuid := (select auth.uid());
  v_test     uuid;
  v_duration int;
  v_attempt  uuid;
  v_pos      int := 0;
  v_inserted int;
  v_slot_have int;
  v_remainder int;
  slot       record;
  d          text;
  v_need     int;
begin
  if v_user is null then raise exception 'forbidden'; end if;

  select entry_test_id, duration_seconds into v_test, v_duration
  from mock_test_blueprints where id = p_blueprint and is_active;
  if v_test is null then raise exception 'blueprint not found'; end if;

  insert into attempts (user_id, entry_test_id, mode, blueprint_id, status, expires_at)
  values (v_user, v_test, 'mock', p_blueprint, 'in_progress',
          now() + make_interval(secs => v_duration))
  returning id into v_attempt;

  for slot in
    select mbs.test_subject_id, mbs.question_count, mbs.difficulty_mix,
           mbs.display_order, ts.subject_id
    from mock_blueprint_slots mbs
    join test_subjects ts on ts.id = mbs.test_subject_id
    where mbs.blueprint_id = p_blueprint
    order by mbs.display_order
  loop
    v_slot_have := 0;

    -- Per-difficulty picks per the slot's mix.
    foreach d in array array['easy','medium','hard'] loop
      v_need := coalesce((slot.difficulty_mix ->> d)::int, 0);
      if v_need > 0 then
        insert into attempt_answers (attempt_id, question_id, display_order)
        select v_attempt, sub.id, v_pos + row_number() over ()
        from (
          select q.id
          from questions q
          join question_tests qt
            on qt.question_id = q.id and qt.entry_test_id = v_test
          where q.subject_id = slot.subject_id
            and q.deleted_at is null
            and q.moderation_status = 'approved'
            and coalesce(qt.difficulty, q.difficulty) = d::difficulty
            and not exists (
              select 1 from attempt_answers aa
              where aa.attempt_id = v_attempt and aa.question_id = q.id
            )
          order by random()
          limit v_need
        ) sub;
        get diagnostics v_inserted = row_count;
        v_pos := v_pos + v_inserted;
        v_slot_have := v_slot_have + v_inserted;
      end if;
    end loop;

    -- Shortfall fill: top up from the remaining subject pool to reach the count.
    v_remainder := slot.question_count - v_slot_have;
    if v_remainder > 0 then
      insert into attempt_answers (attempt_id, question_id, display_order)
      select v_attempt, sub.id, v_pos + row_number() over ()
      from (
        select q.id
        from questions q
        join question_tests qt
          on qt.question_id = q.id and qt.entry_test_id = v_test
        where q.subject_id = slot.subject_id
          and q.deleted_at is null
          and q.moderation_status = 'approved'
          and not exists (
            select 1 from attempt_answers aa
            where aa.attempt_id = v_attempt and aa.question_id = q.id
          )
        order by random()
        limit v_remainder
      ) sub;
      get diagnostics v_inserted = row_count;
      v_pos := v_pos + v_inserted;
    end if;
  end loop;

  return v_attempt;
end;
$$;

-- 3d. Submit + grade a mock in one transaction; idempotent.
create or replace function submit_mock(p_attempt uuid, p_answers jsonb)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then raise exception 'forbidden'; end if;
  if not exists (
    select 1 from attempts a
    where a.id = p_attempt and a.user_id = v_user and a.mode = 'mock'
  ) then
    raise exception 'forbidden';
  end if;

  -- Idempotent: if already graded, return the existing result.
  if exists (select 1 from mock_results where attempt_id = p_attempt) then
    return p_attempt;
  end if;

  -- Apply submitted selections to the frozen rows.
  update attempt_answers aa
  set selected_option_id = nullif(e.value ->> 'selected_option_id', '')::uuid,
      time_taken_ms      = nullif(e.value ->> 'time_taken_ms', '')::int
  from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) e
  where aa.attempt_id = p_attempt
    and aa.question_id = (e.value ->> 'question_id')::uuid;

  -- Grade against the real key.
  update attempt_answers aa
  set is_correct = (
    aa.selected_option_id is not null
    and exists (
      select 1 from question_options o
      where o.id = aa.selected_option_id and o.is_correct
    )
  )
  where aa.attempt_id = p_attempt;

  -- Persist the result + per-subject breakdown.
  insert into mock_results (
    attempt_id, total_questions, attempted_count, correct_count,
    incorrect_count, skipped_count, score_percent, total_time_ms, per_subject
  )
  select
    p_attempt,
    count(*),
    count(*) filter (where aa.selected_option_id is not null),
    count(*) filter (where aa.is_correct),
    count(*) filter (where aa.selected_option_id is not null and not aa.is_correct),
    count(*) filter (where aa.selected_option_id is null),
    round(100.0 * count(*) filter (where aa.is_correct) / nullif(count(*), 0), 2),
    sum(aa.time_taken_ms),
    coalesce((
      select jsonb_object_agg(s.slug, jsonb_build_object('correct', c.correct, 'total', c.total))
      from (
        select q.subject_id,
               count(*)                          as total,
               count(*) filter (where aa2.is_correct) as correct
        from attempt_answers aa2
        join questions q on q.id = aa2.question_id
        where aa2.attempt_id = p_attempt
        group by q.subject_id
      ) c
      join subjects s on s.id = c.subject_id
    ), '{}'::jsonb)
  from attempt_answers aa
  where aa.attempt_id = p_attempt;

  update attempts set status = 'submitted', submitted_at = now() where id = p_attempt;
  return p_attempt;
end;
$$;

-- 3e. Lock down EXECUTE: authenticated only.
revoke execute on function start_attempt(text, uuid, question_usage)        from anon, public;
revoke execute on function submit_practice_answer(uuid, uuid, uuid, int)    from anon, public;
revoke execute on function generate_mock_attempt(uuid)                      from anon, public;
revoke execute on function submit_mock(uuid, jsonb)                         from anon, public;
grant  execute on function start_attempt(text, uuid, question_usage)        to authenticated;
grant  execute on function submit_practice_answer(uuid, uuid, uuid, int)    to authenticated;
grant  execute on function generate_mock_attempt(uuid)                      to authenticated;
grant  execute on function submit_mock(uuid, jsonb)                         to authenticated;

-- =====================================================================
-- 4. Seed the NET full mock blueprint + per-subject slots (idempotent).
--    test_subjects resolved by slug (no hardcoded generated IDs).
-- =====================================================================
insert into mock_test_blueprints (external_id, entry_test_id, name, description, duration_seconds, total_questions, display_order)
select 'net-full-mock', et.id, 'NET Engineering Full Mock',
       'Full-length 200-question NET simulation: 100 Maths, 60 Physics, 40 English.',
       7200, 200, 0
from entry_tests et where et.slug = 'net'
on conflict (external_id) do update
  set duration_seconds = excluded.duration_seconds,
      total_questions  = excluded.total_questions,
      description      = excluded.description;

-- Slots (display_order sets section order: Maths -> Physics -> English).
insert into mock_blueprint_slots (blueprint_id, test_subject_id, question_count, past_paper_min, difficulty_mix, display_order)
select bp.id, ts.id, v.qcount, 0, v.mix, v.ord
from mock_test_blueprints bp
cross join (values
  ('maths',   100, '{"easy":15,"medium":45,"hard":40}'::jsonb, 0),
  ('physics',  60, '{"easy":9,"medium":27,"hard":24}'::jsonb,  1),
  ('english',  40, '{"easy":6,"medium":18,"hard":16}'::jsonb,  2)
) as v(subject_slug, qcount, mix, ord)
join entry_tests et on et.slug = 'net'
join subjects s on s.slug = v.subject_slug
join test_subjects ts on ts.entry_test_id = et.id and ts.subject_id = s.id
where bp.external_id = 'net-full-mock'
on conflict (blueprint_id, test_subject_id) do update
  set question_count = excluded.question_count,
      difficulty_mix = excluded.difficulty_mix,
      display_order  = excluded.display_order;
