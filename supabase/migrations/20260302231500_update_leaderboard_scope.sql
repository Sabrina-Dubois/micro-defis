-- Leaderboard scope support: global (all-time) or league (last 7 days).

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
with scope_bounds as (
  select case when coalesce(lower(p_scope), 'global') = 'league' then current_date - 6 else null end as start_day
),
totals as (
  select
    up.user_id,
    coalesce(nullif(trim(up.username), ''), 'Utilisateur') as username,
    count(dc.day)::int as total_completed,
    count(distinct dc.day)::int as active_days
  from public.user_profiles up
  left join public.daily_completions dc
    on dc.user_id = up.user_id
   and (
     (select start_day from scope_bounds) is null
     or dc.day >= (select start_day from scope_bounds)
   )
  group by up.user_id, up.username
),
scored as (
  select
    t.user_id,
    t.username,
    (t.total_completed * 10)::int as xp,
    t.active_days::int as flames
  from totals t
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
$$;

revoke all on function public.get_leaderboard(integer, text) from public;
grant execute on function public.get_leaderboard(integer, text) to authenticated;
grant execute on function public.get_leaderboard(integer, text) to service_role;
