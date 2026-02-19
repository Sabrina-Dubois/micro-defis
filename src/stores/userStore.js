import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getAuthUser, signOut, fetchProfile, upsertProfile } from "@/services/profileService";

export const useUserStore = defineStore("user", () => {
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const authUser = ref(null);
  const profile = ref({ username: "Username", avatar_emoji: "👤", email: "" });
  const memberSince = ref("...");
  const loading = ref(false);
  const error = ref(null);

  // ─────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────
  const isAuthenticated = computed(() => !!authUser.value);
  const userId = computed(() => authUser.value?.id);
  const userName = computed(() => profile.value.username);
  const userEmail = computed(() => profile.value.email);
  const userAvatar = computed(() => profile.value.avatar_emoji);

  // ─────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────
  async function loadUser() {
    loading.value = true;
    error.value = null;

    try {
      const user = await getAuthUser();
      authUser.value = user;
      profile.value.email = user.email;

      const createdAt = new Date(user.created_at);
      memberSince.value = createdAt.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

      const profileData = await fetchProfile(user.id);
      if (profileData) {
        profile.value.username = profileData.username || "Username";
        profile.value.avatar_emoji = profileData.avatar_emoji || "👤";
      }

      return user;
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(updates) {
    if (!authUser.value) throw new Error("Utilisateur non connecté");

    try {
      await upsertProfile(authUser.value.id, updates);
      Object.assign(profile.value, updates);
      return true;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  async function changeAvatar() {
    const avatars = [
      "🙂",
      "😙",
      "😝",
      "🤪",
      "🤓",
      "💩",
      "😎",
      "🦄",
      "🚀",
      "⭐",
      "🔥",
      "💪",
      "🌟",
      "⚡",
      "🎉",
      "🎀",
      "❤️",
      "😈",
      "🫶🏼",
      "🐾",
      "🖕🏼",
      "🫦",
      "🐙",
      "🐣",
      "🐿️",
      "🌵",
      "🩵",
      "💙",
      "🧡",
      "💛",
      "💜",
      "🤎",
      "🖤",
      "🩶",
      "🤍",
      "🩷",
      "💘",
    ];
    const currentIdx = avatars.indexOf(profile.value.avatar_emoji);
    const nextAvatar = avatars[(currentIdx + 1) % avatars.length];
    await updateProfile({ avatar_emoji: nextAvatar });
    return nextAvatar;
  }

  async function logout() {
    await signOut();
    reset();
  }

  function reset() {
    authUser.value = null;
    profile.value = { username: "Username", avatar_emoji: "👤", email: "" };
    memberSince.value = "...";
    loading.value = false;
    error.value = null;
  }

  // ─────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────
  return {
    authUser,
    profile,
    memberSince,
    loading,
    error,
    isAuthenticated,
    userId,
    userName,
    userEmail,
    userAvatar,
    loadUser,
    updateProfile,
    changeAvatar,
    logout,
    reset,
  };
});
