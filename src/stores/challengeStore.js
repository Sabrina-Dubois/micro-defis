import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useUserStore } from "./userStore";
import { useStatsStore } from "./statsStore";
import { useSettingsStore } from "./settingsStore";
import {
  fetchChallengeById,
  fetchActiveChallenges,
  fetchDailyAssignment,
  createDailyAssignment,
} from "@/services/challengeService";

export const useChallengeStore = defineStore("challenge", () => {
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const assignment = ref(null);
  const challengeTitle = ref("");
  const challengeDescription = ref("");
  const challengeCategory = ref("");
  const challengeLevel = ref("");
  const isDone = ref(false);
  const loading = ref(false);
  const error = ref(null);
  const lastChallengeData = ref(null);
  const lastChallengeDay = ref("");

  // ─────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────
  function getLocalISODate() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const todayISO = computed(() => getLocalISODate());
  const hasChallenge = computed(() => !!assignment.value);

  // ─────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────
  function extractRelationName(obj, fallback) {
    if (!obj) return fallback;
    if (Array.isArray(obj)) return obj[0]?.name || fallback;
    if (typeof obj === "object") return obj.name || fallback;
    return fallback;
  }

  function applyChallenge(challengeData, lang) {
    challengeTitle.value = challengeData?.[`title_${lang}`] || challengeData?.title_fr || "";
    challengeDescription.value = challengeData?.[`description_${lang}`] || challengeData?.description_fr || "";
    challengeCategory.value = extractRelationName(challengeData?.category, "Catégorie");
    challengeLevel.value = extractRelationName(challengeData?.level, "Niveau");
  }

  // ─────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────

  /**
   * Charge le défi du jour avec assignment quotidien
   */
  async function loadTodayChallenge(force = false) {
    const userStore = useUserStore();
    const settingsStore = useSettingsStore();
    if (!userStore.userId) throw new Error("Utilisateur non connecté");

    loading.value = true;
    error.value = null;

    try {
      await settingsStore.loadPreferences();

      const day = todayISO.value;
      const lang = settingsStore.language || "fr";
      const isPremium = settingsStore.isPremium;

      const statsStore = useStatsStore();

      // Invalidate stale in-memory state as soon as local day changes.
      if (assignment.value?.day && assignment.value.day !== day) {
        assignment.value = null;
        lastChallengeData.value = null;
        lastChallengeDay.value = "";
        isDone.value = false;
      }

      if (!force && assignment.value?.day === day && lastChallengeDay.value === day && lastChallengeData.value) {
        applyChallenge(lastChallengeData.value, lang);
        isDone.value = statsStore.isCompletedDay(day);
        return;
      }

      // Vérifier si un assignment existe déjà aujourd'hui
      const existing = await fetchDailyAssignment(userStore.userId, day);

      let challengeData;
      if (existing) {
        assignment.value = existing;
        challengeData = await fetchChallengeById(existing.challenge_id);
      } else {
        // Choisir un défi aléatoire selon le niveau premium
        let allChallenges = await fetchActiveChallenges();
        if (!isPremium) {
          allChallenges = allChallenges.filter((c) => c.level?.premium === false);
        }
        if (!allChallenges.length) throw new Error("Aucun défi disponible");

        const pick = allChallenges[Math.floor(Math.random() * allChallenges.length)];
        const created = await createDailyAssignment(userStore.userId, day, pick.id);
        assignment.value = created;
        challengeData = pick;
      }

      applyChallenge(challengeData, lang);
      lastChallengeData.value = challengeData;
      lastChallengeDay.value = day;
      isDone.value = statsStore.isCompletedDay(day);
    } catch (e) {
      error.value = e.message;
      console.error("❌ Erreur loadTodayChallenge:", e);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Charge un défi en tenant compte des préférences catégories/niveaux
   */
  async function loadTodayChallengeWithPreferences() {
    const userStore = useUserStore();
    const settingsStore = useSettingsStore();
    if (!userStore.userId) throw new Error("Utilisateur non connecté");

    loading.value = true;
    error.value = null;

    try {
      await settingsStore.loadPreferences();
      const isPremium = settingsStore.isPremium;
      const lang = settingsStore.language || "fr";

      let challenges = await fetchActiveChallenges();

      // Filtre premium
      if (!isPremium) {
        challenges = challenges.filter((c) => c.level?.premium === false);
      }

      // Filtre catégories préférées
      if (settingsStore.preferredCategories?.length > 0) {
        challenges = challenges.filter((c) => settingsStore.preferredCategories.includes(c.category?.name));
      }

      // Filtre niveaux préférés
      if (settingsStore.preferredLevels?.length > 0) {
        challenges = challenges.filter((c) => settingsStore.preferredLevels.includes(c.level?.name));
      }

      // Fallback si aucun résultat après filtres
      if (!challenges.length) {
        challenges = (await fetchActiveChallenges()).filter((c) => c.level?.premium === false);
      }

      const pick = challenges[Math.floor(Math.random() * challenges.length)];
      applyChallenge(pick, lang);
    } catch (e) {
      error.value = e.message;
      console.error("❌ Erreur loadTodayChallengeWithPreferences:", e);
    } finally {
      loading.value = false;
    }
  }

  async function markAsCompleted() {
    if (isDone.value) return;

    const userStore = useUserStore();
    const statsStore = useStatsStore();
    if (!userStore.userId || !assignment.value) throw new Error("Données manquantes");

    try {
      await statsStore.addCompletion(assignment.value.day, assignment.value.challenge_id);
      isDone.value = true;
    } catch (e) {
      error.value = e.message;
      console.error("Erreur markAsCompleted:", e);
    }
  }

  async function refreshLanguage() {
    if (!assignment.value?.challenge_id) return;

    const settingsStore = useSettingsStore();
    const lang = settingsStore.language || "fr";
    const data = await fetchChallengeById(assignment.value.challenge_id);
    applyChallenge(data, lang);
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

  // ─────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────
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
    loadTodayChallengeWithPreferences,
    markAsCompleted,
    refreshLanguage,
    reset,
  };
});
