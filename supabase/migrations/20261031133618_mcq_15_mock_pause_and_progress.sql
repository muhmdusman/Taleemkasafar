-- mcq_15: pause / resume for timed mocks + per-subject practice progress.
--
-- Additive and idempotent. Apply BEFORE deploying the app version that calls
-- these functions. The app degrades without them: "Pause" reports that it is
-- unavailable (the timer keeps running) and subject cards hide their progress
-- bars, but nothing else breaks.
--
-- Note: the mock timer was already display-only on the server (submit_mock
-- does not check expires_at), so pausing does not weaken any enforcement.

-- =====================================================================
-- 1. Pause state (null = not paused). While paused, the remaining time is
--    expires_at - paused_at; resuming shifts expires_at by the pause length.
-- =====================================================================
alter table attempts add column if not exists paused_at timestamptz;

-- =====================================================================
-- 2. Pause a running mock. Idempotent: pausing a paused mock keeps the
--    original pause time. Raises if the mock is finished or already expired.
-- =====================================================================
create or replace function pause_mock(p_attempt uuid)
returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  v_user   uuid := (select auth.uid());
  v_paused timestamptz;
begin
  if v_user is null then raise exception 'forbidden'; end if;

  update attempts a
     set paused_at = coalesce(a.paused_at, now())
   where a.id = p_attempt
     and a.user_id = v_user
     and a.mode = 'mock'
     and a.status = 'in_progress'
     and (a.paused_at is not null or a.expires_at is null or a.expires_at > now())
  returning a.paused_at into v_paused;

  if v_paused is null then raise exception 'mock not pausable'; end if;
  return v_paused;
end;
$$;

-- =====================================================================
-- 3. Resume (if paused) and return the authoritative status + expiry.
--    A no-op for running or finished mocks, so the sitting calls it every
--    time it opens (this also corrects stale client state after Back/Forward).
-- =====================================================================
create or replace function resume_mock(p_attempt uuid)
returns table (current_status attempt_status, current_expires_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then raise exception 'forbidden'; end if;

  update attempts a
     set expires_at = a.expires_at + (now() - a.paused_at),
         paused_at  = null
   where a.id = p_attempt
     and a.user_id = v_user
     and a.mode = 'mock'
     and a.status = 'in_progress'
     and a.paused_at is not null;

  return query
  select a.status, a.expires_at
  from attempts a
  where a.id = p_attempt
    and a.user_id = v_user
    and a.mode = 'mock';
end;
$$;

-- =====================================================================
-- 4. Practice progress per subject for the caller in one entry test.
--    SECURITY INVOKER: the existing RLS policies scope rows to the caller.
--    answered = graded answers (re-answers in later sittings count again),
--    questions_seen = distinct questions answered at least once.
-- =====================================================================
create or replace function practice_progress(p_entry_test uuid)
returns table (subject_id uuid, answered bigint, correct bigint, questions_seen bigint)
language sql stable security invoker set search_path = public as $$
  select q.subject_id,
         count(*)                              as answered,
         count(*) filter (where aa.is_correct) as correct,
         count(distinct aa.question_id)        as questions_seen
  from attempt_answers aa
  join attempts  a on a.id = aa.attempt_id
  join questions q on q.id = aa.question_id
  where a.user_id = (select auth.uid())
    and a.entry_test_id = p_entry_test
    and a.mode = 'practice'
    and aa.selected_option_id is not null
  group by q.subject_id;
$$;

-- =====================================================================
-- 5. EXECUTE: authenticated only (same pattern as mcq_14).
-- =====================================================================
revoke execute on function pause_mock(uuid)        from anon, public;
revoke execute on function resume_mock(uuid)       from anon, public;
revoke execute on function practice_progress(uuid) from anon, public;
grant  execute on function pause_mock(uuid)        to authenticated;
grant  execute on function resume_mock(uuid)       to authenticated;
grant  execute on function practice_progress(uuid) to authenticated;
