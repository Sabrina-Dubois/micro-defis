import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { getAuthUser, signOut, fetchProfile, upsertProfile } from "@/services/profileService";

const AVATAR_OPTIONS = [
  "🙂","😙","😝","🤪","🤓","😎","💩","🦄","🚀","⭐","🔥","💪","⚡","🎉","🎀","❤️","🤍","🤎","🩷","💙","🧡","💛","💜","🖤","💚","🩶","🖕🏼","🫶🏼","🫦","🐾","🐙","🐣","🐿️","🌵","🌈","🧠","🎧","📱","📸","🧇","💫","🕊️","☀️","🌙","⛰️","🏝️","🍀","🍓","🍍","☕","🧋",
];

export const useUserStore = defineStore("user", () => {
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const authUser = ref(null);
  const profile = ref({ username: "Username", avatar_emoji: "👤", email: "", premium: false });
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
  const isPremium = computed(() => profile.value.premium);

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
        profile.value.premium = profileData.premium || false;
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
    const currentIdx = AVATAR_OPTIONS.indexOf(profile.value.avatar_emoji);
    const nextAvatar = AVATAR_OPTIONS[(currentIdx + 1) % AVATAR_OPTIONS.length];
    await updateProfile({ avatar_emoji: nextAvatar });
    return nextAvatar;
  }

  async function logout() {
    try {
      await signOut();
    } finally {
      reset();
    }
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
    isPremium,
    loadUser,
    updateProfile,
    changeAvatar,
    logout,
    reset,
  };
});
