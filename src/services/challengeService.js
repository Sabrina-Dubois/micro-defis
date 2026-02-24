import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────
// CHALLENGES
// ─────────────────────────────────────────

export async function fetchChallengeById(challengeId) {
  const { data, error } = await supabase
    .from("challenges")
    .select(
      `
      *,
      category:category_id (id, name, premium),
      level:level_id (id, name, premium)
    `,
    )
    .eq("id", challengeId)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchActiveChallenges() {
  const { data, error } = await supabase
    .from("challenges")
    .select(
      `
      *,
      category:category_id (id, name, premium),
      level:level_id (id, name, premium)
    `,
    )
    .eq("active", true);

  if (error) throw error;
  return data || [];
}

// ─────────────────────────────────────────
// DAILY ASSIGNMENTS
// ─────────────────────────────────────────

export async function fetchDailyAssignment(userId, day) {
  const { data, error } = await supabase
    .from("daily_assignments")
    .select("day, challenge_id, created_at")
    .eq("user_id", userId)
    .eq("day", day)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] ? { day: data[0].day, challenge_id: data[0].challenge_id } : null;
}

export async function createDailyAssignment(userId, day, challengeId) {
  const { data, error } = await supabase
    .from("daily_assignments")
    .insert({ user_id: userId, day, challenge_id: challengeId })
    .select("day, challenge_id")
    .single();

  if (error?.code === "23505") {
    const existing = await fetchDailyAssignment(userId, day);
    if (existing) return existing;
  }
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────
// COMPLETIONS
// ─────────────────────────────────────────

export async function fetchCompletion(userId, day) {
  const { data, error } = await supabase
    .from("daily_completions")
    .select("day")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function insertCompletion(userId, day, challengeId) {
  const { error } = await supabase
    .from("daily_completions")
    .insert({ user_id: userId, day, challenge_id: challengeId });

  if (error) throw error;
  return true;
}
