-- Final leaderboard scoring:
-- + Base points
-- + Speed bonus
-- + Difficulty bonus
-- + Global flame bonus
-- Supports global + weekly league (Monday->Sunday, Europe/Paris).

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
as $func$
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
row_points as (
  select
    br.user_id,
    br.day,
    (
      10
      + case
          when br.assigned_at is not null and br.completed_at <= br.assigned_at + interval '2 hour' then 6
          when (br.completed_at at time zone 'Europe/Paris')::time < time '12:00' then 4
          when (br.completed_at at time zone 'Europe/Paris')::time < time '18:00' then 2
          else 0
        end
      + case
          when coalesce(br.level_name, '') ilike '%Expert%' then 6
          when coalesce(br.level_name, '') ilike '%Difficile%' then 4
          when coalesce(br.level_name, '') ilike '%Intermédiaire%' then 2
          when coalesce(br.level_name, '') ilike '%Intermediaire%' then 2
          else 0
        end
    )::int as points
  from base_rows br
),
xp_scoped as (
  select
    up.user_id,
    coalesce(nullif(trim(up.username), ''), 'Utilisateur') as username,
    coalesce(sum(rp.points), 0)::int as xp
  from public.user_profiles up
  left join row_points rp on rp.user_id = up.user_id
  group by up.user_id, up.username
),
flames_global as (
  select
    up.user_id,
    coalesce((
      with ordered as (
        select
          d.day,
          row_number() over (order by d.day desc) as rn,
          max(d.day) over () as max_day
        from (
          select distinct dc.day
          from public.daily_completions dc
          where dc.user_id = up.user_id
        ) d
      )
      select count(*)::int
      from ordered o
      where o.day = (o.max_day - ((o.rn - 1)::int))
    ), 0) as flames
  from public.user_profiles up
),
scored as (
  select
    x.user_id,
    x.username,
    (
      x.xp
      + case
          when coalesce(f.flames, 0) > 30 then 6
          when coalesce(f.flames, 0) > 7 then 3
          else 0
        end
    )::int as xp,
    coalesce(f.flames, 0)::int as flames
  from xp_scoped x
  left join flames_global f on f.user_id = x.user_id
)
select
  s.user_id,
  s.username,
  s.xp,
  s.flames,
  dense_rank() over (order by s.xp desc, s.flames desc, s.username asc) as rank
from scored s
order by rank, username
limit greatest(coalesce(p_limit, 50), 1);
$func$;

revoke all on function public.get_leaderboard(integer, text) from public;
grant execute on function public.get_leaderboard(integer, text) to authenticated;
grant execute on function public.get_leaderboard(integer, text) to service_role;
