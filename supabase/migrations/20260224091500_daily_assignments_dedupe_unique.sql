-- Enforce one assignment per user per day.
-- 1) Remove duplicate rows, keep the newest one.
-- 2) Add unique constraint on (user_id, day).

with ranked as (
  select
    ctid,
    row_number() over (
      partition by user_id, day
      order by created_at desc nulls last, ctid desc
    ) as rn
  from public.daily_assignments
)
delete from public.daily_assignments d
using ranked r
where d.ctid = r.ctid
  and r.rn > 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_assignments_user_day_uniq'
  ) then
    alter table public.daily_assignments
      add constraint daily_assignments_user_day_uniq unique (user_id, day);
  end if;
end $$;
