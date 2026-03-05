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
  updateDailyAssignmentChallenge,
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

  function relationName(relation) {
    if (!relation) return "";
    if (Array.isArray(relation)) return relation[0]?.name || "";
    if (typeof relation === "object") return relation.name || "";
    return "";
  }

  function isRelationPremium(relation) {
    if (!relation) return false;
    if (Array.isArray(relation)) return relation[0]?.premium === true;
    if (typeof relation === "object") return relation.premium === true;
    return false;
  }

  function isChallengePremium(challenge) {
    return isRelationPremium(challenge?.level) || isRelationPremium(challenge?.category);
  }

  function matchesPreferences(challenge, preferredCategories, preferredLevels) {
    const categoryName = relationName(challenge?.category);
    const levelName = relationName(challenge?.level);

    const categoryOk =
      !preferredCategories?.length || preferredCategories.includes(categoryName);
    const levelOk =
      !preferredLevels?.length || preferredLevels.includes(levelName);

    return categoryOk && levelOk;
  }

  function pickRandom(items) {
    if (!items?.length) return null;
    return items[Math.floor(Math.random() * items.length)];
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
      const preferredCategories = settingsStore.preferredCategories || [];
      const preferredLevels = settingsStore.preferredLevels || [];

      const statsStore = useStatsStore();

      // Invalidate stale in-memory state as soon as local day changes.
      if (assignment.value?.day && assignment.value.day !== day) {
        assignment.value = null;
        lastChallengeData.value = null;
        lastChallengeDay.value = "";
        isDone.value = false;
      }

      if (!force && assignment.value?.day === day && lastChallengeDay.value === day && lastChallengeData.value) {
        const alreadyCompletedToday = statsStore.isCompletedDay(day);
        const cacheIsPremiumMismatch = !isPremium && isChallengePremium(lastChallengeData.value);
        const cacheIsPrefsMismatch =
          !matchesPreferences(lastChallengeData.value, preferredCategories, preferredLevels);

        // Ne pas réutiliser le cache si le défi ne respecte plus l'état/prefs actuels.
        if (!alreadyCompletedToday && (cacheIsPremiumMismatch || cacheIsPrefsMismatch)) {
          // continue and recompute assignment below
        } else {
          applyChallenge(lastChallengeData.value, lang);
          isDone.value = alreadyCompletedToday;
          return;
        }
      }

      // Vérifier si un assignment existe déjà aujourd'hui
      const existing = await fetchDailyAssignment(userStore.userId, day);

      let challengeData;
      if (existing) {
        assignment.value = existing;
        challengeData = await fetchChallengeById(existing.challenge_id);
        const alreadyCompletedToday = statsStore.isCompletedDay(day);

        // Si les prefs actuelles ne correspondent plus (ou non-premium avec défi premium),
        // on remplace l'assignment du jour si le défi n'est pas déjà validé.
        const mustReplaceForPremium = !isPremium && isChallengePremium(challengeData);
        const mustReplaceForPrefs =
          !matchesPreferences(challengeData, preferredCategories, preferredLevels);

        if (!alreadyCompletedToday && (mustReplaceForPremium || mustReplaceForPrefs)) {
          let candidates = await fetchActiveChallenges();
          if (!isPremium) {
            candidates = candidates.filter((c) => !isChallengePremium(c));
          }
          candidates = candidates.filter((c) =>
            matchesPreferences(c, preferredCategories, preferredLevels),
          );

          // Fallback: si prefs trop strictes, on garde la règle premium uniquement.
          if (!candidates.length) {
            candidates = await fetchActiveChallenges();
            if (!isPremium) {
              candidates = candidates.filter((c) => !isChallengePremium(c));
            }
          }
          if (!candidates.length) {
            throw new Error("Aucun defi disponible");
          }

          const fallback = pickRandom(candidates);
          const updated = await updateDailyAssignmentChallenge(
            userStore.userId,
            day,
            fallback.id,
          );
          assignment.value = updated;
          challengeData = fallback;
        }
      } else {
        // Choisir un défi aléatoire selon premium + préférences
        let allChallenges = await fetchActiveChallenges();
        if (!isPremium) {
          allChallenges = allChallenges.filter((c) => !isChallengePremium(c));
        }
        allChallenges = allChallenges.filter((c) =>
          matchesPreferences(c, preferredCategories, preferredLevels),
        );
        // Fallback prefs trop strictes
        if (!allChallenges.length) {
          allChallenges = await fetchActiveChallenges();
          if (!isPremium) {
            allChallenges = allChallenges.filter((c) => !isChallengePremium(c));
          }
        }
        if (!allChallenges.length) throw new Error("Aucun défi disponible");

        const pick = pickRandom(allChallenges);
        const created = await createDailyAssignment(userStore.userId, day, pick.id);
        assignment.value = created;
        // If another concurrent request already created today's assignment,
        // always display the challenge actually stored in DB.
        if (created?.challenge_id && created.challenge_id !== pick.id) {
          challengeData = await fetchChallengeById(created.challenge_id);
        } else {
          challengeData = pick;
        }
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
        challenges = challenges.filter((c) => !isChallengePremium(c));
      }

      // Filtre catégories préférées
      if (settingsStore.preferredCategories?.length > 0) {
        challenges = challenges.filter((c) =>
          settingsStore.preferredCategories.includes(relationName(c.category)),
        );
      }

      // Filtre niveaux préférés
      if (settingsStore.preferredLevels?.length > 0) {
        challenges = challenges.filter((c) =>
          settingsStore.preferredLevels.includes(relationName(c.level)),
        );
      }

      // Fallback si aucun résultat après filtres
      if (!challenges.length) {
        challenges = (await fetchActiveChallenges()).filter((c) => !isChallengePremium(c));
      }

      const pick = pickRandom(challenges);
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
