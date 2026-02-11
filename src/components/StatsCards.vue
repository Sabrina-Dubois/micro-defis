<template>
  <div class="stats-grid">
    <v-card
      v-for="(stat, index) in stats"
      :key="index"
      class="micro-card pa-3 text-center"
    >
      <div class="stat-icon">{{ stat.icon }}</div>
      <div class="stat-value">{{ stat.value }}</div>
      <div class="stat-label">{{ stat.label }}</div>
    </v-card>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  stats: {
    type: Array,
    required: true,
    default: () => [],
    // Chaque stat = { icon: "🔥", value: 0, label: "Streak" }
  },
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.stat-icon {
  font-size: 28px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 900;
  color: #ff6b35;
}

.stat-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}
</style>