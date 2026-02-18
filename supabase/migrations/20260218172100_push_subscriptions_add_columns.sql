-- 1) Schema changes for timezone-aware scheduling.
alter table if exists public.push_subscriptions
  add column if not exists reminder_time_local text,
  add column if not exists timezone text;
