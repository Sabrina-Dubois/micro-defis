import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useUserStore } from "./userStore";
import { fetchAllCompletions, insertCompletion } from "@/services/statsService";

export const useStatsStore = defineStore("stats", () => {
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const completions = ref([]);
  const completedDaysSet = ref(new Set());
  const currentStreak = ref(0);
  const bestStreak = ref(0);
  const totalCompleted = ref(0);
  const loading = ref(false);
  const error = ref(null);
  const levelTitles = [
    { min: 1, title: "Recrue", icon: "🌱" },
    { min: 5, title: "Challenger", icon: "⚡" },
    { min: 10, title: "Explorateur", icon: "🧭" },
    { min: 20, title: "Aventurier", icon: "🔥" },
    { min: 35, title: "Expert", icon: "💪" },
    { min: 50, title: "Maître", icon: "🏆" },
    { min: 75, title: "Légende", icon: "⭐" },
  ];

  // ─────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────
  const userLevel = computed(() => Math.floor((totalCompleted.value * 15) / 100) + 1);
  const xpCurrentDisplay = computed(() => (totalCompleted.value * 15) % 100);
  const xpNext = computed(() => 100);
  const xpProgress = computed(() => (xpCurrentDisplay.value / xpNext.value) * 100);
  const xpRemaining = computed(() => xpNext.value - xpCurrentDisplay.value);
  const userTitle = computed(() => {
    const level = userLevel.value;
    return [...levelTitles].reverse().find((t) => level >= t.min) || levelTitles[0];
  });

  // ─────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────
  async function loadCompletions() {
    const userStore = useUserStore();

    // Attendre que l'utilisateur soit chargé si besoin
    if (!userStore.userId) {
      await new Promise((resolve) => {
        const stop = watch(
          () => userStore.userId,
          (val) => {
            if (val) {
              stop();
              resolve();
            }
          },
        );
      });
    }

    loading.value = true;
    error.value = null;

    try {
      const data = await fetchAllCompletions(userStore.userId);

      completions.value = data;
      totalCompleted.value = data.length;
      completedDaysSet.value = new Set(data.map((c) => c.day));

      calculateStreaks();
      return data;
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function calculateStreaks() {
    if (!completions.value.length) {
      currentStreak.value = 0;
      bestStreak.value = 0;
      return;
    }

    const days = completions.value.map((c) => new Date(c.day)).sort((a, b) => b - a);

    // Streak actuel
    let streak = 0;
    let previousDate = null;
    for (const d of days) {
      if (!previousDate) {
        previousDate = d;
        streak = 1;
      } else {
        const diff = (previousDate - d) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          streak++;
          previousDate = d;
        } else break;
      }
    }
    currentStreak.value = streak;

    // Meilleur streak
    let maxStreak = 0;
    let tempStreak = 1;
    for (let i = 0; i < days.length - 1; i++) {
      const diff = (days[i] - days[i + 1]) / (1000 * 60 * 60 * 24);
      if (diff === 1) tempStreak++;
      else tempStreak = 1;
      maxStreak = Math.max(maxStreak, tempStreak);
    }
    bestStreak.value = Math.max(maxStreak, currentStreak.value);
  }

  async function addCompletion(day, challengeId) {
    const userStore = useUserStore();
    if (!userStore.userId) throw new Error("Utilisateur non connecté");

    try {
      await insertCompletion(userStore.userId, day, challengeId);
      await loadCompletions();
      window.dispatchEvent(new CustomEvent("challenge-completed"));
      return true;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  function isCompletedDay(day) {
    return completedDaysSet.value.has(day);
  }

  function getLast7Days() {
    const labelMap = ["D", "L", "M", "M", "J", "V", "S"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().slice(0, 10);
      return { label: labelMap[d.getDay()], completed: completedDaysSet.value.has(ds), date: ds };
    });
  }

  function reset() {
    completions.value = [];
    completedDaysSet.value = new Set();
    currentStreak.value = 0;
    bestStreak.value = 0;
    totalCompleted.value = 0;
    loading.value = false;
    error.value = null;
  }

  // ─────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────
  return {
    completions,
    completedDaysSet,
    currentStreak,
    bestStreak,
    totalCompleted,
    loading,
    error,
    userLevel,
    xpCurrentDisplay,
    xpNext,
    xpProgress,
    xpRemaining,
    userTitle,
    loadCompletions,
    calculateStreaks,
    addCompletion,
    isCompletedDay,
    getLast7Days,
    reset,
  };
});
