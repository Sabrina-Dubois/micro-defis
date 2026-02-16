import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "./userStore";

export const useSettingsStore = defineStore("settings", () => {
  // =========================
  // STATE
  // =========================
  const preferences = ref({
    notifications_enabled: true,
    reminder_time: "20:00",
    pref_category: [],
    pref_level: [],
    language: "fr",
    theme: "light",
    premium_active: false,
  });

  const loading = ref(false);
  const error = ref(null);

  // Données BDD
  const categories = ref([]);
  const levels = ref([]);

  // =========================
  // GETTERS
  // =========================
  const notificationsEnabled = computed(() => preferences.value.notifications_enabled);
  const reminderTime = computed(() => preferences.value.reminder_time);
  const preferredCategories = computed(() => preferences.value.pref_category);
  const preferredLevels = computed(() => preferences.value.pref_level);
  const language = computed(() => preferences.value.language);
  const theme = computed(() => preferences.value.theme);
  const isPremium = computed(() => preferences.value.premium_active ?? false);

  const languageLabel = computed(() => (preferences.value.language === "fr" ? "Français" : "English"));

  const themeLabel = computed(() => (preferences.value.theme === "dark" ? "Sombre" : "Clair"));

  // =========================
  // ACTIONS
  // =========================

  // Charger les préférences utilisateur
  async function loadPreferences() {
    const userStore = useUserStore();

    if (!userStore.userId) {
      console.warn("Utilisateur non connecté");
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      // Préférences
      const { data, error: fetchError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userStore.userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (data) {
        preferences.value = {
          notifications_enabled: data.notifications_enabled ?? true,
          reminder_time: data.reminder_time ?? "20:00",
          pref_category: data.pref_category ?? [],
          pref_level: data.pref_level ?? [],
          language: data.language ?? "fr",
          theme: data.theme ?? "light",
          premium_active: data.premium_active ?? false,
        };
      }

      // Statut premium depuis user_profiles
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("premium")
        .eq("user_id", userStore.userId)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Erreur chargement premium:", profileError);
      }

      if (profileData) {
        preferences.value.premium_active = profileData.premium ?? false;
      }

      return preferences.value;
    } catch (e) {
      error.value = e.message;
      console.error("Erreur loadPreferences:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // Charger les catégories
  async function loadCategories() {
    try {
      const { data, error: fetchError } = await supabase.from("categories").select("id, name, premium").order("name");

      if (fetchError) throw fetchError;

      categories.value = data || [];
    } catch (e) {
      console.error("Erreur loadCategories:", e);
      categories.value = [];
    }
  }

  // Charger les niveaux
  async function loadLevels() {
    try {
      const { data, error: fetchError } = await supabase
        .from("levels")
        .select("id, name, premium")
        .order("premium", { ascending: true });

      if (fetchError) throw fetchError;

      levels.value = data || [];
    } catch (e) {
      console.error("Erreur loadLevels:", e);
      levels.value = [];
    }
  }

  async function updatePreference(key, value) {
    const userStore = useUserStore();
    if (!userStore.userId) throw new Error("Utilisateur non connecté");

    try {
      const updates = {
        user_id: userStore.userId,
        [key]: value,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase.from("user_preferences").upsert(updates);

      if (updateError) throw updateError;

      preferences.value[key] = value;
      return true;
    } catch (e) {
      error.value = e.message;
      console.error("Erreur updatePreference:", e);
      throw e;
    }
  }

  async function updateMultiplePreferences(updates) {
    const userStore = useUserStore();
    if (!userStore.userId) throw new Error("Utilisateur non connecté");

    try {
      const payload = {
        user_id: userStore.userId,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase.from("user_preferences").upsert(payload);

      if (updateError) throw updateError;

      Object.assign(preferences.value, updates);
      return true;
    } catch (e) {
      error.value = e.message;
      console.error("Erreur updateMultiplePreferences:", e);
      throw e;
    }
  }

  async function toggleNotifications() {
    const newValue = !preferences.value.notifications_enabled;
    await updatePreference("notifications_enabled", newValue);
    return newValue;
  }

  async function setReminderTime(time) {
    await updatePreference("reminder_time", time);
    return time;
  }

  async function setLanguage(lang) {
    await updatePreference("language", lang);
    return lang;
  }

  async function setTheme(newTheme) {
    await updatePreference("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    return newTheme;
  }

  async function toggleTheme() {
    const newTheme = preferences.value.theme === "light" ? "dark" : "light";
    await setTheme(newTheme);
    return newTheme;
  }

  async function setChallengePreferences(cats, levs) {
    await updateMultiplePreferences({
      pref_category: cats,
      pref_level: levs,
    });
    return { cats, levs };
  }

  function initThemeFromLocalStorage() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      preferences.value.theme = savedTheme;
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }

  function reset() {
    preferences.value = {
      notifications_enabled: true,
      reminder_time: "20:00",
      pref_category: [],
      pref_level: [],
      language: "fr",
      theme: "light",
      premium_active: false,
    };
    categories.value = [];
    levels.value = [];
    loading.value = false;
    error.value = null;
  }

  return {
    // STATE
    preferences,
    categories,
    levels,
    loading,
    error,

    // GETTERS
    notificationsEnabled,
    reminderTime,
    preferredCategories,
    preferredLevels,
    language,
    theme,
    isPremium,
    languageLabel,
    themeLabel,

    // ACTIONS
    loadPreferences,
    loadCategories,
    loadLevels,
    updatePreference,
    updateMultiplePreferences,
    toggleNotifications,
    setReminderTime,
    setLanguage,
    setTheme,
    toggleTheme,
    setChallengePreferences,
    initThemeFromLocalStorage,
    reset,
  };
});
