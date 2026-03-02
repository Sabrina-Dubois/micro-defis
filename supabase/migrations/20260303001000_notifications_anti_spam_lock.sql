-- Anti-spam lock for push notifications:
-- max 1 send per user + notif type + local day.

create table if not exists public.notification_sends (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  notif_type text not null,
  day_local date not null,
  created_at timestamptz not null default now(),
  constraint notification_sends_notif_type_chk
    check (notif_type in ('daily_reminder', 'streak_risk', '23h_reminder'))
);

create unique index if not exists notification_sends_user_type_day_uniq_idx
  on public.notification_sends (user_id, notif_type, day_local);

create index if not exists notification_sends_day_local_idx
  on public.notification_sends (day_local desc);

create or replace function public.reserve_notification_send(
  p_user_id uuid,
  p_notif_type text,
  p_day_local date
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_rows integer := 0;
begin
  insert into public.notification_sends (user_id, notif_type, day_local)
  values (p_user_id, p_notif_type, p_day_local)
  on conflict (user_id, notif_type, day_local) do nothing;

  get diagnostics inserted_rows = row_count;
  return inserted_rows = 1;
end;
$$;

revoke all on function public.reserve_notification_send(uuid, text, date) from public;
grant execute on function public.reserve_notification_send(uuid, text, date) to service_role;
