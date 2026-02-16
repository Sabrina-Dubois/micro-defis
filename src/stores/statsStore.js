import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "./userStore";

export const useStatsStore = defineStore("stats", () => {
  // ===== STATE =====
  const completions = ref([]);
  const completedDaysSet = ref(new Set());
  const currentStreak = ref(0);
  const bestStreak = ref(0);
  const totalCompleted = ref(0);
  const loading = ref(false);
  const error = ref(null);

  // ===== GETTERS =====
  const userLevel = computed(() => Math.floor((totalCompleted.value * 15) / 100) + 1);
  const xpCurrentDisplay = computed(() => (totalCompleted.value * 15) % 100);
  const xpNext = computed(() => 100);
  const xpProgress = computed(() => (xpCurrentDisplay.value / xpNext.value) * 100);
  const xpRemaining = computed(() => xpNext.value - xpCurrentDisplay.value);

  // ===== ACTIONS =====
  async function loadCompletions() {
    const userStore = useUserStore();

    // ⚡ Attendre que l'utilisateur soit chargé
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
      const { data, error: fetchError } = await supabase
        .from("daily_completions")
        .select("day, challenge_id")
        .eq("user_id", userStore.userId)
        .order("day", { ascending: false });

      if (fetchError) throw fetchError;

      completions.value = data || [];
      totalCompleted.value = completions.value.length;
      completedDaysSet.value = new Set(completions.value.map((c) => c.day));

      calculateStreaks();

      return data;
    } catch (e) {
      error.value = e.message;
      console.error("Erreur loadCompletions:", e);
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

    const days = completions.value.map((c) => new Date(c.day));
    days.sort((a, b) => b - a); // du plus récent au plus ancien

    // ===== Calcul streak actuel =====
    const todayStr = new Date().toISOString().slice(0, 10);
    let streak = 0;
    let expectedDate = new Date(todayStr);

    for (const d of days) {
      const dStr = d.toISOString().slice(0, 10);
      if (dStr === expectedDate.toISOString().slice(0, 10)) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    currentStreak.value = streak;

    // ===== Calcul best streak =====
    let maxStreak = 0;
    let tempStreak = 1;
    for (let i = 0; i < days.length - 1; i++) {
      const diffDays = Math.floor((days[i] - days[i + 1]) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      maxStreak = Math.max(maxStreak, tempStreak);
    }
    bestStreak.value = Math.max(maxStreak, currentStreak.value);
  }

  async function addCompletion(day, challengeId) {
    const userStore = useUserStore();

    if (!userStore.userId) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      const { error: insertError } = await supabase.from("daily_completions").insert({
        user_id: userStore.userId,
        day,
        challenge_id: challengeId,
      });

      if (insertError) throw insertError;

      // Recharge les stats
      await loadCompletions();

      // Événement global
      window.dispatchEvent(new CustomEvent("challenge-completed"));

      return true;
    } catch (e) {
      error.value = e.message;
      console.error("Erreur addCompletion:", e);
      throw e;
    }
  }

  function isCompletedDay(day) {
    return completedDaysSet.value.has(day);
  }

  function getLast7Days() {
    const last7Days = [];
    const labelMap = ["D", "L", "M", "M", "J", "V", "S"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      last7Days.push({
        label: labelMap[d.getDay()],
        completed: completedDaysSet.value.has(ds),
        date: ds,
      });
    }

    return last7Days;
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

  return {
    // State
    completions,
    completedDaysSet,
    currentStreak,
    bestStreak,
    totalCompleted,
    loading,
    error,

    // Getters
    userLevel,
    xpCurrentDisplay,
    xpNext,
    xpProgress,
    xpRemaining,

    // Actions
    loadCompletions,
    calculateStreaks,
    addCompletion,
    isCompletedDay,
    getLast7Days,
    reset,
  };
});
