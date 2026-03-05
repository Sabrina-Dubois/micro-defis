-- Diversified leaderboard scoring (v1):
-- base + speed bonus + difficulty bonus
-- Supports global and weekly league (Monday->Sunday, Europe/Paris).

drop function if exists public.get_leaderboard(integer);
drop function if exists public.get_leaderboard(integer, text);

create function public.get_leaderboard(
  p_limit integer default 50,
  p_scope text default 'global'
)
returns table(
  user_id uuid,
  username text,
  xp integer,
  flames integer,
  rank bigint
)
language sql
security definer
set search_path = public
as $$
with today as (
  select (now() at time zone 'Europe/Paris')::date as d
),
bounds as (
  select
    case
      when lower(coalesce(p_scope, 'global')) = 'league'
      then date_trunc('week', d::timestamp)::date
      else null
    end as start_day,
    case
      when lower(coalesce(p_scope, 'global')) = 'league'
      then (date_trunc('week', d::timestamp)::date + 6)
      else null
    end as end_day
  from today
),
base_rows as (
  select
    dc.user_id,
    dc.day,
    dc.challenge_id,
    dc.completed_at,
    da.created_at as assigned_at,
    l.name as level_name
  from public.daily_completions dc
  left join public.daily_assignments da
    on da.user_id = dc.user_id
   and da.day = dc.day
   and da.challenge_id = dc.challenge_id
  left join public.challenges ch on ch.id = dc.challenge_id
  left join public.levels l on l.id = ch.level_id
  where
    (select start_day from bounds) is null
    or dc.day between (select start_day from bounds) and (select end_day from bounds)
),
scored_rows as (
  select
    br.user_id,
    -- Base points
    10
    -- Speed bonus:
    + case
        when br.assigned_at is not null and br.completed_at <= br.assigned_at + interval '2 hour' then 6
        when (br.completed_at at time zone 'Europe/Paris')::time < time '12:00' then 4
        when (br.completed_at at time zone 'Europe/Paris')::time < time '18:00' then 2
        else 0
      end
    -- Difficulty bonus from level name
    + case
        when coalesce(br.level_name, '') ilike '%Expert%' then 6
        when coalesce(br.level_name, '') ilike '%Difficile%' then 4
        when coalesce(br.level_name, '') ilike '%Intermédiaire%' then 2
        when coalesce(br.level_name, '') ilike '%Intermediaire%' then 2
        else 0
      end
      as points,
    br.day
  from base_rows br
),
user_points as (
  select
    up.user_id,
    coalesce(nullif(trim(up.username), ''), 'Utilisateur') as username,
    coalesce(sum(sr.points), 0)::int as xp,
    coalesce(count(distinct sr.day), 0)::int as flames
  from public.user_profiles up
  left join scored_rows sr on sr.user_id = up.user_id
  group by up.user_id, up.username
)
select
  p.user_id,
  p.username,
  p.xp,
  p.flames,
  dense_rank() over (order by p.xp desc, p.flames desc, p.username asc) as rank
from user_points p
order by rank, username
limit greatest(coalesce(p_limit, 50), 1);
$$;

revoke all on function public.get_leaderboard(integer, text) from public;
grant execute on function public.get_leaderboard(integer, text) to authenticated;
grant execute on function public.get_leaderboard(integer, text) to service_role;
