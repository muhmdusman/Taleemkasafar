-- Pin search_path on set_updated_at (was mutable).
create or replace function set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Internal trigger/RLS helpers, not REST RPCs. Revoke EXECUTE from API roles.
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.is_admin() from anon;
