import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────
// PRÉFÉRENCES
// ─────────────────────────────────────────

export async function fetchPreferences(userId) {
  const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertPreferences(userId, updates) {
  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() }, { onConflict: ["user_id"] });

  if (error) throw error;
  return true;
}

// ─────────────────────────────────────────
// CATÉGORIES & NIVEAUX
// ─────────────────────────────────────────

export async function fetchCategories() {
  const { data, error } = await supabase.from("categories").select("id, name, premium").order("name");

  if (error) throw error;
  return data || [];
}

export async function fetchLevels() {
  const { data, error } = await supabase
    .from("levels")
    .select("id, name, premium")
    .order("premium", { ascending: true });

  if (error) throw error;
  return data || [];
}

// ─────────────────────────────────────────
// PUSH SUBSCRIPTIONS
// ─────────────────────────────────────────

export async function savePushSubscription(userId, subscription, reminderTime) {
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      subscription: JSON.stringify(subscription),
      reminder_time: reminderTime,
      updated_at: new Date().toISOString(),
    },
    { onConflict: ["user_id"] },
  );

  if (error) throw error;
  return true;
}

export async function deletePushSubscription(userId) {
  const { error } = await supabase.from("push_subscriptions").delete().eq("user_id", userId);

  if (error) throw error;
  return true;
}

export async function updatePushReminderTime(userId, reminderTime) {
  const { error } = await supabase
    .from("push_subscriptions")
    .update({ reminder_time: reminderTime, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) throw error;
  return true;
}
