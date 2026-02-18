import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useUserStore } from "./userStore";
import {
  fetchPreferences,
  upsertPreferences,
  fetchCategories,
  fetchLevels,
  savePushSubscription,
  deletePushSubscription,
  updatePushReminderTime,
} from "@/services/settingsService";
import { fetchPremiumStatus } from "@/services/profileService";

export const useSettingsStore = defineStore("settings", () => {
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i += 1) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function localReminderToUtc(reminderTime) {
    const [hours, minutes] = (reminderTime || "20:00").split(":").map(Number);
    const date = new Date();
    date.setHours(Number.isFinite(hours) ? hours : 20, Number.isFinite(minutes) ? minutes : 0, 0, 0);
    return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
  }

  function getCurrentTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const preferences = ref({
    notifications_enabled: false,
    reminder_time: "20:00",
    pref_category: [],
    pref_level: [],
    language: "fr",
    theme: "light",
    premium_active: false,
  });

  const categories = ref([]);
  const levels = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // ─────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────
  const notificationsEnabled = computed(() => preferences.value.notifications_enabled);
  const reminderTime = computed(() => preferences.value.reminder_time);
  const preferredCategories = computed(() => preferences.value.pref_category);
  const preferredLevels = computed(() => preferences.value.pref_level);
  const language = computed(() => preferences.value.language);
  const theme = computed(() => preferences.value.theme);
  const isPremium = computed(() => preferences.value.premium_active ?? false);
  const languageLabel = computed(() => (preferences.value.language === "fr" ? "Français" : "English"));
  const themeLabel = computed(() => (preferences.value.theme === "dark" ? "Sombre" : "Clair"));

  // ─────────────────────────────────────────
  // ACTIONS — CHARGEMENT
  // ─────────────────────────────────────────
  async function loadPreferences() {
    const userStore = useUserStore();
    if (!userStore.userId) return;

    loading.value = true;
    error.value = null;

    try {
      const data = await fetchPreferences(userStore.userId);
      if (data) {
        preferences.value = {
          notifications_enabled: data.notifications_enabled ?? false,
          reminder_time: data.reminder_time ?? "20:00",
          pref_category: data.pref_category ?? [],
          pref_level: data.pref_level ?? [],
          language: data.language ?? "fr",
          theme: data.theme ?? "light",
          premium_active: data.premium_active ?? false,
        };
      }

      // Vérifier le statut premium depuis user_profiles
      const premium = await fetchPremiumStatus(userStore.userId);
      preferences.value.premium_active = premium;

      // Maintient push_subscriptions aligné sur l'UTC courant (timezone/DST).
      if (preferences.value.notifications_enabled) {
        const utcReminderTime = localReminderToUtc(preferences.value.reminder_time);
        await updatePushReminderTime(
          userStore.userId,
          utcReminderTime,
          preferences.value.reminder_time,
          getCurrentTimeZone(),
        );
      }

      return preferences.value;
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function loadCategories() {
    try {
      categories.value = await fetchCategories();
    } catch (e) {
      console.error("Erreur loadCategories:", e);
      categories.value = [];
    }
  }

  async function loadLevels() {
    try {
      levels.value = await fetchLevels();
    } catch (e) {
      console.error("Erreur loadLevels:", e);
      levels.value = [];
    }
  }

  // ─────────────────────────────────────────
  // ACTIONS — MISE À JOUR
  // ─────────────────────────────────────────
  async function updatePreference(key, value) {
    const userStore = useUserStore();
    if (!userStore.userId) throw new Error("Utilisateur non connecté");

    try {
      await upsertPreferences(userStore.userId, { [key]: value });
      preferences.value[key] = value;
      return true;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  async function updateMultiplePreferences(updates) {
    const userStore = useUserStore();
    if (!userStore.userId) throw new Error("Utilisateur non connecté");

    try {
      await upsertPreferences(userStore.userId, updates);
      Object.assign(preferences.value, updates);
      return true;
    } catch (e) {
      error.value = e.message;
      throw e;
    }
  }

  // ─────────────────────────────────────────
  // ACTIONS — HELPERS
  // ─────────────────────────────────────────
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
    return await setTheme(newTheme);
  }

  async function setReminderTime(time) {
    await updatePreference("reminder_time", time);
    const userStore = useUserStore();
    if (preferences.value.notifications_enabled && userStore.userId) {
      const utcReminderTime = localReminderToUtc(time);
      await updatePushReminderTime(userStore.userId, utcReminderTime, time, getCurrentTimeZone());
    }
    return time;
  }

  async function setChallengePreferences(cats, levs) {
    await updateMultiplePreferences({ pref_category: cats, pref_level: levs });
    return { cats, levs };
  }

  // ─────────────────────────────────────────
  // ACTIONS — PUSH NOTIFICATIONS
  // ─────────────────────────────────────────
  async function getServiceWorkerRegistration() {
    if (!("serviceWorker" in navigator)) return null;

    let registration = await navigator.serviceWorker.getRegistration("/sw.js");
    if (!registration) {
      registration = await navigator.serviceWorker.getRegistration();
    }
    if (!registration) {
      registration = await navigator.serviceWorker.register("/sw.js");
    }
    return registration;
  }

  async function subscribeToPush() {
    const userStore = useUserStore();

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const registration = await getServiceWorkerRegistration();
    if (!registration) return null;

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) throw new Error("VITE_VAPID_PUBLIC_KEY manquante");

    const existingSubscription = await registration.pushManager.getSubscription();
    const subscription =
      existingSubscription ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      }));
console.log("5. sauvegarde dans Supabase...");
    const utcReminderTime = localReminderToUtc(preferences.value.reminder_time);
    await savePushSubscription(
      userStore.userId,
      subscription,
      utcReminderTime,
      preferences.value.reminder_time,
      getCurrentTimeZone(),
    );
console.log("6. sauvegarde OK !");
    return subscription;
  }

  async function sendLocalNotificationTest() {
    const registration = await getServiceWorkerRegistration();
    if (!registration) return;
    await registration.showNotification("✅ Test notification locale", {
      body: "Si tu vois ça, ton téléphone peut afficher les notifications.",
      icon: "/images/microdefis-logo-192.png",
      badge: "/images/microdefis-logo-192.png",
      data: { url: "/settings" },
      tag: "local-test",
      renotify: true,
    });
  }

  async function unsubscribeFromPush() {
    const userStore = useUserStore();

    const registration = await getServiceWorkerRegistration();
    if (registration) {
      const sub = await registration.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
    }

    await deletePushSubscription(userStore.userId);
  }

async function toggleNotifications(value) {
  console.log("1. toggleNotifications appelé avec:", value);
  await updatePreference("notifications_enabled", value);
  console.log("2. préférence sauvegardée");

  if (value) {
    console.log("3. tentative subscribeToPush");
    const sub = await subscribeToPush();
    console.log("4. résultat subscribeToPush:", sub);
    if (!sub) {
      await updatePreference("notifications_enabled", false);
    }
  } else {
    console.log("3. tentative unsubscribeFromPush");
    await unsubscribeFromPush();
  }

  return value;
}

  // ─────────────────────────────────────────
  // THEME LOCAL STORAGE
  // ─────────────────────────────────────────
  function initThemeFromLocalStorage() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      preferences.value.theme = savedTheme;
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }

  function reset() {
    preferences.value = {
      notifications_enabled: false,
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

  // ─────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────
  return {
    preferences,
    categories,
    levels,
    loading,
    error,
    notificationsEnabled,
    reminderTime,
    preferredCategories,
    preferredLevels,
    language,
    theme,
    isPremium,
    languageLabel,
    themeLabel,
    loadPreferences,
    loadCategories,
    loadLevels,
    updatePreference,
    updateMultiplePreferences,
    setLanguage,
    setTheme,
    toggleTheme,
    setReminderTime,
    setChallengePreferences,
    toggleNotifications,
    subscribeToPush,
    sendLocalNotificationTest,
    unsubscribeFromPush,
    initThemeFromLocalStorage,
    reset,
  };
});
