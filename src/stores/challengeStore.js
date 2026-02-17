import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "./userStore";
import { useStatsStore } from "./statsStore";
import { useSettingsStore } from "./settingsStore";

export const useChallengeStore = defineStore("challenge", () => {
  /* =========================
     STATE
  ========================= */
  const assignment = ref(null);
  const challengeTitle = ref("");
  const challengeDescription = ref("");
  const challengeCategory = ref("");
  const challengeLevel = ref("");
  const isDone = ref(false);
  const loading = ref(false);
  const error = ref(null);

  /* =========================
     GETTERS
  ========================= */
  const todayISO = computed(() => new Date().toISOString().slice(0, 10));
  const hasChallenge = computed(() => !!assignment.value);

  /* =========================
     HELPERS
  ========================= */
  function extractRelationName(obj, fallback) {
    if (!obj) return fallback;
    if (Array.isArray(obj)) return obj[0]?.name || fallback;
    if (typeof obj === "object") return obj.name || fallback;
    return fallback;
  }

  /* =========================
     DATABASE HELPERS
  ========================= */
  async function getOrCreateDailyAssignment(userId, day, isPremium) {
    // Vérifier si déjà assigné aujourd'hui
    const { data: existing } = await supabase
      .from("daily_assignments")
      .select("day, challenge_id")
      .eq("user_id", userId)
      .eq("day", day)
      .maybeSingle();

    if (existing) {
      const challengeData = await getChallengeData(existing.challenge_id);
      return { ...existing, _picked: challengeData };
    }

    // ✅ Récupérer les challenges avec filtre premium
    let query = supabase
      .from("challenges")
      .select(
        `
        *,
        category:category_id (id, name, premium),
        level:level_id (id, name, premium)
      `,
      )
      .eq("active", true);

    // ✅ Si pas premium → uniquement les défis de niveau non-premium
    if (!isPremium) {
      query = query.eq("level.premium", false);
    }

    const { data: list, error: fetchError } = await query;

    if (fetchError) throw fetchError;

    // ✅ Filtre JS en backup (au cas où le filtre Supabase sur relation ne fonctionne pas)
    let filtered = list || [];
    if (!isPremium) {
      filtered = filtered.filter((c) => c.level?.premium === false);
    }

    if (!filtered.length) throw new Error("Aucun défi disponible pour ce niveau");

    const pick = filtered[Math.floor(Math.random() * filtered.length)];

    const { data: created } = await supabase
      .from("daily_assignments")
      .insert({ user_id: userId, day, challenge_id: pick.id })
      .select("day, challenge_id")
      .single();

    return { ...created, _picked: pick };
  }

  async function getChallengeData(challengeId) {
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

  /* ============================================================
     1️⃣ LOAD STANDARD (Daily Assignment) — avec filtre premium
  ============================================================ */
  async function loadTodayChallenge() {
    const userStore = useUserStore();
    const settingsStore = useSettingsStore();

    if (!userStore.userId) throw new Error("Utilisateur non connecté");

    loading.value = true;
    error.value = null;

    try {
      // ✅ Charger les préférences pour avoir isPremium à jour
      await settingsStore.loadPreferences();

      const day = todayISO.value;
      const lang = settingsStore.language || "fr";
      const isPremium = settingsStore.isPremium; // ✅ récupéré ici

      const a = await getOrCreateDailyAssignment(userStore.userId, day, isPremium);
      assignment.value = a;

      const challengeData = a._picked;

      challengeTitle.value = challengeData?.[`title_${lang}`] || challengeData?.title_fr || "";
      challengeDescription.value = challengeData?.[`description_${lang}`] || challengeData?.description_fr || "";
      challengeCategory.value = extractRelationName(challengeData?.category, "Catégorie");
      challengeLevel.value = extractRelationName(challengeData?.level, "Niveau");

      // Vérifier si déjà complété aujourd'hui
      const { data: done } = await supabase
        .from("daily_completions")
        .select("day")
        .eq("user_id", userStore.userId)
        .eq("day", day)
        .maybeSingle();

      isDone.value = !!done;
    } catch (e) {
      error.value = e.message;
      console.error("❌ Erreur loadTodayChallenge:", e);
    } finally {
      loading.value = false;
    }
  }

  /* ============================================================
     2️⃣ LOAD AVEC FILTRES (Premium + Préférences catégories/niveaux)
  ============================================================ */
  async function loadTodayChallengeAlternative() {
    const userStore = useUserStore();
    const settingsStore = useSettingsStore();

    if (!userStore.userId) throw new Error("Utilisateur non connecté");

    loading.value = true;
    error.value = null;

    try {
      await settingsStore.loadPreferences();
      const isPremium = settingsStore.isPremium;

      const { data, error: fetchError } = await supabase
        .from("challenges")
        .select(
          `
          *,
          category:category_id (id, name, premium),
          level:level_id (id, name, premium)
        `,
        )
        .eq("active", true);

      if (fetchError) throw fetchError;
      if (!data?.length) throw new Error("Aucun défi disponible");

      let filtered = data;

      // Filtre premium
      if (!isPremium) {
        filtered = filtered.filter((c) => c.level?.premium === false);
      }

      // Filtre catégories préférées
      if (settingsStore.preferredCategories?.length > 0) {
        filtered = filtered.filter((c) => settingsStore.preferredCategories.includes(c.category?.name));
      }

      // Filtre niveaux préférés
      if (settingsStore.preferredLevels?.length > 0) {
        filtered = filtered.filter((c) => settingsStore.preferredLevels.includes(c.level?.name));
      }

      // Fallback si aucun défi après filtres
      if (!filtered.length) {
        filtered = data.filter((c) => c.level?.premium === false);
      }

      const challenge = filtered[Math.floor(Math.random() * filtered.length)];
      const lang = settingsStore.language || "fr";

      challengeTitle.value = challenge?.[`title_${lang}`] || challenge?.title_fr || "";
      challengeDescription.value = challenge?.[`description_${lang}`] || challenge?.description_fr || "";
      challengeCategory.value = extractRelationName(challenge.category, "Catégorie");
      challengeLevel.value = extractRelationName(challenge.level, "Niveau");
    } catch (e) {
      error.value = e.message;
      console.error("❌ Erreur alternative:", e);
    } finally {
      loading.value = false;
    }
  }

  /* =========================
     COMPLETION
  ========================= */
  async function markAsCompleted() {
    if (isDone.value) return;

    const userStore = useUserStore();
    const statsStore = useStatsStore();

    if (!userStore.userId || !assignment.value) throw new Error("Utilisateur ou challenge manquant");

    try {
      await statsStore.addCompletion(assignment.value.day, assignment.value.challenge_id);
      isDone.value = true;
    } catch (e) {
      error.value = e.message;
      console.error("Erreur markAsCompleted:", e);
    }
  }

  /* =========================
     LANGUAGE REFRESH
  ========================= */
  async function refreshLanguage() {
    if (!assignment.value?.challenge_id) return;

    const settingsStore = useSettingsStore();
    const lang = settingsStore.language || "fr";

    const data = await getChallengeData(assignment.value.challenge_id);

    challengeTitle.value = data?.[`title_${lang}`] || data?.title_fr || "";
    challengeDescription.value = data?.[`description_${lang}`] || data?.description_fr || "";
    challengeCategory.value = extractRelationName(data?.category, "Catégorie");
    challengeLevel.value = extractRelationName(data?.level, "Niveau");
  }

  function reset() {
    assignment.value = null;
    challengeTitle.value = "";
    challengeDescription.value = "";
    challengeCategory.value = "";
    challengeLevel.value = "";
    isDone.value = false;
    loading.value = false;
    error.value = null;
  }

  return {
    assignment,
    challengeTitle,
    challengeDescription,
    challengeCategory,
    challengeLevel,
    isDone,
    loading,
    error,
    todayISO,
    hasChallenge,
    loadTodayChallenge,
    loadTodayChallengeAlternative,
    markAsCompleted,
    refreshLanguage,
    reset,
  };
});
