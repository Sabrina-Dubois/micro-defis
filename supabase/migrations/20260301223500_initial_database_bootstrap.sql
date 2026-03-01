-- ============================================================
-- MIGRATION PRINCIPALE - BOOTSTRAP DE LA BASE DE DONNEES
-- ============================================================
-- Rejouable sans perte de donnees (idempotente).

create extension if not exists "pgcrypto";

/* ============================================================
   TABLES
   ============================================================ */

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  premium boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  premium boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title_fr text not null,
  title_en text not null,
  description_fr text,
  description_en text,
  active boolean not null default true,
  category_id uuid references public.categories(id) on delete set null,
  level_id uuid references public.levels(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(title_fr, title_en)
);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null default 'Username',
  avatar_emoji text not null default '🙂',
  lang text not null default 'fr' check (lang in ('fr', 'en')),
  premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.user_profiles(user_id) on delete cascade,
  theme text not null default 'light',
  notifications boolean not null default true,
  language text not null default 'fr',
  notifications_enabled boolean not null default false,
  reminder_time text not null default '20:00',
  pref_category text[] default '{}',
  pref_level text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences
  add column if not exists language text not null default 'fr',
  add column if not exists notifications_enabled boolean not null default false,
  add column if not exists reminder_time text not null default '20:00',
  add column if not exists pref_category text[] default '{}',
  add column if not exists pref_level text[] default '{}';

create table if not exists public.daily_assignments (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  challenge_id uuid not null references public.challenges(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, day, challenge_id)
);

create table if not exists public.daily_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  challenge_id uuid not null references public.challenges(id) on delete restrict,
  completed_at timestamptz not null default now(),
  primary key (user_id, day, challenge_id)
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  subscription text not null,
  reminder_time text default '20:00',
  reminder_time_local text,
  timezone text,
  updated_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_stripe_customer_id_uniq_idx
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists subscriptions_stripe_subscription_id_uniq_idx
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

/* ============================================================
   DATA QUALITY
   ============================================================ */

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
    select 1 from pg_constraint
    where conname = 'daily_assignments_user_day_uniq'
  ) then
    alter table public.daily_assignments
      add constraint daily_assignments_user_day_uniq unique (user_id, day);
  end if;
end $$;

update public.push_subscriptions
set reminder_time_local = coalesce(reminder_time_local, reminder_time),
    timezone = coalesce(timezone, 'UTC')
where reminder_time_local is null
   or timezone is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
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
    select 1 from pg_constraint
    where conname = 'push_subscriptions_timezone_not_blank_chk'
  ) then
    alter table public.push_subscriptions
      add constraint push_subscriptions_timezone_not_blank_chk
      check (length(trim(timezone)) > 0);
  end if;
end $$;

create index if not exists push_subscriptions_reminder_time_local_idx
  on public.push_subscriptions(reminder_time_local);

create index if not exists push_subscriptions_timezone_idx
  on public.push_subscriptions(timezone);

create index if not exists push_subscriptions_updated_at_idx
  on public.push_subscriptions(updated_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_preferences_language_chk'
  ) then
    alter table public.user_preferences
      add constraint user_preferences_language_chk
      check (language in ('fr', 'en'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_preferences_theme_chk'
  ) then
    alter table public.user_preferences
      add constraint user_preferences_theme_chk
      check (theme in ('light', 'dark'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_preferences_reminder_time_hhmm_chk'
  ) then
    alter table public.user_preferences
      add constraint user_preferences_reminder_time_hhmm_chk
      check (reminder_time ~ '^[0-2][0-9]:[0-5][0-9]$');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'subscriptions_status_chk'
  ) then
    alter table public.subscriptions
      add constraint subscriptions_status_chk
      check (
        status in (
          'active','inactive','canceled','past_due','unpaid','trialing','incomplete','incomplete_expired'
        )
      );
  end if;
end $$;

/* ============================================================
   FUNCTIONS
   ============================================================ */

create or replace function public.update_user_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.update_user_preferences_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.update_subscriptions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.user_profiles (user_id, username, avatar_emoji)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'Username'),
    '🙂'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.user_is_premium()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_id = auth.uid()
      and premium = true
  );
$$;

/* ============================================================
   TRIGGERS
   ============================================================ */

drop trigger if exists update_user_profiles_timestamp on public.user_profiles;
create trigger update_user_profiles_timestamp
before update on public.user_profiles
for each row
execute function public.update_user_profiles_updated_at();

drop trigger if exists update_user_preferences_timestamp on public.user_preferences;
create trigger update_user_preferences_timestamp
before update on public.user_preferences
for each row
execute function public.update_user_preferences_updated_at();

drop trigger if exists update_subscriptions_timestamp on public.subscriptions;
create trigger update_subscriptions_timestamp
before update on public.subscriptions
for each row
execute function public.update_subscriptions_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

/* ============================================================
   RLS + POLICIES
   ============================================================ */

alter table public.categories enable row level security;
alter table public.levels enable row level security;
alter table public.challenges enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.daily_assignments enable row level security;
alter table public.daily_completions enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Categories viewable by authenticated users" on public.categories;
create policy "Categories viewable by authenticated users" on public.categories
for select to authenticated
using (true);

drop policy if exists "Levels viewable by authenticated users" on public.levels;
create policy "Levels viewable by authenticated users" on public.levels
for select to authenticated
using (true);

drop policy if exists "Challenges view free or premium" on public.challenges;
create policy "Challenges view free or premium" on public.challenges
for select to authenticated
using (
  (
    level_id is null
    or exists (
      select 1
      from public.levels l
      where l.id = challenges.level_id
        and (l.premium = false or public.user_is_premium())
    )
  )
  and
  (
    category_id is null
    or exists (
      select 1
      from public.categories c
      where c.id = challenges.category_id
        and (c.premium = false or public.user_is_premium())
    )
  )
);

-- Security: write access reserved to backend service role.
drop policy if exists "Challenges insert authenticated" on public.challenges;
drop policy if exists "Challenges update authenticated" on public.challenges;
drop policy if exists "Challenges delete authenticated" on public.challenges;
drop policy if exists "Challenges write service role" on public.challenges;
create policy "Challenges write service role" on public.challenges
for all to service_role
using (true)
with check (true);

drop policy if exists "Users view own profile" on public.user_profiles;
create policy "Users view own profile" on public.user_profiles
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users insert own profile" on public.user_profiles;
create policy "Users insert own profile" on public.user_profiles
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users update own profile" on public.user_profiles;
create policy "Users update own profile" on public.user_profiles
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own profile" on public.user_profiles;
create policy "Users delete own profile" on public.user_profiles
for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users view own preferences" on public.user_preferences;
create policy "Users view own preferences" on public.user_preferences
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users insert own preferences" on public.user_preferences;
create policy "Users insert own preferences" on public.user_preferences
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users update own preferences" on public.user_preferences;
create policy "Users update own preferences" on public.user_preferences
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own preferences" on public.user_preferences;
create policy "Users delete own preferences" on public.user_preferences
for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users view own assignments" on public.daily_assignments;
create policy "Users view own assignments" on public.daily_assignments
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users insert own assignments" on public.daily_assignments;
create policy "Users insert own assignments" on public.daily_assignments
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users update own assignments" on public.daily_assignments;
create policy "Users update own assignments" on public.daily_assignments
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own assignments" on public.daily_assignments;
create policy "Users delete own assignments" on public.daily_assignments
for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users view own completions" on public.daily_completions;
create policy "Users view own completions" on public.daily_completions
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users insert own completions" on public.daily_completions;
create policy "Users insert own completions" on public.daily_completions
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users update own completions" on public.daily_completions;
create policy "Users update own completions" on public.daily_completions
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own completions" on public.daily_completions;
create policy "Users delete own completions" on public.daily_completions
for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users manage own push subscription" on public.push_subscriptions;
create policy "Users manage own push subscription" on public.push_subscriptions
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users view own subscription" on public.subscriptions;
create policy "Users view own subscription" on public.subscriptions
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Service role manage subscriptions" on public.subscriptions;
create policy "Service role manage subscriptions" on public.subscriptions
for all to service_role
using (true)
with check (true);

/* ============================================================
   SEED
   ============================================================ */

insert into public.categories (name, premium)
values
  ('💪 Sport', true),
  ('🌿 Nature', true),
  ('🤪 Insolite', true),
  ('🧘 Bien-être', true),
  ('👥 Social', true),
  ('🧠 Mental', true),
  ('⚡️ Boost', true),
  ('🎨 Créativité', true),
  ('💻 Digitale', true)
on conflict (name) do update
set premium = excluded.premium;

insert into public.levels (name, premium)
values
  ('Débutant 🌱', false),
  ('Intermédiaire ⚡️', true),
  ('Difficile 💪', true),
  ('Expert 💀', true)
on conflict (name) do update
set premium = excluded.premium;
