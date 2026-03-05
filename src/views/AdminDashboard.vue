<template>
  <section class="admin-page">
    <header class="admin-header">
      <div class="header-left">
        <h1 class="admin-title">Dashboard admin</h1>
        <p class="admin-subtitle">Suivi des inscriptions, abonnements et activite.</p>
      </div>
      <div class="range-switch" role="group" aria-label="Periode">
        <button
          v-for="range in ranges"
          :key="range.value"
          class="range-btn"
          :class="{ active: selectedRange === range.value }"
          type="button"
          @click="selectedRange = range.value"
        >
          {{ range.label }}
        </button>
      </div>
    </header>

    <div class="kpi-grid">
      <article
        v-for="card in kpiCards"
        :key="card.id"
        class="kpi-card micro-card"
        :style="{ '--card-accent': card.accent }"
      >
        <p class="kpi-label">{{ card.label }}</p>
        <p class="kpi-value">{{ card.value }}</p>
        <p class="kpi-delta" :class="card.direction">
          <span class="delta-arrow">{{ card.direction === 'up' ? '▲' : '▼' }}</span>
          <span>{{ card.delta }}</span>
          <span class="kpi-period">vs periode prec.</span>
        </p>
      </article>
    </div>

    <div class="panel-grid">
      <article class="micro-card panel">
        <header class="panel-head">
          <h2>Repartition utilisateurs</h2>
          <span class="panel-meta">30 derniers jours</span>
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
          <h2>Inscriptions hebdo</h2>
          <span class="panel-meta">Mois en cours</span>
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
          <h2>
            <span class="push-icon">🔔</span>
            Push Notifications
          </h2>
          <span class="panel-meta">Dernieres 24h</span>
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

      <article class="micro-card panel">
        <header class="panel-head">
          <h2>Activite recente</h2>
          <span class="panel-meta">Temps reel</span>
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
  </section>
</template>

<script setup>
import { ref } from "vue";

const selectedRange = ref("30d");

const ranges = [
  { label: "7j", value: "7d" },
  { label: "30j", value: "30d" },
  { label: "3m", value: "3m" },
  { label: "1a", value: "1y" },
];

const kpiCards = [
  { id: "new", label: "Nouveaux inscrits", value: "247", delta: "+18%", direction: "up", accent: "#F97316" },
  { id: "subs", label: "Nouveaux premium", value: "59", delta: "+11%", direction: "up", accent: "#6D28D9" },
  { id: "active", label: "Actifs semaine", value: "1 842", delta: "+7%", direction: "up", accent: "#0EA5E9" },
  { id: "inactive", label: "Inactifs ce mois", value: "1 449", delta: "-3%", direction: "down", accent: "#64748B" },
];

const userSegments = [
  { label: "Free actifs", value: "1 524", pct: 46, color: "#0EA5E9" },
  { label: "Premium actifs", value: "318", pct: 10, color: "#F97316" },
  { label: "Inactifs", value: "1 449", pct: 44, color: "#94A3B8" },
];

const weeklySignups = [
  { label: "S-4", value: 48, percent: 48 },
  { label: "S-3", value: 62, percent: 62 },
  { label: "S-2", value: 55, percent: 55 },
  { label: "S-1", value: 82, percent: 82 },
];

const pushStats = [
  { label: "Taux d'abonnement global", value: "73%", pct: 73, color: "#0EA5E9" },
  { label: "Notifications envoyees", value: "1 204", pct: 100, color: "#10B981" },
  { label: "Taux de succes", value: "96%", pct: 96, color: "#10B981" },
  { label: "Erreurs 410 (expirees)", value: "47", pct: 4, color: "#EF4444" },
  { label: "Premium abonnes push", value: "89%", pct: 89, color: "#F97316" },
];

const events = [
  { id: 1, type: "NEW", text: "user_4821 vient de s'inscrire", time: "Il y a 2 min" },
  { id: 2, type: "PREM", text: "marie_d est passee premium", time: "Il y a 8 min" },
  { id: 3, type: "PUSH", text: "Campagne notif 20:00 envoyee a 1 204 utilisateurs", time: "Il y a 14 min" },
  { id: 4, type: "UNSUB", text: "user_3102 s'est desabonne des notifications", time: "Il y a 35 min" },
];
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 16px;
  width: 100%;
  padding-top: 16px;
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
