-- Admin access for user profiles
-- Adds an is_admin flag and policy to let admins read all profiles.

alter table public.user_profiles
add column if not exists is_admin boolean not null default false;

drop policy if exists "Admin view all profiles" on public.user_profiles;
create policy "Admin view all profiles" on public.user_profiles
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.user_profiles up
    where up.user_id = auth.uid()
      and up.is_admin = true
  )
);

-- Example to grant yourself admin rights (run manually with your email):
-- update public.user_profiles
-- set is_admin = true
-- where user_id = (
--   select id from auth.users where email = 'ton-email@exemple.com'
-- );
