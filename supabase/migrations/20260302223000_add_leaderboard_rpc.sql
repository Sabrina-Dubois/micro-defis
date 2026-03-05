-- Public leaderboard RPC (authenticated users).
-- Returns rank, username, XP and current flame streak.

create or replace function public.get_leaderboard(p_limit integer default 50)
returns table (
  rank bigint,
  user_id uuid,
  username text,
  xp integer,
  flames integer,
  total_completed integer
)
language sql
security definer
set search_path = public
as $$
  with user_totals as (
    select
      up.user_id,
      coalesce(nullif(trim(up.username), ''), 'Utilisateur') as username,
      count(dc.day)::int as total_completed
    from public.user_profiles up
    left join public.daily_completions dc on dc.user_id = up.user_id
    group by up.user_id, up.username
  ),
  user_streaks as (
    select
      ut.user_id,
      coalesce((
        select count(*)::int
        from (
          select
            d.day,
            row_number() over (order by d.day desc) as rn
          from (
            select distinct dc.day
            from public.daily_completions dc
            where dc.user_id = ut.user_id
              and dc.day <= current_date
          ) d
        ) s
        where s.day = (current_date - ((s.rn - 1)::int))
      ), 0) as flames
    from user_totals ut
  ),
  scored as (
    select
      ut.user_id,
      ut.username,
      (ut.total_completed * 15)::int as xp,
      us.flames,
      ut.total_completed
    from user_totals ut
    left join user_streaks us on us.user_id = ut.user_id
    where ut.total_completed > 0
  )
  select
    dense_rank() over (order by s.xp desc, s.flames desc, s.username asc) as rank,
    s.user_id,
    s.username,
    s.xp,
    s.flames,
    s.total_completed
  from scored s
  order by rank, username
  limit greatest(coalesce(p_limit, 50), 1);
$$;

revoke all on function public.get_leaderboard(integer) from public;
grant execute on function public.get_leaderboard(integer) to authenticated;
grant execute on function public.get_leaderboard(integer) to service_role;
