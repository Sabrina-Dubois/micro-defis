// Store global utilisateur : profil (username, avatar, catégories)
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { profileService } from "@/services/profileService";

export const useUserStore = defineStore("user", () => {
  // 📊 État (données)
  const profile = ref(null);
  const username = ref("Username");
  const avatar = ref("🙂");
  const favoriteCategories = ref(["Santé", "Créativité", "Social"]);
  const loading = ref(false);

  // 🔢 Computed (calculés automatiquement)
  const currentStreak = computed(() => profile.value?.current_streak || 0);
  const totalCompleted = computed(() => profile.value?.total_completed || 0);
  const level = computed(() => Math.floor(totalCompleted.value / 10) + 1);

  // 🔧 Actions (fonctions)
  async function loadProfile() {
    loading.value = true;
    try {
      const data = await profileService.getProfile();
      if (data) {
        profile.value = data;
        username.value = data.username;
        avatar.value = data.avatar_emoji;
        favoriteCategories.value = data.favorite_categories || [];
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    } finally {
      loading.value = false;
    }
  }

  async function updateAvatar(emoji) {
    const success = await profileService.updateAvatar(emoji);
    if (success) {
      avatar.value = emoji;
    }
    return success;
  }

  async function updateUsername(newUsername) {
    const success = await profileService.updateUsername(newUsername);
    if (success) {
      username.value = newUsername;
    }
    return success;
  }

  async function updateFavoriteCategories(categories) {
    const success = await profileService.updateFavoriteCategories(categories);
    if (success) {
      favoriteCategories.value = categories;
    }
    return success;
  }

  return {
    // État
    profile,
    username,
    avatar,
    favoriteCategories,
    loading,
    // Computed
    currentStreak,
    totalCompleted,
    level,
    // Actions
    loadProfile,
    updateAvatar,
    updateUsername,
    updateFavoriteCategories,
  };
});
