import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "./userStore";

export const useStatsStore = defineStore("stats", () => {
  // State
  const completions = ref([]);
  const completedDaysSet = ref(new Set());
  const currentStreak = ref(0);
  const bestStreak = ref(0);
  const totalCompleted = ref(0);
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const userLevel = computed(() => {
    const xpTotal = totalCompleted.value * 15;
    return Math.floor(xpTotal / 100) + 1;
  });

  const xpCurrentDisplay = computed(() => {
    const xpTotal = totalCompleted.value * 15;
    return xpTotal % 100;
  });

  const xpNext = computed(() => 100);

  const xpProgress = computed(() => {
    return (xpCurrentDisplay.value / xpNext.value) * 100;
  });

  const xpRemaining = computed(() => {
    return xpNext.value - xpCurrentDisplay.value;
  });

  // Actions
  async function loadCompletions() {
    const userStore = useUserStore();

    if (!userStore.userId) {
      console.warn("Utilisateur non connecté");
      return;
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

      // Calculer les streaks
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
    console.log("🔍 calculateStreaks - completions:", completions.value);

    if (!completions.value || completions.value.length === 0) {
      console.log("❌ Pas de completions");
      currentStreak.value = 0;
      bestStreak.value = 0;
      return;
    }

    // ===== STREAK ACTUEL =====
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    console.log("🔍 today:", today);
    console.log("🔍 yesterday:", yesterdayStr);
    console.log("🔍 first completion:", completions.value[0]?.day);

    // Détermine le point de départ : aujourd'hui ou hier
    let expectedDay;
    if (completions.value[0]?.day === today) {
      // Il y a une complétion aujourd'hui, on commence par aujourd'hui
      expectedDay = today;
      console.log("✅ Défi complété aujourd'hui, streak commence aujourd'hui");
    } else if (completions.value[0]?.day === yesterdayStr) {
      // Il y a une complétion hier mais pas aujourd'hui, on commence par hier
      expectedDay = yesterdayStr;
      console.log("✅ Défi complété hier, streak commence hier");
    } else {
      // Aucune complétion aujourd'hui ni hier = streak cassé
      console.log("❌ Aucune complétion aujourd'hui ni hier = streak cassé");
      currentStreak.value = 0;

      // Continue pour calculer le best streak
      let maxStreak = 0;
      let tempStreak = 1;

      for (let i = 0; i < completions.value.length - 1; i++) {
        const current = new Date(completions.value[i].day);
        const next = new Date(completions.value[i + 1].day);
        const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          maxStreak = Math.max(maxStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }

      bestStreak.value = Math.max(maxStreak, 1);
      console.log("✅ Final bestStreak:", bestStreak.value);
      return;
    }

    // Calcule le streak à partir du point de départ
    for (const comp of completions.value) {
      console.log("🔍 Comparing:", comp.day, "vs", expectedDay);

      if (comp.day === expectedDay) {
        streak++;
        console.log("✅ Match! Streak:", streak);
        const d = new Date(expectedDay);
        d.setDate(d.getDate() - 1);
        expectedDay = d.toISOString().slice(0, 10);
        console.log("🔍 Next expectedDay:", expectedDay);
      } else {
        console.log("❌ Break streak");
        break;
      }
    }

    console.log("✅ Final currentStreak:", streak);
    currentStreak.value = streak;

    // ===== BEST STREAK =====
    let maxStreak = streak; // Le streak actuel peut être le meilleur
    let tempStreak = 1;

    for (let i = 0; i < completions.value.length - 1; i++) {
      const current = new Date(completions.value[i].day);
      const next = new Date(completions.value[i + 1].day);
      const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    console.log("✅ Final bestStreak:", maxStreak);
    bestStreak.value = maxStreak;
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

      // Recharger les stats
      await loadCompletions();

      // Émettre un événement global
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

    function getLocalDateString(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = getLocalDateString(d);

      const dayNum = d.getDay();
      const labelMap = ["D", "L", "M", "M", "J", "V", "S"];

      last7Days.push({
        label: labelMap[dayNum],
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
