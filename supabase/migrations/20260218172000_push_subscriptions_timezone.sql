alter table if exists public.push_subscriptions
  add column if not exists reminder_time_local text,
  add column if not exists timezone text;

update public.push_subscriptions
set reminder_time_local = coalesce(reminder_time_local, reminder_time),
    timezone = coalesce(timezone, 'UTC')
where reminder_time_local is null
   or timezone is null;
