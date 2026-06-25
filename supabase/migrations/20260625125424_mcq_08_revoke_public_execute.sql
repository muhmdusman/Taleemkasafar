-- Default Postgres grants EXECUTE to PUBLIC; revoke that so these internal
-- functions aren't exposed as REST RPCs.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.is_admin() from public;

-- is_admin() is referenced by RLS policies and must be executable by the
-- authenticated role during policy evaluation. Grant ONLY that role.
grant execute on function public.is_admin() to authenticated;
