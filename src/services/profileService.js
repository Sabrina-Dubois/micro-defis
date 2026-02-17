import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

export async function getAuthUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new Error("Utilisateur non authentifié");
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// ─────────────────────────────────────────
// PROFIL
// ─────────────────────────────────────────

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("username, avatar_emoji")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertProfile(userId, updates) {
  const { data: existing } = await supabase.from("user_profiles").select("id").eq("user_id", userId).maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({ user_id: userId, ...updates })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function fetchPremiumStatus(userId) {
  const { data, error } = await supabase.from("user_profiles").select("premium").eq("user_id", userId).maybeSingle();

  if (error) throw error;
  return data?.premium ?? false;
}