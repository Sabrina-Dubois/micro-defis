-- 3) Data quality + query performance.

-- HH:MM (24h) format checks.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'push_subscriptions_reminder_time_local_hhmm_chk'
  ) then
    alter table public.push_subscriptions
      add constraint push_subscriptions_reminder_time_local_hhmm_chk
      check (reminder_time_local ~ '^[0-2][0-9]:[0-5][0-9]$');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'push_subscriptions_timezone_not_blank_chk'
  ) then
    alter table public.push_subscriptions
      add constraint push_subscriptions_timezone_not_blank_chk
      check (length(trim(timezone)) > 0);
  end if;
end $$;

-- Useful indexes for reminder jobs and user updates.
create index if not exists push_subscriptions_reminder_time_local_idx
  on public.push_subscriptions(reminder_time_local);

create index if not exists push_subscriptions_timezone_idx
  on public.push_subscriptions(timezone);

create index if not exists push_subscriptions_updated_at_idx
  on public.push_subscriptions(updated_at desc);
