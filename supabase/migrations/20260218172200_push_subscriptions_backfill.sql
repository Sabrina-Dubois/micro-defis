-- 2) Backfill existing rows with safe defaults.
update public.push_subscriptions
set reminder_time_local = coalesce(reminder_time_local, reminder_time),
    timezone = coalesce(timezone, 'UTC')
where reminder_time_local is null
   or timezone is null;
