import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────
// STATS / COMPLETIONS
// ─────────────────────────────────────────

export async function fetchAllCompletions(userId) {
  const { data, error } = await supabase
    .from("daily_completions")
    .select("day, challenge_id")
    .eq("user_id", userId)
    .order("day", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function insertCompletion(userId, day, challengeId) {
  const { error } = await supabase
    .from("daily_completions")
    .insert({ user_id: userId, day, challenge_id: challengeId });

  if (error) throw error;
  return true;
}
