import { supabase } from "@/lib/supabase";

export async function fetchLeaderboard(limit = 50, scope = "global") {
  const scoped = await supabase.rpc("get_leaderboard", {
    p_limit: limit,
    p_scope: scope,
  });
  if (!scoped.error) return scoped.data || [];

  // Backward compatibility: old function signature (p_limit only).
  const legacy = await supabase.rpc("get_leaderboard", {
    p_limit: limit,
  });
  if (legacy.error) throw scoped.error || legacy.error;

  return legacy.data || [];
}
