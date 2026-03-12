<template>
  <div class="daily-page">
    <template v-if="isPageReady">

      <!-- 🛡️ Modale torche -->
      <v-dialog v-model="showShieldModal" max-width="340" persistent>
        <v-card class="shield-modal pa-6 text-center">
          <div class="modal-fire">🔥</div>
          <div class="modal-title">{{ t("daily.shield_modal.title") }}</div>
          <div class="modal-desc">
            {{ t("daily.shield_modal.desc_prefix") }}
            <strong>
              {{ statsStore.currentStreak }}
              {{ statsStore.currentStreak > 1 ? t("common.day_plural") : t("common.day_singular") }}
            </strong>
            {{ t("daily.shield_modal.desc_suffix") }}
          </div>
          <div class="modal-torch-info">
            {{ t("daily.shield_modal.torch_prefix") }}
            <strong>
              {{ streakShields }}
              {{ streakShields > 1 ? t("common.torch_plural") : t("common.torch_singular") }}
            </strong>
            {{ streakShields > 1 ? t("common.available_plural") : t("common.available_singular") }}
          </div>
          <v-btn class="btn-primary mt-4" block :loading="shieldLoading" @click="activateShield">
            🕯️ {{ t("daily.shield_modal.use_button") }}
          </v-btn>
          <v-btn variant="text" block class="mt-2 btn-decline" @click="declineShield">
            {{ t("daily.shield_modal.decline_button") }}
          </v-btn>
        </v-card>
      </v-dialog>

      <!-- Toast confirmation -->
      <v-snackbar v-model="showShieldToast" color="deep-orange" timeout="3000" location="top">
        {{ t("daily.shield_toast") }}
      </v-snackbar>

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

        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 10px;">
          <v-chip color="primary" variant="flat" size="small">
            {{ t("daily.level") }} {{ challengeStore.challengeLevel }}
          </v-chip>
          <v-chip color="deep-purple" variant="flat" size="small">
            {{ challengeStore.challengeCategory }}
          </v-chip>
        </div>

        <div v-if="challengeStore.error" style="color: #ef4444; font-weight: 700">
          {{ challengeStore.error }}
        </div>

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

        <v-btn block class="mt-2 challenge-action-btn" :class="challengeStore.isDone ? 'btn-success' : 'btn-primary'"
          :disabled="challengeStore.loading" @click="markDone">
          <template v-if="challengeStore.isDone">
            <v-icon size="28">mdi-check-bold</v-icon>
          </template>
          <template v-else>{{ t("daily.todo") }}</template>
        </v-btn>
      </v-card>

      <!-- Carte flammes + torches -->
      <v-card class="micro-card pa-5 mt-4">
        <div class="share-visual">

          <div class="flames-display">
            🔥 {{ statsStore.currentStreak }}
          </div>

          <div class="shields-display" :class="{ locked: !isPremium }">
            <div class="shields-icons">
              <span v-for="i in 3" :key="i" class="shield-icon" :class="{ empty: i > streakShields }">
                {{ i > streakShields ? "🧯" : "🕯️" }}
              </span>
            </div>
            <div class="shields-label">
              <template v-if="!isPremium">
                {{ t("daily.shields.premium_locked") }}
              </template>
              <template v-else-if="streakShields > 0">
                {{ streakShields }}
                {{ streakShields > 1 ? t("common.torch_plural") : t("common.torch_singular") }}
                {{ streakShields > 1 ? t("common.available_plural") : t("common.available_singular") }}
              </template>
              <template v-else>
                {{ t("daily.shields.none") }}
              </template>
            </div>
          </div>

        </div>
        <v-btn class="btn-primary mt-4" block @click="$router.push('/share')">
          {{ t("daily.share") }}
        </v-btn>
      </v-card>

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

const userStore = useUserStore();
const { streakShields, isPremium, userName } = storeToRefs(userStore);

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

// 🛡️ Shield modal
const showShieldModal = ref(false);
const showShieldToast = ref(false);
const shieldLoading = ref(false);

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function getLocalISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─────────────────────────────────────────
// SHIELD LOGIC
// ─────────────────────────────────────────
function checkShieldOffer() {
  if (!isPremium.value) return;
  if (streakShields.value <= 0) return;
  if (statsStore.checkMissedDay()) {
    showShieldModal.value = true;
  }
}

async function activateShield() {
  shieldLoading.value = true;
  try {
    const success = await statsStore.useShield();
    if (success) {
      showShieldModal.value = false;
      showShieldToast.value = true;
      await statsStore.loadCompletions(); // ← est-ce que cette ligne est bien là ?
    }
  } finally {
    shieldLoading.value = false;
  }
}

function declineShield() {
  statsStore.markDeclinedToday(userStore.userId); // 👈 ajoute cette ligne
  showShieldModal.value = false;
}

// ─────────────────────────────────────────
// REFRESH LOGIC
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
    await userStore.loadUser();
  } catch (e) {
    console.error("❌ Erreur markDone:", e);
  }
}

// ─────────────────────────────────────────
// LIFECYCLE
// ─────────────────────────────────────────
onMounted(async () => {
  try {
    await userStore.loadUser();
    await statsStore.loadCompletions();
    await settingsStore.loadPreferences();
    await challengeStore.loadTodayChallenge();
    currentLocalDay.value = getLocalISODate();

    // 🛡️ Vérifie si on doit proposer une torche
    checkShieldOffer();

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

.shield-icon.empty {
  opacity: 0.95;
  filter: grayscale(0.1);
}

.shields-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
}

/* Modale */
.shield-modal {
  border-radius: 24px !important;
}

.modal-fire {
  font-size: 56px;
  margin-bottom: 12px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.15);
  }
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.modal-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.modal-torch-info {
  font-size: 14px;
  padding: 10px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.btn-decline {
  font-size: 12px;
  color: var(--text-secondary) !important;
  opacity: 0.7;
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
