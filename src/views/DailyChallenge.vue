<template>
  <div class="daily-page">
    <template v-if="isPageReady">
      <!-- Top -->
      <div class="top">
        <div class="page-title">
          {{ t("daily.title") }}<br /> {{ userName }}
        </div>
      </div>

      <!-- Carte du défi -->
      <v-card class="micro-card card-challenge pa-5 mb-4">
        <div class="page-subtitle text-center"
          style="font-size: 30px !important; font-weight: 600; margin-bottom: 12px;">
          {{ t("daily.challenge") }}
        </div>

        <!-- Chips niveau + catégorie -->
        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 10px;">
          <v-chip color="primary" variant="flat" size="small">
            {{ t("daily.level") }} {{ challengeStore.challengeLevel }}
          </v-chip>
          <v-chip color="deep-purple" variant="flat" size="small">
            {{ challengeStore.challengeCategory }}
          </v-chip>
        </div>

        <!-- Erreur -->
        <div v-if="challengeStore.error" style="color: #ef4444; font-weight: 700">
          {{ challengeStore.error }}
        </div>

        <!-- Contenu -->
        <div v-else class="challenge-content">
          <div class="challenge-title">
            <template v-if="challengeStore.loading">
              <div class="skeleton-line skeleton-title"></div>
            </template>
            <template v-else>
              {{ challengeStore.challengeTitle }}
            </template>
          </div>

          <template v-if="challengeStore.loading">
            <div class="challenge-description">
              <div class="skeleton-line skeleton-text"></div>
              <div class="skeleton-line skeleton-text short"></div>
            </div>
          </template>
          <template v-else-if="challengeStore.challengeDescription">
            <div class="challenge-description mb-3">
              {{ challengeStore.challengeDescription }}
            </div>
          </template>
        </div>

        <!-- Bouton action -->
        <v-btn block class="mt-2 challenge-action-btn" :class="challengeStore.isDone ? 'btn-success' : 'btn-primary'"
          :disabled="challengeStore.loading" @click="markDone">
          <template v-if="challengeStore.isDone">
            <v-icon size="28">mdi-check-bold</v-icon>
          </template>
          <template v-else>{{ t("daily.todo") }}</template>
        </v-btn>
      </v-card>

      <!-- Carte des flammes / shields / partage -->
      <v-card class="micro-card pa-5 mt-4">
        <div class="share-visual">

          <!-- Flammes -->
          <div class="flames-display">
            🔥 {{ statsStore.currentStreak }}
          </div>

          <!-- 🕯️ Torches (Premium uniquement) -->
          <div class="shields-display" :class="{ locked: !isPremium }">
            <div class="shields-icons">
              <span v-for="i in 3" :key="i" class="shield-icon" :class="{ empty: i > streakShields }">
                {{ i > streakShields ? "🧯" : "🕯️" }}
              </span>
            </div>
            <div class="shields-label">
              <template v-if="!isPremium">
                🔒 Torches réservées au Premium
              </template>
              <template v-else-if="streakShields > 0">
                {{ streakShields }} torche{{ streakShields > 1 ? 's' : '' }} disponible{{
                  streakShields > 1 ? 's' : '' }}
              </template>
              <template v-else>
                Plus de torches · complète des défis pour en gagner
              </template>
            </div>
          </div>

        </div>
        <v-btn class="btn-primary mt-4" block @click="$router.push('/share')">
          {{ t("daily.share") }}
        </v-btn>
      </v-card>

      <div>Torches affichées dans le store : {{ streakShields }}</div>

      <!-- Bouton PWA -->
      <PWAButton />
    </template>
    <template v-else>
      <FlameLoader />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import PWAButton from "@/components/PWAButton.vue";
import FlameLoader from "@/components/FlameLoader.vue";

import { useUserStore } from "@/stores/userStore";
import { useStatsStore } from "@/stores/statsStore";
import { useChallengeStore } from "@/stores/challengeStore";
import { useSettingsStore } from "@/stores/settingsStore";

const { t } = useI18n();

// ─────────────────────────────────────────
// STORES
// ─────────────────────────────────────────
const userStore = useUserStore();
const { streakShields, isPremium, userName } = storeToRefs(userStore);
// → On utilise storeToRefs pour avoir une vraie réactivité

const statsStore = useStatsStore();
const challengeStore = useChallengeStore();
const settingsStore = useSettingsStore();

// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────
const isPageReady = ref(false);
const currentLocalDay = ref("");
let dayWatcherTimer = null;
let visibilityRefreshTimer = null;
let lastVisibilityRefresh = 0;
const VISIBILITY_REFRESH_INTERVAL = 30 * 1000;

function getLocalISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────
async function refreshForNewDayIfNeeded() {
  const nowDay = getLocalISODate();
  if (!currentLocalDay.value) { currentLocalDay.value = nowDay; return; }
  if (currentLocalDay.value === nowDay) return;
  currentLocalDay.value = nowDay;
  await challengeStore.loadTodayChallenge();
  await statsStore.loadCompletions();
}

async function refreshOnVisibility() {
  if (typeof document === "undefined") return;
  if (document.visibilityState !== "visible") return;
  if (!userStore.userId) return;
  if (challengeStore.loading) return;
  const now = Date.now();
  if (now - lastVisibilityRefresh < VISIBILITY_REFRESH_INTERVAL) return;
  lastVisibilityRefresh = now;
  try {
    await challengeStore.loadTodayChallenge();
    await statsStore.loadCompletions();
  } catch (e) {
    console.error("❌ Erreur refreshVisibility:", e);
  }
}

function handleVisibilityChange() {
  if (visibilityRefreshTimer) clearTimeout(visibilityRefreshTimer);
  visibilityRefreshTimer = setTimeout(refreshOnVisibility, 100);
}

async function markDone() {
  if (challengeStore.isDone) return;
  try {
    await challengeStore.markAsCompleted();
    // 🆕 on recharge le profil après la complétion
    await userStore.loadUser();
  } catch (e) {
    console.error("❌ Erreur markDone:", e);
  }
}

// ─────────────────────────────────────────
// MOUNT / UNMOUNT
// ─────────────────────────────────────────
onMounted(async () => {
  try {
    await userStore.loadUser();  // charge bien le profil avec streak_shields
    await statsStore.loadCompletions();
    await settingsStore.loadPreferences();
    await challengeStore.loadTodayChallenge();
    currentLocalDay.value = getLocalISODate();
    dayWatcherTimer = setInterval(refreshForNewDayIfNeeded, 60000);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    handleVisibilityChange();
  } catch (e) {
    console.error("❌ Erreur chargement:", e);
  } finally {
    isPageReady.value = true;
  }
});

onUnmounted(() => {
  if (dayWatcherTimer) clearInterval(dayWatcherTimer);
  if (visibilityRefreshTimer) clearTimeout(visibilityRefreshTimer);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.removeEventListener("focus", handleVisibilityChange);
});
</script>

<style scoped>
.top {
  margin: 6px 0 14px;
}

.card-challenge {
  min-height: 260px;
  height: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
}

.micro-card {
  border-radius: 24px;
  overflow: visible;
  position: relative;
  z-index: 100;
}

.challenge-title {
  font-size: 30px;
  font-weight: 800;
  color: var(--text-primary) !important;
  margin-bottom: 6px;
  text-align: center;
  line-height: 1.2;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.challenge-description {
  font-size: 20px;
  color: var(--text-secondary) !important;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.challenge-content {
  flex: 1;
}

.challenge-action-btn {
  margin-top: auto !important;
}

/* Flammes */
.flames-display {
  text-align: center;
  font-size: 46px;
  line-height: 1;
}

/* Torches */
.shields-display {
  text-align: center;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02));
}

.shields-display.locked {
  border-color: rgba(148, 163, 184, 0.25);
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.12), rgba(148, 163, 184, 0.04));
}

.shields-icons {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 6px;
}

.shield-icon {
  font-size: 31px;
  transition: opacity 0.3s, filter 0.3s;
}

/* Slot vide : extincteur lisible */
.shield-icon.empty {
  opacity: 0.95;
  filter: grayscale(0.1);
}

.shields-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

/* Skeletons */
.skeleton-line {
  height: 22px;
  border-radius: 999px;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05),
      rgba(255, 255, 255, 0.1));
  background-size: 200% 100%;
  animation: skeletonPulse 1.2s linear infinite;
}

.skeleton-title {
  width: 60%;
  margin: 0 auto;
  min-height: 26px;
}

.skeleton-text {
  width: 80%;
  margin: 8px auto;
  min-height: 18px;
}

.skeleton-text.short {
  width: 50%;
}

@keyframes skeletonPulse {
  to {
    background-position: -200% 0;
  }
}
</style>
