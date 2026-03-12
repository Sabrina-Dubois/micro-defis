<template>
  <section class="admin-page">
    <header class="admin-header">
      <div class="header-left">
        <h1 class="admin-title">{{ t("admin.title") }}</h1>
        <p class="admin-subtitle">{{ t("admin.subtitle") }}</p>
      </div>
      <div class="range-switch" role="group" :aria-label="t('admin.range_label')">
        <button v-for="range in ranges" :key="range.value" class="range-btn"
          :class="{ active: selectedRange === range.value }" type="button" @click="selectedRange = range.value">
          {{ range.label }}
        </button>
      </div>
    </header>

    <div v-if="loading" class="loading">{{ t("admin.loading") }}</div>
    <div v-else-if="error" class="error">{{ t("admin.error", { error }) }}</div>

    <template v-else>
      <div class="kpi-grid">
        <article v-for="card in kpiCards" :key="card.id" class="kpi-card micro-card"
          :style="{ '--card-accent': card.accent }">
          <p class="kpi-label">{{ card.label }}</p>
          <p class="kpi-value">{{ card.value }}</p>
          <p class="kpi-delta" :class="card.direction">
            <span class="delta-arrow">{{ card.direction === 'up' ? '▲' : '▼' }}</span>
            <span>{{ card.delta }}</span>
            <span class="kpi-period">{{ t("admin.kpi.vs_previous") }}</span>
          </p>
        </article>
      </div>

      <div class="panel-grid">
        <article class="micro-card panel">
          <header class="panel-head">
            <h2>{{ t("admin.panels.user_split.title") }}</h2>
            <span class="panel-meta">{{ t("admin.panels.user_split.meta") }}</span>
          </header>
          <div class="split-list">
            <div v-for="segment in userSegments" :key="segment.label" class="split-row">
              <div class="split-top">
                <span class="split-label">
                  <span class="split-dot" :style="{ background: segment.color }"></span>
                  {{ segment.label }}
                </span>
                <span class="split-right">
                  <strong>{{ segment.value }}</strong>
                  <span class="split-pct">{{ segment.pct }}%</span>
                </span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: segment.pct + '%', background: segment.color }"></div>
              </div>
            </div>
          </div>
        </article>

        <article class="micro-card panel">
          <header class="panel-head">
            <h2>{{ t("admin.panels.weekly_signups.title") }}</h2>
            <span class="panel-meta">{{ t("admin.panels.weekly_signups.meta") }}</span>
          </header>
          <div class="bars">
            <div v-for="week in weeklySignups" :key="week.label" class="bar-row">
              <span class="bar-label">{{ week.label }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: `${week.percent}%` }">{{ week.value }}</div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="bottom-grid">
        <article class="micro-card panel push-panel">
          <header class="panel-head">
            <h2><span class="push-icon">🔔</span> {{ t("admin.panels.push.title") }}</h2>
            <span class="panel-meta">{{ t("admin.panels.push.meta") }}</span>
          </header>
          <div class="push-grid">
            <div v-for="stat in pushStats" :key="stat.label" class="push-stat">
              <div class="push-stat-head">
                <span class="push-stat-label">{{ stat.label }}</span>
                <span class="push-stat-value" :style="{ color: stat.color }">{{ stat.value }}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: stat.pct + '%', background: stat.color }"></div>
              </div>
            </div>
          </div>
        </article>

        <!-- Activité récente hardcodée pour l'instant -->
        <article class="micro-card panel">
          <header class="panel-head">
            <h2>{{ t("admin.panels.recent_activity.title") }}</h2>
            <span class="panel-meta">{{ t("admin.panels.recent_activity.meta") }}</span>
          </header>
          <ul class="activity-list">
            <li v-for="event in events" :key="event.id" class="activity-item">
              <span class="event-badge" :class="event.type.toLowerCase()">{{ event.type }}</span>
              <div class="event-body">
                <p class="event-main">{{ event.text }}</p>
                <p class="event-time">{{ event.time }}</p>
              </div>
            </li>
          </ul>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "@/lib/supabase";
import { useI18n } from "vue-i18n";

// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────
const selectedRange = ref("30d");
const loading = ref(true);
const error = ref(null);
const { t } = useI18n();

const ranges = computed(() => [
  { label: t("admin.ranges.7d"), value: "7d" },
  { label: t("admin.ranges.30d"), value: "30d" },
  { label: t("admin.ranges.3m"), value: "3m" },
  { label: t("admin.ranges.1y"), value: "1y" },
]);

const kpiCards = ref([]);
const userSegments = ref([]);
const weeklySignups = ref([]);
const pushStats = ref([]);

// Activité récente hardcodée — nécessite une table de logs pour être dynamique
const defaultEvents = computed(() => [
  { id: 1, type: "NEW", text: t("admin.events.new_user"), time: t("admin.events.time_2m") },
  { id: 2, type: "PREM", text: t("admin.events.new_premium"), time: t("admin.events.time_8m") },
  { id: 3, type: "PUSH", text: t("admin.events.push_sent"), time: t("admin.events.time_14m") },
  { id: 4, type: "UNSUB", text: t("admin.events.unsub"), time: t("admin.events.time_35m") },
]);
const events = ref([]);

// ─────────────────────────────────────────
// CHARGEMENT
// On appelle l'Edge Function "admin-stats" qui a accès à toutes
// les données (bypass RLS grâce à la service_role_key côté serveur).
// C'est le même principe que ton Edge Function "notifications".
// ─────────────────────────────────────────
async function loadDashboard() {
  loading.value = true;
  error.value = null;

  try {
    // Appel de l'Edge Function Supabase
    const { data, error: fnError } = await supabase.functions.invoke("admin-stats");
    if (fnError) throw fnError;

    const { kpi, segments, weeklySignups: weekly, pushStats: push, events: logs } = data;

    // Calcul de la tendance des nouveaux inscrits (▲ ou ▼)
    const diff = kpi.newUsers30d - kpi.newUsersPrev;
    const pct = kpi.newUsersPrev > 0
      ? Math.round((diff / kpi.newUsersPrev) * 100)
      : 0;

    // Construction des 4 cartes KPI avec les vraies données
    kpiCards.value = [
      {
        id: "new",
        label: t("admin.kpi.new_users"),
        value: kpi.newUsers30d.toLocaleString("fr-FR"),
        delta: `${pct >= 0 ? "+" : ""}${pct}%`,
        direction: pct >= 0 ? "up" : "down",
        accent: "#F97316",
      },
      {
        id: "subs",
        label: t("admin.kpi.premium_subs"),
        value: kpi.totalPremium.toLocaleString("fr-FR"),
        delta: "+0%",
        direction: "up",
        accent: "#6D28D9",
      },
      {
        id: "active",
        label: t("admin.kpi.active_week"),
        value: kpi.activeWeek.toLocaleString("fr-FR"),
        delta: "+0%",
        direction: "up",
        accent: "#0EA5E9",
      },
      {
        id: "inactive",
        label: t("admin.kpi.inactive_month"),
        value: kpi.inactive.toLocaleString("fr-FR"),
        delta: "0%",
        direction: "down",
        accent: "#64748B",
      },
    ];

    events.value = Array.isArray(logs) && logs.length ? logs : defaultEvents.value;

    // Les autres données viennent directement de l'Edge Function
    userSegments.value = segments;
    weeklySignups.value = weekly;
    pushStats.value = push;

  } catch (e) {
    error.value = e.message;
    console.error("Erreur dashboard admin:", e);
  } finally {
    loading.value = false;
  }
}

// S'exécute quand la page s'affiche
onMounted(() => {
  loadDashboard();
});
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 16px;
  width: 100%;
  padding-top: 16px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-weight: 600;
}

.error {
  text-align: center;
  padding: 40px;
  color: #ef4444;
  font-weight: 600;
}

.admin-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
  padding: 28px 22px;
  background: linear-gradient(125deg, #ff6b35 0%, #f7931e 100%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: white;
  box-shadow: 0 14px 36px rgba(17, 24, 39, 0.24);
}

.header-left {
  text-align: center;
}

.admin-title {
  margin: 0 0 2px;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.7px;
}

.admin-subtitle {
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.88);
  font-size: 14px;
  max-width: 460px;
}

.range-switch {
  display: inline-flex;
  align-self: center;
  background: rgba(70, 97, 158, 0.4);
  border-radius: 999px;
  padding: 4px;
  gap: 3px;
}

.range-btn {
  border: 0;
  border-radius: 999px;
  padding: 6px 12px;
  color: rgba(255, 255, 255, 0.72);
  background: transparent;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.range-btn.active {
  background: #ffffff;
  color: #312e81;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.kpi-card {
  border-left: 4px solid var(--card-accent);
  padding: 16px 16px 14px;
}

.kpi-label {
  margin: 0;
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1.1px;
  font-weight: 700;
}

.kpi-value {
  margin: 10px 0 8px;
  font-size: 34px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -1px;
}

.kpi-delta {
  margin: 0;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
}

.kpi-delta.up {
  color: #22c55e;
}

.kpi-delta.down {
  color: #ef4444;
}

.delta-arrow {
  font-size: 9px;
}

.kpi-period {
  color: var(--text-secondary);
  font-weight: 400;
  font-size: 11px;
}

.panel-grid {
  display: grid;
  gap: 12px;
}

.panel {
  padding: 18px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  gap: 10px;
}

.panel-head h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.panel-meta {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  white-space: nowrap;
}

.split-list {
  display: grid;
  gap: 14px;
}

.split-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.split-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.split-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--text-primary);
}

.split-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.split-right {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.split-right strong {
  font-size: 15px;
  color: var(--text-primary);
}

.split-pct {
  font-size: 11px;
  color: var(--text-secondary);
}

.progress-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.bars {
  display: grid;
  gap: 10px;
}

.bar-row {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 10px;
  align-items: center;
}

.bar-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 700;
  text-align: right;
}

.bar-track {
  width: 100%;
  border-radius: 999px;
  height: 28px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 10px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  background: linear-gradient(90deg, #f38b40, #7130d9d1);
  min-width: 40px;
}

.bottom-grid {
  display: grid;
  gap: 12px;
}

.push-icon {
  font-size: 15px;
}

.push-grid {
  display: grid;
  gap: 14px;
}

.push-stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.push-stat-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.push-stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.push-stat-value {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.event-badge {
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  border-radius: 999px;
  padding: 3px 8px;
  text-transform: uppercase;
}

.event-badge.new {
  background: rgba(14, 165, 233, 0.15);
  color: #0ea5e9;
  border: 1px solid rgba(14, 165, 233, 0.25);
}

.event-badge.prem {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.25);
}

.event-badge.push {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.event-badge.unsub {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.event-body {
  flex: 1;
  min-width: 0;
}

.event-main {
  margin: 0;
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.4;
}

.event-time {
  margin: 3px 0 0;
  font-size: 11px;
  color: var(--text-secondary);
}

@media (max-width: 390px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .kpi-value {
    font-size: 26px;
  }
}
</style>
